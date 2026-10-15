"use client";

import { IconCheck, IconPackage, IconTruckDelivery } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "@/lib/account";
import { inr, PRODUCTS } from "@/lib/catalog";

/**
 * Order confirmation.
 *
 * Reads the order the account store recorded at checkout. In production this
 * page fetches by order id from the server — same page, same layout, a real
 * data source. If the order is not on this device (a shared link, a different
 * browser) it degrades to a confirmation without line items rather than
 * pretending to know what was bought.
 */
export function OrderSuccess({ orderId }: { orderId?: string }) {
  const { orderById, hydrated } = useAccount();
  const order = orderId ? orderById(orderId) : undefined;

  if (!hydrated) return <div className="shell py-10 lg:py-14" />;

  const eta = new Date(order?.placedAt ?? Date.now());
  eta.setDate(eta.getDate() + (order?.method === "store" ? 0 : 4));

  return (
    <div className="shell py-10 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <IconCheck size={32} stroke={1.3} />
        <h1 className="t-banner mt-6">Order placed</h1>

        <p className="prose mt-5">
          Thank you. We have your order and a confirmation is on its way to{" "}
          {order?.email ? (
            <strong className="font-medium">{order.email}</strong>
          ) : (
            "your email"
          )}
          .
        </p>

        <dl className="mt-10 border-y border-[color:var(--line-2)] py-6 text-[0.9rem]">
          <div className="flex gap-4">
            <dt className="w-32 shrink-0 text-[color:var(--ink-3)]">
              Order number
            </dt>
            <dd className="num font-medium">{order?.id ?? "—"}</dd>
          </div>
          <div className="mt-3 flex gap-4">
            <dt className="w-32 shrink-0 text-[color:var(--ink-3)]">
              Arriving by
            </dt>
            <dd className="num">
              {eta.toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </dd>
          </div>
          <div className="mt-3 flex gap-4">
            <dt className="w-32 shrink-0 text-[color:var(--ink-3)]">Payment</dt>
            <dd>{order?.cod ? "Cash on delivery" : "UPI on delivery"}</dd>
          </div>
          {order?.address && (
            <div className="mt-3 flex gap-4">
              <dt className="w-32 shrink-0 text-[color:var(--ink-3)]">
                Delivering to
              </dt>
              <dd>
                {order.address}, {order.city} {order.pin}
              </dd>
            </div>
          )}
        </dl>

        {order?.lines?.length ? (
          <section className="mt-10">
            <h2 className="t-h3">What is coming</h2>
            <ul className="mt-5 border-t border-[color:var(--line)]">
              {order.lines.map((l) => {
                const p = PRODUCTS.find((x) => x.id === l.productId);
                if (!p) return null;
                return (
                  <li
                    key={l.key}
                    className="flex gap-4 border-b border-[color:var(--line)] py-4"
                  >
                    <span className="relative aspect-4/5 w-16 shrink-0 overflow-hidden bg-[color:var(--paper-3)]">
                      <Image
                        src={p.image}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </span>
                    <span className="flex-1 text-[0.9rem]">
                      <Link href={`/shop/${p.id}`} className="link-draw">
                        {p.name}
                      </Link>
                      <span className="mt-0.5 block text-[0.8rem] text-[color:var(--ink-3)]">
                        {l.color} · {l.size} · Qty {l.qty}
                      </span>
                    </span>
                    <span className="num text-[0.9rem]">
                      {inr(p.price * l.qty)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <dl className="mt-5 space-y-2 text-[0.9rem]">
              <Sum label="Subtotal" value={inr(order.totals.subtotal)} />
              {order.totals.discount > 0 && (
                <Sum
                  label="Discount"
                  value={`−${inr(order.totals.discount)}`}
                />
              )}
              <Sum
                label="Delivery"
                value={
                  order.totals.shipping === 0
                    ? "Free"
                    : inr(order.totals.shipping)
                }
              />
              <Sum label="GST" value={inr(order.totals.tax)} />
              <div className="flex items-baseline justify-between border-t border-[color:var(--line)] pt-3 text-[1.05rem]">
                <dt className="font-medium">Total</dt>
                <dd className="num">{inr(order.totals.total)}</dd>
              </div>
            </dl>
          </section>
        ) : (
          <p className="prose mt-10">
            We cannot show the line items for this order on this device. The
            confirmation email has the full breakdown.
          </p>
        )}

        <div className="mt-12 flex flex-wrap gap-6 border-t border-[color:var(--line)] pt-8 text-[0.9rem]">
          <span className="flex items-start gap-2.5">
            <IconPackage size={17} stroke={1.5} className="mt-0.5" />
            Track it with the order number above
          </span>
          <span className="flex items-start gap-2.5">
            <IconTruckDelivery size={17} stroke={1.5} className="mt-0.5" />
            15 days to exchange once it arrives
          </span>
        </div>

        <div className="mt-8 flex flex-wrap gap-6">
          <Link
            href={`/track-order?order=${order?.id ?? ""}`}
            className="link-draw text-[0.9rem]"
          >
            Track this order
          </Link>
          <Link href="/shop" className="link-draw text-[0.9rem]">
            Keep shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

function Sum({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[color:var(--ink-2)]">{label}</dt>
      <dd className="num">{value}</dd>
    </div>
  );
}
