"use client";

import { IconArrowRight, IconMapPin } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

import { STORE_CITIES } from "@/lib/catalog";
import { Fade, HeadingLines, Reveal } from "./motion";

/**
 * The reason this brand exists is that it had stores first. Say so, once, and
 * make it useful — a list of places you can still walk into.
 */
export function ShopAndOnline() {
  return (
    <section
      id="stores"
      className="shell band border-t border-[color:var(--line)]"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-6">
          <HeadingLines
            as="h2"
            className="t-h2 max-w-[14ch]"
            lines={["Still a shop.", "Now also a website."]}
          />
          <Fade delay={0.25}>
            <p className="prose mt-6">
              We opened our first store in 2014 and we still would rather you
              tried a shirt on than scroll through three sizes of a return
              policy. Nothing changed about the stock — it just arrives at your
              door now too.
            </p>
            <p className="prose mt-4">
              Ordering online costs you nothing extra. Same price, same exchange
              offer, and you can still return anything to a counter if it is
              easier.
            </p>
          </Fade>

          <Fade delay={0.35}>
            <div className="mt-10 grid gap-px border border-[color:var(--line)] bg-[color:var(--line)] sm:grid-cols-2">
              {STORE_CITIES.map((c) => (
                <div
                  key={c.city}
                  className="flex items-baseline justify-between bg-[color:var(--paper)] px-4 py-3.5"
                >
                  <span className="text-[0.95rem] font-medium">{c.city}</span>
                  <span className="text-[0.82rem] text-[color:var(--ink-3)]">
                    {c.count} {c.count === 1 ? "store" : "stores"}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/stores"
              className="group mt-6 inline-flex items-center gap-2 pb-0.5 text-[0.9rem] font-medium"
            >
              <IconMapPin size={16} stroke={1.6} />
              <span className="link-draw">All store addresses and timings</span>
              <IconArrowRight
                size={15}
                stroke={1.8}
                className="transition-transform duration-500 group-hover:translate-x-1"
              />
            </Link>
          </Fade>
        </div>

        <div className="lg:col-span-6">
          <Reveal className="grid h-full grid-cols-2 gap-3">
            <div className="relative aspect-3/4 overflow-hidden bg-[color:var(--paper-3)]">
              <Image
                src="/images/editorial/editorial-store.webp"
                alt="Inside a Good Zone store"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-3/4 overflow-hidden bg-[color:var(--paper-3)]">
              <Image
                src="/images/editorial/editorial-coffee.webp"
                alt="A Good Zone customer trying a shirt on in store"
                fill
                sizes="(max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
