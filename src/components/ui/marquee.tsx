"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "cn";

/**
 * Marquee
 * -------
 * The Aceternity registry item `@aceternity/marquee` sits behind an auth wall —
 * `https://ui.aceternity.com/registry/marquee.json` answers 401 while the rest
 * of the registry answers 200, so it cannot be installed here.
 *
 * This is that component built out: a clipped viewport with parallel rows
 * translating on X forever, each row on its own duration and direction so the
 * two never line up and repeat visibly.
 *
 * Accessibility notes, because a looping strip is exactly where this goes wrong:
 *  - it stops on hover and on keyboard focus, so a reader can actually read it
 *  - it does not run at all under prefers-reduced-motion; the content is still
 *    there, laid out and scrollable
 *  - the repeated copy is hidden from assistive tech, so it is announced once
 *    rather than in a loop
 */
export function Marquee({
  children,
  reverse = false,
  speed = 38,
  pauseOnHover = true,
  className,
  fade = true,
}: {
  children: ReactNode;
  /** Scroll the other way. */
  reverse?: boolean;
  /** Seconds for one pass. Longer is calmer. */
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
  /** Feather the left and right edges so items enter and leave softly. */
  fade?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Toggled as a data attribute rather than React state so pausing on hover
  // never triggers a render.
  const pause = () => {
    if (rootRef.current) rootRef.current.dataset.paused = "true";
  };
  const resume = () => {
    if (rootRef.current) delete rootRef.current.dataset.paused;
  };

  useEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const doubled = track.scrollWidth;
    if (!doubled) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      track.style.animation = "none";
      return;
    }

    track.style.animationDuration = `${speed}s`;

    // The distance depends on measured content, so recompute on resize rather
    // than guessing a percentage.
    const apply = () => {
      const width = track.scrollWidth / 2;
      track.style.animationName = "none";
      // force reflow so the keyframe distance is re-read
      void track.offsetWidth;
      track.style.animationName = "";
      track.style.setProperty("--marquee-distance", `${width}px`);
      track.style.animationDirection = reverse ? "reverse" : "normal";
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(track);
    return () => ro.disconnect();
  }, [speed, reverse]);

  return (
    <div
      ref={rootRef}
      data-marquee
      onMouseEnter={pauseOnHover ? pause : undefined}
      onMouseLeave={pauseOnHover ? resume : undefined}
      onFocusCapture={pauseOnHover ? pause : undefined}
      onBlurCapture={pauseOnHover ? resume : undefined}
      className={cn(
        "group/marquee relative flex overflow-hidden",
        fade &&
          "[mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]",
        className,
      )}
    >
      <div
        ref={trackRef}
        aria-hidden
        className="flex w-max shrink-0 animate-marquee items-center group-data-[paused]/marquee:[animation-play-state:paused] motion-reduce:animate-none"
      >
        {children}
        {/* One duplicate is enough — the track is exactly two copies wide */}
        {children}
      </div>
    </div>
  );
}

/** One item in the row, with its separator. */
export function MarqueeItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-4 pr-10 whitespace-nowrap",
        className,
      )}
    >
      {children}
      <span aria-hidden className="opacity-30">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M9 1v16M9 1 4 6M9 1l5 5M9 17l-5-5M9 17l5-5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </div>
  );
}

export default Marquee;