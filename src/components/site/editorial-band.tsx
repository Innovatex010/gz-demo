"use client";

import { IconArrowRight } from "@tabler/icons-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { Fade, HeadingLines } from "./motion";

/**
 * The scroll gets its one heavy parallax here. The photograph moves slower than
 * the frame, which is what gives the band its depth.
 */
export function EditorialBand() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    ["-12%", reduced ? "0%" : "12%"],
  );
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.04, 1.12]);

  return (
    <section ref={ref} className="on-ink relative overflow-hidden">
      <div className="relative h-[78svh] min-h-[26rem] w-full">
        <motion.div style={{ y, scale }} className="absolute inset-0">
          <Image
            src="/images/editorial/editorial-orange.webp"
            alt="A Good Zone jacket photographed against a painted wall"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(100deg,color-mix(in_oklch,var(--ink)_92%,transparent)_8%,color-mix(in_oklch,var(--ink)_35%,transparent)_58%,transparent_85%)]" />

        <div className="shell relative flex h-full flex-col justify-end pb-14">
          <HeadingLines
            as="h2"
            className="t-h2 max-w-[15ch] text-[color:var(--paper)]"
            lines={["Small runs,", "restocked not", "replaced."]}
          />

          <Fade delay={0.35}>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-8 border-t border-[color:var(--on-ink-line)] pt-7">
              <p className="prose-ink max-w-[42ch] text-[1rem]">
                We cut two hundred pieces at a time. When they sell, we make
                more of the same — same block, same fit, same shirt you bought
                last year. When they don't, we fix the block rather than
                discount the shelf.
              </p>

              <Link
                href="/shop"
                className="group inline-flex items-center gap-2 pb-0.5 text-[0.95rem] font-medium text-[color:var(--paper)]"
              >
                <span className="link-draw">See what is in stock</span>
                <IconArrowRight
                  size={16}
                  stroke={1.8}
                  className="transition-transform duration-500 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </Fade>
        </div>
      </div>
    </section>
  );
}
