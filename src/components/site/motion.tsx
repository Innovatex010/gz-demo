"use client";

import { cn } from "cn";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

/**
 * A block reveals through a mask rather than sliding. Used on images only —
 * text never gets this, so the page does not turn into a field of fades.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  from = "bottom",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  from?: "bottom" | "left";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const reduced = useReducedMotion();

  const hidden = from === "bottom" ? "inset(0 0 100% 0)" : "inset(0 0 0 100%)";

  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 0 } : { clipPath: hidden }}
      animate={
        inView
          ? { clipPath: "inset(0 0 0 0)", opacity: 1 }
          : { clipPath: hidden, opacity: reduced ? 0 : 1 }
      }
      transition={{
        duration: reduced ? 0.2 : 1.1,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}

/** Headings rise out of their own mask, line by line. */
export function HeadingLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  as: Tag = "h2",
}: {
  lines: React.ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });
  const reduced = useReducedMotion();

  return (
    <Tag ref={ref as never} className={className}>
      {lines.map((line, i) => (
        <span
          key={typeof line === "string" ? line : i}
          className="block overflow-hidden pb-[0.06em]"
        >
          <motion.span
            className={cn("block", lineClassName)}
            initial={reduced ? { opacity: 0 } : { y: "112%" }}
            animate={
              inView ? { y: "0%", opacity: 1 } : { y: "112%", opacity: 0 }
            }
            transition={{
              duration: reduced ? 0.2 : 1,
              delay: delay + i * 0.08,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Quiet fade for supporting copy. One per section, never per card. */
export function Fade({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-6% 0px" });
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={
        inView ? { opacity: 1, y: 0 } : { opacity: 0, y: reduced ? 0 : 14 }
      }
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * The one page-load sequence. Reserved for the hero so the entrance reads as a
 * single gesture rather than a pile of separate animations.
 */
export function Load({
  children,
  className,
  delay = 0,
  y = 26,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduced ? 0.2 : 1,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
