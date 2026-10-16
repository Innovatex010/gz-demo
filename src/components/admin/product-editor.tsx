"use client";

import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  DefGrid,
  Panel,
  PanelHead,
  QuietLink,
  StatusDotChip,
} from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import type { AdminProduct, ProductStatus, Variant } from "@/lib/admin-data";
import { type CategoryId, categoryLabel, inr } from "@/lib/catalog";
import { COLLECTIONS } from "@/lib/commerce";

/* ────────────────────────────────────────────────────────────────────────────
   THE STYLE CARD
   The paper tag that hangs off a rack rail, blown up: what it is, what it
   costs, how many are on the shelf in each size. Stock and thresholds are
   edited in place — a count from the store floor goes straight onto the card.
   ──────────────────────────────────────────────────────────────────────────── */

const STATUSES: { key: ProductStatus; label: string; note: string }[] = [
  { key: "draft", label: "Draft", note: "Hidden everywhere. Safe to edit." },
  {
    key: "published",
    label: "Live",
    note: "On the storefront, in search, in collections.",
  },
  {
    key: "archived",
    label: "Archived",
    note: "Kept for records. Not for sale.",
  },
];

const CATEGORY_IDS: CategoryId[] = [
  "full-sleeve",
  "half-sleeve",
  "t-shirts",
  "pants",
  "trousers",
];

const labelClass = "text-[0.72rem] text-[color:var(--ink-3)]";
const fieldClass =
  "mt-1 h-9 w-full border border-[color:var(--line-2)] bg-[color:var(--paper)] px-2.5 text-[0.85rem] focus-visible:border-[color:var(--indigo)]";

