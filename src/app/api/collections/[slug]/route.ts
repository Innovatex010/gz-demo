import { asc, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { collection, collectionProduct } from "@/db/schema";
import { db } from "@/lib/db/drizzle";
import { getProduct } from "@/lib/db/queries";

/**
 * GET /api/collections/[slug]
 * Returns a single collection with its full product list.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const coll = await db
      .select()
      .from(collection)
      .where(eq(collection.slug, slug))
      .then((rows) => rows[0] ?? null);

    if (!coll) {
      return NextResponse.json(
        { error: `Collection ${slug} not found` },
        { status: 404 },
      );
    }

    const collProducts = await db
      .select({ productId: collectionProduct.productId })
      .from(collectionProduct)
      .where(eq(collectionProduct.collectionSlug, slug))
      .orderBy(asc(collectionProduct.productId));

    const productIds = collProducts.map((p) => p.productId);
    const products = (
      await Promise.all(productIds.map((id) => getProduct(id)))
    ).filter((p): p is NonNullable<typeof p> => Boolean(p));

    return NextResponse.json({
      slug: coll.slug,
      title: coll.title,
      blurb: coll.blurb ?? "",
      image: coll.image ?? "",
      productIds,
      products,
    });
  } catch (e) {
    console.error("[GET /api/collections/:slug]", e);
    return NextResponse.json(
      { error: "Failed to fetch collection" },
      { status: 500 },
    );
  }
}
