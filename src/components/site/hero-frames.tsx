"use client";

import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react";
import { cn } from "cn";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { inr } from "@/lib/catalog";

export type HeroFrame = {
  src: string;
  productId: string;
  code: string;
  name: string;
  price: number;
  /** Where the subject sits, so the crop holds across breakpoints. */
  position: string;
};

const DURATION = 6000;
/** Long enough for the page-load sequence to finish before anything moves. */
const SETTLE = 2800;

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Only the picture turns. The headline is the one sentence on this site that
 * matters most, so it stays put and keeps the reading.
 *
 * Nothing here moves unless the reader is not currently doing something else,
 * it stops for good the moment they take a control, and it does not run at all
 * for anyone who has asked for reduced motion.
 */
export function HeroFrames({ frames }: { frames: HeroFrame[] }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [takenOver, setTakenOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), SETTLE);
    return () => clearTimeout(id);
  }, []);

  const running =
    ready && !reduced && !paused && !takenOver && !busy && frames.length > 1;

  /* biome-ignore lint/correctness/useExhaustiveDependencies: `index` is not
     read in the body, but the clock has to restart whenever the frame changes,
     including when the reader picks one by hand */
  useEffect(() => {
    if (!running) return;
    const id = setTimeout(
      () => setIndex((i) => (i + 1) % frames.length),
      DURATION,
    );
    return () => clearTimeout(id);
  }, [running, index, frames.length]);

  const go = (next: number) => {
    setTakenOver(true);
    setPaused(false);
    setIndex((next + frames.length) % frames.length);
  };

  const frame = frames[index];

  return (
    /* biome-ignore lint/a11y/useSemanticElements: this is the ARIA carousel
       pattern; a <fieldset> would announce it as a form group */
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="This week's looks"
      onMouseEnter={() => setBusy(true)}
      onMouseLeave={() => setBusy(false)}
      onFocusCapture={() => setBusy(true)}
      onBlurCapture={() => setBusy(false)}
    >
      <div className="relative aspect-4/5 overflow-hidden bg-[color:var(--paper-3)]">
        {frames.map((f, i) => (
          <motion.div
            key={f.src}
            aria-hidden={i !== index}
            initial={false}
            animate={{
              opacity: i === index ? 1 : 0,
              scale: i === index ? 1 : 1.025,
            }}
            transition={{ duration: reduced ? 0.15 : 1.2, ease: EASE }}
            className="absolute inset-0"
          >
            <Image
              src={f.src}
              alt={i === index ? `${f.name}, worn by a model` : ""}
              fill
              priority
              loading="eager"
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover"
              style={{ objectPosition: f.position }}
            />
          </motion.div>
        ))}

        {/* What you are looking at, and the switch that stops the moving */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-[color:var(--ink)] px-4 py-3 text-[color:var(--paper)]">
          <Link
            href={`/shop/${frame.productId}`}
            aria-live="polite"
            className="link-draw text-[0.8rem] leading-tight"
          >
            <span className="num">{frame.code}</span> {frame.name}
            <span className="num ml-2 text-[color:var(--paper)]/70">
              {inr(frame.price)}
            </span>
          </Link>

          {frames.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setTakenOver(true);
                setPaused((p) => !p);
              }}
              aria-pressed={!running}
              className="grid size-8 shrink-0 place-items-center transition-opacity hover:opacity-70"
            >
              {running ? (
                <IconPlayerPause size={17} stroke={1.5} />
              ) : (
                <IconPlayerPlay size={17} stroke={1.5} />
              )}
              <span className="sr-only">
                {running ? "Pause the slideshow" : "Play the slideshow"}
              </span>
            </button>
          )}
        </div>
      </div>

      {frames.length > 1 && (
        <div className="mt-3 flex items-center gap-3">
          <div className="flex flex-1 gap-2">
            {frames.map((f, i) => (
              <button
                key={f.src}
                type="button"
                onClick={() => go(i)}
                aria-current={i === index}
                className="group relative block w-11 shrink-0"
              >
                <span
                  className={cn(
                    "block overflow-hidden transition-opacity duration-500",
                    i === index
                      ? "opacity-100"
                      : "opacity-45 group-hover:opacity-80",
                  )}
                >
                  <span className="relative block aspect-4/5">
                    <Image
                      src={f.src}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                      style={{ objectPosition: f.position }}
                    />
                  </span>
                </span>
                <span className="mt-1.5 block h-px w-full bg-[color:var(--line-2)]">
                  {i === index && (
                    <motion.span
                      key={`${index}-${running}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: running ? 1 : 0 }}
                      transition={{
                        duration: running ? DURATION / 1000 : 0.25,
                        ease: "linear",
                      }}
                      className="block h-px w-full origin-left bg-[color:var(--ink)]"
                    />
                  )}
                </span>
                <span className="sr-only">Show {f.name}</span>
              </button>
            ))}
          </div>

          <span className="num shrink-0 text-[0.78rem] text-[color:var(--ink-3)]">
            {String(index + 1).padStart(2, "0")}
            <span className="mx-1 opacity-40">/</span>
            {String(frames.length).padStart(2, "0")}
          </span>
        </div>
      )}
    </div>
  );
}
