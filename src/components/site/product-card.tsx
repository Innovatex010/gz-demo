"use client";

import { IconHeart, IconShoppingBagPlus } from "@tabler/icons-react";
import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const [loaded, setLoaded] = useState(false);
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
        {/* The frame is reserved up front, so nothing jumps when it lands */}
        {!loaded && (
          <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
        )}

        <Image
          src={product.image}
          alt={`${product.name} in ${product.colors[0].name}`}
          fill
          priority={priority}
          onLoad={() => setLoaded(true)}
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
          <Badge
            variant={product.badge === "Last few left" ? "sale" : "default"}
            className="absolute top-3 left-3"
          >
            {product.badge}
          </Badge>
        )}

        {/* Quick actions answer the hover — they rise from the frame edge */}
        <div className="pointer-events-none absolute inset-x-2 bottom-2 hidden translate-y-3 gap-2 opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover/card:translate-y-0 group-hover/card:opacity-100 md:flex">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toast.success(`${product.name} added to your bag`, {
                description: `${inr(product.price)} · pick a size on the product page`,
                action: {
                  label: "View",
                  onClick: () => router.push(`/shop/${product.id}`),
                },
              });
            }}
            className="pointer-events-auto flex flex-1 items-center justify-center gap-2 bg-[color:var(--paper)] py-3 text-[0.8rem] font-medium transition-colors hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
          >
            <IconShoppingBagPlus size={16} stroke={1.6} />
            Add to bag
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const next = !wished;
              setWished(next);
              if (next) {
                toast(`${product.name} saved for later`, {
                  description: "You have 4 saved items.",
                });
              }
            }}
            aria-label={wished ? "Remove from wishlist" : "Save for later"}
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
    </article>
  );
}
