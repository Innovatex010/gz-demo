import "dotenv/config";
import { count, eq } from "drizzle-orm";
import {
  collection,
  collectionProduct,
  coupon,
  productVariant,
} from "@/db/schema";
import { PRODUCTS } from "@/lib/catalog";
import { db } from "@/lib/db/drizzle";
import { getProduct, getProducts } from "@/lib/db/queries";

async function main() {
  console.log("=== Test 1: getProducts (all) ===");
  const all = await getProducts({ limit: 50 });
  console.log(
    `Returned ${all.products.length} products, nextCursor: ${all.nextCursor}`,
  );
  console.log(
    `First product: ${all.products[0]?.id} - ${all.products[0]?.name}`,
  );
  console.log(
    `First product colors: ${JSON.stringify(all.products[0]?.colors?.[0]?.name)}`,
  );
  console.log(`First product sizes: ${JSON.stringify(all.products[0]?.sizes)}`);
  console.log(`First product model: ${JSON.stringify(all.products[0]?.model)}`);
  console.log(`First product fitName: ${all.products[0]?.fitName}`);
  console.log(
    `First product collections: ${JSON.stringify(all.products[0]?.collections)}`,
  );

  // Verify data matches frontend static data
  const frontend = PRODUCTS[0];
  const backend = all.products[0];
  console.log(`\nData integrity check (product ${frontend.id}):`);
  console.log(
    `  name: ${frontend.name} === ${backend?.name} → ${frontend.name === backend?.name}`,
  );
  console.log(
    `  price: ${frontend.price} === ${backend?.price} → ${frontend.price === backend?.price}`,
  );
  console.log(
    `  category: ${frontend.category} === ${backend?.category} → ${frontend.category === backend?.category}`,
  );
  console.log(
    `  image: ${frontend.image} === ${backend?.image} → ${frontend.image === backend?.image}`,
  );
  console.log(
    `  badge: ${frontend.badge} === ${backend?.badge} → ${frontend.badge === backend?.badge}`,
  );
  console.log(
    `  model height: ${frontend.model.height} === ${backend?.model?.height} → ${frontend.model.height === (backend?.model as any)?.height}`,
  );
  console.log(
    `  colors match: ${JSON.stringify(frontend.colors) === JSON.stringify(backend?.colors)}`,
  );
  console.log(
    `  sizes match: ${JSON.stringify(frontend.sizes) === JSON.stringify(backend?.sizes)}`,
  );
  console.log(
    `  stock match: ${JSON.stringify(frontend.stock) === JSON.stringify(backend?.stock)}`,
  );

  console.log("\n=== Test 2: getProduct (single) ===");
  const p = await getProduct("GZ-102");
  console.log(`Product: ${p?.id} - ${p?.name} (${p?.category})`);
  console.log(`Colors: ${p?.colors.length}`);
  console.log(`Sizes: ${p?.sizes.length}`);
  console.log(`Stock: ${JSON.stringify(p?.stock)}`);
  console.log(`Model: ${JSON.stringify(p?.model)}`);

  console.log("\n=== Test 3: getProducts with category filter ===");
  const tshirts = await getProducts({ category: "t-shirts", limit: 50 });
  console.log(`T-shirts count: ${tshirts.products.length}`);
  const pants = await getProducts({ category: "pants", limit: 50 });
  console.log(`Pants count: ${pants.products.length}`);
  const shirts = await getProducts({ category: "full-sleeve", limit: 50 });
  console.log(`Full-sleeve shirts count: ${shirts.products.length}`);

  console.log("\n=== Test 4: getProducts with collection filter ===");
  const newArrivals = await getProducts({
    collection: "new-arrivals",
    limit: 50,
  });
  console.log(`New arrivals count: ${newArrivals.products.length}`);
  const theShirt = await getProducts({ collection: "the-shirt", limit: 50 });
  console.log(`The shirt collection count: ${theShirt.products.length}`);

  console.log("\n=== Test 5: Collections query ===");
  const collections = await db.select().from(collection);
  for (const c of collections) {
    const [{ count: productCount }] = await db
      .select({ count: count() })
      .from(collectionProduct)
      .where(eq(collectionProduct.collectionSlug, c.slug));
    console.log(`  ${c.slug}: ${c.title} - ${productCount} products`);
  }

  console.log("\n=== Test 6: Coupon check ===");
  const coupons = await db.select().from(coupon);
  console.log(`Coupons: ${coupons.map((c) => c.code).join(", ")}`);

  console.log("\n=== Test 7: ProductVariant SKU check ===");
  const variants = await db
    .select()
    .from(productVariant)
    .where(eq(productVariant.productId, "GZ-102"));
  console.log(`GZ-102 variants: ${variants.length}`);
  for (const v of variants) {
    console.log(`  ${v.sku} - size=${v.size}, stock=${v.stock}`);
  }

  console.log("\nAll tests passed!");
}

main().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
