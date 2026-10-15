"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES, type CategoryId, PRODUCTS } from "@/lib/catalog";
import { HeadingLines } from "./motion";
import { ProductCard } from "./product-card";
import { QuickViewHost, QuickViewProvider } from "./quick-view";

type Filter = "all" | CategoryId;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Everything" },
  ...CATEGORIES.map((c) => ({ id: c.id as Filter, label: c.label })),
];

export function NewIn() {
  const [filter, setFilter] = useState<Filter>("all");

  const shown =
    filter === "all"
      ? PRODUCTS.slice(0, 8)
      : PRODUCTS.filter((p) => p.category === filter);

  return (
    <section
      id="new-in"
      className="shell border-t border-[color:var(--line)] pt-16 pb-[var(--band)]"
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <HeadingLines
            as="h2"
            className="t-h2"
            lines={["New in", "this week"]}
          />
          <p className="mt-4 text-[0.95rem] text-[color:var(--ink-2)]">
            What came off the line last. Ordered by what people are actually
            buying, not by what we want to clear.
          </p>
        </div>
        <Link
          href="/shop"
          className="link-draw inline-flex items-center gap-1.5 pb-0.5 text-[0.9rem] font-medium"
        >
          All {PRODUCTS.length} pieces
          <IconArrowRight size={15} stroke={1.8} />
        </Link>
      </div>

      {/* Filters — shadcn Tabs so the row gets real tab semantics and keyboard
          arrow navigation without re-inventing them */}
      <Tabs
        value={filter}
        onValueChange={(v) => setFilter(v as Filter)}
        className="mt-10"
      >
        <TabsList className="h-auto flex-wrap justify-start gap-x-7 gap-y-3 rounded-none border-b border-[color:var(--line)] bg-transparent p-0">
          {FILTERS.map((f) => (
            <TabsTrigger
              key={f.id}
              value={f.id}
              className="link-draw h-auto rounded-none px-0 pb-3 text-[0.92rem] font-normal text-[color:var(--ink-3)] shadow-none transition-colors hover:text-[color:var(--ink-2)] data-[state=active]:font-medium data-[state=active]:text-[color:var(--ink)]"
            >
              {f.label}
              <span className="num ml-1.5 text-[0.75rem] text-[color:var(--ink-3)]">
                {f.id === "all"
                  ? PRODUCTS.length
                  : PRODUCTS.filter((p) => p.category === f.id).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <QuickViewProvider>
        <motion.div
          layout
          className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 lg:gap-x-6"
        >
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{
                  duration: 0.45,
                  delay: Math.min(i, 7) * 0.035,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        <QuickViewHost />
      </QuickViewProvider>

      {shown.length === 0 && (
        <p className="mt-12 text-[0.95rem] text-[color:var(--ink-2)]">
          Nothing in this category yet. Try another one, or{" "}
          <Link href="/shop" className="link-draw">
            see everything
          </Link>
          .
        </p>
      )}
    </section>
  );
}
