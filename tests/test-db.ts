import "dotenv/config";
import { count } from "drizzle-orm";
import { product, subscription, user } from "@/db/schema";
import { db } from "@/lib/db/drizzle";

async function main() {
  const userCount = (await db.select({ count: count() }).from(user))[0].count;
  console.log("User count:", userCount);
  const subscriptionCount = (
    await db.select({ count: count() }).from(subscription)
  )[0].count;
  console.log("Subscription count:", subscriptionCount);
  const productCount = (await db.select({ count: count() }).from(product))[0]
    .count;
  console.log("Product count:", productCount);
}

main().catch(console.error);
