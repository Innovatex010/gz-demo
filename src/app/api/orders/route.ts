import { asc, desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { order, orderEvent, orderLine } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";
import { transformOrder } from "@/lib/db/queries";

/**
 * GET /api/orders
 * Returns orders for the authenticated user.
 * Guests receive an empty list.
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ orders: [] });
    }

    // Fetch orders for the customer
    const orders = await db
      .select()
      .from(order)
      .where(eq(order.customerId, session.user.id))
      .orderBy(desc(order.placedAt));

    // For each order, load its lines and events
    const result = await Promise.all(
      orders.map(async (o) => {
        const [lines, events] = await Promise.all([
          db
            .select()
            .from(orderLine)
            .where(eq(orderLine.orderId, o.id))
            .orderBy(asc(orderLine.id)),
          db
            .select()
            .from(orderEvent)
            .where(eq(orderEvent.orderId, o.id))
            .orderBy(desc(orderEvent.at)),
        ]);

        return transformOrder({ ...o, lines, events });
      }),
    );

    return NextResponse.json({
      orders: result,
    });
  } catch (e: any) {
    console.error("[GET /api/orders]", e);
    const msg = e?.message ?? "Failed to fetch orders";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
