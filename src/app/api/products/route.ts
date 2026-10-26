import { type NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/db/queries";

/**
 * GET /api/products
 * Query params: category, collection, limit, cursor
 * Returns paginated product list in frontend Product[] format.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? undefined;
  const collection = searchParams.get("collection") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);
  const cursor = searchParams.get("cursor") ?? undefined;

  try {
    const { products, nextCursor } = await getProducts({
      category,
      collection,
      limit,
      cursor,
    });
    return NextResponse.json({ products, nextCursor });
  } catch (e) {
    console.error("[GET /api/products]", e);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
