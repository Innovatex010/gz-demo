import { asc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { collection, collectionProduct } from "@/db/schema";
import { db } from "@/lib/db/drizzle";
import { getProduct } from "@/lib/db/queries";

/**
 * GET /api/collections
 * Returns all collections with summary product data.
 */
export async function GET(_req: NextRequest) {
  try {
    const collections = await db.select().from(collection);

    const result = await Promise.all(
      collections.map(async (c) => {
        const collProducts = await db
          .select({ productId: collectionProduct.productId })
          .from(collectionProduct)
          .where(eq(collectionProduct.collectionSlug, c.slug))
          .orderBy(asc(collectionProduct.productId));

        const productIds = collProducts.map((p) => p.productId);
        const products = (
          await Promise.all(productIds.slice(0, 8).map((id) => getProduct(id)))
        ).filter((p): p is NonNullable<typeof p> => Boolean(p));

        return {
          slug: c.slug,
          title: c.title,
          blurb: c.blurb ?? "",
          image: c.image ?? "",
          productIds,
          products,
        };
      }),
    );

    return NextResponse.json(result);
  } catch (e) {
    console.error("[GET /api/collections]", e);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 },
    );
  }
}
