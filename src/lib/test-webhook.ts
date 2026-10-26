/**
 * Test script for the Razorpay webhook handler.
 *
 * Tests the webhook endpoint by importing the route handler directly
 * and simulating HTTP requests.
 *
 * Run: npx tsx src/lib/test-webhook.ts
 */
import "dotenv/config";
import { createHmac } from "crypto";
import { eq } from "drizzle-orm";
import { POST } from "../app/api/razorpay/webhook/route";
import { order, orderEvent } from "../db/schema";
import { db } from "./db/drizzle";

const WEBHOOK_SECRET =
  process.env.RAZORPAY_WEBHOOK_SECRET || "dev_webhook_secret_placeholder";

function signWebhook(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

async function callWebhook(
  body: string,
  signature: string,
): Promise<{ status: number; body: any }> {
  // Build a minimal request object that satisfies the route handler.
  const headers = new Headers({
    "content-type": "application/json",
    "x-razorpay-signature": signature,
  });

  const req = {
    url: "http://localhost:3000/api/razorpay/webhook",
    method: "POST",
    headers,
    text: async () => body,
    json: async () => JSON.parse(body),
  } as any;

  const res = await POST(req);
  const resBody = await res.json();
  return { status: res.status, body: resBody };
}

async function main() {
  // ── Test 1: Signature verification logic ───────────────────────────
  console.log("=== Test 1: Signature verification ===");
  const payload = JSON.stringify({ event: "payment_successful" });
  const validSig = signWebhook(payload, WEBHOOK_SECRET);
  const invalidSig = "invalid_signature";
  console.log(
    `Valid signature matches: ${signWebhook(payload, WEBHOOK_SECRET) === validSig}`,
  );
  console.log(
    `Invalid signature differs: ${signWebhook(payload, WEBHOOK_SECRET) !== invalidSig}`,
  );
  console.log("");

  // ── Test 2: Create test order ────────────────────────────────────────
  console.log("=== Test 2: Create test order ===");
  const testOrderId = `GZ-WEBHOOK-TEST-${Date.now()}`;
  const razorpayOrderId = `order_${Date.now()}`;
  await db.insert(order).values({
    id: testOrderId,
    placedAt: new Date(),
    customerId: null,
    name: "Webhook Test",
    phone: "9999999999",
    email: "webhook@test.com",
    address: "Test address",
    pin: "000000",
    city: "TestCity",
    deliveryMethod: "upi",
    cod: false,
    paymentMethod: "upi",
    paymentStatus: "pending",
    razorpayOrderId,
    coupon: null,
    totals: {
      subtotal: 1000,
      shipping: 79,
      discount: 0,
      tax: 50,
      total: 1129,
    },
  });
  console.log(
    `Created order ${testOrderId} with razorpayOrderId=${razorpayOrderId}`,
  );
  console.log("");

  // ── Test 3: Send payment_successful webhook ─────────────────────────
  console.log("=== Test 3: payment_successful webhook ===");
  const webhookPayload = JSON.stringify({
    event: "payment_successful",
    payload: {
      payment: {
        entity: {
          id: `pay_${Date.now()}`,
          order_id: razorpayOrderId,
        },
      },
    },
  });
  const signature = signWebhook(webhookPayload, WEBHOOK_SECRET);
  const res = await callWebhook(webhookPayload, signature);
  console.log(`Response status: ${res.status}`);
  console.log(`Response body: ${JSON.stringify(res.body)}`);

  if (res.status !== 200) {
    console.error("FAILED: Expected 200, got", res.status);
    process.exit(1);
  }
  console.log("");

  // ── Test 4: Verify order was updated ────────────────────────────────
  console.log("=== Test 4: Verify order updated ===");
  const updated = (
    await db.select().from(order).where(eq(order.id, testOrderId))
  )[0];
  console.log(`paymentStatus: ${updated.paymentStatus} (expected: paid)`);
  console.log(`status: ${updated.status} (expected: processing)`);
  console.log(`razorpayPaymentId: ${updated.razorpayPaymentId ?? "(null)"}`);

  if (updated.paymentStatus !== "paid") {
    console.error("FAILED: paymentStatus should be 'paid'");
    process.exit(1);
  }
  if (updated.status !== "processing") {
    console.error("FAILED: status should be 'processing'");
    process.exit(1);
  }

  // ── Test 4b: Check order event was created ──────────────────────────
  console.log("=== Test 4b: Verify order event created ===");
  const events = await db
    .select()
    .from(orderEvent)
    .where(eq(orderEvent.orderId, testOrderId));
  console.log(`Events found: ${events.length} (expected: >=1)`);
  if (events.length === 0) {
    console.error("FAILED: No order event created");
    process.exit(1);
  }
  console.log(`Event stage: ${events[0]?.stage}`);
  console.log(`Event note: ${events[0]?.note ?? "(none)"}`);
  console.log("");

  // ── Test 5: Invalid signature returns 400 ───────────────────────────
  console.log("=== Test 5: Invalid signature ===");
  const resBad = await callWebhook(webhookPayload, "tampered_signature");
  console.log(`Response status: ${resBad.status} (expected: 400)`);
  if (resBad.status !== 400) {
    console.error("FAILED: Expected 400 for invalid signature");
    process.exit(1);
  }
  console.log("");

  // ── Test 6: payment.failed webhook ──────────────────────────────────
  console.log("=== Test 6: payment.failed webhook ===");
  await db
    .update(order)
    .set({
      paymentStatus: "pending",
      status: "pending",
      razorpayPaymentId: null,
    })
    .where(eq(order.id, testOrderId));

  const failPayload = JSON.stringify({
    event: "payment.failed",
    payload: {
      payment: {
        entity: {
          id: `pay_fail_${Date.now()}`,
          order_id: razorpayOrderId,
        },
      },
    },
  });
  const failSig = signWebhook(failPayload, WEBHOOK_SECRET);
  const resFail = await callWebhook(failPayload, failSig);
  console.log(`Response status: ${resFail.status}`);
  if (resFail.status !== 200) {
    console.error("FAILED: Expected 200, got", resFail.status);
    process.exit(1);
  }

  const failedOrder = (
    await db.select().from(order).where(eq(order.id, testOrderId))
  )[0];
  console.log(`paymentStatus: ${failedOrder.paymentStatus} (expected: failed)`);
  console.log(`status: ${failedOrder.status} (expected: cancelled)`);
  if (failedOrder.paymentStatus !== "failed") {
    console.error("FAILED: paymentStatus should be 'failed'");
    process.exit(1);
  }
  console.log("");

  // ── Cleanup ────────────────────────────────────────────────────────
  console.log("=== Cleanup ===");
  await db.delete(orderEvent).where(eq(orderEvent.orderId, testOrderId));
  await db.delete(order).where(eq(order.id, testOrderId));
  console.log(`Deleted test order ${testOrderId} and its events`);

  console.log("\n✅ All webhook tests passed!");
}

main().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
