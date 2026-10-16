import {
  ADMIN_ORDERS,
  ADMIN_PRODUCTS,
  type AdminOrder,
  type AdminProduct,
  AS_OF,
  AS_OF_LABEL,
  dayISO,
  fmtDay,
  fmtFull,
  productUnits,
  stockLevel,
} from "./admin-data";

/* ────────────────────────────────────────────────────────────────────────────
   THE BOOKS
   Revenue, comparisons and the boards the dashboard is built from. Seeded
   randomness only — the same render always produces the same books, which is
   what keeps the dashboard inside the static shell.
   ──────────────────────────────────────────────────────────────────────────── */

/** mulberry32 — small, fast, deterministic. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type RangeKey = "day" | "week" | "month" | "year";

export const RANGE_LABEL: Record<RangeKey, string> = {
  day: "14 days",
  week: "12 weeks",
  month: "12 months",
  year: "5 years",
};

export type Point = {
  /** Short axis label. */
  label: string;
  /** Full label for the readout. */
  full: string;
  gross: number;
  /** Net = gross minus discounts and refunds. */
  net: number;
  orders: number;
};

const buildSeries = (
  key: RangeKey,
  count: number,
  base: number,
  drift: number,
  /** Rupees per order — how big a basket was in this period. */
  perOrder: number,
  label: (i: number) => { label: string; full: string },
  seed: number,
): Point[] => {
  const rnd = seeded(seed);
  const pts: Point[] = [];
  for (let i = 0; i < count; i += 1) {
    const t = i / Math.max(1, count - 1);
    const trend = base * (1 + drift * t);
    const wobble = 0.82 + rnd() * 0.36;
    // Saturday–Sunday are the shop's busy days for online orders.
    const weekend =
      key === "day"
        ? [0, 6].includes(new Date(dayISO(i - (count - 1))).getUTCDay())
          ? 1.22
          : 1
        : 1;
    const gross = Math.round((trend * wobble * weekend) / 100) * 100;
    const orders = Math.max(3, Math.round(gross / perOrder));
    const l = label(i);
    pts.push({
      label: l.label,
      full: l.full,
      gross,
      net: Math.round(gross * 0.92),
      orders,
    });
  }
  return pts;
};

const lastNDaysLabel = (n: number) => (i: number) => {
  const iso = dayISO(i - (n - 1));
  return { label: fmtDay(iso), full: `${fmtDay(iso)} 2026` };
};

const monthLabel = (i: number) => {
  const d = new Date(AS_OF);
  d.setUTCMonth(d.getUTCMonth() - (11 - i));
  return {
    label: d.toLocaleDateString("en-IN", { month: "short" }),
    full: d.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
  };
};

const weekLabel = (i: number) => {
  const iso = dayISO(-(11 - i) * 7);
  return { label: fmtDay(iso), full: `Week of ${fmtFull(iso)}` };
};

const yearLabel = (i: number) => ({
  label: String(2022 + i),
  full: String(2022 + i),
});

/* Two independent books per range: the period on screen and the one before
   it. Basket size moves on its own (perOrder), so the average-order-value
   comparison is a real number rather than a copy of the gross-sales one. */
export const SERIES: Record<RangeKey, Point[]> = {
  day: buildSeries("day", 14, 13_400, 0.18, 2450, lastNDaysLabel(14), 7),
  week: buildSeries("week", 12, 94_000, 0.24, 2380, weekLabel, 21),
  month: buildSeries("month", 12, 402_000, 0.3, 2450, monthLabel, 33),
  year: buildSeries("year", 5, 3_600_000, 0.42, 2600, yearLabel, 51),
};

/** The period immediately before the one on screen, for the comparison. */
export const SERIES_PREV: Record<RangeKey, Point[]> = {
  day: buildSeries("day", 14, 11_600, 0.1, 2280, lastNDaysLabel(14), 99),
  week: buildSeries("week", 12, 76_500, 0.14, 2520, weekLabel, 100),
  month: buildSeries("month", 12, 318_000, 0.16, 2310, monthLabel, 101),
  year: buildSeries("year", 5, 2_300_000, 0.24, 2750, yearLabel, 102),
};

