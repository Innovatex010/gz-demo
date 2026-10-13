"use client";

import { IconArrowRight, IconMapPin } from "@tabler/icons-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { MagneticButton } from "@/components/ui/magnetic-button";

import { CATEGORIES, PRODUCTS } from "@/lib/catalog";
import { type HeroFrame, HeroFrames } from "./hero-frames";
import { HeadingLines, Load } from "./motion";

/**
 * Three frames, three different kinds of thing we sell — a shirt, a t-shirt and
 * a trouser — so the picture says "range", not "one product".
 */
const HERO_FRAMES: HeroFrame[] = [
  {
    src: "/images/editorial/hero-shutter.webp",
    productId: "GZ-104",
    code: "GZ-104",
    name: "Denim Chambray Shirt",
    price: 1799,
    position: "center 28%",
  },
  {
    src: "/images/product/tee-white-outdoor.webp",
    productId: "GZ-301",
    code: "GZ-301",
    name: "Heavyweight Cotton Tee",
    price: 699,
    position: "center 25%",
  },
  {
    src: "/images/product/trouser-cream.webp",
    productId: "GZ-502",
    code: "GZ-502",
    name: "Cream Linen Trouser",
    price: 1899,
    position: "center 30%",
  },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imgY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", reduced ? "0%" : "14%"],
  );
  const copyY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", reduced ? "0%" : "-22%"],
  );
  const fade = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  return (
    <section className="relative overflow-hidden border-b border-[color:var(--line)]">
      <div
        ref={ref}
        className="shell grid gap-10 pt-10 pb-14 lg:grid-cols-12 lg:gap-12 lg:pt-16 lg:pb-20"
      >
        {/* Copy */}
        <motion.div
          style={{ y: copyY, opacity: fade }}
          className="flex flex-col justify-center lg:col-span-7"
        >
          <Load delay={0.05}>
            <p className="t-eyebrow text-[color:var(--ink-2)]">
              Nine years in stores, and counting
            </p>
          </Load>

          <HeadingLines
            as="h1"
            className="t-hero mt-6"
            delay={0.14}
            lines={["The shop,", "now online."]}
          />

          <Load delay={0.42}>
            <p className="prose mt-8 text-[1.0625rem]">
              The same shirts, t-shirts, pants and trousers we have been selling
              over the counter since 2014 — delivered to your door. Same prices,
              same exchange offer, no extra charge for going online.
            </p>
          </Load>

          <Load delay={0.52}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <MagneticButton strength={0.28}>
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-4xl bg-[color:var(--ink)] px-7 py-3.5 text-sm font-medium text-[color:var(--paper)]"
                >
                  Shop new in
                  <IconArrowRight size={16} stroke={1.6} />
                </Link>
              </MagneticButton>

              <MagneticButton strength={0.18}>
                <Link
                  href="#stores"
                  className="inline-flex items-center gap-2 rounded-4xl border border-[color:var(--line-2)] px-7 py-3.5 text-sm font-medium"
                >
                  <IconMapPin size={16} stroke={1.6} />
                  Find a store
                </Link>
              </MagneticButton>
            </div>
          </Load>

          <Load delay={0.68}>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-[color:var(--line)] pt-6">
              {[
                [String(PRODUCTS.length), "pieces online"],
                ["8", "stores, 4 cities"],
                ["15", "day returns"],
              ].map(([v, k]) => (
                <div key={k}>
                  <dt className="sr-only">{k}</dt>
                  <dd>
                    <span className="num block text-[2.4rem] leading-none">
                      {v}
                    </span>
                    <span className="mt-1.5 block text-[0.8rem] text-[color:var(--ink-3)]">
                      {k}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </Load>
        </motion.div>

        {/* The pictures turn; the headline stays */}
        <motion.div
          style={{ y: imgY, opacity: fade }}
          className="relative lg:col-span-5"
        >
          <Load delay={0.16} y={40}>
            <motion.div
              initial={
                reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0)" }
              }
              animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1 }}
              transition={{
                duration: reduced ? 0.2 : 1.5,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <HeroFrames frames={HERO_FRAMES} />
            </motion.div>
          </Load>
        </motion.div>
      </div>

      {/* Category rail — the four things people actually shop for */}
      <div className="shell pb-10">
        <ul className="grid grid-cols-2 gap-px border border-[color:var(--line)] bg-[color:var(--line)] md:grid-cols-4">
          {CATEGORIES.slice(0, 4).map((c, i) => (
            <motion.li
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.85 + i * 0.07,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="bg-[color:var(--paper)]"
            >
              <Link href={c.href} className="link-draw flex flex-col px-4 py-4">
                <span className="text-[0.95rem] font-medium">{c.label}</span>
                <span className="mt-1 text-[0.8rem] text-[color:var(--ink-3)]">
                  {c.tagline}
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
