import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Reveal } from "@/components/site/motion";
import { CATEGORIES } from "@/lib/catalog";
import { COLLECTIONS, productsInCollection } from "@/lib/commerce";

export const metadata: Metadata = {
  title: "Collections — Good Zone",
  description:
    "New arrivals, the shirt, essentials, linen season and last few left. Curated edits of Good Zone clothing.",
};

export default function CollectionsPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="shell py-10 lg:py-14">
          <Reveal>
            <h1 className="t-banner">Collections</h1>
            <p className="prose mt-5 max-w-prose">
              Five edits, cut by hand from the catalogue. A collection is a
              point of view — if something drops out of one, it is because we
              took it out, not because stock ran down.
            </p>
          </Reveal>

          <ul className="mt-16 grid gap-x-6 gap-y-14 md:grid-cols-2">
            {COLLECTIONS.map((c, i) => {
              const count = productsInCollection(c.slug).length;
              return (
                <li key={c.slug}>
                  <Reveal delay={i * 0.06}>
                    <Link
                      href={`/collections/${c.slug}`}
                      className="group block"
                    >
                      <div className="relative aspect-3/2 overflow-hidden bg-[color:var(--paper-3)]">
                        <Image
                          src={c.image}
                          alt=""
                          fill
                          priority={i === 0}
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]"
                        />
                        <span className="num absolute top-4 right-4 bg-[color:var(--paper)] px-2 py-1 text-[0.72rem]">
                          {count} styles
                        </span>
                      </div>
                      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-[color:var(--line)] pt-4">
                        <h2 className="t-h3">{c.title}</h2>
                        <span className="link-draw shrink-0 text-[0.82rem]">
                          See all
                        </span>
                      </div>
                      <p className="prose mt-2 max-w-prose">{c.blurb}</p>
                    </Link>
                  </Reveal>
                </li>
              );
            })}
          </ul>

          <section className="mt-28 border-t border-[color:var(--line)] pt-12">
            <h2 className="t-h2">Or go by category</h2>
            <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link href={c.href} className="link-draw text-[0.95rem]">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
