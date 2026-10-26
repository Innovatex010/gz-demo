import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { order, orderEvent } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";

/**
 * GET /api/orders/[id]/events
 * Returns the event history for an order, sorted newest-first.
 * Authenticated users can only see events for their own orders.
 *
 * POST /api/orders/[id]/events
 * Adds a status event to an order and optionally updates the order's status.
 * Requires authentication; only the order owner can add events.
 */

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    // Verify the order exists and the user has access
    const orderRow = await db
      .select({ id: order.id, customerId: order.customerId })
      .from(order)
      .where(eq(order.id, id))
      .then((rows) => rows[0] ?? null);

    if (!orderRow) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (orderRow.customerId && session?.user?.id !== orderRow.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const events = await db
      .select()
      .from(orderEvent)
      .where(eq(orderEvent.orderId, id))
      .orderBy(desc(orderEvent.at));

    return NextResponse.json(events);
  } catch (e: any) {
    console.error("[GET /api/orders/:id/events]", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to fetch events" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    // Verify the order exists and the user has access
    const orderRow = await db
      .select({
        id: order.id,
        customerId: order.customerId,
        status: order.status,
      })
      .from(order)
      .where(eq(order.id, id))
      .then((rows) => rows[0] ?? null);

    if (!orderRow) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (orderRow.customerId && session?.user?.id !== orderRow.customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    // Validate stage
    const validStages = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!body.stage || !validStages.includes(body.stage)) {
      return NextResponse.json(
        {
          error: `Invalid stage. Must be one of: ${validStages.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Create the event
    const newEvent = await db
      .insert(orderEvent)
      .values({
        id: `${id}-evt-${Date.now()}`,
        orderId: id,
        stage: body.stage,
        at: body.at ?? new Date().toISOString(),
        note: body.note ?? null,
      })
      .returning();

    // Update the order's status if the new event has a different stage
    if (orderRow.status !== body.stage) {
      await db
        .update(order)
        .set({ status: body.stage })
        .where(eq(order.id, id));
    }

    return NextResponse.json(newEvent[0], { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/orders/:id/events]", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to create event" },
      { status: 500 },
    );
  }
}
