"use client";

import { IconX } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { categoryLabel, inr } from "@/lib/catalog";
import { stockLine, totalStock } from "@/lib/commerce";
import { resolveProducts, useStore } from "@/lib/stores";

/**
 * Compare.
 *
 * Capped at three, because that is genuinely the point past which a table stops
 * being readable on a phone — and a compare page nobody can read is worse than
 * no compare page. The cap is enforced when adding (`toggleCompare`) and again
 * here, so a stale key cannot produce a four-column table.
 *
 * Rows are chosen to answer "which one", not to describe everything: what it
 * is, what it costs, how it fits, what it is made of, and whether it is in
 * stock. Adding more rows makes the table worse, not richer.
 */
export function CompareView() {
  const { compare, hydrated, toggleCompare, clearCompare } = useStore();
  const products = resolveProducts(compare).slice(0, 3);

  if (!hydrated) return <div className="shell py-10 lg:py-14" />;

  if (products.length === 0)
    return (
      <div className="shell py-10 lg:py-14">
        <h1 className="t-banner">Compare</h1>
        <p className="prose mt-5 max-w-prose">
          Nothing to compare yet. Use the scale icon on any product frame to put
          up to three styles side by side.
        </p>
        <Link
          href="/shop"
          className="link-draw mt-6 inline-block text-[0.95rem]"
        >
          Browse the catalogue
        </Link>
      </div>
    );

  const rows: { label: string; render: (i: number) => React.ReactNode }[] = [
    {
      label: "Price",
      render: (i) => <span className="num">{inr(products[i].price)}</span>,
    },
    { label: "Category", render: (i) => categoryLabel(products[i].category) },
    { label: "Fabric", render: (i) => products[i].fabric },
    { label: "Fit", render: (i) => products[i].fitName },
    {
      label: "Cut in",
      render: (i) => (
        <span className="num">{products[i].sizes.join(" · ")}</span>
      ),
    },
    { label: "Colours", render: (i) => `${products[i].colors.length}` },
    {
      label: "Availability",
      render: (i) =>
        totalStock(products[i]) === 0 ? "Out of stock" : stockLine(products[i]),
    },
  ];

  return (
    <div className="shell py-10 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-banner">Compare</h1>
          <p className="prose mt-5 max-w-prose">
            {products.length === 1
              ? "One style. Add another to make the comparison useful."
              : `${products.length} styles, side by side.`}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCompare}
          className="link-draw text-[0.85rem]"
        >
          Clear all
        </button>
      </div>

      {/* Desktop: a real table, because that is what compare is. */}
      <div className="mt-12 hidden overflow-x-auto md:block">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-32 border-b border-[color:var(--line-2)] pb-6" />
              {products.map((p, i) => (
                <th
                  key={p.id}
                  className="border-b border-[color:var(--line-2)] pb-6 pl-6 text-left align-bottom"
                >
                  <div className="relative aspect-4/5 w-full overflow-hidden bg-[color:var(--paper-3)]">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      priority={i === 0}
                      sizes="30vw"
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleCompare(p)}
                    aria-label={`Remove ${p.name} from comparison`}
                    className="absolute top-2 right-2 grid size-8 place-items-center bg-[color:var(--paper)]"
                  >
                    <IconX size={15} stroke={1.6} />
                  </button>
                  <Link
                    href={`/shop/${p.id}`}
                    className="link-draw mt-4 block text-[0.95rem] font-medium"
                  >
                    {p.name}
                  </Link>
                  <Link
                    href={`/shop/${p.id}`}
                    className="mt-2 inline-block border border-[color:var(--ink)] px-4 py-2 text-[0.8rem] transition-colors hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
                  >
                    View
                  </Link>
                </th>
              ))}
              {products.length < 3 && (
                <th className="border-b border-[color:var(--line-2)] pb-6 pl-6 text-left align-bottom">
                  <Link href="/shop" className="link-draw text-[0.85rem]">
                    Add another →
                  </Link>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.label}
                className="border-b border-[color:var(--line)]"
              >
                <th
                  scope="row"
                  className="label py-4 text-left align-top text-[color:var(--ink-3)]"
                >
                  {row.label}
                </th>
                {products.map((p) => (
                  <td
                    key={p.id}
                    className="py-4 pl-6 align-top text-[0.875rem]"
                  >
                    {row.render(products.indexOf(p))}
                  </td>
                ))}
                {products.length < 3 && <td />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone: stacked cards. A three-column table on a 360px screen is
          unreadable, and horizontal scroll here hides the thing being compared. */}
      <div className="mt-12 space-y-8 md:hidden">
        {products.map((p) => (
          <section
            key={p.id}
            className="border-t border-[color:var(--line-2)] pt-6"
          >
            <div className="flex gap-4">
              <Link
                href={`/shop/${p.id}`}
                className="relative aspect-4/5 w-28 shrink-0 overflow-hidden bg-[color:var(--paper-3)]"
              >
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <h2 className="text-[0.95rem] font-medium">
                  <Link href={`/shop/${p.id}`} className="link-draw">
                    {p.name}
                  </Link>
                </h2>
                <button
                  type="button"
                  onClick={() => toggleCompare(p)}
                  className="link-draw mt-1 text-[0.78rem] text-[color:var(--ink-3)]"
                >
                  Remove
                </button>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-[0.85rem]">
              {rows.map((row) => (
                <div key={row.label} className="flex gap-4">
                  <dt className="w-28 shrink-0 text-[color:var(--ink-3)]">
                    {row.label}
                  </dt>
                  <dd>{row.render(products.indexOf(p))}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
