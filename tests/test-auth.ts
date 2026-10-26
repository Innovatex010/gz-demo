import "dotenv/config";
import { eq, sql } from "drizzle-orm";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";

async function main() {
  console.log("Auth config loaded");
  console.log("Schema type check...");

  // Check Better-Auth tables exist
  const baTables: any = await db.execute(sql`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('user', 'session', 'account', 'verification', 'subscription')
    ORDER BY tablename
  `);
  const tableRows = baTables?.rows ?? baTables;
  console.log(
    "Better-Auth tables:",
    tableRows.map((t: any) => t.tablename),
  );

  // Try to create a user with a unique email
  const testEmail = `test-${Date.now()}@example.com`;
  const signUpResult = await auth.api.signUpEmail({
    body: {
      name: "Test User",
      email: testEmail,
      password: "testpassword123",
    },
  });
  console.log("Sign up result:", JSON.stringify(signUpResult, null, 2));

  // Verify the user was created
  const dbUser = (
    await db.select().from(user).where(eq(user.email, testEmail))
  )[0];
  console.log("DB User:", JSON.stringify(dbUser, null, 2));

  // Now try to sign in
  const signInResult = await auth.api.signInEmail({
    body: {
      email: testEmail,
      password: "testpassword123",
    },
  });
  console.log("Sign in result:", JSON.stringify(signInResult, null, 2));

  console.log("\nAuth test passed!");
}

main().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
