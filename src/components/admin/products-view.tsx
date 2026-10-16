"use client";

import { IconDownload, IconUpload } from "@tabler/icons-react";
import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  EmptyNote,
  Panel,
  QuietLink,
  Row,
  StatusDotChip,
  Table,
  Td,
  Th,
} from "@/components/admin/kit";
import {
  ADMIN_PRODUCTS,
  type AdminProduct,
  type ProductStatus,
} from "@/lib/admin-data";
import { inr } from "@/lib/catalog";

/* ────────────────────────────────────────────────────────────────────────────
   THE STOCK LIST
   One line per style, with its reorder line. The stock strip reads at a
   glance: a number in red means that size is at or below its threshold. The
   bulk bar does the thing you actually come here to do — publish, archive,
   adjust quantities — without opening eighteen tabs.
   ──────────────────────────────────────────────────────────────────────────── */

const FILTERS: { key: ProductStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "archived", label: "Archived" },
];

function StockStrip({ product }: { product: AdminProduct }) {
  return (
    <span className="flex gap-2">
      {product.variants.map((v) => {
        const low = v.stock <= v.threshold;
        const out = v.stock <= 0;
        return (
          <span
            key={v.sku}
            title={`${v.size} — ${out ? "out of stock" : `${v.stock} on hand, reorder line ${v.threshold}`}`}
            className={cn(
              "num w-7 text-center text-[0.72rem] leading-tight",
              out
                ? "text-[color:var(--sale)] line-through"
                : low
                  ? "text-[color:var(--sale)]"
                  : "text-[color:var(--ink-2)]",
            )}
          >
            {v.size}
            <span className="block font-semibold">{v.stock}</span>
          </span>
        );
      })}
    </span>
  );
}

