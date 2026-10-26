import { desc, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { address } from "@/db/schema";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/drizzle";

/**
 * GET /api/addresses
 * Returns all addresses for the authenticated user, defaults first.
 *
 * POST /api/addresses
 * Creates a new address for the authenticated user.
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await db
      .select()
      .from(address)
      .where(eq(address.customerId, session.user.id))
      .orderBy(desc(address.isDefault), desc(address.id));

    return NextResponse.json(addresses);
  } catch (e: any) {
    console.error("[GET /api/addresses]", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to fetch addresses" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    const required = [
      "label",
      "name",
      "phone",
      "line1",
      "city",
      "pin",
      "state",
    ];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    // If this address is set as default, unset any existing default
    if (body.isDefault) {
      await db
        .update(address)
        .set({ isDefault: false })
        .where(
          sql`${address.customerId} = ${session.user.id} AND ${address.isDefault} = true`,
        );
    }

    const newAddress = await db
      .insert(address)
      .values({
        id: `addr_${Date.now()}`,
        customerId: session.user.id,
        label: body.label,
        name: body.name,
        phone: body.phone,
        line1: body.line1,
        line2: body.line2 ?? null,
        city: body.city,
        pin: body.pin,
        state: body.state,
        isDefault: body.isDefault ?? false,
      })
      .returning();

    return NextResponse.json(newAddress[0], { status: 201 });
  } catch (e: any) {
    console.error("[POST /api/addresses]", e);
    return NextResponse.json(
      { error: e?.message ?? "Failed to create address" },
      { status: 500 },
    );
  }
}
