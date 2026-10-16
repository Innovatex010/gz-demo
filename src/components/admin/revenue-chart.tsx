"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { cn } from "cn";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import type { Point } from "@/lib/admin-books";
import { inrShort } from "@/lib/admin-data";

/* ────────────────────────────────────────────────────────────────────────────
   THE LEDGER CHART
   The shop's books, plotted on graph paper: hairline grid, indigo ink for the
   period on screen, a dashed comparison line for the one before it. It draws
   itself once when it lands — and never again — and it sits out entirely for
   anyone who has asked for reduced motion.

   Keyboard: focus the chart and use the arrow keys to walk the days.
   ──────────────────────────────────────────────────────────────────────────── */

const W = 760;
const H = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 44 };

const EASE = [0.16, 1, 0.3, 1] as const;

export function RevenueChart({
  series,
  previous,
  rangeLabel,
}: {
  series: Point[];
  previous: Point[];
  rangeLabel: string;
}) {
  const reduced = useReducedMotion();
  const [cursor, setCursor] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const n = series.length;
  const max = Math.max(
    ...series.map((p) => p.gross),
    ...previous.map((p) => p.gross),
  );
  const ceil = Math.ceil((max * 1.12) / 10_000) * 10_000;

  const x = (i: number) =>
    PAD.left + (i * (W - PAD.left - PAD.right)) / Math.max(1, n - 1);
  const y = (v: number) =>
    PAD.top + (1 - v / ceil) * (H - PAD.top - PAD.bottom);

  /* biome-ignore lint/correctness/useExhaustiveDependencies: x and y are pure
     geometry from module constants (W, H, PAD) and `ceil`, already a dep */
  const path = useMemo(
    () =>
      series
        .map(
          (p, i) =>
            `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.gross).toFixed(1)}`,
        )
        .join(" "),
    [series, ceil],
  );

  /* biome-ignore lint/correctness/useExhaustiveDependencies: x and y are pure
     geometry from module constants (W, H, PAD) and `ceil`, already a dep */
  const prevPath = useMemo(
    () =>
      previous
        .map(
          (p, i) =>
            `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.gross).toFixed(1)}`,
        )
        .join(" "),
    [previous, ceil],
  );

  const gridValues = [ceil, (ceil * 3) / 4, ceil / 2, ceil / 4];
  const labelEvery = Math.ceil(n / 7);

  const active = cursor === null ? n - 1 : cursor;
  const point = series[active];

  const move = (dir: 1 | -1) =>
    setCursor((c) => {
      const next = (c === null ? n - 1 : c) + dir;
      return Math.max(0, Math.min(n - 1, next));
    });

  const onPointer = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const rel = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(
      ((rel - PAD.left) / (W - PAD.left - PAD.right)) * (n - 1),
    );
    setCursor(Math.max(0, Math.min(n - 1, i)));
  };

  return (
    <figure className="m-0">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-4 pt-3">
        <p className="num text-[1.05rem] text-[color:var(--ink)]">
          {inrShort(point.gross)}
          <span className="ml-2 text-[0.8rem] text-[color:var(--ink-3)]">
            {point.full} · {point.orders} orders
          </span>
        </p>
        <p className="text-[0.75rem] text-[color:var(--ink-3)]">
          {rangeLabel} · {inrShort(series[n - 1].gross)} latest
        </p>
      </figcaption>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="mt-1 h-auto w-full touch-none"
        role="img"
        /* biome-ignore lint/a11y/noNoninteractiveTabindex: the chart is a
           data figure walked with the arrow keys — focus is how a keyboard
           reader reads the numbers off the plot */
        tabIndex={0}
        aria-label={`Gross sales per ${rangeLabel}. Use the arrow keys to read each point.`}
        onPointerMove={onPointer}
        onPointerLeave={() => setCursor(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            move(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            move(-1);
          } else if (e.key === "Escape") {
            setCursor(null);
          }
        }}
      >
        {/* Grid — the graph paper under the bookkeeping */}
        {gridValues.map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(v)}
              y2={y(v)}
              stroke="var(--line)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y(v) + 3.5}
              textAnchor="end"
              className="num"
              fontSize={10.5}
              fill="var(--ink-3)"
            >
              {inrShort(v)}
            </text>
          </g>
        ))}

        {/* X labels */}
        {series.map((p, i) =>
          i % labelEvery === 0 || i === n - 1 ? (
            <text
              key={`${p.label}-${x(i)}`}
              x={x(i)}
              y={H - 8}
              textAnchor={i === n - 1 ? "end" : "middle"}
              fontSize={10.5}
              fill="var(--ink-3)"
            >
              {p.label}
            </text>
          ) : null,
        )}

        {/* Previous period — dashed, quiet, always one step behind */}
        <path
          d={prevPath}
          fill="none"
          stroke="var(--ink-3)"
          strokeWidth={1}
          strokeDasharray="3 4"
          opacity={0.65}
        />

        {/* The line on screen — drawn once, when it lands */}
        <motion.path
          key={series[0].label + series.length}
          d={path}
          fill="none"
          stroke="var(--indigo)"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduced ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduced ? 0 : 1.15, ease: EASE }}
        />

        {series.map((p, i) => (
          <circle
            key={`${p.label}-${p.gross}`}
            cx={x(i)}
            cy={y(p.gross)}
            r={i === active ? 3.5 : 2.2}
            fill={i === active ? "var(--indigo)" : "var(--paper)"}
            stroke="var(--indigo)"
            strokeWidth={1.25}
          />
        ))}

        {/* Cursor guide */}
        {cursor !== null ? (
          <line
            x1={x(cursor)}
            x2={x(cursor)}
            y1={PAD.top}
            y2={H - PAD.bottom}
            stroke="var(--line-2)"
            strokeWidth={1}
          />
        ) : null}
      </svg>

      <div className="flex items-center gap-4 px-4 pb-3 text-[0.72rem] text-[color:var(--ink-3)]">
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-[2px] w-4 bg-[color:var(--indigo)]"
          />
          This period
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-0 w-4 border-t border-dashed border-[color:var(--ink-3)]"
          />
          Previous {rangeLabel}
        </span>
      </div>
    </figure>
  );
}

