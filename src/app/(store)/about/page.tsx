import { IconArrowRight, IconMapPin } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageCrumbs } from "@/components/site/page-crumbs";
import { STORE_CITIES } from "@/lib/catalog";

export const metadata = {
  title: "About Good Zone — nine years of shirts",
  description:
    "Good Zone has traded since 2014 from eight stores across Bengaluru, Hyderabad, Chennai and Pune. How we cut, why the runs are 200 pieces, and why we are online now.",
};

const NUMBERS = [
  { value: "2014", label: "First store, Bengaluru" },
  { value: "8", label: "Stores open today" },
  { value: "4", label: "Cities" },
  { value: "200", label: "Pieces per run" },
];

const MAKING = [
  ["Cloth", "Cut and stitched in Bengaluru"],
  ["Run size", "200 pieces per block"],
  ["Sizes", "XS to XXL, chest in inches"],
];

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        <div className="shell py-10 lg:py-14">
          <PageCrumbs current="About" />

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="min-w-0 lg:col-span-7">
              <p className="label text-[color:var(--ink-3)]">
                Nine years on the same street
              </p>
              <h1 className="t-h2 mt-5 max-w-[16ch]">
                We sell shirts. We have always sold shirts.
              </h1>
              <div className="mt-7 space-y-4">
                <p className="prose">
                  Good Zone started in 2014 with one counter in Bengaluru and a
                  workshop order for two hundred shirts. We still cut the same
                  way. Two hundred pieces, checked by hand, sold at the price on
                  the label.
                </p>
                <p className="prose">
                  Nine years on there are eight stores across four cities. What
                  has not changed is the run size. We make less so we can make
                  it properly.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-4/5 overflow-hidden bg-[color:var(--paper-3)]">
                <Image
                  src="/images/product/shirt-white-walk.webp"
                  alt="A man in a white full-sleeve shirt walking with a bag over his shoulder"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* The short version, in numbers */}
        <section className="shell py-10 lg:py-14 border-t border-[color:var(--line)]">
          <div className="grid gap-px border border-[color:var(--line)] bg-[color:var(--line)] sm:grid-cols-2 lg:grid-cols-4">
            {NUMBERS.map((n) => (
              <div key={n.label} className="bg-[color:var(--paper)] px-5 py-7">
                <p className="num text-[2.6rem] leading-none tracking-[-0.02em]">
                  {n.value}
                </p>
                <p className="mt-3 text-[0.82rem] text-[color:var(--ink-3)]">
                  {n.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="shell py-10 lg:py-14 border-t border-[color:var(--line)]">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 className="t-h2">How it started</h2>
            </div>
            <div className="min-w-0 space-y-4 lg:col-span-8">
              <p className="prose">
                The first Good Zone was a few hundred square feet off a main
                road in Bengaluru. We sold full-sleeve shirts, half-sleeve
                shirts and trousers, and most of what else on the rail was
                somebody&apos;s idea of the week. A shirt that sold in a week
                got reordered. A shirt that did not came off the rail.
              </p>
              <p className="prose">
                Over the next few years the range narrowed on its own. What
                stayed was oxford, poplin, chambray, linen, cotton pique,
                heavier tee cotton, chino twill and suiting. Nine years later
                that is still the list. Nothing on this site is missing from a
                store, and nothing in a store is missing from here.
              </p>
              <p className="prose">
                The workshop is in Bengaluru. Cutting, stitching and packing all
                happen within the city, and the people who pack your order stock
                the counters.
              </p>
            </div>
          </div>
        </section>

        {/* Why we are online now */}
        <section className="on-ink shell py-10 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="min-w-0 lg:col-span-6">
              <h2 className="t-h2 max-w-[14ch] text-[color:var(--paper)]">
                Eight stores, and now this
              </h2>
              <div className="mt-7 space-y-4">
                <p className="prose-ink">
                  For nine years the only way to buy from us was to walk into a
                  store. That worked for people in Bengaluru, Hyderabad, Chennai
                  and Pune. It did not work for anyone else, and we heard about
                  it most days.
                </p>
                <p className="prose-ink">
                  We went online for one reason: so distance stops being the
                  reason you cannot buy a shirt. Nothing about the product
                  changed. The prices are the counter prices. The exchange offer
                  is the counter offer. You can still return anything to a
                  counter instead of the courier if that is easier.
                </p>
                <p className="prose-ink">
                  The stores stay. Eight counters are eight people who know
                  which block fits which customer, and we are not taking that
                  away to save on rent.
                </p>
              </div>

              <Link
                href="/contact"
                className="group mt-9 inline-flex items-center gap-2 pb-0.5 text-[0.95rem] font-medium text-[color:var(--paper)]"
              >
                <span className="link-draw">Store addresses and timings</span>
                <IconArrowRight
                  size={16}
                  stroke={1.8}
                  className="transition-transform duration-500 group-hover:translate-x-1"
                />
              </Link>
            </div>

            <div className="lg:col-span-6">
              <div className="grid h-full grid-cols-2 gap-3">
                <div className="relative aspect-3/4 overflow-hidden bg-[color:var(--ink-raised)]">
                  <Image
                    src="/images/product/shirt-linen-relaxed.webp"
                    alt="A man in a relaxed shirt and cropped trousers walking past a shutter"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-3/4 overflow-hidden bg-[color:var(--ink-raised)]">
                  <Image
                    src="/images/product/pant-chino-cream.webp"
                    alt="Cropped chinos with a denim jacket and white sneakers"
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="shell py-10 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <h2 className="t-h2">Why two hundred</h2>
              <p className="prose mt-5">
                A run of two hundred is small enough for one person to check
                every shirt before it is folded.
              </p>
            </div>

            <div className="min-w-0 lg:col-span-8">
              <div className="space-y-4">
                <p className="prose">
                  Large runs let a factory buy cheaper cloth and move faster.
                  They also mean guessing. Order ten thousand shirts, some
                  fraction of them do not work, and the only way to clear them
                  is to cut the price and start again.
                </p>
                <p className="prose">
                  Two hundred is a different problem. We cut, we sell, we look
                  at what came back. If the collar sat wrong, we move the
                  collar. If a size sells out, we cut the same shirt again in
                  the same block rather than redesigning it. Restocked, not
                  replaced.
                </p>
                <p className="prose">
                  The trade-off is honest. Some sizes run out, and when they do
                  it can take up to six weeks to come back. Leave your number at
                  checkout and we will write the day it does. If you would
                  rather not wait, the range on the shop floor is usually deeper
                  than the range here.
                </p>
              </div>

              <dl className="mt-10 grid gap-px border border-[color:var(--line)] bg-[color:var(--line)] sm:grid-cols-3">
                {MAKING.map(([k, v]) => (
                  <div key={k} className="bg-[color:var(--paper)] px-5 py-5">
                    <dt className="label text-[color:var(--ink-3)]">{k}</dt>
                    <dd className="mt-2 text-[0.9rem]">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="shell py-10 lg:py-14 border-t border-[color:var(--line)]">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="min-w-0 lg:col-span-4">
              <p className="label text-[color:var(--ink-3)]">
                Where to find us
              </p>
              <h2 className="t-h2 mt-4">Eight counters</h2>
              <p className="prose mt-5">
                Three in Bengaluru, two in Hyderabad, two in Chennai, one in
                Pune. Every store carries the full range in the full size run,
                and every store will exchange a shirt bought online.
              </p>
            </div>

            <div className="min-w-0 lg:col-span-8">
              <ul className="grid gap-px border border-[color:var(--line)] bg-[color:var(--line)] sm:grid-cols-2">
                {STORE_CITIES.map((c) => (
                  <li
                    key={c.city}
                    className="flex items-baseline justify-between gap-4 bg-[color:var(--paper)] px-5 py-5"
                  >
                    <span className="flex items-center gap-2.5 text-[1.05rem] font-medium">
                      <IconMapPin
                        size={16}
                        stroke={1.6}
                        className="shrink-0 text-[color:var(--ink-3)]"
                      />
                      {c.city}
                    </span>
                    <span className="num text-[0.85rem] text-[color:var(--ink-3)]">
                      {c.count} {c.count === 1 ? "store" : "stores"}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 pb-0.5 text-[0.95rem] font-medium"
                >
                  <span className="link-draw">Addresses and opening hours</span>
                  <IconArrowRight
                    size={16}
                    stroke={1.8}
                    className="transition-transform duration-500 group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-2 pb-0.5 text-[0.95rem] font-medium"
                >
                  <span className="link-draw">Shop the full range</span>
                  <IconArrowRight
                    size={16}
                    stroke={1.8}
                    className="transition-transform duration-500 group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
