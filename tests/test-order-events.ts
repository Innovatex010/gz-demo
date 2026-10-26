/**
 * Test script for order events and status tracking API.
 *
 * Tests order event CRUD operations via Drizzle ORM,
 * mirroring what the /api/orders/[id]/events route handlers do:
 *  1. Create order with initial status
 *  2. GET events (empty initially)
 *  3. POST event (processing) → updates order status
 *  4. POST event (shipped) → updates order status
 *  5. GET events returns ordered list (newest first)
 *  6. Invalid stage → rejected
 *  7. Nonexistent order → 404 equivalent
 *  8. Cleanup
 *
 * Run: bun tests/test-order-events.ts
 */
import "dotenv/config";
import { desc, eq } from "drizzle-orm";
import { order, orderEvent, user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
const VALID_STAGES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

async function main() {
  // ── Create test user ─────────────────────────────────────────────
  const testEmail = `oevents-${Date.now()}@example.com`;
  const existing = (
    await db.select().from(user).where(eq(user.email, testEmail))
  )[0];
  if (existing) {
    await db.delete(orderEvent).where(eq(orderEvent.orderId, existing.id));
    await db.delete(order).where(eq(order.customerId, existing.id));
    await db.delete(user).where(eq(user.id, existing.id));
  }

  const signUp = await auth.api.signUpEmail({
    body: { name: "OE Test", email: testEmail, password: "testpass123" },
  });
  const userId = signUp?.user?.id;
  if (!userId) {
    console.error("FAILED: Could not create test user");
    process.exit(1);
  }
  console.log(`Created user: ${userId}`);

  // ── Test 1: Create order ──────────────────────────────────────────
  console.log("\n=== Test 1: Create test order ===");
  const orderId = `GZ-OE-${Date.now()}`;
  await db.insert(order).values({
    id: orderId,
    placedAt: new Date(),
    customerId: userId,
    name: "OE Test",
    phone: "9999999999",
    email: testEmail,
    address: "Test Address",
    pin: "000000",
    city: "TestCity",
    deliveryMethod: "standard",
    cod: true,
    paymentMethod: "cod",
    paymentStatus: "pending",
    status: "pending",
    coupon: null,
    totals: {
      subtotal: 500,
      shipping: 79,
      discount: 0,
      tax: 25,
      total: 604,
    },
  });
  console.log(`Created order ${orderId}`);
  console.log("");

  // Helper: list events newest-first
  const listEvents = (oid: string) =>
    db
      .select()
      .from(orderEvent)
      .where(eq(orderEvent.orderId, oid))
      .orderBy(desc(orderEvent.at));

  // Helper: create an event (mirrors POST handler logic)
  async function createEvent(oid: string, stage: OrderStatus, note?: string) {
    if (!VALID_STAGES.includes(stage)) {
      return { status: 400, error: `Invalid stage: ${stage}` };
    }
    const result = await db
      .insert(orderEvent)
      .values({
        id: `${oid}-evt-${Date.now()}`,
        orderId: oid,
        stage: stage,
        at: new Date().toISOString(),
        note: note ?? null,
      })
      .returning();
    await db.update(order).set({ status: stage }).where(eq(order.id, oid));
    return { status: 201, data: result[0] };
  }

  // ── Test 2: GET events (empty) ──────────────────────────────────────
  console.log("=== Test 2: GET events (empty) ===");
  const initialEvents = await listEvents(orderId);
  console.log(`Events: ${initialEvents.length} (expected: 0)`);
  if (initialEvents.length !== 0) {
    console.error("FAILED: Expected 0 events");
    process.exit(1);
  }
  console.log("");

  // ── Test 3: Create processing event → order status updated ─────────
  console.log("=== Test 3: Create 'processing' event ===");
  const res3 = await createEvent(orderId, "processing", "Order confirmed");
  console.log(`Status: ${res3.status}, stage: ${res3.data?.stage}`);
  if (res3.status !== 201) {
    console.error(`FAILED: Expected 201, got ${res3.status}`);
    process.exit(1);
  }

  const orderAfter1 = (
    await db.select().from(order).where(eq(order.id, orderId))
  )[0];
  console.log(`Order status: ${orderAfter1.status} (expected: processing)`);
  if (orderAfter1.status !== "processing") {
    console.error("FAILED: Order status should be 'processing'");
    process.exit(1);
  }
  console.log("");

  // ── Test 4: Create shipped event → order status updated ────────────
  console.log("=== Test 4: Create 'shipped' event ===");
  const res4 = await createEvent(orderId, "shipped", "Dispatched via courier");
  console.log(`Status: ${res4.status}`);
  if (res4.status !== 201) {
    console.error(`FAILED: Expected 201, got ${res4.status}`);
    process.exit(1);
  }

  const orderAfter2 = (
    await db.select().from(order).where(eq(order.id, orderId))
  )[0];
  console.log(`Order status: ${orderAfter2.status} (expected: shipped)`);
  if (orderAfter2.status !== "shipped") {
    console.error("FAILED: Order status should be 'shipped'");
    process.exit(1);
  }
  console.log("");

  // ── Test 5: GET events returns 2, newest first ──────────────────────
  console.log("=== Test 5: GET events (2 events, newest first) ===");
  const events = await listEvents(orderId);
  console.log(`Events: ${events.length} (expected: 2)`);
  if (events.length !== 2) {
    console.error("FAILED: Expected 2 events");
    process.exit(1);
  }
  const stages = events.map((e) => e.stage);
  console.log(`Stages (newest first): ${stages.join(", ")}`);
  // Newest first: shipped should be at index 0, processing at index 1
  if (stages[0] !== "shipped" || stages[1] !== "processing") {
    console.error("FAILED: Events should be ordered newest-first");
    process.exit(1);
  }
  console.log("");

  // ── Test 6: Invalid stage → rejected ─────────────────────────────────
  console.log("=== Test 6: Invalid stage → 400 ===");
  const resBad = await createEvent(orderId, "invalid_stage" as OrderStatus);
  console.log(`Status: ${resBad.status} (expected: 400)`);
  if (resBad.status !== 400) {
    console.error("FAILED: Expected 400 for invalid stage");
    process.exit(1);
  }
  console.log("");

  // ── Test 7: Nonexistent order → no events ──────────────────────────
  console.log("=== Test 7: Nonexistent order events ===");
  const noEvents = await listEvents("NONEXISTENT-ORDER");
  console.log(`Events: ${noEvents.length} (expected: 0)`);
  if (noEvents.length !== 0) {
    console.error("FAILED: Expected 0 events for nonexistent order");
    process.exit(1);
  }
  console.log("");

  // ── Test 8: Delivered event → completed status ─────────────────────
  console.log("=== Test 8: Create 'delivered' event ===");
  const res8 = await createEvent(orderId, "delivered", "Customer received");
  console.log(`Status: ${res8.status}`);
  if (res8.status !== 201) {
    console.error(`FAILED: Expected 201, got ${res8.status}`);
    process.exit(1);
  }
  const orderAfter8 = (
    await db.select().from(order).where(eq(order.id, orderId))
  )[0];
  console.log(`Order status: ${orderAfter8.status} (expected: delivered)`);
  if (orderAfter8.status !== "delivered") {
    console.error("FAILED: Order status should be 'delivered'");
    process.exit(1);
  }
  console.log("");

  // ── Cleanup ────────────────────────────────────────────────────────
  console.log("=== Cleanup ===");
  await db.delete(orderEvent).where(eq(orderEvent.orderId, orderId));
  await db.delete(order).where(eq(order.id, orderId));
  await db.delete(user).where(eq(user.id, userId));
  console.log(`Cleaned up order ${orderId} and user ${userId}`);

  console.log("\n✅ All order events tests passed!");
}

main().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
