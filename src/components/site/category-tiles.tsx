"use client";

import { IconArrowUpRight } from "@tabler/icons-react";
import { cn } from "cn";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";
import { HeadingLines } from "./motion";

const countFor = (id: string) =>
  PRODUCTS.filter((p) => p.category === id).length;

/**
 * The category board. One tile carries the weight and four carry the rest —
 * the same way a shop window is arranged, not an equal five-up grid.
 */
export function CategoryTiles() {
  const [hover, setHover] = useState<string | null>(null);
  const [lead, ...rest] = CATEGORIES;

  return (
    <section className="shell band" id="categories">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[color:var(--line)] pb-6">
        <HeadingLines
          as="h2"
          className="t-h2 max-w-[16ch]"
          lines={["What we make"]}
        />
        <p className="max-w-[38ch] text-[0.95rem] text-[color:var(--ink-2)]">
          Five categories, no season-to-season churn. We restock the same shirts
          and t-shirts so you can reorder the size you already know fits.
        </p>
      </div>

      {/* Lead tile carries the weight; four smaller ones complete the board */}
      <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href={lead.href}
          onMouseEnter={() => setHover(lead.id)}
          onMouseLeave={() => setHover(null)}
          className="group relative block overflow-hidden bg-[color:var(--paper-3)] md:col-span-2 lg:col-span-1 lg:row-span-2"
        >
          {/* The frame gives the fill image a height to resolve against. On
              desktop the tile stretches over two rows, so it fills whatever
              height the grid gives it. */}
          <div className="relative aspect-4/5 lg:aspect-auto lg:h-full lg:min-h-0">
            <Image
              src={lead.image}
              alt={lead.label}
              fill
              sizes="(max-width: 768px) 100vw, 34vw"
              className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/75 to-transparent p-5 pt-16 text-[color:var(--paper)]">
            <div>
              <h3 className="t-h3">{lead.label}</h3>
              <p className="mt-1 text-[0.85rem] text-[color:var(--paper)]/75">
                {countFor(lead.id)} pieces · {lead.tagline}
              </p>
            </div>
            <IconArrowUpRight
              size={22}
              stroke={1.5}
              className="shrink-0 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </div>
        </Link>

        {rest.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{
              duration: 0.8,
              delay: i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Link
              href={c.href}
              onMouseEnter={() => setHover(c.id)}
              onMouseLeave={() => setHover(null)}
              className="group relative block overflow-hidden bg-[color:var(--paper-3)]"
            >
              <div className="relative aspect-4/3">
                <Image
                  src={c.image}
                  alt={c.label}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <h3 className="text-[0.95rem] font-medium">{c.label}</h3>
                  <p className="mt-0.5 text-[0.78rem] text-[color:var(--ink-3)]">
                    {countFor(c.id)} pieces · {c.tagline}
                  </p>
                </div>
                <IconArrowUpRight
                  size={18}
                  stroke={1.5}
                  className={cn(
                    "shrink-0 transition-[transform,opacity] duration-500",
                    hover === c.id
                      ? "translate-x-0.5 -translate-y-0.5 opacity-100"
                      : "opacity-40",
                  )}
                />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
