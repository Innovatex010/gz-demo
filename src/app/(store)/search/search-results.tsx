"use client";

import { useEffect, useState } from "react";
import { ProductGrid } from "@/components/site/product-card";
import { SearchView } from "@/components/site/search-view";
import { CATEGORIES } from "@/lib/catalog";
import { searchProducts } from "@/lib/commerce";

/**
 * Search results. Client-rendered because the query lives in the URL and the
 * catalogue is already in the client bundle — there is nothing to fetch.
 *
 * If this ever needs to index more than a few hundred products, this becomes a
 * server component reading `searchParams` instead.
 */
export function SearchResults({ query }: { query: string }) {
  // The query lives here, not in SearchView. When it only lived in the input,
  // typing updated the suggestion dropdown while the results grid kept showing
  // whatever the URL said — two halves of the page disagreeing.
  const [live, setLive] = useState(query);
  useEffect(() => setLive(query), [query]);

  const q = live.trim();
  const results = q.length >= 2 ? searchProducts(q) : [];

  return (
    <div className="shell py-10 lg:py-14">
      <h1 className="t-banner">Search</h1>

      <div className="mt-10">
        <SearchView value={live} onChange={setLive} />
      </div>

      <div className="mt-14">
        {q.length === 0 ? (
          <Browse />
        ) : q.length === 1 ? (
          <p className="prose">
            Keep typing — one character is too many to search on.
          </p>
        ) : results.length === 0 ? (
          <NoResults query={q} />
        ) : (
          <>
            <p className="num border-b border-[color:var(--line)] pb-4 text-[0.85rem] text-[color:var(--ink-3)]">
              {results.length} {results.length === 1 ? "style" : "styles"} for “
              {q}”
            </p>
            <ProductGrid
              products={results}
              className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6"
            />
          </>
        )}
      </div>
    </div>
  );
}

function Browse() {
  return (
    <section>
      <h2 className="t-h2">Browse by category</h2>
      <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
        {CATEGORIES.map((c) => (
          <li key={c.id}>
            <a href={c.href} className="link-draw text-[0.95rem]">
              {c.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="prose mt-8 max-w-prose">
        You can also search by product code. Every style carries one — GZ-102
        and upwards.
      </p>
    </section>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <section>
      <h2 className="t-h2">Nothing for “{query}”</h2>
      <p className="prose mt-4 max-w-prose">
        We only make twenty styles, so there is a fair chance we simply do not
        have it. Search a category, a fabric, or a product code — or look at
        what is new.
      </p>
      <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
        {CATEGORIES.map((c) => (
          <li key={c.id}>
            <a href={c.href} className="link-draw text-[0.95rem]">
              {c.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
