"use client";

import { cn } from "cn";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  DefGrid,
  OrderChip,
  Panel,
  PanelHead,
  PayChip,
  QuietLink,
  Row,
  Table,
  Td,
  Th,
} from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  type AdminOrder,
  fmtFull,
  fmtTime,
  type OrderStatus,
  PAY_METHOD_LABEL,
  STAGE_LABEL,
} from "@/lib/admin-data";
import { inr } from "@/lib/catalog";

/* ────────────────────────────────────────────────────────────────────────────
   ONE ORDER
   Everything the desk needs to close the loop: who it is, what they bought,
   where it has been, what to do next. The action verbs are the shop's own —
   confirm, pack, ship, deliver, cancel, refund — and each one leaves a line
   on the timeline, the way the day book gets a line.
   ──────────────────────────────────────────────────────────────────────────── */

const CARRIERS = [
  "Delhivery",
  "Blue Dart",
  "Ekart",
  "India Post",
  "Store pickup",
];

/** The next verb for an order that is still moving. */
const nextStep: Partial<Record<OrderStatus, OrderStatus>> = {
  placed: "confirmed",
  confirmed: "packed",
  packed: "shipped",
};

const STEP_NOTE: Record<string, string> = {
  confirmed: "Payment received, order confirmed with the cutting room",
  packed: "Picked and packed at the Bengaluru store",
  shipped: "Handed to the courier",
  delivered: "Delivered and signed for",
  cancelled: "Cancelled by the shop",
  returned: "Returned by the customer",
};

