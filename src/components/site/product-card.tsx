"use client";

import { IconHeart, IconShoppingBagPlus } from "@tabler/icons-react";
import { cn } from "cn";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { inr, type Product } from "@/lib/catalog";

export function ProductCard({
  product,
  priority,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const [hover, setHover] = useState(false);
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);

  const onSale = typeof product.compareAt === "number";

  return (
    <article
      className={cn("group/card relative flex flex-col", className)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link
        href={`/shop/${product.id}`}
        className="relative block aspect-4/5 overflow-hidden bg-[color:var(--paper-3)]"
      >
        <Image
          src={product.image}
          alt={`${product.name} in ${product.colors[0].name}`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            "object-cover transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)]",
            hover ? "scale-[1.04] opacity-0" : "scale-100 opacity-100",
          )}
        />
        <Image
          src={product.altImage}
          alt=""
          aria-hidden
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            "object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)]",
            hover ? "scale-[1.04] opacity-100" : "scale-100 opacity-0",
          )}
        />

        {product.badge && (
          <span
            className={cn(
              "label absolute top-3 left-3 px-2 py-1",
              product.badge === "Last few left"
                ? "bg-[color:var(--sale)] text-[color:var(--paper)]"
                : "bg-[color:var(--paper)] text-[color:var(--ink)]",
            )}
          >
            {product.badge}
          </span>
        )}

        {/* Quick actions answer the hover — they slide in from the frame edge */}
        <div className="pointer-events-none absolute inset-x-2 bottom-2 hidden translate-y-3 gap-2 opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover/card:translate-y-0 group-hover/card:opacity-100 md:flex">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setAdded(true);
            }}
            className="pointer-events-auto flex flex-1 items-center justify-center gap-2 bg-[color:var(--paper)] py-3 text-[0.8rem] font-medium transition-colors hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
          >
            <IconShoppingBagPlus size={16} stroke={1.6} />
            {added ? "Added to bag" : "Add to bag"}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setWished((v) => !v);
            }}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "pointer-events-auto grid size-[42px] place-items-center transition-colors",
              wished
                ? "bg-[color:var(--indigo)] text-[color:var(--paper)]"
                : "bg-[color:var(--paper)] hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]",
            )}
          >
            <IconHeart
              size={16}
              stroke={1.6}
              fill={wished ? "currentColor" : "none"}
            />
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[0.9rem] leading-snug font-medium">
            <Link href={`/shop/${product.id}`} className="link-draw">
              {product.name}
            </Link>
          </h3>
          <p className="num shrink-0 text-[0.95rem]">
            {onSale && (
              <span className="mr-1.5 text-[0.8rem] text-[color:var(--ink-3)] line-through">
                {inr(product.compareAt as number)}
              </span>
            )}
            <span className={cn(onSale && "text-[color:var(--sale)]")}>
              {inr(product.price)}
            </span>
          </p>
        </div>

        <p className="mt-1 text-[0.82rem] text-[color:var(--ink-3)]">
          {product.fabric}
        </p>

        <div className="mt-2 flex items-center gap-1.5">
          {product.colors.map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="size-2.5 rounded-full ring-1 ring-[color:var(--line-2)] ring-offset-1 ring-offset-[color:var(--paper)]"
              style={{ backgroundColor: c.hex }}
            />
          ))}
          <span className="ml-1 text-[0.72rem] text-[color:var(--ink-3)]">
            {product.colors.length} colours
          </span>
        </div>
      </div>

      {/* Confirmation only when it happens — no permanent state row */}
      <AnimatePresence>
        {added && (
          <motion.span
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="sr-only"
            role="status"
          >
            {product.name} added to bag
          </motion.span>
        )}
      </AnimatePresence>
    </article>
  );
}
