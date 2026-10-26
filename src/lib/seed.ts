/**
 * Seed the database from the frontend's static data.
 * Run with: bun src/lib/seed.ts
 */
import "dotenv/config";
import { sql } from "drizzle-orm";
import {
  collection,
  collectionProduct,
  coupon,
  product,
  productColor,
  productVariant,
} from "../db/schema";
import { PRODUCTS } from "./catalog";
import { COLLECTIONS, COUPONS } from "./commerce";
import { db } from "./db/drizzle";

async function main() {
  console.log("Seeding database...");

  // Truncate all custom tables in dependency order (auth tables are managed by Better-Auth)
  await db.execute(sql`
    TRUNCATE TABLE
      "order_event",
      "order_line",
      "order_table",
      "address",
      "review",
      "collection_product",
      "product_color",
      "product_variant",
      "product",
      "collection",
      "coupon"
    RESTART IDENTITY CASCADE
  `);
  console.log("Truncated existing data.");

  // Seed collections
  for (const c of COLLECTIONS) {
    await db.insert(collection).values({
      slug: c.slug,
      title: c.title,
      blurb: c.blurb ?? null,
      image: c.image ?? null,
    });
  }
  console.log(`Seeded ${COLLECTIONS.length} collections.`);

  // Seed products
  for (const p of PRODUCTS) {
    await db.insert(product).values({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      compareAt: p.compareAt ?? null,
      badge: p.badge ?? null,
      fabric: p.fabric,
      fit: p.fit,
      fitName: p.fitName,
      image: p.image,
      altImage: p.altImage ?? "",
      model: p.model as any,
      care: p.care,
      status: "active",
      cost: null,
      unitsSold30d: 0,
    });

    // Insert colors
    for (const c of p.colors) {
      await db.insert(productColor).values({
        id: `${p.id}-${c.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: c.name,
        hex: c.hex,
        images: c.images,
        productId: p.id,
      });
    }

    // Insert variants
    for (const size of p.sizes) {
      await db.insert(productVariant).values({
        id: `${p.id}-${size}`,
        size,
        sku: `${p.id}-${size}`,
        stock: p.stock[size] ?? 0,
        threshold: 4,
        productId: p.id,
      });
    }
  }
  console.log(`Seeded ${PRODUCTS.length} products.`);

  // Link collections to products via join table
  for (const c of COLLECTIONS) {
    for (const pid of c.productIds) {
      await db.insert(collectionProduct).values({
        collectionSlug: c.slug,
        productId: pid,
      });
    }
  }
  console.log(`Linked products to collections.`);

  // Seed coupons
  for (const cp of COUPONS) {
    await db.insert(coupon).values({
      code: cp.code,
      kind: cp.kind ?? null,
      value: cp.value ?? null,
      note: cp.note ?? null,
      used: 0,
      active: true,
    });
  }
  console.log(`Seeded ${COUPONS.length} coupons.`);

  // Verify counts
  const [pCount, cCount, couponCount] = await Promise.all([
    db.$count(product),
    db.$count(collection),
    db.$count(coupon),
  ]);
  console.log(`\nVerification:`);
  console.log(`  Products: ${pCount}`);
  console.log(`  Collections: ${cCount}`);
  console.log(`  Coupons: ${couponCount}`);

  console.log("Done.");
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