/* ── Range switcher ───────────────────────────────────────────────────────── */

const RANGES = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
] as const;

export function RangeTabs({
  value,
  onChange,
  className,
}: {
  value: "day" | "week" | "month" | "year";
  onChange: (v: "day" | "week" | "month" | "year") => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Date range"
      className={cn(
        "flex items-center gap-0 border border-[color:var(--line-2)]",
        className,
      )}
    >
      {RANGES.map((r) => (
        <button
          key={r.key}
          type="button"
          role="tab"
          aria-selected={value === r.key}
          onClick={() => onChange(r.key)}
          className={cn(
            "px-3 py-1.5 text-[0.8rem] transition-colors",
            value === r.key
              ? "bg-[color:var(--ink)] text-[color:var(--paper)]"
              : "text-[color:var(--ink-2)] hover:bg-[color:var(--paper-3)]",
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

/* ── The numbers row ──────────────────────────────────────────────────────── */

export function StatRow({
  stats,
  range,
}: {
  stats: {
    key: string;
    label: string;
    sub: string;
    value: string;
    delta: number | null;
  }[];
  range: string;
}) {
  return (
    <dl className="grid grid-cols-2 border border-[color:var(--line)] lg:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.key}
          className="border-b border-[color:var(--line)] px-4 py-3.5 not-last:border-r lg:border-b-0"
        >
          <dt className="text-[0.75rem] text-[color:var(--ink-3)]">
            {s.label}
          </dt>
          <dd className="num mt-1 text-[1.6rem] leading-none text-[color:var(--ink)]">
            {s.value}
          </dd>
          <dd className="mt-1 text-[0.72rem] text-[color:var(--ink-3)]">
            {s.sub}
          </dd>
          <dd className="mt-1.5">
            <DeltaText value={s.delta} range={range} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* The delta is set in the sans, not the Bodoni: the display face's plus is a
   hairline cross that reads as a stray tick at this size, and a comparison
   should read as a sentence, not a formula. */
function DeltaText({ value, range }: { value: number | null; range: string }) {
  if (value === null)
    return (
      <p className="text-[0.75rem] text-[color:var(--ink-3)]">
        New this period
      </p>
    );
  const up = value >= 0;
  return (
    <p
      className={cn(
        "flex items-center gap-1 text-[0.75rem]",
        up ? "text-[color:var(--ink-2)]" : "text-[color:var(--sale)]",
      )}
    >
      {up ? (
        <IconTrendingUp size={13} stroke={1.8} aria-hidden />
      ) : (
        <IconTrendingDown size={13} stroke={1.8} aria-hidden />
      )}
      {up ? "Up" : "Down"} {Math.abs(value)}%
      <span className="text-[color:var(--ink-3)]">vs the previous {range}</span>
    </p>
  );
}

/* ── Download ─────────────────────────────────────────────────────────────── */

export function ReportButton({
  series,
  range,
}: {
  series: Point[];
  range: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        const rows = [
          ["period", "gross", "net", "orders"],
          ...series.map((p) => [p.full, p.gross, p.net, p.orders]),
        ];
        const csv = rows.map((r) => r.join(",")).join("\n");
        const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = `good-zone-${range}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }}
      className="border border-[color:var(--line-2)] px-2.5 py-1.5 text-[0.78rem] text-[color:var(--ink-2)] transition-colors hover:border-[color:var(--ink)] hover:text-[color:var(--ink)]"
    >
      Download report
    </button>
  );
}