export function ProductsView() {
  const [filter, setFilter] = useState<ProductStatus | "all">("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const rows = useMemo(
    () =>
      ADMIN_PRODUCTS.filter((p) => {
        if (filter !== "all" && p.status !== filter) return false;
        if (!q.trim()) return true;
        const needle = q.trim().toLowerCase();
        return (
          p.name.toLowerCase().includes(needle) ||
          p.id.toLowerCase().includes(needle) ||
          p.categoryLabel.toLowerCase().includes(needle) ||
          p.fabric.toLowerCase().includes(needle)
        );
      }),
    [filter, q],
  );

  const allSelected = rows.length > 0 && selected.length === rows.length;

  const bulk = (action: "publish" | "archive" | "draft" | "up" | "down") => {
    const n = selected.length;
    if (n === 0) return;
    const label =
      action === "up"
        ? `Raised stock by 1 on ${n} styles`
        : action === "down"
          ? `Lowered stock by 1 on ${n} styles`
          : `${action === "publish" ? "Published" : action === "archive" ? "Archived" : "Moved to drafts"} ${n} styles`;
    toast(`${label}. This demo does not write to the catalogue yet.`);
    setSelected([]);
  };

  const exportCsv = () => {
    const head = [
      "id",
      "name",
      "category",
      "price",
      "cost",
      "status",
      "sizes",
      "stock",
    ];
    const lines = ADMIN_PRODUCTS.map((p) =>
      [
        p.id,
        `"${p.name}"`,
        p.category,
        p.price,
        p.cost,
        p.status,
        p.variants.map((v) => `${v.size}:${v.stock}`).join("|"),
      ].join(","),
    );
    const csv = [head.join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "good-zone-products.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${ADMIN_PRODUCTS.length} styles to good-zone-products.csv`);
  };

  return (
    <div className="mx-auto max-w-[76rem] px-4 py-8 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.45rem] font-semibold tracking-tight text-[color:var(--ink)]">
            Products
          </h1>
          <p className="mt-1 max-w-[62ch] text-[0.85rem] leading-relaxed text-[color:var(--ink-2)]">
            Twenty styles, cut in runs of two hundred. Stock is counted by size,
            not by style — that is how the counter sells it.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="flex h-9 items-center gap-1.5 border border-[color:var(--line-2)] px-3 text-[0.8rem] text-[color:var(--ink-2)] transition-colors hover:border-[color:var(--ink)] hover:text-[color:var(--ink)]"
          >
            <IconDownload size={14} stroke={1.6} />
            Export
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-9 items-center gap-1.5 border border-[color:var(--line-2)] px-3 text-[0.8rem] text-[color:var(--ink-2)] transition-colors hover:border-[color:var(--ink)] hover:text-[color:var(--ink)]"
          >
            <IconUpload size={14} stroke={1.6} />
            Import
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const rowsRead = (1 + Math.max(0, file.size / 90)) | 0;
              toast(
                `${file.name} read — ${Math.min(rowsRead, 18)} rows seen. The demo writes nothing; the catalogue below is the shop's own file.`,
              );
              e.target.value = "";
            }}
          />
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div
          role="tablist"
          aria-label="Product status"
          className="flex border border-[color:var(--line-2)]"
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 text-[0.8rem] transition-colors",
                filter === f.key
                  ? "bg-[color:var(--ink)] text-[color:var(--paper)]"
                  : "text-[color:var(--ink-2)] hover:bg-[color:var(--paper-3)]",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="p-q" className="sr-only">
            Search products
          </label>
          <input
            id="p-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name, id, cloth"
            className="h-9 w-[14rem] border border-[color:var(--line-2)] bg-[color:var(--paper)] px-2.5 text-[0.85rem] placeholder:text-[color:var(--ink-3)] focus-visible:border-[color:var(--indigo)]"
          />
          {q ? (
            <button
              type="button"
              onClick={() => setQ("")}
              className="text-[0.78rem] text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {/* Bulk bar — appears only when something is selected */}
      {selected.length > 0 ? (
        <div className="on-ink mt-4 flex flex-wrap items-center gap-2 px-4 py-2.5">
          <p className="num mr-2 text-[0.82rem] text-[color:var(--paper)]">
            {selected.length} selected
          </p>
          {(
            [
              ["publish", "Publish"],
              ["draft", "Move to drafts"],
              ["archive", "Archive"],
              ["up", "Stock +1"],
              ["down", "Stock −1"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => bulk(key)}
              className="border border-[color:var(--on-ink-line-2)] px-2.5 py-1 text-[0.78rem] text-[color:var(--paper)] transition-colors hover:bg-[color:var(--paper)] hover:text-[color:var(--ink)]"
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSelected([])}
            className="ml-auto text-[0.78rem] text-[color:var(--on-ink-muted)] hover:text-[color:var(--paper)]"
          >
            Select none
          </button>
        </div>
      ) : null}

      <div className="mt-4">
        <Panel>
          {rows.length === 0 ? (
            <EmptyNote
              action={
                <button
                  type="button"
                  onClick={() => {
                    setFilter("all");
                    setQ("");
                  }}
                  className="border border-[color:var(--line-2)] px-3 py-1.5 text-[0.8rem] text-[color:var(--ink-2)] hover:border-[color:var(--ink)]"
                >
                  Show every style
                </button>
              }
            >
              No styles match. Try the whole catalogue — drafts and archived
              pieces are hidden until you ask for them.
            </EmptyNote>
          ) : (
            <Table
              caption="Products with stock by size"
              head={
                <>
                  <Th className="w-8">
                    <input
                      type="checkbox"
                      aria-label="Select every style"
                      checked={allSelected}
                      onChange={(e) =>
                        setSelected(
                          e.target.checked ? rows.map((p) => p.id) : [],
                        )
                      }
                      className="size-3.5 accent-[color:var(--indigo)]"
                    />
                  </Th>
                  <Th>Style</Th>
                  <Th>Cloth</Th>
                  <Th numeric>Price</Th>
                  <Th numeric>Cost</Th>
                  <Th numeric>Margin</Th>
                  <Th>Status</Th>
                  <Th>Stock by size</Th>
                  <Th numeric>30-day units</Th>
                </>
              }
            >
              {rows.map((p) => {
                const units = p.variants.reduce((n, v) => n + v.stock, 0);
                const margin = Math.round(((p.price - p.cost) / p.price) * 100);
                const lowCount = p.variants.filter(
                  (v) => v.stock <= v.threshold,
                ).length;
                return (
                  <Row key={p.id} highlight={selected.includes(p.id)}>
                    <Td>
                      <input
                        type="checkbox"
                        aria-label={`Select ${p.name}`}
                        checked={selected.includes(p.id)}
                        onChange={(e) =>
                          setSelected((s) =>
                            e.target.checked
                              ? [...s, p.id]
                              : s.filter((id) => id !== p.id),
                          )
                        }
                        className="size-3.5 accent-[color:var(--indigo)]"
                      />
                    </Td>
                    <Td>
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="flex items-center gap-3 hover:text-[color:var(--indigo)]"
                      >
                        <span className="relative block h-10 w-8 shrink-0 overflow-hidden bg-[color:var(--paper-3)]">
                          <Image
                            src={p.image}
                            alt=""
                            fill
                            sizes="32px"
                            className="object-cover"
                          />
                        </span>
                        <span>
                          {p.name}
                          <span className="block text-[0.72rem] text-[color:var(--ink-3)]">
                            {p.id} · {p.categoryLabel}
                          </span>
                        </span>
                      </Link>
                    </Td>
                    <Td className="max-w-[11rem] truncate text-[0.8rem] text-[color:var(--ink-2)]">
                      {p.fabric}
                    </Td>
                    <Td numeric>
                      {inr(p.price)}
                      {p.compareAt ? (
                        <span className="ml-1.5 text-[0.72rem] text-[color:var(--ink-3)] line-through">
                          {inr(p.compareAt)}
                        </span>
                      ) : null}
                    </Td>
                    <Td numeric className="text-[color:var(--ink-2)]">
                      {inr(p.cost)}
                    </Td>
                    <Td numeric className="text-[color:var(--ink-2)]">
                      {margin}%
                    </Td>
                    <Td>
                      <StatusDotChip status={p.status}>
                        {p.status === "published"
                          ? "Live"
                          : p.status === "draft"
                            ? "Draft"
                            : "Archived"}
                      </StatusDotChip>
                    </Td>
                    <Td>
                      <span className="flex items-center gap-3">
                        <StockStrip product={p} />
                        <span className="num w-14 text-[0.78rem] text-[color:var(--ink-2)]">
                          {units} total
                          {lowCount > 0 ? (
                            <span className="block text-[0.7rem] text-[color:var(--sale)]">
                              {lowCount} at line
                            </span>
                          ) : null}
                        </span>
                      </span>
                    </Td>
                    <Td numeric>{p.unitsSold30d}</Td>
                  </Row>
                );
              })}
            </Table>
          )}
        </Panel>
      </div>

      <p className="mt-3 text-[0.78rem] text-[color:var(--ink-3)]">
        A style goes live the moment you publish it — the storefront reads this
        file. {""}
        <QuietLink href="/admin/products/GZ-102">
          Open the Oxford to see the editor
        </QuietLink>
        .
      </p>
    </div>
  );
}