export type Stat = {
  key: string;
  label: string;
  /** What the number counts, in plain words — sits under the value. */
  sub: string;
  value: string;
  /** Change against the previous period, in percent. */
  delta: number | null;
};

const sum = (pts: Point[], k: "gross" | "net" | "orders") =>
  pts.reduce((n, p) => n + p[k], 0);

const pct = (now: number, before: number) =>
  before === 0 ? null : Math.round(((now - before) / before) * 100);

export function statsFor(range: RangeKey): Stat[] {
  const now = SERIES[range];
  const prev = SERIES_PREV[range];
  const gross = sum(now, "gross");
  const net = sum(now, "net");
  const orders = sum(now, "orders");
  const aov = Math.round(gross / orders);
  const aovPrev = Math.round(sum(prev, "gross") / sum(prev, "orders"));

  return [
    {
      key: "gross",
      label: "Gross sales",
      sub: "before discounts and refunds",
      value: `₹${gross.toLocaleString("en-IN")}`,
      delta: pct(gross, sum(prev, "gross")),
    },
    {
      key: "net",
      label: "Net sales",
      sub: "after discounts and refunds",
      value: `₹${net.toLocaleString("en-IN")}`,
      delta: pct(net, sum(prev, "net")),
    },
    {
      key: "orders",
      label: "Orders",
      sub: "paid and confirmed",
      value: orders.toLocaleString("en-IN"),
      delta: pct(orders, sum(prev, "orders")),
    },
    {
      key: "aov",
      label: "Average order value",
      sub: "per order",
      value: `₹${aov.toLocaleString("en-IN")}`,
      delta: pct(aov, aovPrev),
    },
  ];
}

/* ── Bestsellers ──────────────────────────────────────────────────────────── */

export type Bestseller = {
  product: AdminProduct;
  units: number;
  revenue: number;
  stockLeft: number;
};

export const BESTSELLERS: Bestseller[] = ADMIN_PRODUCTS.map((product) => ({
  product,
  units: product.unitsSold30d,
  revenue: product.unitsSold30d * product.price,
  stockLeft: productUnits(product),
}))
  .sort((a, b) => b.units - a.units)
  .slice(0, 5);

/* ── Low stock ────────────────────────────────────────────────────────────── */

export type LowStockRow = {
  product: AdminProduct;
  size: string;
  sku: string;
  stock: number;
  threshold: number;
};

export const LOW_STOCK: LowStockRow[] = ADMIN_PRODUCTS.flatMap((product) =>
  product.variants
    .filter((v) => stockLevel(product, v) !== "in")
    .map((v) => ({
      product,
      size: v.size,
      sku: v.sku,
      stock: v.stock,
      threshold: v.threshold,
    })),
).sort((a, b) => a.stock - b.stock);

/* ── Payment split ────────────────────────────────────────────────────────── */

export type PaymentRow = {
  status: AdminOrder["payment"];
  count: number;
  amount: number;
};

export const PAYMENT_SPLIT: PaymentRow[] = (
  ["paid", "pending", "refunded", "failed"] as const
).map((status) => ({
  status,
  count: ADMIN_ORDERS.filter((o) => o.payment === status).length,
  amount: ADMIN_ORDERS.filter((o) => o.payment === status).reduce(
    (n, o) => n + (status === "refunded" ? o.totals.subtotal : o.totals.total),
    0,
  ),
}));

/* ── Collections board ────────────────────────────────────────────────────── */

export const COLLECTION_BOARD = [
  { name: "The shirt", units: 128, share: 0.31 },
  { name: "New arrivals", units: 96, share: 0.23 },
  { name: "Essentials", units: 74, share: 0.18 },
  { name: "Linen season", units: 61, share: 0.15 },
  { name: "Last few left", units: 53, share: 0.13 },
];

export { AS_OF, AS_OF_LABEL };
