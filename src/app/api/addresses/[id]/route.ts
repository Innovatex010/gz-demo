import { and, desc, eq, ne } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { address } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";

/**
 * PUT /api/addresses/[id]
 * Updates an address for the authenticated user.
 *
 * DELETE /api/addresses/[id]
 * Deletes an address for the authenticated user.
 */

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const existing = (
      await db
        .select()
        .from(address)
        .where(and(eq(address.id, id), eq(address.customerId, session.user.id)))
    )[0];

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const body = await req.json();

    // If setting as default, unset other defaults for this user
    if (body.isDefault === true) {
      await db
        .update(address)
        .set({ isDefault: false })
        .where(
          and(
            eq(address.customerId, session.user.id),
            eq(address.isDefault, true),
            ne(address.id, id),
          ),
        );
    }

    const updated = await db
      .update(address)
      .set({
        label: body.label ?? existing.label,
        name: body.name ?? existing.name,
        phone: body.phone ?? existing.phone,
        line1: body.line1 ?? existing.line1,
        line2: body.line2 ?? existing.line2,
        city: body.city ?? existing.city,
        pin: body.pin ?? existing.pin,
        state: body.state ?? existing.state,
        isDefault: body.isDefault ?? existing.isDefault,
      })
      .where(eq(address.id, id))
      .returning();

    return NextResponse.json(updated[0]);
  } catch (e: any) {
    console.error("[PUT /api/addresses/:id]", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to update address" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership and delete in one query
    const existing = (
      await db
        .select({ id: address.id })
        .from(address)
        .where(and(eq(address.id, id), eq(address.customerId, session.user.id)))
        .limit(1)
    )[0];

    if (!existing) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await db.delete(address).where(eq(address.id, id));

    // If the deleted address was the default, promote the most recent remaining one
    const remaining = await db
      .select()
      .from(address)
      .where(eq(address.customerId, session.user.id))
      .orderBy(desc(address.id))
      .limit(1);

    if (remaining[0]) {
      await db
        .update(address)
        .set({ isDefault: true })
        .where(eq(address.id, remaining[0].id));
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[DELETE /api/addresses/:id]", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to delete address" },
      { status: 500 },
    );
  }
}
