import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { cn } from "cn";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  type OrderStatus,
  PAY_STATUS_LABEL,
  type PayStatus,
  STAGE_LABEL,
} from "@/lib/admin-data";

/* ────────────────────────────────────────────────────────────────────────────
   THE FURNITURE
   Flat panels divided by hairlines, ink chips for status, Bodoni numerals for
   figures. Nothing here casts a shadow or rounds a corner: the shop's own
   system is 2px radii and rules, and the desk should feel cut from the same
   cloth.
   ──────────────────────────────────────────────────────────────────────────── */

export function Panel({
  children,
  className,
  as: As = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return (
    <As
      className={cn(
        "border border-[color:var(--line)] bg-[color:var(--paper)]",
        className,
      )}
    >
      {children}
    </As>
  );
}

export function PanelHead({
  title,
  hint,
  action,
  className,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[color:var(--line)] px-4 py-3",
        className,
      )}
    >
      <h2 className="text-[0.95rem] font-semibold tracking-tight text-[color:var(--ink)]">
        {title}
      </h2>
      {hint ? (
        <p className="text-[0.78rem] text-[color:var(--ink-3)]">{hint}</p>
      ) : null}
      {action}
    </div>
  );
}

/* ── Chips ────────────────────────────────────────────────────────────────── */

type ChipTone = "ink" | "outline" | "sale";

const chipTone: Record<ChipTone, string> = {
  ink: "border-transparent bg-[color:var(--ink)] text-[color:var(--paper)]",
  outline: "border-[color:var(--line-2)] text-[color:var(--ink-2)]",
  sale: "border-transparent bg-[color:var(--sale)]/12 text-[color:var(--sale)]",
};

export function Chip({
  tone = "outline",
  children,
  className,
  title,
}: {
  tone?: ChipTone;
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-[1.125rem] items-center rounded-none border px-1.5 text-[0.7rem] leading-none font-medium whitespace-nowrap",
        chipTone[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const orderTone = (status: OrderStatus): ChipTone => {
  if (status === "delivered") return "ink";
  if (status === "cancelled" || status === "returned") return "sale";
  return "outline";
};

export function OrderChip({ status }: { status: OrderStatus }) {
  return (
    <Chip tone={orderTone(status)}>
      {STAGE_LABEL[status as keyof typeof STAGE_LABEL] ??
        (status === "cancelled" ? "Cancelled" : "Returned")}
    </Chip>
  );
}

const payTone = (payment: PayStatus): ChipTone => {
  if (payment === "paid") return "ink";
  if (payment === "pending") return "outline";
  return "sale";
};

export function PayChip({ payment }: { payment: PayStatus }) {
  return <Chip tone={payTone(payment)}>{PAY_STATUS_LABEL[payment]}</Chip>;
}

export function StockChip({
  stock,
  threshold,
}: {
  stock: number;
  threshold: number;
}) {
  if (stock <= 0) return <Chip tone="sale">Out</Chip>;
  if (stock <= threshold) return <Chip tone="sale">{stock} left</Chip>;
  return <Chip>{stock}</Chip>;
}

export function StatusDotChip({
  status,
  children,
}: {
  status: "draft" | "published" | "archived";
  children: ReactNode;
}) {
  return (
    <Chip
      tone={
        status === "published" ? "ink" : status === "draft" ? "outline" : "sale"
      }
    >
      {children}
    </Chip>
  );
}

/* ── Key/value pairs ──────────────────────────────────────────────────────── */

export function DefGrid({
  rows,
  className,
}: {
  rows: [string, ReactNode][];
  className?: string;
}) {
  return (
    <dl className={cn("grid gap-x-8 gap-y-3", className)}>
      {rows.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-0.5">
          <dt className="text-[0.72rem] text-[color:var(--ink-3)]">{k}</dt>
          <dd className="text-[0.88rem] text-[color:var(--ink)]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ── Tables ───────────────────────────────────────────────────────────────── */

export function Table({
  head,
  children,
  className,
  caption,
}: {
  head: ReactNode;
  children: ReactNode;
  className?: string;
  caption?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse text-[0.85rem]", className)}>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-[color:var(--line-2)]">{head}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Th({
  children,
  className,
  numeric,
  scope = "col",
}: {
  children: ReactNode;
  className?: string;
  numeric?: boolean;
  scope?: "col" | "row";
}) {
  return (
    <th
      scope={scope}
      className={cn(
        "px-4 py-2.5 text-[0.72rem] font-semibold text-[color:var(--ink-3)]",
        numeric ? "text-right" : "text-left",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className,
  numeric,
}: {
  children: ReactNode;
  className?: string;
  numeric?: boolean;
}) {
  return (
    <td
      className={cn(
        "px-4 py-2.5 align-middle text-[color:var(--ink)]",
        numeric && "num text-right",
        className,
      )}
    >
      {children}
    </td>
  );
}

export function Row({
  children,
  className,
  highlight,
}: {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <tr
      className={cn(
        "border-b border-[color:var(--line)] last:border-b-0",
        highlight && "bg-[color:var(--sand)]",
        className,
      )}
    >
      {children}
    </tr>
  );
}

/* ── Delta ────────────────────────────────────────────────────────────────── */

export function Delta({ value, note }: { value: number | null; note: string }) {
  if (value === null)
    return (
      <p className="mt-1 text-[0.75rem] text-[color:var(--ink-3)]">
        New this period
      </p>
    );
  const up = value >= 0;
  const Icon = up ? IconTrendingUp : IconTrendingDown;
  return (
    <p
      className={cn(
        "mt-1 flex items-center gap-1 text-[0.75rem]",
        up ? "text-[color:var(--ink-2)]" : "text-[color:var(--sale)]",
      )}
    >
      <Icon size={13} stroke={1.8} aria-hidden />
      <span className="num">
        {up ? "+" : "−"}
        {Math.abs(value)}%
      </span>
      <span className="text-[color:var(--ink-3)]">{note}</span>
    </p>
  );
}

/* ── Empty and notes ──────────────────────────────────────────────────────── */

export function EmptyNote({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="mx-auto max-w-[38ch] text-[0.9rem] leading-relaxed text-[color:var(--ink-2)]">
        {children}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function QuietLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "link-draw text-[0.85rem] text-[color:var(--indigo)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}
