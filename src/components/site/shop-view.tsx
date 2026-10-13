"use client";

import { IconAdjustmentsHorizontal, IconX } from "@tabler/icons-react";
import { cn } from "cn";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ProductCard } from "@/components/site/product-card";
import {
  CATEGORIES,
  type CategoryId,
  categoryLabel,
  PRODUCTS,
  type Product,
} from "@/lib/catalog";

type Sort = "featured" | "price-low" | "price-high" | "new";

const SORTS: { id: Sort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "new", label: "Newest first" },
  { id: "price-low", label: "Price: low to high" },
  { id: "price-high", label: "Price: high to low" },
];

const PRICE_BANDS = [
  { id: "u1000", label: "Under ₹1,000", test: (p: Product) => p.price < 1000 },
  {
    id: "1000-1600",
    label: "₹1,000 – ₹1,600",
    test: (p: Product) => p.price >= 1000 && p.price <= 1600,
  },
  { id: "o1600", label: "Above ₹1,600", test: (p: Product) => p.price > 1600 },
];

export function ShopView() {
  const params = useSearchParams();
  const [cats, setCats] = useState<CategoryId[]>(() => {
    const c = params.get("c") as CategoryId | null;
    return c && CATEGORIES.some((x) => x.id === c) ? [c] : [];
  });
  const [colours, setColours] = useState<string[]>([]);
  const [bands, setBands] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("featured");
  const [sheet, setSheet] = useState(false);

  const allColours = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of PRODUCTS) {
      for (const c of p.colors) m.set(c.name, c.hex);
    }
    return [...m.entries()];
  }, []);

  const shown = useMemo(() => {
    const out = PRODUCTS.filter((p) => {
      if (cats.length && !cats.includes(p.category)) return false;
      if (colours.length && !p.colors.some((c) => colours.includes(c.name)))
        return false;
      if (
        bands.length &&
        !bands.some((b) => PRICE_BANDS.find((x) => x.id === b)?.test(p))
      )
        return false;
      return true;
    });
    const sorted = [...out];
    if (sort === "price-low") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-high") sorted.sort((a, b) => b.price - a.price);
    if (sort === "new") sorted.sort((a, b) => b.id.localeCompare(a.id));
    return sorted;
  }, [cats, colours, bands, sort]);

  const active = cats.length + colours.length + bands.length;

  const toggle = <T,>(list: T[], set: (v: T[]) => void, v: T) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const clear = () => {
    setCats([]);
    setColours([]);
    setBands([]);
  };

  const Filters = (
    <div className="space-y-8">
      <FilterGroup title="Category">
        {CATEGORIES.map((c) => {
          const n = PRODUCTS.filter((p) => p.category === c.id).length;
          return (
            <Check
              key={c.id}
              checked={cats.includes(c.id)}
              onChange={() => toggle(cats, setCats, c.id)}
              label={c.label}
              count={n}
            />
          );
        })}
      </FilterGroup>

      <FilterGroup title="Price">
        {PRICE_BANDS.map((b) => (
          <Check
            key={b.id}
            checked={bands.includes(b.id)}
            onChange={() => toggle(bands, setBands, b.id)}
            label={b.label}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Colour">
        <div className="flex flex-wrap gap-2.5">
          {allColours.map(([name, hex]) => {
            const on = colours.includes(name);
            return (
              <button
                key={name}
                type="button"
                title={name}
                aria-pressed={on}
                onClick={() => toggle(colours, setColours, name)}
                className={cn(
                  "size-7 rounded-full ring-1 ring-[color:var(--line-2)] ring-offset-2 ring-offset-[color:var(--paper)] transition-all",
                  on && "ring-2 ring-[color:var(--ink)]",
                )}
                style={{ backgroundColor: hex }}
              >
                <span className="sr-only">{name}</span>
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {active > 0 && (
        <button
          type="button"
          onClick={clear}
          className="link-draw inline-flex items-center gap-1.5 text-[0.85rem] font-medium"
        >
          <IconX size={14} stroke={1.8} />
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="shell py-10 lg:py-14">
      <nav
        aria-label="Breadcrumb"
        className="text-[0.8rem] text-[color:var(--ink-3)]"
      >
        <Link href="/" className="link-draw">
          Home
        </Link>
        <span className="mx-2 opacity-50">/</span>
        <span className="text-[color:var(--ink-2)]">Shop</span>
        {cats.length === 1 && (
          <>
            <span className="mx-2 opacity-50">/</span>
            <span className="text-[color:var(--ink-2)]">
              {categoryLabel(cats[0])}
            </span>
          </>
        )}
      </nav>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-5 border-b border-[color:var(--line)] pb-6">
        <div>
          <h1 className="t-h2">
            {cats.length === 1 ? categoryLabel(cats[0]) : "Everything in stock"}
          </h1>
          <p className="mt-2 text-[0.9rem] text-[color:var(--ink-2)]">
            {shown.length} {shown.length === 1 ? "piece" : "pieces"}
            {active > 0 && " matching your filters"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSheet(true)}
            className="flex items-center gap-2 rounded-4xl border border-[color:var(--line-2)] px-4 py-2 text-[0.85rem] lg:hidden"
          >
            <IconAdjustmentsHorizontal size={16} stroke={1.6} />
            Filters{active > 0 && ` (${active})`}
          </button>

          <label className="flex items-center gap-2 text-[0.85rem]">
            <span className="text-[color:var(--ink-3)]">Sort</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-4xl border border-[color:var(--line-2)] bg-transparent px-4 py-2 outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-[104px]">{Filters}</div>
        </aside>

        <div className="lg:col-span-9">
          {shown.length === 0 ? (
            <div className="border border-[color:var(--line)] px-6 py-16 text-center">
              <p className="t-h3">Nothing matches that combination</p>
              <p className="prose mx-auto mt-3">
                Try removing a colour or widening the price range. If it is a
                size that is gone, leave your number at checkout and we will
                write when it is back.
              </p>
              <button
                type="button"
                onClick={clear}
                className="mt-6 inline-flex items-center rounded-4xl bg-[color:var(--ink)] px-6 py-3 text-sm font-medium text-[color:var(--paper)]"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:gap-x-6"
            >
              <AnimatePresence mode="popLayout">
                {shown.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{
                      duration: 0.4,
                      delay: Math.min(i, 8) * 0.03,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <ProductCard product={p} priority={i < 6} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Filter sheet, small screens */}
      <AnimatePresence>
        {sheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <button
              type="button"
              aria-label="Close filters"
              onClick={() => setSheet(false)}
              className="absolute inset-0 bg-black/40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto bg-[color:var(--paper)] p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="t-h3">Filters</h2>
                <button
                  type="button"
                  onClick={() => setSheet(false)}
                  aria-label="Close"
                >
                  <IconX size={20} stroke={1.6} />
                </button>
              </div>
              {Filters}
              <button
                type="button"
                onClick={() => setSheet(false)}
                className="mt-8 w-full rounded-4xl bg-[color:var(--ink)] py-3.5 text-sm font-medium text-[color:var(--paper)]"
              >
                Show {shown.length} {shown.length === 1 ? "piece" : "pieces"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset>
      <legend className="label mb-3 text-[color:var(--ink-3)]">{title}</legend>
      <div className="space-y-2">{children}</div>
    </fieldset>
  );
}

function Check({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 text-[0.9rem]">
      <span className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="size-4 shrink-0 accent-[color:var(--ink)]"
        />
        {label}
      </span>
      {count !== undefined && (
        <span className="num text-[0.78rem] text-[color:var(--ink-3)]">
          {count}
        </span>
      )}
    </label>
  );
}
