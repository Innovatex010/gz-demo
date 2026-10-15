"use client";

import Link from "next/link";
import { ProductGrid } from "@/components/site/product-card";
import { CATEGORIES } from "@/lib/catalog";
import { resolveProducts, useStore } from "@/lib/stores";

/** Wishlist. localStorage for now — see the note in `stores.tsx`. */
export function WishlistView() {
  const { wishlist, hydrated, toggleWishlist } = useStore();
  const products = resolveProducts(wishlist);

  if (!hydrated) return <div className="shell py-10 lg:py-14" />;

  if (products.length === 0)
    return (
      <div className="shell py-10 lg:py-14">
        <h1 className="t-banner">Saved</h1>
        <p className="prose mt-5 max-w-prose">
          Nothing saved yet. Tap the heart on any style and it stays here —
          across visits, on this device.
        </p>
        <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <Link href={c.href} className="link-draw text-[0.95rem]">
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <div className="shell py-10 lg:py-14">
      <h1 className="t-banner">Saved</h1>
      <p className="num mt-5 text-[0.85rem] text-[color:var(--ink-3)]">
        {products.length} {products.length === 1 ? "style" : "styles"}
      </p>

      <div className="mt-12">
        <ProductGrid
          products={products}
          className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6"
        />
      </div>

      <button
        type="button"
        onClick={() => {
          for (const p of products) toggleWishlist(p);
        }}
        className="link-draw mt-12 text-[0.85rem] text-[color:var(--ink-3)]"
      >
        Clear all
      </button>
    </div>
  );
}
