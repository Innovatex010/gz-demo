import { type NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/db/queries";

/**
 * GET /api/products/[id]
 * Returns a single product by ID in frontend Product format.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const product = await getProduct(id);
    if (!product) {
      return NextResponse.json(
        { error: `Product ${id} not found` },
        { status: 404 },
      );
    }
    return NextResponse.json(product);
  } catch (e) {
    console.error("[GET /api/products/:id]", e);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}
