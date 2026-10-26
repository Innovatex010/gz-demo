import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { order, orderLine, productVariant } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";

/**
 * POST /api/checkout
 * Creates an order in the database from the checkout form data.
 * If the user is authenticated, the order is linked to their account.
 * Returns the created order in frontend Order format.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  // Validate required fields
  const required = ["name", "phone", "email", "method", "lines", "totals"];
  for (const field of required) {
    if (body[field] === undefined || body[field] === null) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 },
      );
    }
  }

  if (body.method === "standard" || body.method === "express") {
    for (const addrField of ["address", "pin", "city"]) {
      if (!body[addrField]) {
        return NextResponse.json(
          { error: `Missing required field for delivery: ${addrField}` },
          { status: 400 },
        );
      }
    }
  }

  try {
    // Get the session if available (optional — guest checkout allowed)
    let userId: string | null = null;
    try {
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      userId = session?.user?.id ?? null;
    } catch {
      // Guest checkout — no session required
    }

    // Generate order ID
    const orderId = `GZ${Date.now().toString().slice(-8)}`;

    // Build order lines
    const linesData = body.lines.map((l: any) => ({
      id: `${orderId}-${l.key}`,
      key: l.key,
      orderId,
      productId: l.productId,
      name: l.name ?? "",
      size: l.size,
      color: l.color,
      qty: l.qty,
      price: l.price ?? 0,
    }));

    // Insert order
    const [createdOrder] = await db
      .insert(order)
      .values({
        id: orderId,
        placedAt: new Date(),
        customerId: userId ?? null,
        name: body.name,
        phone: body.phone,
        email: body.email,
        address: body.address ?? "",
        pin: body.pin ?? "",
        city: body.city ?? "",
        deliveryMethod: body.method,
        cod: body.cod ?? true,
        paymentMethod: body.cod ? "cod" : "upi",
        paymentStatus: body.cod ? "pending" : "pending",
        coupon: body.coupon ?? null,
        totals: body.totals,
      })
      .returning();

    // Insert order lines
    if (linesData.length > 0) {
      await db.insert(orderLine).values(linesData as any);
    }

    // Deduct stock from product variants
    for (const l of body.lines) {
      await db
        .update(productVariant)
        .set({
          stock: sql`${productVariant.stock} - ${l.qty}`,
        })
        .where(
          and(
            eq(productVariant.productId, l.productId),
            eq(productVariant.size, l.size),
          ),
        );
    }

    return NextResponse.json({
      id: createdOrder.id,
      placedAt:
        createdOrder.placedAt instanceof Date
          ? createdOrder.placedAt.toISOString()
          : createdOrder.placedAt,
      name: createdOrder.name,
      phone: createdOrder.phone,
      email: createdOrder.email,
      address: createdOrder.address,
      pin: createdOrder.pin,
      city: createdOrder.city,
      method: createdOrder.deliveryMethod,
      cod: createdOrder.cod,
      coupon: createdOrder.coupon ?? undefined,
      lines: linesData.map((l: any) => ({
        key: l.key,
        productId: l.productId,
        size: l.size,
        color: l.color,
        qty: l.qty,
      })),
      totals: createdOrder.totals,
    });
  } catch (e: any) {
    console.error("[POST /api/checkout]", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to create order" },
      { status: 500 },
    );
  }
}
