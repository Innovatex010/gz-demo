"use client";

import { IconArrowRight } from "@tabler/icons-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { LOOKS } from "@/lib/catalog";
import { Fade } from "./motion";

/**
 * Sticky scroll with a real job: one photograph that changes as you read the
 * five ways to dress for. The reader controls which look they are on, and the
 * frame answers.
 */
export function LooksSticky() {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start center", "end center"],
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  useMotionValueEvent(smooth, "change", (v) => {
    const next = Math.min(
      LOOKS.length - 1,
      Math.max(0, Math.round(v * (LOOKS.length - 1))),
    );
    setIndex(next);
  });

  const look = LOOKS[index];

  return (
    <section ref={ref} className="on-sand border-y border-[color:var(--line)]">
      <div className="shell grid gap-10 py-16 lg:grid-cols-12 lg:gap-14 lg:py-24">
        {/* Sticky frame */}
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-[104px]">
            <div className="relative aspect-4/5 overflow-hidden bg-[color:var(--paper-3)] lg:h-[min(62svh,40rem)] lg:aspect-auto">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={look.id}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={look.image}
                    alt={look.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 48vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* The frame reports where you are — this is a sequence, so it counts */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-[color:var(--ink)] px-4 py-3 text-[color:var(--paper)]">
                <span className="label opacity-70">{look.title}</span>
                <span className="num text-[0.9rem] tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                  <span className="mx-1 opacity-40">/</span>
                  {String(LOOKS.length).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Progress rule */}
            <div className="mt-4 flex gap-1.5" aria-hidden>
              {LOOKS.map((l, i) => (
                <span
                  key={l.id}
                  className="h-px flex-1 bg-[color:var(--ink)] transition-opacity duration-500"
                  style={{ opacity: i <= index ? 0.5 : 0.16 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Reading column */}
        <div className="lg:col-span-6">
          <p className="label text-[color:var(--ink-3)]">
            Five ways to dress for
          </p>

          <ol className="mt-8">
            {LOOKS.map((l, i) => (
              <li
                key={l.id}
                className="flex min-h-[58svh] flex-col justify-center border-t border-[color:var(--line)] py-12 last:min-h-0"
              >
                <Fade>
                  <span className="num block text-[2.6rem] leading-none text-[color:var(--ink-3)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="t-h2 mt-4">{l.title}</h3>
                  <p className="prose mt-4">{l.copy}</p>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {l.pieces.map((p) => (
                      <li
                        key={p}
                        className="border border-[color:var(--line-2)] px-3 py-1.5 text-[0.78rem]"
                      >
                        {p}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/shop"
                    className="group mt-7 inline-flex items-center gap-2 pb-0.5 text-[0.9rem] font-medium"
                  >
                    <span className="link-draw">Shop this look</span>
                    <IconArrowRight
                      size={15}
                      stroke={1.8}
                      className="transition-transform duration-500 group-hover:translate-x-1"
                    />
                  </Link>
                </Fade>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
