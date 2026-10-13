import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { CATEGORIES } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Page not built yet — Good Zone",
};

/**
 * A catch-all can never be enumerated, so it cannot be prerendered. This is the
 * documented opt-out; every route that matters is still fully static.
 */
export const instant = false;

/**
 * We have linked the whole site together before every page exists. Rather than
 * send anyone to a browser error, this says plainly what is and is not there.
 */
export default async function CatchAll({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = "/" + slug.join("/");

  return (
    <>
      <Header />
      <main className="shell flex-1 py-24">
        <p className="label text-[color:var(--ink-3)]">Not built yet</p>
        <h1 className="t-h2 mt-5 max-w-[18ch]">
          This page is still being written
        </h1>
        <p className="prose mt-5">
          You asked for <span className="num">{path}</span>. We have linked the
          site together before every page is finished, so you can see how it all
          connects. Until this one is ready, these will get you somewhere
          useful.
        </p>

        <ul className="mt-10 grid gap-px border border-[color:var(--line)] bg-[color:var(--line)] sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Everything in stock", href: "/shop" },
            ...CATEGORIES.map((c) => ({ label: c.label, href: c.href })),
          ].map((l) => (
            <li key={l.href} className="bg-[color:var(--paper)]">
              <Link
                href={l.href}
                className="link-draw block px-5 py-4 text-[0.95rem]"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
