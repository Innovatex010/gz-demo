"use client";

import { IconCheck, IconHeart, IconTruckDelivery } from "@tabler/icons-react";
import { cn } from "cn";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { DeliveryEstimate } from "@/components/site/delivery-estimate";
import { ProductCard } from "@/components/site/product-card";
import { ProductGallery } from "@/components/site/product-gallery";
import { RecentlyViewed, RecordView } from "@/components/site/recently-viewed";
import { Reviews } from "@/components/site/reviews";
import { SizeGuide } from "@/components/site/size-guide";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { categoryLabel, inr, type Product } from "@/lib/catalog";
import { sizeStock, stockLine } from "@/lib/commerce";
import { useStore } from "@/lib/stores";

const FIT_NOTE: Record<string, string> = {
  Slim: "Follows the body. Take your usual size, or one down for a closer line.",
  Regular: "Straight through the chest, room at the waist. Your usual size.",
  Relaxed: "Cut wide on purpose. Size down if you want it to sit closer.",
  Oversized: "Deliberately roomy. Size down if you want it to sit closer.",
};

export function ProductDetail({
  product,
  related,
  complete,
}: {
  product: Product;
  related: Product[];
  complete: Product[];
}) {
  const { addToCart, toggleWishlist, inWishlist, hydrated } = useStore();

  const [colour, setColour] = useState(product.colors[0].name);
  const [size, setSize] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const wished = hydrated && inWishlist(product.id);
  const inStock = size ? sizeStock(product, size) > 0 : true;
  const outEverywhere = product.sizes.every((s) => sizeStock(product, s) === 0);

  const onAdd = () => {
    setTouched(true);
    if (!size) {
      toast.error("Pick a size first", {
        description: "Sizes and stock differ per style.",
      });
      return;
    }
    if (!inStock) {
      toast.error(`${size} is out of stock`);
      return;
    }
    addToCart(product, size, colour);
    toast.success(`${product.name} added to your bag`, {
      description: `${size} · ${colour} · ${inr(product.price)}`,
      action: {
        label: "View bag",
        onClick: () => {
          window.location.href = "/cart";
        },
      },
    });
  };

  return (
    <div className="shell py-10">
      <RecordView id={product.id} />

      <Breadcrumb>
        <BreadcrumbList className="text-[0.8rem] text-[color:var(--ink-3)]">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/shop">Shop</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/shop?c=${product.category}`}>
                {categoryLabel(product.category)}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-[color:var(--ink-2)]">
              {product.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <ProductGallery
          product={product}
          colorName={colour}
          badge={product.badge}
        />

        {/* Buy column */}
        <div className="lg:col-span-5">
          <p className="num text-[0.85rem] text-[color:var(--ink-3)]">
            {product.id}
          </p>
          <h1 className="t-h2 mt-2">{product.name}</h1>

          <p className="mt-4 text-[1.05rem]">
            <span className="num text-[1.5rem]">{inr(product.price)}</span>
            {product.compareAt && (
              <span className="num ml-3 text-[1rem] text-[color:var(--ink-3)] line-through">
                {inr(product.compareAt)}
              </span>
            )}
          </p>

          <p className="prose mt-5">{product.fit}</p>

          {/* Colour */}
          <div className="mt-8">
            <div className="flex items-baseline justify-between">
              <h2 className="label text-[color:var(--ink-3)]">Colour</h2>
              <span className="text-[0.85rem]">{colour}</span>
            </div>
            <div className="mt-3 flex gap-3">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColour(c.name)}
                  aria-pressed={colour === c.name}
                  className={cn(
                    "size-9 rounded-full ring-1 ring-[color:var(--line-2)] ring-offset-2 ring-offset-[color:var(--paper)]",
                    colour === c.name && "ring-2 ring-[color:var(--ink)]",
                  )}
                  style={{ backgroundColor: c.hex }}
                >
                  <span className="sr-only">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mt-8">
            <div className="flex items-baseline justify-between">
              <h2 className="label text-[color:var(--ink-3)]">Size</h2>
              <SizeGuide product={product} />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {product.sizes.map((s) => {
                const n = sizeStock(product, s);
                const out = n === 0;
                const low = !out && n <= 4;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSize(s);
                      setTouched(true);
                    }}
                    aria-pressed={size === s}
                    disabled={out}
                    className={cn(
                      "relative border py-3 text-[0.85rem] transition-colors",
                      size === s
                        ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]"
                        : "border-[color:var(--line-2)] hover:border-[color:var(--ink)]",
                      out &&
                        "cursor-not-allowed text-[color:var(--ink-3)] line-through opacity-55 hover:border-[color:var(--line-2)]",
                    )}
                  >
                    {s}
                    {low && (
                      <span className="absolute inset-x-0 -bottom-0.5 mx-auto block size-1 rounded-full bg-[color:var(--sale)]" />
                    )}
                  </button>
                );
              })}
            </div>

            <p
              aria-live="polite"
              className={cn(
                "mt-3 min-h-5 text-[0.83rem]",
                touched && size && !inStock
                  ? "text-[color:var(--sale)]"
                  : "text-[color:var(--ink-2)]",
              )}
            >
              {size
                ? stockLine(product, size)
                : outEverywhere
                  ? "Out of stock. We do restock core shirts — leave your number at checkout and we will tell you."
                  : "Pick a size to add this to your bag."}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <MagneticButton strength={0.25}>
              <button
                type="button"
                onClick={onAdd}
                disabled={outEverywhere}
                className="inline-flex w-full items-center justify-center gap-2 rounded-4xl bg-[color:var(--ink)] px-8 py-4 text-sm font-medium text-[color:var(--paper)] disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto"
              >
                {outEverywhere
                  ? "Out of stock"
                  : size
                    ? `Add to bag — ${inr(product.price)}`
                    : "Pick a size"}
              </button>
            </MagneticButton>

            <button
              type="button"
              onClick={() => {
                const now = toggleWishlist(product);
                toast(
                  now
                    ? `${product.name} saved`
                    : `${product.name} removed from saved`,
                );
              }}
              aria-pressed={wished}
              aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              className={cn(
                "grid size-14 place-items-center rounded-4xl border transition-colors",
                wished
                  ? "border-[color:var(--indigo)] bg-[color:var(--indigo)] text-[color:var(--paper)]"
                  : "border-[color:var(--line-2)] hover:border-[color:var(--ink)]",
              )}
            >
              <IconHeart
                size={20}
                stroke={1.5}
                fill={wished ? "currentColor" : "none"}
              />
            </button>
          </div>

          <ul className="mt-6 space-y-2.5 border-t border-[color:var(--line)] pt-6 text-[0.875rem]">
            <li className="flex items-start gap-2.5">
              <IconTruckDelivery
                size={17}
                stroke={1.5}
                className="mt-0.5 shrink-0"
              />
              Delivered in 2–4 days. Free over ₹1,499.
            </li>
            <li className="flex items-start gap-2.5">
              <IconCheck size={17} stroke={1.5} className="mt-0.5 shrink-0" />
              15 days to exchange, picked up from your door.
            </li>
          </ul>

          <DeliveryEstimate className="mt-6" />

          {/* Details */}
          <dl className="mt-6 space-y-3 border-t border-[color:var(--line)] pt-6 text-[0.875rem]">
            <div className="flex gap-4">
              <dt className="w-28 shrink-0 text-[color:var(--ink-3)]">
                Fabric
              </dt>
              <dd>{product.fabric}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 shrink-0 text-[color:var(--ink-3)]">Fit</dt>
              <dd>
                {product.fitName}. {FIT_NOTE[product.fitName]}
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 shrink-0 text-[color:var(--ink-3)]">Care</dt>
              <dd>{product.care}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 shrink-0 text-[color:var(--ink-3)]">Model</dt>
              <dd>
                {product.model.height} tall, wearing {product.model.wears}.
                Chest {product.model.chest}, waist {product.model.waist}.
              </dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 shrink-0 text-[color:var(--ink-3)]">
                Made in
              </dt>
              <dd>Bengaluru, in runs of 200.</dd>
            </div>
          </dl>
        </div>
      </div>

      <Reviews product={product} />

      {related.length > 0 && (
        <section className="mt-24 border-t border-[color:var(--line)] pt-12">
          <h2 className="t-h2">Goes with it</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {complete.length > 0 && (
        <section className="mt-20 border-t border-[color:var(--line)] pt-12">
          <h2 className="t-h2">Complete the look</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-3 lg:gap-x-6">
            {complete.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed exclude={product.id} />
    </div>
  );
}
