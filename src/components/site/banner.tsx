"use client";

import {
  IconArrowRight,
  IconMapPin,
  IconPlayerPause,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { cn } from "cn";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { ALWAYS, CAMPAIGNS, type Campaign } from "@/lib/campaign";

const DURATION = 7000;
/** Long enough for the load sequence to finish before the first turn. */
const SETTLE = 3200;

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * A campaign banner that turns.
 *
 * Each slide is a complete campaign: creative, offer, copy, calls to action.
 * The reader can step through, or leave it to run — but nothing moves while
 * they are hovering or inside it with the keyboard, it stops for good the
 * moment they take a control, and it does not run at all for anyone who has
 * asked for reduced motion.
 *
 * The facts strip underneath is deliberately outside the carousel: it is true
 * whether or not a campaign is running.
 */
export function Banner({ campaigns = CAMPAIGNS }: { campaigns?: Campaign[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const first = useRef(true);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // The creative is the heaviest thing on the page, so it barely moves and the
  // type lifts away from it.
  const imgY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", reduced ? "0%" : "12%"],
  );
  const typeY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", reduced ? "0%" : "-26%"],
  );
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), SETTLE);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    first.current = false;
  }, []);

  const running = ready && !reduced && !paused && !busy;

  /* biome-ignore lint/correctness/useExhaustiveDependencies: `index` is not
     read in the body, but the clock has to restart after each advance, so the
     next seven seconds are timed from when this slide actually landed */
  useEffect(() => {
    if (!running || campaigns.length < 2) return;
    const id = setTimeout(
      () => setIndex((i) => (i + 1) % campaigns.length),
      DURATION,
    );
    return () => clearTimeout(id);
  }, [running, index, campaigns.length]);

  const campaign = campaigns[index] ?? campaigns[0];
  const delay = first.current ? 0.1 : 0.05;
  const right = campaign.align === "right";
  const showText = campaign.text !== false;

  return (
    /* biome-ignore lint/a11y/useSemanticElements: the ARIA carousel pattern;
       a <fieldset> would announce this as a form group */
    <section
      role="group"
      aria-roledescription="carousel"
      aria-label="Current campaigns"
      className="relative isolate overflow-hidden bg-[color:var(--ink)]"
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: hover and focus
          only pause the timer; nothing on this wrapper is a control */}
      <div
        ref={ref}
        className="relative min-h-[min(78svh,42rem)] w-full"
        onMouseEnter={() => setBusy(true)}
        onMouseLeave={() => setBusy(false)}
        onFocusCapture={() => setBusy(true)}
        onBlurCapture={() => setBusy(false)}
      >
        {/* Creatives, all mounted, cross-faded */}
        <motion.div style={{ y: imgY }} className="absolute inset-0 -z-10">
          {campaigns.map((c, i) => (
            <motion.div
              key={c.id}
              aria-hidden={i !== index}
              initial={false}
              animate={{
                opacity: i === index ? 1 : 0,
                scale: i === index ? 1 : 1.03,
              }}
              transition={{ duration: reduced ? 0.15 : 1.3, ease: EASE }}
              className="absolute inset-0"
            >
              <Image
                src={c.image}
                alt={i === index ? c.alt : ""}
                fill
                priority={i === 0}
                loading="eager"
                sizes="100vw"
                className="object-cover"
                style={{ objectPosition: c.position ?? "center" }}
              />
            </motion.div>
          ))}

          {/* Scrim, in two layers. The bottom one is always there; the second
              washes whichever side the copy is on, so a right-aligned
              campaign is as legible as a left-aligned one. A single bottom
              gradient left the offer pill sitting on bare image. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_oklch,var(--ink)_96%,transparent)_0%,color-mix(in_oklch,var(--ink)_84%,transparent)_32%,transparent_72%)]"
          />
          <div
            aria-hidden
            className={cn(
              "absolute inset-0",
              right
                ? "bg-[linear-gradient(to_left,color-mix(in_oklch,var(--ink)_92%,transparent)_0%,color-mix(in_oklch,var(--ink)_74%,transparent)_34%,color-mix(in_oklch,var(--ink)_22%,transparent)_68%,transparent_88%)]"
                : "bg-[linear-gradient(to_right,color-mix(in_oklch,var(--ink)_18%,transparent)_30%,color-mix(in_oklch,var(--ink)_74%,transparent)_74%,color-mix(in_oklch,var(--ink)_92%,transparent)_100%)]",
            )}
          />
        </motion.div>

        {showText && (
          <motion.div
            style={{ y: typeY, opacity: fade }}
            className={cn(
              "shell absolute inset-x-0 bottom-0 flex flex-col items-start pb-10 pt-36",
              right && "items-end text-right",
            )}
          >
            <div className={cn("max-w-[38rem]", right && "ml-auto")}>
              {campaign.offer && (
                <BannerPart
                  show
                  delay={delay}
                  reduced={!!reduced}
                  align={right}
                >
                  <span className="inline-flex items-center rounded-4xl bg-[color:var(--paper)] px-3.5 py-1.5 text-[0.75rem] font-medium text-[color:var(--ink)]">
                    {campaign.offer}
                  </span>
                </BannerPart>
              )}

              {campaign.label && (
                <BannerPart
                  show
                  delay={delay + 0.08}
                  reduced={!!reduced}
                  align={right}
                >
                  <p className="t-eyebrow mt-5 text-[color:var(--paper)]/70">
                    {campaign.label}
                  </p>
                </BannerPart>
              )}

              <h1 key={campaign.id} className="t-banner mt-5 max-w-[44rem]">
                {campaign.lines ? (
                  campaign.lines.map((line, i) => (
                    <span
                      key={line}
                      className="block overflow-hidden pb-[0.06em]"
                    >
                      <motion.span
                        className="block"
                        initial={reduced ? { opacity: 0 } : { y: "112%" }}
                        animate={{ y: "0%", opacity: 1 }}
                        transition={{
                          duration: reduced ? 0.2 : 0.9,
                          delay: delay + 0.14 + i * 0.07,
                          ease: EASE,
                        }}
                      >
                        {line}
                      </motion.span>
                    </span>
                  ))
                ) : (
                  <BannerPart
                    show
                    delay={delay + 0.14}
                    reduced={!!reduced}
                    align={right}
                  >
                    {campaign.headline}
                  </BannerPart>
                )}
              </h1>

              {campaign.body && (
                <BannerPart
                  show
                  delay={delay + 0.34}
                  reduced={!!reduced}
                  align={right}
                >
                  <p className="mt-6 max-w-[46ch] text-[1.0625rem] leading-relaxed text-[color:var(--paper)]/85">
                    {campaign.body}
                  </p>
                </BannerPart>
              )}

              <BannerPart
                show
                delay={delay + 0.44}
                reduced={!!reduced}
                align={right}
              >
                <div
                  className={cn(
                    "mt-8 flex flex-wrap items-center gap-3",
                    right && "justify-end",
                  )}
                >
                  <MagneticButton strength={0.25}>
                    <Link
                      href={campaign.primary.href}
                      className="inline-flex items-center gap-2 rounded-4xl bg-[color:var(--paper)] px-7 py-3.5 text-sm font-medium text-[color:var(--ink)]"
                    >
                      {campaign.primary.label}
                      <IconArrowRight size={16} stroke={1.7} />
                    </Link>
                  </MagneticButton>

                  {campaign.secondary && (
                    <MagneticButton strength={0.16}>
                      <Link
                        href={campaign.secondary.href}
                        className="inline-flex items-center gap-2 rounded-4xl border border-[color:var(--paper)]/35 px-7 py-3.5 text-sm font-medium text-[color:var(--paper)]"
                      >
                        {campaign.id === "online" && (
                          <IconMapPin size={16} stroke={1.5} />
                        )}
                        {campaign.secondary.label}
                      </Link>
                    </MagneticButton>
                  )}
                </div>
              </BannerPart>
            </div>
          </motion.div>
        )}

        {/* Progress only. No arrows, no stepper — this runs itself.
            The one control is pause, which WCAG 2.2.2 requires for anything
            that moves by itself for longer than five seconds. */}
        {campaigns.length > 1 && (
          <>
            <div className="absolute inset-x-0 bottom-0 z-10 flex h-[3px]">
              {campaigns.map((c, i) => (
                <span
                  key={c.id}
                  className="relative flex-1 bg-[color:var(--paper)]/20"
                >
                  {i === index && (
                    <motion.span
                      key={`${index}-${running}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: running ? 1 : 0 }}
                      transition={{
                        duration: running ? DURATION / 1000 : 0.3,
                        ease: "linear",
                      }}
                      className="absolute inset-0 origin-left bg-[color:var(--paper)]"
                    />
                  )}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-pressed={!running}
              className="absolute right-4 bottom-6 z-10 grid size-9 place-items-center rounded-full border border-[color:var(--paper)]/30 text-[color:var(--paper)] transition-colors hover:bg-[color:var(--paper)] hover:text-[color:var(--ink)]"
            >
              {running ? (
                <IconPlayerPause size={16} stroke={1.6} />
              ) : (
                <IconPlayerPlay size={16} stroke={1.6} />
              )}
              <span className="sr-only">
                {running ? "Pause the banners" : "Play the banners"}
              </span>
            </button>
          </>
        )}
      </div>

      {/* Always true, whatever is running */}
      <div className="on-ink border-t border-[color:var(--on-ink-line)]">
        <dl className="shell grid grid-cols-2 gap-x-6 gap-y-5 py-6 md:grid-cols-4">
          {ALWAYS.map((f) => (
            <div key={f.value}>
              <dt className="text-[0.9rem] font-medium text-[color:var(--paper)]">
                {f.value}
              </dt>
              <dd className="mt-1 text-[0.78rem] text-[color:var(--on-ink-muted)]">
                {f.note}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** Each part of a slide arrives on its own, so changing slide reads as the
 *  same piece landing rather than a different one replacing it. */
function BannerPart({
  children,
  show,
  delay,
  reduced,
  align,
}: {
  children: React.ReactNode;
  show: boolean;
  delay: number;
  reduced: boolean;
  align?: boolean;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, y: reduced ? 0 : 12 }}
      animate={{ opacity: show ? 1 : 0, y: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.7, delay, ease: EASE }}
      className={cn("block", align && "text-right")}
    >
      {children}
    </motion.span>
  );
}