export function ProductEditor({ product }: { product: AdminProduct }) {
  const [form, setForm] = useState({
    name: product.name,
    status: product.status,
    category: product.category,
    price: String(product.price),
    compareAt: product.compareAt ? String(product.compareAt) : "",
    cost: String(product.cost),
    fabric: product.fabric,
    fitName: product.fitName,
    tags: [product.badge ?? "essentials"].join(", "),
  });
  const [variants, setVariants] = useState<Variant[]>(product.variants);
  const [collections, setCollections] = useState<string[]>(
    COLLECTIONS.filter((c) => c.productIds.includes(product.id)).map(
      (c) => c.slug,
    ),
  );

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const setVariant = (sku: string, patch: Partial<Variant>) =>
    setVariants((vs) =>
      vs.map((v) => (v.sku === sku ? { ...v, ...patch } : v)),
    );

  const units = variants.reduce((n, v) => n + v.stock, 0);
  const low = variants.filter((v) => v.stock <= v.threshold).length;
  const margin = Math.round(
    ((Number(form.price) - Number(form.cost)) / Number(form.price)) * 100,
  );

  const save = () =>
    toast(
      `${form.name} saved. The style card, prices and counts are with the shop now.`,
    );

  return (
    <div className="mx-auto max-w-[76rem] px-4 py-8 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <QuietLink href="/admin/products" className="text-[0.78rem]">
            ← All styles
          </QuietLink>
          <h1 className="mt-2 flex items-center gap-3 text-[1.45rem] font-semibold tracking-tight text-[color:var(--ink)]">
            {form.name || "Untitled style"}
            <StatusDotChip status={form.status}>
              {form.status === "published"
                ? "Live"
                : form.status === "draft"
                  ? "Draft"
                  : "Archived"}
            </StatusDotChip>
          </h1>
          <p className="num mt-1 text-[0.8rem] text-[color:var(--ink-3)]">
            {product.id} · {categoryLabel(product.category)} ·{" "}
            {product.colors.join(" / ")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/shop/${product.id}`} target="_blank">
              View on the shop
            </Link>
          </Button>
          <Button size="sm" onClick={save}>
            Save changes
          </Button>
        </div>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_18rem]">
        <div className="flex flex-col gap-4">
          {/* The card itself */}
          <Panel>
            <PanelHead title="The style" hint="What the customer reads" />
            <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="f-name" className={labelClass}>
                  Name
                </label>
                <input
                  id="f-name"
                  value={form.name}
                  onChange={set("name")}
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="f-category" className={labelClass}>
                  Category
                </label>
                <select
                  id="f-category"
                  value={form.category}
                  onChange={set("category")}
                  className={fieldClass}
                >
                  {CATEGORY_IDS.map((c) => (
                    <option key={c} value={c}>
                      {categoryLabel(c)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="f-fit" className={labelClass}>
                  Fit family
                </label>
                <select
                  id="f-fit"
                  value={form.fitName}
                  onChange={set("fitName")}
                  className={fieldClass}
                >
                  {["Slim", "Regular", "Relaxed", "Oversized"].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="f-price" className={labelClass}>
                  Price
                </label>
                <div className="flex items-center gap-2">
                  <span className="num text-[0.85rem] text-[color:var(--ink-3)]">
                    ₹
                  </span>
                  <input
                    id="f-price"
                    inputMode="numeric"
                    value={form.price}
                    onChange={set("price")}
                    className={cn(fieldClass, "num")}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="f-compare" className={labelClass}>
                  Compare-at price
                  <span className="ml-1 text-[color:var(--ink-3)]">
                    (leave empty if it is not on sale)
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="num text-[0.85rem] text-[color:var(--ink-3)]">
                    ₹
                  </span>
                  <input
                    id="f-compare"
                    inputMode="numeric"
                    value={form.compareAt}
                    onChange={set("compareAt")}
                    placeholder="—"
                    className={cn(fieldClass, "num")}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="f-cost" className={labelClass}>
                  Cost to make
                </label>
                <div className="flex items-center gap-2">
                  <span className="num text-[0.85rem] text-[color:var(--ink-3)]">
                    ₹
                  </span>
                  <input
                    id="f-cost"
                    inputMode="numeric"
                    value={form.cost}
                    onChange={set("cost")}
                    className={cn(fieldClass, "num")}
                  />
                </div>
              </div>

              <div className="flex items-end">
                <p className="num text-[0.8rem] text-[color:var(--ink-2)]">
                  Margin {Number.isNaN(margin) ? "—" : `${margin}%`}
                  {form.compareAt ? " · on sale" : ""}
                </p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="f-fabric" className={labelClass}>
                  Cloth
                </label>
                <input
                  id="f-fabric"
                  value={form.fabric}
                  onChange={set("fabric")}
                  className={fieldClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="f-tags" className={labelClass}>
                  Tags
                  <span className="ml-1 text-[color:var(--ink-3)]">
                    (separated by commas)
                  </span>
                </label>
                <input
                  id="f-tags"
                  value={form.tags}
                  onChange={set("tags")}
                  className={fieldClass}
                />
              </div>
            </div>
          </Panel>

          {/* Stock, counted by size */}
          <Panel>
            <PanelHead
              title="Stock, by size"
              hint={`${units} on hand · ${low} at the reorder line`}
            />
            <table className="w-full text-[0.85rem]">
              <caption className="sr-only">
                Units on hand and reorder thresholds, by size
              </caption>
              <thead>
                <tr className="border-b border-[color:var(--line-2)]">
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-left text-[0.72rem] font-semibold text-[color:var(--ink-3)]"
                  >
                    Size
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-left text-[0.72rem] font-semibold text-[color:var(--ink-3)]"
                  >
                    SKU
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-right text-[0.72rem] font-semibold text-[color:var(--ink-3)]"
                  >
                    On hand
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-right text-[0.72rem] font-semibold text-[color:var(--ink-3)]"
                  >
                    Reorder line
                  </th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => {
                  const atLine = v.stock <= v.threshold;
                  return (
                    <tr
                      key={v.sku}
                      className="border-b border-[color:var(--line)] last:border-b-0"
                    >
                      <td className="px-4 py-2">
                        <span className="num">{v.size}</span>
                        {atLine ? (
                          <span className="ml-2 text-[0.7rem] text-[color:var(--sale)]">
                            at line
                          </span>
                        ) : null}
                      </td>
                      <td className="num px-4 py-2 text-[0.8rem] text-[color:var(--ink-3)]">
                        {v.sku}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          value={v.stock}
                          aria-label={`Units on hand in ${v.size}`}
                          onChange={(e) =>
                            setVariant(v.sku, {
                              stock: Math.max(0, Number(e.target.value)),
                            })
                          }
                          className={cn(
                            "num h-8 w-20 border px-2 text-right text-[0.85rem]",
                            atLine
                              ? "border-[color:var(--sale)]/50 text-[color:var(--sale)]"
                              : "border-[color:var(--line-2)]",
                          )}
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <input
                          type="number"
                          min={0}
                          value={v.threshold}
                          aria-label={`Reorder line for ${v.size}`}
                          onChange={(e) =>
                            setVariant(v.sku, {
                              threshold: Math.max(0, Number(e.target.value)),
                            })
                          }
                          className="num h-8 w-20 border border-[color:var(--line-2)] px-2 text-right text-[0.85rem] text-[color:var(--ink-2)]"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="border-t border-[color:var(--line)] px-4 py-2.5 text-[0.75rem] text-[color:var(--ink-3)]">
              Damaged pieces come off the count the day they are found — adjust
              the number here, and the movement is logged on the activity page.
            </p>
          </Panel>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHead title="State" />
            <div className="flex flex-col gap-2 px-4 py-3">
              {STATUSES.map((s) => (
                <label
                  key={s.key}
                  className={cn(
                    "flex cursor-pointer items-start gap-2.5 border p-2.5 transition-colors",
                    form.status === s.key
                      ? "border-[color:var(--indigo)] bg-[color:var(--paper-3)]"
                      : "border-[color:var(--line)] hover:bg-[color:var(--paper-3)]",
                  )}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s.key}
                    checked={form.status === s.key}
                    onChange={() => setForm((f) => ({ ...f, status: s.key }))}
                    className="mt-0.5 size-3.5 accent-[color:var(--indigo)]"
                  />
                  <span>
                    <span className="block text-[0.85rem] text-[color:var(--ink)]">
                      {s.label}
                    </span>
                    <span className="block text-[0.72rem] leading-snug text-[color:var(--ink-3)]">
                      {s.note}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHead
              title="Colourways"
              hint="One SKU per size, shared across colours"
            />
            <ul className="flex flex-col gap-2.5 px-4 py-3.5">
              {product.colors.map((c) => (
                <li key={c} className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="size-4 border border-[color:var(--line-2)]"
                    style={{ background: colorHex(c) }}
                  />
                  <span className="text-[0.85rem] text-[color:var(--ink)]">
                    {c}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelHead title="Lead image" />
            <div className="px-4 py-3.5">
              <div className="relative aspect-4/5 w-full overflow-hidden bg-[color:var(--paper-3)]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 60vw, 18rem"
                  className="object-cover"
                />
              </div>
              <p className="mt-2 text-[0.72rem] leading-snug text-[color:var(--ink-3)]">
                Shot 4:5, subject in the middle third. Replacing this file
                changes it everywhere the style appears.
              </p>
            </div>
          </Panel>

          <Panel>
            <PanelHead title="Collections" hint="Curated, not automatic" />
            <div className="flex flex-col gap-2 px-4 py-3">
              {COLLECTIONS.map((c) => (
                <label key={c.slug} className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={collections.includes(c.slug)}
                    onChange={(e) =>
                      setCollections((cs) =>
                        e.target.checked
                          ? [...cs, c.slug]
                          : cs.filter((s) => s !== c.slug),
                      )
                    }
                    className="size-3.5 accent-[color:var(--indigo)]"
                  />
                  <span className="text-[0.85rem] text-[color:var(--ink)]">
                    {c.title}
                  </span>
                </label>
              ))}
            </div>
          </Panel>

          <Panel>
            <PanelHead title="The numbers" />
            <div className="px-4 py-3.5">
              <DefGrid
                className="grid-cols-2"
                rows={[
                  [
                    "On hand",
                    <span className="num" key="u">
                      {units}
                    </span>,
                  ],
                  [
                    "Reorder line",
                    <span className="num" key="l">
                      {low} at line
                    </span>,
                  ],
                  [
                    "Cost",
                    <span className="num" key="c">
                      {inr(Number(form.cost) || 0)}
                    </span>,
                  ],
                  [
                    "Sells at",
                    <span className="num" key="s">
                      {inr(Number(form.price) || 0)}
                    </span>,
                  ],
                ]}
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/** The catalogue's colour hexes live on the product page data; the desk only
    carries names, so fall back to the ink when unknown. */
function colorHex(name: string) {
  return COLOR_HEX[name] ?? "var(--ink-3)";
}

const COLOR_HEX: Record<string, string> = {
  White: "#F2F0EA",
  Sky: "#A8C4DE",
  Navy: "#2B3550",
  Indigo: "#4A6489",
  Stone: "#BFB4A0",
  Rose: "#D9A7A0",
  Sand: "#D6CBB4",
  Ecru: "#E4DCC8",
  Olive: "#6B6B45",
  Peach: "#E3B79B",
  Black: "#1C1B1A",
  Grey: "#9A9A98",
  Offwhite: "#EFEAE0",
  Charcoal: "#3A3A3C",
  Stripe: "#B9C4CC",
};
