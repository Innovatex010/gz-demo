"use client";

import { cn } from "cn";
import { useEffect, useRef } from "react";

/**
 * Registry: @aceternity/infinite-moving-cards — repointed from testimonial
 * cards to the selvedge ticker: the services strip that runs along the edge of
 * the cloth.
 */
export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
  itemClassName,
  separator,
}: {
  items: string[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
  itemClassName?: string;
  separator?: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const scroller = scrollerRef.current;
    if (!container || !scroller) return;

    for (const item of Array.from(scroller.children)) {
      scroller.appendChild(item.cloneNode(true));
    }

    container.style.setProperty(
      "--animation-direction",
      direction === "left" ? "forwards" : "reverse",
    );
    container.style.setProperty(
      "--animation-duration",
      speed === "fast" ? "22s" : speed === "normal" ? "45s" : "90s",
    );
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "animate-scroll flex w-max min-w-full shrink-0 flex-nowrap items-center",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item, idx) => (
          <li
            /* biome-ignore lint/suspicious/noArrayIndexKey: the list is cloned
               and repeated, so position must stay part of the key */
            key={`${item}-${idx}`}
            className={cn(
              "flex shrink-0 items-center gap-6 whitespace-nowrap pr-6",
              itemClassName,
            )}
          >
            <span>{item}</span>
            <span aria-hidden className="opacity-40">
              {separator ?? "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
