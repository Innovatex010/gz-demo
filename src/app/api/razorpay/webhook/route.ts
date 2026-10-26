import { createHmac, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { order, orderEvent } from "@/db/schema";
import { db } from "@/lib/db/drizzle";

/**
 * POST /api/razorpay/webhook
 *
 * Receives webhook events from Razorpay and updates order/payment status.
 * The webhook secret is configured via RAZORPAY_WEBHOOK_SECRET.
 *
 * Supported events:
 *  - payment_successful: marks the order as paid, status → processing
 *  - payment.failed:      marks the order payment as failed, status → cancelled
 *  - subscription.activated/cancelled/completed: future — subscription status
 */

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

/**
 * Verify the Razorpay webhook signature using HMAC-SHA256.
 * Mirrors the approach used by @amank-root/better-auth-razorpay.
 */
function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string,
): boolean {
  const generated = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expected = Buffer.from(generated, "hex");
  const received = Buffer.from(signature, "hex");
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    console.error("[Webhook] RAZORPAY_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const signature = req.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature header" },
      { status: 400 },
    );
  }

  // Read the raw body — must be the exact string Razorpay signed
  const rawBody = await req.text();

  if (!verifyWebhookSignature(rawBody, signature, WEBHOOK_SECRET)) {
    console.error("[Webhook] Signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  console.log(`[Webhook] Received event: ${event.event}`);
  await handleEvent(event);

  return NextResponse.json({ status: "ok" });
}

/** Non-POST methods are rejected. */
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

async function handleEvent(event: any) {
  const { event: eventName, payload } = event;

  switch (eventName) {
    case "payment_successful":
    case "payment.failed":
      await handlePaymentEvent(eventName, payload);
      break;

    case "subscription.activated":
    case "subscription.cancelled":
    case "subscription.completed":
      // Future: update subscription status in the DB
      console.log(`[Webhook] Subscription event not yet handled: ${eventName}`);
      break;

    default:
      console.log(`[Webhook] Unhandled event: ${eventName}`);
  }
}

async function handlePaymentEvent(eventName: string, payload: any) {
  const payment = payload?.payment?.entity;
  if (!payment) {
    console.warn("[Webhook] Payment payload missing entity");
    return;
  }

  const razorpayOrderId: string | undefined = payment.order_id;
  const razorpayPaymentId: string = payment.id;

  if (!razorpayOrderId) {
    console.warn(
      "[Webhook] Payment has no order_id — cannot map to internal order",
    );
    return;
  }

  // Find the order by the Razorpay order ID
  const orders = await db
    .select()
    .from(order)
    .where(eq(order.razorpayOrderId, razorpayOrderId));

  const orderRow = orders[0];
  if (!orderRow) {
    console.warn(
      `[Webhook] No order found for razorpay_order_id=${razorpayOrderId}`,
    );
    return;
  }

  const isPaid = eventName === "payment_successful";
  const newStatus: "paid" | "failed" = isPaid ? "paid" : "failed";

  // Update the order's payment status and payment ID
  await db
    .update(order)
    .set({
      paymentStatus: newStatus,
      razorpayPaymentId,
      status: isPaid ? "processing" : "cancelled",
    })
    .where(eq(order.id, orderRow.id));

  // Record an order event for the status change
  await db.insert(orderEvent).values({
    id: `${orderRow.id}-evt-${Date.now()}`,
    orderId: orderRow.id,
    stage: isPaid ? "processing" : "cancelled",
    at: new Date().toISOString(),
    note: `Payment ${isPaid ? "succeeded" : "failed"} via Razorpay (${razorpayPaymentId})`,
  });

  console.log(
    `[Webhook] Order ${orderRow.id} payment status updated to ${newStatus}`,
  );
}
