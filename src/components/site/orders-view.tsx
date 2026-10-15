"use client";

import { IconPackage, IconTruck } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "@/lib/account";
import { inr } from "@/lib/catalog";

/** Order history. Local until the backend exists — see `account.tsx`. */
export function OrdersView() {
  const { orders, hydrated, products } = useAccount();

  if (!hydrated) return <div className="shell py-10 lg:py-14" />;

  if (orders.length === 0)
    return (
      <div className="shell py-10 lg:py-14">
        <h1 className="t-banner">Your orders</h1>
        <p className="prose mt-5 max-w-prose">No orders on this device yet.</p>
        <Link
          href="/shop"
          className="link-draw mt-6 inline-block text-[0.95rem]"
        >
          Browse the catalogue
        </Link>
      </div>
    );

  return (
    <div className="shell py-10 lg:py-14">
      <h1 className="t-banner">Your orders</h1>

      <ul className="mt-12 space-y-8">
        {orders.map((o) => {
          const eta = new Date(o.placedAt);
          eta.setDate(eta.getDate() + (o.method === "store" ? 0 : 4));
          return (
            <li
              key={o.id}
              className="border-t border-[color:var(--line-2)] pt-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="num text-[0.85rem] text-[color:var(--ink-3)]">
                    {o.id}
                  </p>
                  <p className="mt-1 text-[0.95rem]">
                    Placed{" "}
                    {new Date(o.placedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <p className="num text-[1.05rem]">{inr(o.totals.total)}</p>
              </div>

              <ul className="mt-5 flex flex-wrap gap-3">
                {o.lines.map((l) => {
                  const p = products[l.productId];
                  if (!p) return null;
                  return (
                    <li key={l.key}>
                      <Link
                        href={`/shop/${p.id}`}
                        className="relative block aspect-4/5 w-20 overflow-hidden bg-[color:var(--paper-3)]"
                      >
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                        {l.qty > 1 && (
                          <span className="num absolute top-0 right-0 bg-[color:var(--ink)] px-1.5 text-[0.65rem] text-[color:var(--paper)]">
                            {l.qty}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <dl className="mt-5 grid gap-3 text-[0.85rem] sm:grid-cols-3">
                <div>
                  <dt className="text-[color:var(--ink-3)]">Arriving by</dt>
                  <dd className="num mt-0.5">
                    {eta.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-[color:var(--ink-3)]">Payment</dt>
                  <dd className="mt-0.5">
                    {o.cod ? "Cash on delivery" : "UPI"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[color:var(--ink-3)]">Total</dt>
                  <dd className="num mt-0.5">{inr(o.totals.total)}</dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-6 text-[0.85rem]">
                <Link
                  href={`/track-order?order=${o.id}`}
                  className="link-draw inline-flex items-center gap-1.5"
                >
                  <IconTruck size={14} stroke={1.6} />
                  Track
                </Link>
                <a href={`/returns-policy`} className="link-draw">
                  Exchange or return
                </a>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-16 flex items-start gap-2.5 text-[0.85rem] text-[color:var(--ink-3)]">
        <IconPackage size={17} stroke={1.5} className="mt-0.5 shrink-0" />
        Orders are stored on this device only. Once accounts are server-side
        they will follow you between phone and laptop.
      </p>
    </div>
  );
}
