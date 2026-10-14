"use client";

import { IconArrowRight } from "@tabler/icons-react";
import { cn } from "cn";
import {
  animate,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";
import { useMedia } from "@/lib/use-media";
import { HeadingLines } from "./motion";

const PANELS = CATEGORIES.map((c) => ({
  ...c,
  count: PRODUCTS.filter((p) => p.category === c.id).length,
}));

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/**
 * Scroll down and the categories travel sideways.
 *
 * Two branches, chosen by capability rather than guesswork: on a mouse the rail
 * is pinned and scrubbed by the vertical scroll; on touch, where momentum and a
 * scrub fight each other, it becomes an ordinary swipe rail. Nobody who has
 * asked for reduced motion gets the pinned version.
 */
export function RangeRail() {
  const finePointer = useMedia("(min-width: 1024px) and (pointer: fine)");
  const reduced = useReducedMotion();
  const scrub = finePointer && !reduced;

  const sectionRef = useRef<HTMLElement>(null);
  const clipRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Light. A heavy spring here reads as the rail dragging behind the wheel
  // rather than being pulled by it.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    mass: 0.2,
  });
  const x = useTransform(smooth, [0, 1], [0, -travel]);
  const fill = useTransform(smooth, [0, 1], ["0%", "100%"]);

  // Whichever panel the rail has arrived at. One place decides it, so the
  // panels themselves stay dumb.
  const [current, setCurrent] = useState(0);
  useMotionValueEvent(smooth, "change", (v) => {
    setCurrent(Math.round(clamp(v, 0, 1) * (PANELS.length - 1)));
  });

  // How far the rail has to travel. The overflow lives on the clipping box, so
  // that is the width to compare the track against.
  useEffect(() => {
    const track = trackRef.current;
    const clip = clipRef.current;
    if (!scrub || !track || !clip) return;

    const measure = () =>
      setTravel(Math.max(0, track.scrollWidth - clip.offsetWidth));
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(track);
    ro.observe(clip);
    return () => ro.disconnect();
  }, [scrub]);

  /** Arrow keys step the reader along the rail, eased by Motion. */
  const stepRail = useCallback((direction: 1 | -1) => {
    const el = sectionRef.current;
    if (!el) return;
    const from = window.scrollY;
    const to = clamp(
      from + direction * window.innerHeight * 0.8,
      el.offsetTop,
      el.offsetTop + el.offsetHeight - window.innerHeight,
    );
    if (to === from) return;
    animate(from, to, {
      duration: 0.55,
      ease: [0.32, 0.72, 0, 1],
      onUpdate: (v) => window.scrollTo(0, v),
    });
  }, []);

  useEffect(() => {
    if (!scrub) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const el = e.target as HTMLElement | null;
      // Let arrow keys do their normal job inside anything the reader can type in.
      if (el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) return;
      e.preventDefault();
      stepRail(e.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrub, stepRail]);

  return (
    <section
      ref={sectionRef}
      id="range"
      aria-label="Browse by category"
      className="border-t border-[color:var(--line)]"
      style={scrub ? { height: `${PANELS.length * 52}svh` } : undefined}
    >
      <div className="lg:sticky lg:top-0 lg:flex lg:h-100svh lg:flex-col lg:overflow-hidden">
        <div className="shell pt-28 pb-4 lg:pt-32">
          <div className="flex flex-wrap items-end justify-between gap-4 pb-4">
            <HeadingLines
              as="h2"
              className="t-h2"
              lines={["Pick one and see all of it"]}
            />
            <div className="max-w-[40ch]">
              <p className="text-[0.9rem] text-[color:var(--ink-2)]">
                Five categories, {PRODUCTS.length} pieces. Pick a category and
                everything in it comes with you.
              </p>
              <p className="mt-1.5 text-[0.75rem] text-[color:var(--ink-3)]">
                {scrub
                  ? "Scroll to move along the rail. Arrow keys work too."
                  : "Swipe sideways to see the rest."}
              </p>
            </div>
          </div>

          {/* The rule under the heading is also how far along the rail you are */}
          <div className="h-px w-full bg-[color:var(--line)]">
            {scrub && (
              <motion.div
                style={{ width: fill }}
                className="h-px bg-[color:var(--ink)]"
              />
            )}
          </div>
        </div>

        {scrub ? (
          <div
            ref={clipRef}
            className="relative flex min-h-0 flex-1 items-center overflow-hidden py-5"
          >
            <motion.div
              ref={trackRef}
              style={{ x }}
              className="flex w-max items-center gap-4 px-[var(--shell)] will-change-transform"
            >
              {PANELS.map((p, i) => (
                <Panel key={p.id} panel={p} active={i === current} />
              ))}
              <EndPanel />
            </motion.div>
          </div>
        ) : (
          <div className="overflow-x-auto snap-x snap-mandatory pb-10 [scrollbar-width:thin]">
            <div className="flex w-max gap-3 px-[var(--shell)]">
              {PANELS.map((p) => (
                <Panel key={p.id} panel={p} active={false} />
              ))}
              <EndPanel />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Panel({
  panel,
  active,
}: {
  panel: (typeof PANELS)[number];
  active: boolean;
}) {
  return (
    <article className="relative w-[68vw] shrink-0 snap-start sm:w-[44vw] lg:w-[clamp(15rem,21vw,20rem)]">
      <Link href={panel.href} className="group block">
        <div
          className={cn(
            "relative aspect-4/5 overflow-hidden bg-[color:var(--paper-3)] transition-[outline-color] duration-500",
            active &&
              "outline outline-1 outline-offset-4 outline-[color:var(--line-2)]",
          )}
        >
          <Image
            src={panel.image}
            alt={panel.label}
            fill
            sizes="(max-width: 640px) 68vw, (max-width: 1024px) 44vw, 20rem"
            className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105"
          />
        </div>

        <div className="flex items-start justify-between gap-3 pt-3">
          <div>
            <h3 className="t-h3">{panel.label}</h3>
            <p className="mt-1 text-[0.8rem] text-[color:var(--ink-3)]">
              {panel.count} pieces · {panel.tagline}
            </p>
          </div>
          <IconArrowRight
            size={18}
            stroke={1.5}
            className="mt-1 shrink-0 transition-transform duration-500 group-hover:translate-x-1"
          />
        </div>
      </Link>
    </article>
  );
}

/** The rail has to end somewhere, and it ends by sending you onward. */
function EndPanel() {
  return (
    <div className="flex w-[68vw] shrink-0 snap-start flex-col justify-center sm:w-[44vw] lg:w-[clamp(14rem,18vw,17rem)]">
      <p className="max-w-[24ch] font-display text-[1.6rem] leading-[1.15]">
        Or see all {PRODUCTS.length} at once.
      </p>
      <Link
        href="/shop"
        className="mt-5 inline-flex w-fit items-center gap-2 rounded-4xl bg-[color:var(--ink)] px-5 py-2.5 text-[0.85rem] font-medium text-[color:var(--paper)]"
      >
        Shop everything
        <IconArrowRight size={15} stroke={1.8} />
      </Link>
    </div>
  );
}
