"use client";

import { IconCheck, IconHeart, IconTruckDelivery } from "@tabler/icons-react";
import { cn } from "cn";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ProductCard } from "@/components/site/product-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryLabel, inr, type Product, SIZES } from "@/lib/catalog";

const SIZE_NOTE: Record<string, string> = {
  XS: "34–36 in chest",
  S: "36–38 in chest",
  M: "38–40 in chest",
  L: "40–42 in chest",
  XL: "42–44 in chest",
  XXL: "44–46 in chest",
};

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [frame, setFrame] = useState<0 | 1>(0);
  const [colour, setColour] = useState(product.colors[0].name);
  const [size, setSize] = useState<string | null>(null);
  const [wished, setWished] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const shots = [product.image, product.altImage];

  return (
    <div className="shell py-10">
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
        {/* Frames */}
        <div className="lg:col-span-7">
          <div className="relative aspect-4/5 overflow-hidden bg-[color:var(--paper-3)]">
            {!loaded && (
              <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
            )}
            <AnimateFrame
              key={shots[frame]}
              src={shots[frame]}
              alt={`${product.name}, view ${frame + 1}`}
              onLoad={() => setLoaded(true)}
            />
            {product.badge && (
              <span className="label absolute top-4 left-4 bg-[color:var(--paper)] px-2 py-1">
                {product.badge}
              </span>
            )}
          </div>

          <div className="mt-3 flex gap-3">
            {shots.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => setFrame(i as 0 | 1)}
                aria-label={`View image ${i + 1}`}
                aria-pressed={frame === i}
                className={cn(
                  "relative aspect-4/5 w-20 overflow-hidden bg-[color:var(--paper-3)] transition-opacity",
                  frame === i
                    ? "ring-1 ring-[color:var(--ink)]"
                    : "opacity-60 hover:opacity-100",
                )}
              >
                <Image
                  src={s}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

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
              <Link href="/#fit" className="link-draw text-[0.8rem]">
                Size guide
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={cn(
                    "border py-3 text-[0.85rem] transition-colors",
                    size === s
                      ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]"
                      : "border-[color:var(--line-2)] hover:border-[color:var(--ink)]",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton strength={0.25}>
              <button
                type="button"
                disabled={!size}
                onClick={() =>
                  toast.success(`${product.name} added to your bag`, {
                    description: `${size} · ${colour} · ${inr(product.price)}`,
                  })
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-4xl bg-[color:var(--ink)] px-8 py-4 text-sm font-medium text-[color:var(--paper)] disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto"
              >
                {size ? `Add to bag — ${inr(product.price)}` : "Pick a size"}
              </button>
            </MagneticButton>

            <button
              type="button"
              onClick={() => setWished((v) => !v)}
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

          <p className="mt-3 min-h-5 text-[0.83rem] text-[color:var(--ink-2)]">
            {size
              ? `${size} — ${SIZE_NOTE[size]}`
              : "Pick a size to add this to your bag."}
          </p>

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

          <dl className="mt-6 space-y-3 border-t border-[color:var(--line)] pt-6 text-[0.875rem]">
            <div className="flex gap-4">
              <dt className="w-28 shrink-0 text-[color:var(--ink-3)]">
                Fabric
              </dt>
              <dd>{product.fabric}</dd>
            </div>
            <div className="flex gap-4">
              <dt className="w-28 shrink-0 text-[color:var(--ink-3)]">Care</dt>
              <dd>Machine wash cold. Dry in shade. Warm iron.</dd>
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
    </div>
  );
}

function AnimateFrame({
  src,
  alt,
  onLoad,
}: {
  src: string;
  alt: string;
  onLoad: () => void;
}) {
  return (
    <motion.div
      key={src}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0"
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority
        onLoad={onLoad}
        sizes="(max-width: 1024px) 100vw, 55vw"
        className="object-cover"
      />
    </motion.div>
  );
}
