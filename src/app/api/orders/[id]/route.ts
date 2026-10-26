import { asc, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { order, orderEvent, orderLine } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { transformOrder } from "@/lib/db/queries";

/**
 * GET /api/orders/[id]
 * Returns a single order by ID.
 * Authenticated users can only access their own orders.
 * Admins can access any order.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const orderRow = await db
      .select()
      .from(order)
      .where(eq(order.id, id))
      .then((rows) => rows[0] ?? null);

    if (!orderRow) {
      return NextResponse.json(
        { error: `Order ${id} not found` },
        { status: 404 },
      );
    }

    // Authorization: users *** only see their own orders
    if (orderRow.customerId && session?.user?.id !== orderRow.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Load related data
    const [lines, events] = await Promise.all([
      db
        .select()
        .from(orderLine)
        .where(eq(orderLine.orderId, id))
        .orderBy(asc(orderLine.id)),
      db
        .select()
        .from(orderEvent)
        .where(eq(orderEvent.orderId, id))
        .orderBy(desc(orderEvent.at)),
    ]);

    return NextResponse.json(transformOrder({ ...orderRow, lines, events }));
  } catch (e) {
    console.error("[GET /api/orders/:id]", e);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}
