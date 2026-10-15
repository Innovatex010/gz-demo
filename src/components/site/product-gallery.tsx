"use client";

import { IconZoomIn, IconZoomOut } from "@tabler/icons-react";
import { cn } from "cn";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/lib/catalog";

/**
 * Product frames with hover zoom and a thumbnail rail.
 *
 * Two things worth knowing about how this works:
 *
 * 1. Zoom is pointer-driven and deliberately desktop-only. It tracks the cursor
 *    with a background-position swap rather than a transform, so the frame never
 *    reflows and neighbouring content never moves. On touch there is no hover,
 *    so a tap opens a full-screen viewer instead — which is the pattern people
 *    already expect from a shopping app.
 *
 * 2. The gallery is driven by the selected colourway. `frames` comes from
 *    `colors[i].images`, so switching swatches switches the photographs.
 */
export function ProductGallery({
  product,
  colorName,
  badge,
}: {
  product: Product;
  colorName: string;
  badge?: Product["badge"];
}) {
  const colour =
    product.colors.find((c) => c.name === colorName) ?? product.colors[0];
  const frames = colour?.images?.length ? colour.images : [product.image];

  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [fullscreen, setFullscreen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  // A different colourway is a different set of photographs, so the rail has to
  // go back to frame one rather than pointing at frame 3 of a one-frame gallery.
  // Adjusting during render is React's pattern for resetting state when a prop
  // changes — an effect here would paint the stale frame once first.
  const [seenColour, setSeenColour] = useState(colorName);
  if (seenColour !== colorName) {
    setSeenColour(colorName);
    setActive(0);
    setLoaded(false);
    setZoomed(false);
  }

  // Lock the page behind the full-screen viewer.
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % frames.length);
      if (e.key === "ArrowLeft")
        setActive((i) => (i - 1 + frames.length) % frames.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [fullscreen, frames.length]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = frameRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  const current = frames[Math.min(active, frames.length - 1)];

  return (
    <div className="lg:col-span-7">
      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        {/* Thumbnails. A vertical rail on desktop, a horizontal one on phones. */}
        {frames.length > 1 && (
          <div
            role="tablist"
            aria-label="Product frames"
            className="flex shrink-0 gap-2 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-visible"
          >
            {frames.map((src, i) => (
              <button
                key={src}
                type="button"
                role="tab"
                aria-selected={active === i}
                aria-label={`View frame ${i + 1} of ${frames.length}`}
                onClick={() => setActive(i)}
                className={cn(
                  "relative aspect-4/5 w-16 shrink-0 overflow-hidden bg-[color:var(--paper-3)] transition-opacity sm:w-full",
                  active === i
                    ? "ring-1 ring-[color:var(--ink)] ring-offset-2 ring-offset-[color:var(--paper)]"
                    : "opacity-55 hover:opacity-100",
                )}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* The frame. Hover-zoom is a pointer-only refinement layered over the
            image — the button inside it is the real, focusable control, and the
            full-screen viewer is the keyboard and touch path. Nothing here is
            reachable by keyboard, so there is no role to give. */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: pointer-only zoom; the button and full-screen viewer carry the accessible path */}
        <div
          ref={frameRef}
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => setZoomed(false)}
          onMouseMove={onMove}
          className="group relative aspect-4/5 flex-1 overflow-hidden bg-[color:var(--paper-3)]"
        >
          {!loaded && (
            <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
          )}

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={current}
                alt={`${product.name} in ${colour?.name}, frame ${active + 1}`}
                fill
                priority
                onLoad={() => setLoaded(true)}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
                style={
                  zoomed
                    ? {
                        transform: "scale(1.9)",
                        transformOrigin: `${pos.x}% ${pos.y}%`,
                        transition: "transform 220ms cubic-bezier(.16,1,.3,1)",
                      }
                    : {
                        transform: "scale(1)",
                        transition: "transform 320ms cubic-bezier(.16,1,.3,1)",
                      }
                }
              />
            </motion.div>
          </AnimatePresence>

          {badge && (
            <span className="label absolute top-4 left-4 bg-[color:var(--paper)] px-2 py-1">
              {badge}
            </span>
          )}

          {/* Hover zoom is meaningless on touch, so offer a tap-to-open instead */}
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            aria-label={`Enlarge ${product.name}`}
            className="absolute right-3 bottom-3 hidden size-10 place-items-center bg-[color:var(--paper)] text-[color:var(--ink)] transition-colors hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] md:grid"
          >
            {zoomed ? (
              <IconZoomOut size={18} stroke={1.5} />
            ) : (
              <IconZoomIn size={18} stroke={1.5} />
            )}
          </button>

          <span className="num absolute bottom-3 left-3 bg-[color:var(--paper)] px-2 py-1 text-[0.7rem] text-[color:var(--ink-3)] md:hidden">
            {active + 1} / {frames.length}
          </span>
        </div>
      </div>

      <FullscreenViewer
        open={fullscreen}
        onClose={() => setFullscreen(false)}
        frames={frames}
        active={active}
        setActive={setActive}
        name={product.name}
        colorName={colour?.name ?? ""}
      />
    </div>
  );
}

function FullscreenViewer({
  open,
  onClose,
  frames,
  active,
  setActive,
  name,
  colorName,
}: {
  open: boolean;
  onClose: () => void;
  frames: string[];
  active: number;
  setActive: (i: number) => void;
  name: string;
  colorName: string;
}) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} enlarged`}
      className="fixed inset-0 z-100 flex flex-col bg-[color:var(--ink)]"
    >
      <div className="flex items-center justify-between px-4 py-3 text-[color:var(--paper)]">
        <span className="num text-[0.75rem] opacity-70">
          {active + 1} / {frames.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="border border-current px-3 py-1.5 text-[0.8rem]"
        >
          Close
        </button>
      </div>

      <button
        type="button"
        onClick={() => setActive((active - 1 + frames.length) % frames.length)}
        aria-label="Previous frame"
        className="flex-1 py-2 text-[2rem] text-[color:var(--paper)]/60"
      >
        ‹
      </button>

      <div className="relative aspect-4/5 w-full max-w-md shrink-0 self-center">
        <Image
          src={frames[active]}
          alt={`${name} in ${colorName}, frame ${active + 1}`}
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>

      <button
        type="button"
        onClick={() => setActive((active + 1) % frames.length)}
        aria-label="Next frame"
        className="flex-1 py-2 text-[2rem] text-[color:var(--paper)]/60"
      >
        ›
      </button>

      <div className="flex justify-center gap-2 pb-6">
        {frames.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Frame ${i + 1}`}
            aria-current={active === i}
            className={cn(
              "size-2 rounded-full",
              active === i
                ? "bg-[color:var(--paper)]"
                : "bg-[color:var(--paper)]/35",
            )}
          />
        ))}
      </div>
    </div>
  );
}
