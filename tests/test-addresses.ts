/**
 * Test script for customer address management.
 *
 * Tests address CRUD operations directly via Drizzle ORM,
 * mirroring what the /api/addresses route handlers do:
 *  1. Create user via Better-Auth
 *  2. GET empty list
 *  3. POST (insert) a default address
 *  4. POST (insert) a second address
 *  5. Verify default is first, switching default clears other
 *  6. PUT (update) city and isDefault
 *  7. DELETE (delete) an address
 *  8. Verify default reassignment
 *  9. Cleanup
 *
 * Run: bun tests/test-addresses.ts
 */
import "dotenv/config";
import { and, desc, eq, ne } from "drizzle-orm";
import { address, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";

async function main() {
  // ── Create a test user ─────────────────────────────────────────────
  const testEmail = `addr-test-${Date.now()}@example.com`;
  console.log(`=== Setup: Creating test user (${testEmail}) ===`);

  // Clean up any leftover user
  const existing = (
    await db.select().from(user).where(eq(user.email, testEmail))
  )[0];
  if (existing) {
    await db.delete(address).where(eq(address.customerId, existing.id));
    await db.delete(user).where(eq(user.id, existing.id));
  }

  const signUpResult = await auth.api.signUpEmail({
    body: {
      name: "Addr Test",
      email: testEmail,
      password: "testpass123",
    },
  });

  const userId = signUpResult?.user?.id;
  if (!userId) {
    console.error("FAILED: Could not create test user");
    process.exit(1);
  }
  console.log(`Created user: ${userId}\n`);

  // Helper: list user's addresses ordered defaults first
  const listAddresses = () =>
    db
      .select()
      .from(address)
      .where(eq(address.customerId, userId))
      .orderBy(desc(address.isDefault), desc(address.id));

  // ── Test 1: GET returns empty list ────────────────────────────────
  console.log("=== Test 1: GET empty list ===");
  const initial = await listAddresses();
  console.log(`Addresses: ${initial.length} (expected: 0)`);
  if (initial.length !== 0) {
    console.error("FAILED: Expected empty list");
    process.exit(1);
  }
  console.log("");

  // ── Test 2: POST (insert) first address as default ────────────────
  console.log("=== Test 2: Create default address ===");
  await db.insert(address).values({
    id: `addr_${Date.now()}`,
    customerId: userId,
    label: "Home",
    name: "Test User",
    phone: "9999999999",
    line1: "123 Test Street",
    line2: "Apt 4",
    city: "TestCity",
    pin: "000000",
    state: "TestState",
    isDefault: true,
  });
  const addr1 = (
    await db
      .select()
      .from(address)
      .where(eq(address.customerId, userId))
      .orderBy(desc(address.isDefault))
      .limit(1)
  )[0];
  console.log(`Created: ${addr1.id}, isDefault: ${addr1.isDefault}`);
  if (!addr1?.isDefault) {
    console.error("FAILED: Address should be default");
    process.exit(1);
  }
  console.log("");

  // ── Test 3: POST (insert) second address (not default) ─────────────
  console.log("=== Test 3: Create second address (not default) ===");
  await db.insert(address).values({
    id: `addr_${Date.now() + 1}`,
    customerId: userId,
    label: "Work",
    name: "Test User",
    phone: "8888888888",
    line1: "456 Work Avenue",
    line2: null,
    city: "WorkCity",
    pin: "111111",
    state: "WorkState",
    isDefault: false,
  });
  const allAddrs = await listAddresses();
  console.log(`Total addresses: ${allAddrs.length} (expected: 2)`);
  if (allAddrs.length !== 2) {
    console.error("FAILED: Expected 2 addresses");
    process.exit(1);
  }
  // Default should be first
  console.log(`First (default): ${allAddrs[0].label}`);
  console.log(
    `Second: ${allAddrs[1].label}, isDefault: ${allAddrs[1].isDefault}`,
  );
  if (!allAddrs[0]?.isDefault) {
    console.error("FAILED: Default address should be first");
    process.exit(1);
  }
  if (allAddrs[1]?.isDefault) {
    console.error("FAILED: Second address should not be default");
    process.exit(1);
  }
  console.log("");

  // ── Test 4: PUT — switch default to second address ──────────────────
  console.log("=== Test 4: Switch default to second address ===");
  await db
    .update(address)
    .set({ isDefault: false })
    .where(
      and(
        eq(address.customerId, userId),
        eq(address.isDefault, true),
        ne(address.id, allAddrs[1].id),
      ),
    );
  await db
    .update(address)
    .set({ isDefault: true })
    .where(eq(address.id, allAddrs[1].id));

  const afterSwitch = await listAddresses();
  console.log(
    `First: ${afterSwitch[0].label} (default: ${afterSwitch[0].isDefault})`,
  );
  console.log(
    `Second: ${afterSwitch[1].label} (default: ${afterSwitch[1].isDefault})`,
  );
  if (!afterSwitch[0].isDefault) {
    console.error("FAILED: First address should be default after switch");
    process.exit(1);
  }
  if (afterSwitch[1].isDefault) {
    console.error("FAILED: Second address should not be default after switch");
    process.exit(1);
  }
  console.log("");

  // ── Test 5: PUT — update city on first address ─────────────────────
  console.log("=== Test 5: Update city on first address ===");
  await db
    .update(address)
    .set({ city: "UpdatedCity" })
    .where(eq(address.id, allAddrs[0].id));
  const updated = (
    await db.select().from(address).where(eq(address.id, allAddrs[0].id))
  )[0];
  console.log(`City: ${updated?.city} (expected: UpdatedCity)`);
  if (updated?.city !== "UpdatedCity") {
    console.error("FAILED: City should be UpdatedCity");
    process.exit(1);
  }
  console.log("");

  // ── Test 6: DELETE default address, verify promotion ──────────────────
  console.log("=== Test 6: Delete default address, verify promotion ===");
  const beforeDelete = await listAddresses();
  const defaultId = beforeDelete[0].id;
  const nonDefaultId = beforeDelete[1].id;
  console.log(`Deleting default (${defaultId}), promoting ${nonDefaultId}`);

  // Simulate route handler: delete then promote the most recent remaining
  await db.delete(address).where(eq(address.id, defaultId));
  const promote = (
    await db
      .select()
      .from(address)
      .where(eq(address.customerId, userId))
      .orderBy(desc(address.id))
      .limit(1)
  )[0];
  if (promote) {
    await db
      .update(address)
      .set({ isDefault: true })
      .where(eq(address.id, promote.id));
  }
  console.log("");

  // ── Test 7: Verify promotion worked ───────────────────────────────────
  console.log("=== Test 7: Verify remaining address is now default ===");
  const remaining = await listAddresses();
  console.log(`Remaining: ${remaining.length} (expected: 1)`);
  console.log(
    `Label: ${remaining[0]?.label}, isDefault: ${remaining[0]?.isDefault}`,
  );
  if (remaining.length !== 1) {
    console.error("FAILED: Expected 1 address remaining");
    process.exit(1);
  }
  if (!remaining[0]?.isDefault) {
    console.error("FAILED: Promoted address should be default");
    process.exit(1);
  }
  console.log("");

  // ── Cleanup ────────────────────────────────────────────────────────
  console.log("=== Cleanup ===");
  await db.delete(address).where(eq(address.customerId, userId));
  await db.delete(user).where(eq(user.id, userId));
  console.log(`Cleaned up user ${userId}`);

  console.log("\n✅ All address API tests passed!");
}

main().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