export function OrderDetail({ order: seed }: { order: AdminOrder }) {
  const [order, setOrder] = useState<AdminOrder>(seed);
  const [carrier, setCarrier] = useState(seed.carrier ?? CARRIERS[0]);
  const [tracking, setTracking] = useState(seed.tracking ?? "");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [doc, setDoc] = useState<"invoice" | "slip" | "summary">("invoice");

  const advance = () => {
    const next = nextStep[order.status];
    if (!next) return;
    setOrder((o) => ({
      ...o,
      status: next,
      carrier: next === "shipped" ? carrier : o.carrier,
      tracking: next === "shipped" && tracking ? tracking : o.tracking,
      events: [
        ...o.events,
        {
          stage: next,
          at: new Date().toISOString(),
          note:
            next === "shipped"
              ? `Handed to ${carrier}${tracking ? ` — ${tracking}` : ""}`
              : STEP_NOTE[next],
        },
      ],
    }));
    toast(
      `${STAGE_LABEL[next as "confirmed" | "packed" | "shipped"]} — ${order.id} updated`,
    );
  };

  const cancel = () => {
    setOrder((o) => ({
      ...o,
      status: "cancelled",
      events: [
        ...o.events,
        {
          stage: "cancelled",
          at: new Date().toISOString(),
          note: "Cancelled by the shop at the customer's request",
        },
      ],
    }));
    setCancelOpen(false);
    toast(`${order.id} cancelled. The stock is back on the shelf.`);
  };

  const refund = () => {
    setOrder((o) => ({ ...o, payment: "refunded" }));
    setRefundOpen(false);
    toast(
      `${inr(order.totals.total)} refunded to the original payment method.`,
    );
  };

  const printDoc = (which: "invoice" | "slip" | "summary") => {
    setDoc(which);
    // Let the sheet swap before the print dialog opens.
    requestAnimationFrame(() => window.print());
  };

  const itemsCount = order.lines.reduce((n, l) => n + l.qty, 0);
  const next = nextStep[order.status];
  const done =
    order.status === "delivered" ||
    order.status === "cancelled" ||
    order.status === "returned";

  return (
    <div className="mx-auto max-w-[76rem] px-4 py-8 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <QuietLink href="/admin/orders" className="text-[0.78rem]">
            ← All orders
          </QuietLink>
          <h1 className="num mt-2 text-[1.6rem] leading-none font-semibold tracking-tight text-[color:var(--ink)]">
            {order.id}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-[0.85rem] text-[color:var(--ink-2)]">
            <OrderChip status={order.status} />
            <PayChip payment={order.payment} />
            <span className="text-[color:var(--ink-3)]">
              {itemsCount} {itemsCount === 1 ? "item" : "items"} · placed{" "}
              {fmtFull(order.placedAt)}, {fmtTime(order.placedAt)}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {order.expectedBy ? (
            <p className="num mr-2 text-[0.8rem] text-[color:var(--ink-2)]">
              With {order.carrier} · expected by {fmtFull(order.expectedBy)}
            </p>
          ) : null}

          {next ? (
            <Button size="sm" onClick={advance}>
              Mark{" "}
              {STAGE_LABEL[
                next as "confirmed" | "packed" | "shipped"
              ].toLowerCase()}
            </Button>
          ) : null}

          {order.status === "shipped" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setOrder((o) => ({
                  ...o,
                  status: "delivered",
                  events: [
                    ...o.events,
                    {
                      stage: "delivered",
                      at: new Date().toISOString(),
                      note: STEP_NOTE.delivered,
                    },
                  ],
                }));
                toast(`${order.id} marked delivered.`);
              }}
            >
              Mark delivered
            </Button>
          ) : null}

          <Button
            size="sm"
            variant="outline"
            onClick={() => printDoc("invoice")}
          >
            Print invoice
          </Button>
          <Button size="sm" variant="outline" onClick={() => printDoc("slip")}>
            Packing slip
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => printDoc("summary")}
          >
            Summary
          </Button>

          {order.payment === "paid" && order.status !== "returned" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setRefundOpen(true)}
            >
              Refund
            </Button>
          ) : null}

          {!done ? (
            <Button
              size="sm"
              variant="ghost"
              className="text-[color:var(--sale)]"
              onClick={() => setCancelOpen(true)}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-4">
          {/* What they bought */}
          <Panel>
            <PanelHead
              title="What they bought"
              hint={`${order.lines.length} ${order.lines.length === 1 ? "style" : "styles"}`}
            />
            <Table
              caption="Items on this order"
              head={
                <>
                  <Th>Item</Th>
                  <Th>Size</Th>
                  <Th>Colour</Th>
                  <Th numeric>Qty</Th>
                  <Th numeric>Price</Th>
                  <Th numeric>Line total</Th>
                </>
              }
            >
              {order.lines.map((l) => (
                <Row key={`${l.productId}-${l.size}-${l.color}`}>
                  <Td>
                    <Link
                      href={`/admin/products/${l.productId}`}
                      className="hover:text-[color:var(--indigo)]"
                    >
                      {l.name}
                    </Link>
                  </Td>
                  <Td className="num">{l.size}</Td>
                  <Td>{l.color}</Td>
                  <Td numeric>{l.qty}</Td>
                  <Td numeric>{inr(l.price)}</Td>
                  <Td numeric>{inr(l.price * l.qty)}</Td>
                </Row>
              ))}
            </Table>
            <div className="flex flex-col items-end gap-1 border-t border-[color:var(--line-2)] px-4 py-3">
              {[
                ["Subtotal", order.totals.subtotal],
                order.totals.discount
                  ? [
                      `Discount${order.coupon ? ` (${order.coupon})` : ""}`,
                      -order.totals.discount,
                    ]
                  : null,
                ["Shipping", order.totals.shipping],
                ["GST (5%)", order.totals.tax],
              ]
                .filter((row): row is [string, number] => Boolean(row))
                .map(([label, value]) => (
                  <p
                    key={label}
                    className="num text-[0.82rem] text-[color:var(--ink-2)]"
                  >
                    {label}{" "}
                    <span className="ml-6 inline-block w-20 text-right">
                      {value < 0 ? `− ${inr(-value)}` : inr(value)}
                    </span>
                  </p>
                ))}
              <p className="num mt-1 border-t border-[color:var(--line)] pt-1.5 text-[1.05rem] text-[color:var(--ink)]">
                Total{" "}
                <span className="ml-6 inline-block w-20 text-right">
                  {inr(order.totals.total)}
                </span>
              </p>
            </div>
          </Panel>

          {/* Timeline */}
          <Panel>
            <PanelHead title="Where it has been" hint="Every line is stamped" />
            <ol className="px-4 py-4">
              {order.events.map((e, i) => {
                const bad = e.stage === "cancelled" || e.stage === "returned";
                const last = i === order.events.length - 1;
                return (
                  <li key={`${e.stage}-${e.at}-${i}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        aria-hidden
                        className={cn(
                          "mt-1 block size-2.5 rounded-full border",
                          bad
                            ? "border-[color:var(--sale)] bg-[color:var(--sale)]"
                            : "border-[color:var(--indigo)] bg-[color:var(--indigo)]",
                        )}
                      />
                      {!last ? (
                        <span
                          aria-hidden
                          className="w-px flex-1 bg-[color:var(--line-2)]"
                        />
                      ) : null}
                    </div>
                    <div className={cn("pb-5", last && "pb-0")}>
                      <p className="text-[0.88rem] font-medium text-[color:var(--ink)]">
                        {STAGE_LABEL[e.stage as keyof typeof STAGE_LABEL] ??
                          (e.stage === "cancelled" ? "Cancelled" : "Returned")}
                      </p>
                      <p className="num text-[0.75rem] text-[color:var(--ink-3)]">
                        {fmtFull(e.at)} · {fmtTime(e.at)}
                      </p>
                      {e.note ? (
                        <p className="mt-0.5 text-[0.8rem] text-[color:var(--ink-2)]">
                          {e.note}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Panel>

          {/* Documents — a preview of the sheet that will print */}
          <Panel>
            <PanelHead
              title="Documents"
              hint="What the parcel carries"
              action={
                <div className="flex gap-1">
                  {(
                    [
                      ["invoice", "Invoice"],
                      ["slip", "Packing slip"],
                      ["summary", "Summary"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDoc(key)}
                      aria-pressed={doc === key}
                      className={cn(
                        "border px-2 py-1 text-[0.75rem] transition-colors",
                        doc === key
                          ? "border-[color:var(--ink)] text-[color:var(--ink)]"
                          : "border-[color:var(--line-2)] text-[color:var(--ink-3)] hover:text-[color:var(--ink)]",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              }
            />
            <div className="bg-[color:var(--paper-3)] p-4 lg:p-8">
              <DocSheet order={order} doc={doc} />
            </div>
          </Panel>
        </div>

        {/* Right column: customer, shipping, tracking, payment */}
        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHead title="Customer" />
            <div className="px-4 py-3.5">
              <DefGrid
                rows={[
                  ["Name", order.customer.name],
                  ["Email", order.customer.email],
                  [
                    "Phone",
                    <span key="phone" className="num">
                      {order.customer.phone}
                    </span>,
                  ],
                  [
                    "Customer since",
                    <span key="since" className="num">
                      {fmtFull(order.placedAt)}
                    </span>,
                  ],
                ]}
              />
            </div>
          </Panel>

          <Panel>
            <PanelHead title="Shipping address" />
            <address className="px-4 py-3.5 text-[0.88rem] leading-relaxed text-[color:var(--ink-2)] not-italic">
              {order.customer.name}
              <br />
              {order.address.line1}
              {order.address.line2 ? (
                <>
                  <br />
                  {order.address.line2}
                </>
              ) : null}
              <br />
              {order.address.city} {order.address.pin}
              <br />
              {order.address.state}
            </address>
            <div className="border-t border-[color:var(--line)] px-4 py-3">
              {order.status === "packed" ||
              order.status === "shipped" ||
              order.tracking ? (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="carrier"
                    className="text-[0.72rem] text-[color:var(--ink-3)]"
                  >
                    Carrier
                  </label>
                  <select
                    id="carrier"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    disabled={
                      order.status === "shipped" || order.status === "delivered"
                    }
                    className="h-9 border border-[color:var(--line-2)] bg-[color:var(--paper)] px-2 text-[0.85rem] disabled:opacity-60"
                  >
                    {CARRIERS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <label
                    htmlFor="tracking"
                    className="mt-1 text-[0.72rem] text-[color:var(--ink-3)]"
                  >
                    Tracking number
                  </label>
                  <Input
                    id="tracking"
                    value={tracking}
                    onChange={(e) => setTracking(e.target.value)}
                    placeholder="DH0000000000"
                    disabled={
                      order.status === "shipped" || order.status === "delivered"
                    }
                    className="num rounded-none"
                  />
                  <p className="text-[0.72rem] text-[color:var(--ink-3)]">
                    The customer sees this on their order page the moment it is
                    saved.
                  </p>
                </div>
              ) : (
                <p className="text-[0.82rem] leading-relaxed text-[color:var(--ink-2)]">
                  Add a carrier and tracking number when the parcel leaves the
                  store.
                </p>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelHead title="Payment" />
            <div className="px-4 py-3.5">
              <DefGrid
                rows={[
                  ["Method", PAY_METHOD_LABEL[order.method]],
                  [
                    "Status",
                    <span key="pay" className="flex items-center gap-2">
                      <PayChip payment={order.payment} />
                      {order.payment === "pending" ? (
                        <span className="text-[0.75rem] text-[color:var(--ink-3)]">
                          collected on delivery
                        </span>
                      ) : null}
                    </span>,
                  ],
                  [
                    "Amount",
                    <span className="num" key="amt">
                      {inr(order.totals.total)}
                    </span>,
                  ],
                  [
                    "Collected",
                    <span className="num" key="col">
                      {order.coupon
                        ? `With coupon ${order.coupon}`
                        : "Full price"}
                    </span>,
                  ],
                ]}
              />
            </div>
          </Panel>
        </div>
      </div>

      {/* Confirmations */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="rounded-none sm:max-w-[26rem]">
          <DialogHeader>
            <DialogTitle>Cancel {order.id}?</DialogTitle>
            <DialogDescription>
              {order.payment === "paid"
                ? `The customer paid ${inr(order.totals.total)}. Cancel only after refunding — refund first, then cancel, so the books stay straight.`
                : "This order has not been paid. The stock goes back on the shelf and the customer is told by email."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep the order</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={cancel}
              disabled={order.payment === "paid"}
            >
              Cancel the order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent className="rounded-none sm:max-w-[26rem]">
          <DialogHeader>
            <DialogTitle>Refund {inr(order.totals.total)}</DialogTitle>
            <DialogDescription>
              To {order.customer.name}, by {PAY_METHOD_LABEL[order.method]}. The
              money returns to the original method in 5–7 working days. The
              order is marked returned and the stock comes back.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Not yet</Button>
            </DialogClose>
            <Button variant="destructive" onClick={refund}>
              Record the refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── The sheet that goes in the parcel ────────────────────────────────────── */

function DocSheet({
  order,
  doc,
}: {
  order: AdminOrder;
  doc: "invoice" | "slip" | "summary";
}) {
  const title =
    doc === "invoice"
      ? "Tax invoice"
      : doc === "slip"
        ? "Packing slip"
        : "Order summary";

  return (
    <div className="doc-sheet mx-auto max-w-[40rem] border border-[color:var(--line-2)] bg-[color:var(--paper)] p-6 lg:p-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-[1.2rem] leading-none text-[color:var(--ink)]">
            Good Zone
          </p>
          <p className="mt-1 text-[0.72rem] text-[color:var(--ink-3)]">
            14, Commercial Street, Bengaluru 560001
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.8rem] font-semibold text-[color:var(--ink)]">
            {title}
          </p>
          <p className="num text-[0.75rem] text-[color:var(--ink-3)]">
            {order.id}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-[color:var(--line)] pt-4 text-[0.78rem]">
        <div>
          <p className="text-[color:var(--ink-3)]">Billed to</p>
          <p className="mt-0.5 text-[color:var(--ink)]">
            {order.customer.name}
          </p>
          <p className="text-[color:var(--ink-2)]">{order.address.line1}</p>
          <p className="text-[color:var(--ink-2)]">
            {order.address.city} {order.address.pin}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[color:var(--ink-3)]">Placed</p>
          <p className="num mt-0.5 text-[color:var(--ink-2)]">
            {fmtFull(order.placedAt)}
          </p>
          {doc !== "summary" ? (
            <p className="num mt-2 text-[color:var(--ink-3)]">
              {PAY_METHOD_LABEL[order.method]} ·{" "}
              <span className="capitalize">{order.payment}</span>
            </p>
          ) : null}
        </div>
      </div>

      {doc !== "summary" ? (
        <table className="mt-5 w-full text-[0.78rem]">
          <thead>
            <tr className="border-b border-[color:var(--line-2)]">
              <th className="py-1.5 text-left font-semibold text-[color:var(--ink-3)]">
                {doc === "invoice" ? "Item" : "Pick"}
              </th>
              <th className="py-1.5 text-left font-semibold text-[color:var(--ink-3)]">
                Size
              </th>
              <th className="py-1.5 text-right font-semibold text-[color:var(--ink-3)]">
                Qty
              </th>
              {doc === "invoice" ? (
                <th className="py-1.5 text-right font-semibold text-[color:var(--ink-3)]">
                  Amount
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {order.lines.map((l) => (
              <tr
                key={`${l.productId}-${l.size}-${l.color}`}
                className="border-b border-[color:var(--line)]"
              >
                <td className="py-1.5 text-[color:var(--ink)]">
                  {l.name}
                  <span className="text-[color:var(--ink-3)]">
                    {" "}
                    · {l.color}
                  </span>
                </td>
                <td className="num py-1.5 text-[color:var(--ink-2)]">
                  {l.size}
                </td>
                <td className="num py-1.5 text-right text-[color:var(--ink-2)]">
                  {l.qty}
                </td>
                {doc === "invoice" ? (
                  <td className="num py-1.5 text-right text-[color:var(--ink)]">
                    {inr(l.price * l.qty)}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="mt-5 text-[0.8rem] leading-relaxed text-[color:var(--ink-2)]">
          {order.lines
            .map((l) => `${l.qty} × ${l.name}, ${l.color}, ${l.size}`)
            .join(". ")}
          . Delivered to {order.address.city}.
        </p>
      )}

      {doc === "invoice" ? (
        <div className="mt-4 flex flex-col items-end gap-0.5 text-[0.8rem]">
          <p className="num text-[color:var(--ink-2)]">
            Subtotal {inr(order.totals.subtotal)}
          </p>
          <p className="num text-[color:var(--ink-2)]">
            GST {inr(order.totals.tax)} · Shipping {inr(order.totals.shipping)}
          </p>
          <p className="num mt-1 border-t border-[color:var(--line)] pt-1 text-[0.95rem] font-semibold text-[color:var(--ink)]">
            Total {inr(order.totals.total)}
          </p>
        </div>
      ) : null}

      <p className="mt-5 border-t border-[color:var(--line)] pt-3 text-[0.7rem] leading-relaxed text-[color:var(--ink-3)]">
        Good Zone · care@goodzone.in · +91 80 4123 8890 · Fifteen-day returns,
        picked up from your door. Thank you for buying from the shop.
      </p>
    </div>
  );
}
