"use client";

import { useEffect } from "react";
import { ProductCard } from "@/components/site/product-card";
import { resolveProducts, useStore } from "@/lib/stores";

/**
 * Recently viewed, driven by localStorage.
 *
 * Returns null until the store has hydrated — rendering the empty state for a
 * frame and then filling it in is worse than rendering nothing, so the section
 * simply does not exist until we know whether there is anything in it.
 *
 * The product currently being viewed is filtered out by the caller.
 */
export function RecentlyViewed({
  exclude,
  title = "Recently viewed",
}: {
  exclude?: string;
  title?: string;
}) {
  const { recent, hydrated } = useStore();

  const ids = recent.filter((id) => id !== exclude).slice(0, 4);
  const products = resolveProducts(ids);
  const show = hydrated && products.length > 0;

  return show ? (
    <section className="mt-20 border-t border-[color:var(--line)] pt-12">
      <h2 className="t-h2">{title}</h2>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  ) : null;
}

/** Records a visit. Mounted on the product page; writes once per product. */
export function RecordView({ id }: { id: string }) {
  const { markViewed, hydrated } = useStore();

  useEffect(() => {
    if (!hydrated) return;
    markViewed(id);
  }, [hydrated, id, markViewed]);

  return null;
}
