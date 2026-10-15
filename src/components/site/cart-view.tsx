"use client";

import { IconArrowRight, IconTrash } from "@tabler/icons-react";
import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ProductCard } from "@/components/site/product-card";
import { QuickViewProvider } from "@/components/site/quick-view";
import { Button } from "@/components/ui/button";
import { inr, PRODUCTS } from "@/lib/catalog";
import {
  COD_LIMIT,
  FREE_DELIVERY_OVER,
  findCoupon,
  totals,
} from "@/lib/commerce";
import { paidLines, useStore } from "@/lib/stores";

export function CartView() {
  const { cart, hydrated, setQty, removeLine, setSaved } = useStore();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<ReturnType<typeof findCoupon>>();

  const paid = paidLines(cart);
  const saved = cart.filter((l) => l.saved);

  const t = totals(
    paid.map((x) => ({ price: x.product.price, qty: x.line.qty })),
    applied ?? undefined,
  );

  const codOk = t.subtotal - t.discount <= COD_LIMIT;

  const applyCoupon = () => {
    const found = findCoupon(code);
    if (!found) {
      setApplied(undefined);
      toast.error(`“${code.trim().toUpperCase()}” is not a code we recognise`);
      return;
    }
    setApplied(found);
    toast.success(`${found.code} applied`, { description: found.note });
  };

  if (!hydrated) return <div className="shell py-10 lg:py-14" />;

  if (cart.length === 0)
    return (
      <div className="shell py-10 lg:py-14">
        <h1 className="t-banner">Your bag</h1>
        <p className="prose mt-5 max-w-prose">Nothing in it yet.</p>
        <Link
          href="/shop"
          className="link-draw mt-6 inline-block text-[0.95rem]"
        >
          Browse the catalogue
        </Link>
        <section className="mt-24 border-t border-[color:var(--line)] pt-12">
          <h2 className="t-h2">Start with these</h2>
          <div className="mt-8">
            <QuickViewProvider>
              <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
                {PRODUCTS.filter((p) => p.badge === "Bestseller").map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </QuickViewProvider>
          </div>
        </section>
      </div>
    );

  return (
    <div className="shell py-10 lg:py-14">
      <h1 className="t-banner">Your bag</h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Lines */}
        <div className="lg:col-span-7">
          <ul className="border-t border-[color:var(--line-2)]">
            {cart.map((l) => {
              const p = PRODUCTS.find((x) => x.id === l.productId);
              if (!p) return null;
              return (
                <li
                  key={l.key}
                  className={cn(
                    "flex gap-4 border-b border-[color:var(--line)] py-6",
                    l.saved && "opacity-55",
                  )}
                >
                  <Link
                    href={`/shop/${p.id}`}
                    className="relative aspect-4/5 w-24 shrink-0 overflow-hidden bg-[color:var(--paper-3)]"
                  >
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-[0.95rem] font-medium">
                          <Link href={`/shop/${p.id}`} className="link-draw">
                            {p.name}
                          </Link>
                        </h2>
                        <p className="mt-1 text-[0.82rem] text-[color:var(--ink-3)]">
                          {l.color} · Size {l.size}
                        </p>
                      </div>
                      <p className="num shrink-0 text-[0.95rem]">
                        {inr(p.price * l.qty)}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4">
                      <div className="flex items-center border border-[color:var(--line-2)]">
                        <button
                          type="button"
                          onClick={() => setQty(l.key, l.qty - 1)}
                          aria-label={`Reduce quantity of ${p.name}`}
                          className="px-3 py-1.5 text-[0.9rem] hover:bg-[color:var(--paper-3)]"
                        >
                          −
                        </button>
                        <span className="num w-8 text-center text-[0.9rem]">
                          {l.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(l.key, l.qty + 1)}
                          disabled={l.qty >= 10}
                          aria-label={`Increase quantity of ${p.name}`}
                          className="px-3 py-1.5 text-[0.9rem] hover:bg-[color:var(--paper-3)] disabled:opacity-35"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSaved(l.key, !l.saved)}
                        className="link-draw text-[0.8rem]"
                      >
                        {l.saved ? "Move to bag" : "Save for later"}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeLine(l.key)}
                        aria-label={`Remove ${p.name} from bag`}
                        className="ml-auto flex items-center gap-1.5 text-[0.8rem] text-[color:var(--ink-3)] hover:text-[color:var(--sale)]"
                      >
                        <IconTrash size={14} stroke={1.5} />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {saved.length > 0 && (
            <div className="mt-10 border-t border-[color:var(--line)] pt-6">
              <h2 className="label text-[color:var(--ink-3)]">
                Saved for later · {saved.length}
              </h2>
              <p className="prose mt-2 text-[0.85rem]">
                Kept in your bag but not paid for. They disappear when you clear
                the basket.
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="lg:col-span-5">
          <div className="border border-[color:var(--line-2)] p-6">
            <h2 className="t-h3">Summary</h2>

            <dl className="mt-5 space-y-2.5 text-[0.9rem]">
              <Row label="Subtotal" value={inr(t.subtotal)} />
              {t.discount > 0 && (
                <Row
                  label={`Discount (${applied?.code})`}
                  value={`−${inr(t.discount)}`}
                  accent
                />
              )}
              <Row
                label="Delivery"
                value={t.shipping === 0 ? "Free" : inr(t.shipping)}
              />
              <Row label="GST (5%)" value={inr(t.tax)} />
              <div className="flex items-baseline justify-between border-t border-[color:var(--line)] pt-3 text-[1.05rem]">
                <dt className="font-medium">Total</dt>
                <dd className="num">{inr(t.total)}</dd>
              </div>
            </dl>

            {t.freeShippingGap > 0 && (
              <p className="mt-4 border-l-2 border-[color:var(--indigo)] pl-3 text-[0.83rem]">
                {inr(t.freeShippingGap)} more for free delivery.
              </p>
            )}

            {!codOk && (
              <p className="mt-4 border-l-2 border-[color:var(--sale)] pl-3 text-[0.83rem]">
                Over ₹10,000, so this is card or UPI only. No cash on delivery.
              </p>
            )}

            {/* Coupon */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                applyCoupon();
              }}
              className="mt-6 flex gap-2 border-t border-[color:var(--line)] pt-5"
            >
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Discount code"
                aria-label="Discount code"
                className="min-w-0 flex-1 border border-[color:var(--line-2)] px-3 py-2.5 text-[0.85rem] uppercase outline-none focus:border-[color:var(--ink)]"
              />
              <button
                type="submit"
                className="border border-[color:var(--ink)] px-4 text-[0.85rem] transition-colors hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
              >
                Apply
              </button>
            </form>
            {applied && (
              <button
                type="button"
                onClick={() => {
                  setApplied(undefined);
                  setCode("");
                }}
                className="link-draw mt-2 text-[0.8rem]"
              >
                Remove {applied.code}
              </button>
            )}

            <Button asChild className="mt-6 w-full rounded-4xl py-4">
              <Link href="/checkout">
                Checkout
                <IconArrowRight size={16} stroke={1.6} />
              </Link>
            </Button>

            <p className="mt-4 text-[0.8rem] text-[color:var(--ink-3)]">
              Cash on delivery up to ₹10,000. Free delivery over{" "}
              {inr(FREE_DELIVERY_OVER)}. 15 days to exchange, collected from
              your door.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[color:var(--ink-2)]">{label}</dt>
      <dd className={cn("num", accent && "text-[color:var(--sale)]")}>
        {value}
      </dd>
    </div>
  );
}
