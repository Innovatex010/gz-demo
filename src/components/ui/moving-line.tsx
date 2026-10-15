"use client";

import { motion, useScroll, useSpring } from "motion/react";

/**
 * Registry: @aceternity/moving-line — repointed.
 *
 * The original is a 1567px vertical SVG line that shrinks as you scroll, with
 * its own gradient and blue stroke. Nothing on this site has a decorative side
 * rail, and the offset was set up for a hero that does not exist here, so it is
 * now the thing that indicator is actually good for: a rule under the sticky
 * header showing how much of the page is behind you. Same primitive underneath
 * — scroll progress on a spring — pointed at something real.
 */
export function ScrollProgress({ className }: { className?: string }) {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 30,
    mass: 0.3,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: width }}
      className={
        className ??
        "absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[color:var(--ink)]"
      }
    />
  );
}

export default ScrollProgress;
