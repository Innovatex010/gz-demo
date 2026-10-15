import {
  type CategoryId,
  categoryLabel,
  inr,
  PRODUCTS,
  type Product,
  productById,
  SIZES,
} from "./catalog";

/* ────────────────────────────────────────────────────────────────────────────
   Collections
   A curated layer over the catalogue. `/shop` is everything; `/collections` is
   what we would actually put in front of someone. Membership is an explicit
   list on purpose — a collection that silently refills itself when stock
   changes stops being a point of view.
   ──────────────────────────────────────────────────────────────────────────── */

export type Collection = {
  slug: string;
  title: string;
  /** One line, under the title. Sets the expectation for what is inside. */
  blurb: string;
  image: string;
  productIds: string[];
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "new-arrivals",
    title: "New arrivals",
    blurb: "The last two production runs, cut and finished.",
    image: "/images/product/shirt-linen-relaxed.webp",
    productIds: ["GZ-105", "GZ-106", "GZ-203", "GZ-402", "GZ-503"],
  },
  {
    slug: "the-shirt",
    title: "The shirt",
    blurb: "Full-sleeve and half-sleeve, in the cloths we keep reordering.",
    image: "/images/product/shirt-chambray-seated.webp",
    productIds: [
      "GZ-102",
      "GZ-103",
      "GZ-104",
      "GZ-105",
      "GZ-106",
      "GZ-201",
      "GZ-202",
      "GZ-203",
    ],
  },
  {
    slug: "essentials",
    title: "Essentials",
    blurb: "The things you reorder without thinking. That is the point.",
    image: "/images/product/tee-olive.webp",
    productIds: ["GZ-102", "GZ-301", "GZ-302", "GZ-401", "GZ-501"],
  },
  {
    slug: "linen-season",
    title: "Linen season",
    blurb: "Both our linen shirts and both our linen trousers.",
    image: "/images/product/shirt-rose-pink.webp",
    productIds: ["GZ-105", "GZ-106", "GZ-501", "GZ-502"],
  },
  {
    slug: "last-few",
    title: "Last few left",
    blurb: "Almost gone. When these are out we will not cut them again.",
    image: "/images/product/tee-white-print.webp",
    productIds: ["GZ-305", "GZ-403", "GZ-504"],
  },
];

export const collectionBySlug = (slug: string) =>
  COLLECTIONS.find((c) => c.slug === slug);

export const productsInCollection = (slug: string): Product[] => {
  const c = collectionBySlug(slug);
  if (!c) return [];
  return c.productIds.map(productById).filter((p): p is Product => Boolean(p));
};

/* ────────────────────────────────────────────────────────────────────────────
   Variants and stock
   ──────────────────────────────────────────────────────────────────────────── */

/** Chest inches, the way Indian shirt sizing actually works. */
export const SIZE_CHEST: Record<string, string> = {
  XS: '34"',
  S: '36"',
  M: '38"',
  L: '40"',
  XL: '42"',
  XXL: '44"',
};

export const sizeStock = (p: Product, size: string) => p.stock[size] ?? 0;

export const totalStock = (p: Product) =>
  p.sizes.reduce((n, s) => n + sizeStock(p, s), 0);

/** Units below this read as urgency rather than as stock. */
const LOW = 4;

export type StockState = "out" | "low" | "in";

export const stockState = (p: Product, size?: string): StockState => {
  const n = size ? sizeStock(p, size) : totalStock(p);
  if (n <= 0) return "out";
  if (n <= LOW) return "low";
  return "in";
};

export const stockLine = (p: Product, size?: string) => {
  const n = size ? sizeStock(p, size) : totalStock(p);
  if (n <= 0) return size ? "Out of stock in this size" : "Out of stock";
  if (n <= LOW)
    return size
      ? `Only ${n} left in ${size}`
      : `Only ${n} left across all sizes`;
  return size ? "In stock" : "In stock";
};

export const maxSelectable = 3;

/* ────────────────────────────────────────────────────────────────────────────
   Search
   Scores a product against a free-text query. Deliberately simple: prefix
   matches beat word matches, and a match in the name beats a match in the
   fabric. Real relevance tuning wants a search index and real query logs.
   ──────────────────────────────────────────────────────────────────────────── */

const norm = (s: string) => s.toLowerCase().trim();

export function searchProducts(query: string, limit = 24): Product[] {
  const q = norm(query);
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  const scored = PRODUCTS.map((p) => {
    const name = norm(p.name);
    const cat = norm(categoryLabel(p.category));
    const fabric = norm(p.fabric);
    const fit = norm(p.fit);
    const id = norm(p.id);
    const colours = norm(p.colors.map((c) => c.name).join(" "));

    let score = 0;
    let matchedAll = true;

    for (const t of terms) {
      let s = 0;
      if (name.startsWith(t)) s = 60;
      else if (name.includes(t)) s = 40;
      if (id.startsWith(t)) s = Math.max(s, 55);
      if (cat.includes(t)) s = Math.max(s, 25);
      if (colours.includes(t)) s = Math.max(s, 18);
      if (fabric.includes(t)) s = Math.max(s, 12);
      if (fit.includes(t)) s = Math.max(s, 8);
      if (s === 0) matchedAll = false;
      score += s;
    }
    return { p, score, matchedAll };
  });

  return scored
    .filter((r) => r.matchedAll && r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.p);
}

/** Typeahead: products first, then categories, then collections. */
export type Suggestion =
  | {
      kind: "product";
      label: string;
      href: string;
      meta: string;
      image: string;
    }
  | { kind: "category"; label: string; href: string; meta: string }
  | { kind: "collection"; label: string; href: string; meta: string };

export function suggest(query: string, limit = 6): Suggestion[] {
  const q = norm(query);
  if (q.length < 2) return [];

  const products = searchProducts(q, limit).map<Suggestion>((p) => ({
    kind: "product",
    label: p.name,
    href: `/shop/${p.id}`,
    meta: `${inr(p.price)} · ${p.colors[0]?.name ?? ""}`,
    image: p.image,
  }));

  const cats: Suggestion[] = [];
  const seenCats = new Set<string>();
  for (const p of searchProducts(q, 40)) {
    const c = categoryLabel(p.category);
    if (seenCats.has(c)) continue;
    seenCats.add(c);
    cats.push({
      kind: "category",
      label: c,
      href: `/shop?c=${p.category}`,
      meta: "Category",
    });
  }

  const cols: Suggestion[] = COLLECTIONS.filter(
    (c) =>
      norm(c.title).includes(q) ||
      norm(c.blurb).includes(q) ||
      productsInCollection(c.slug).some((p) => norm(p.name).includes(q)),
  ).map<Suggestion>((c) => ({
    kind: "collection",
    label: c.title,
    href: `/collections/${c.slug}`,
    meta: `Collection · ${c.productIds.length} styles`,
  }));

  return [
    ...products.slice(0, limit),
    ...cats.slice(0, 2),
    ...cols.slice(0, 2),
  ];
}

/* ────────────────────────────────────────────────────────────────────────────
   Delivery
   Indian pincodes: 6 digits, and the leading digits tell you the region. We
   only have real stores in four cities, so anything outside them falls back
   to the national courier estimate rather than pretending to know.
   ──────────────────────────────────────────────────────────────────────────── */

export const STORE_PIN_PREFIX: Record<string, string> = {
  Bengaluru: "56",
  Hyderabad: "50",
  Chennai: "60",
  Pune: "41",
};

export type DeliveryEstimate = {
  ok: boolean;
  /** Why it failed, when ok is false. */
  problem?: string;
  days: string;
  by?: string;
  cod: boolean;
  city?: string;
};

const SERVICEABLE = new Set(["56", "50", "60", "41", "1", "2", "3", "4", "7"]);

export function estimateDelivery(
  pin: string,
  when = new Date(),
): DeliveryEstimate {
  const p = pin.trim();
  if (!/^\d{6}$/.test(p))
    return {
      ok: false,
      problem: "A pincode is six digits.",
      days: "",
      cod: true,
    };

  const pre = p.slice(0, 2);
  const city = Object.entries(STORE_PIN_PREFIX).find(([, v]) => v === pre)?.[0];

  if (!city && !SERVICEABLE.has(pre))
    return {
      ok: false,
      problem: "We do not ship to that pincode yet.",
      days: "",
      cod: true,
    };

  // Orders placed before 11am go out the same day, but only where we have a
  // store to walk the parcel to.
  const beforeCutoff = when.getHours() < 11;
  const base = city ? (beforeCutoff ? 2 : 3) : 4;
  const arrive = new Date(when);
  arrive.setDate(arrive.getDate() + base);

  return {
    ok: true,
    days: base === 2 ? "1–2 working days" : `${base}–${base + 2} working days`,
    by: arrive.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    cod: city !== undefined,
    city,
  };
}

/* ────────────────────────────────────────────────────────────────────────────
   Totals
   ──────────────────────────────────────────────────────────────────────────── */

export const FREE_DELIVERY_OVER = 1499;
export const COD_LIMIT = 10000;
export const TAX_RATE = 0.05;

export type Totals = {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  freeShippingGap: number;
};

export function totals(
  lines: { price: number; qty: number }[],
  coupon?: { kind: "percent"; value: number } | null,
): Totals {
  const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
  const discount = coupon ? Math.round((subtotal * coupon.value) / 100) : 0;
  const net = subtotal - discount;
  const shipping = net === 0 || net >= FREE_DELIVERY_OVER ? 0 : 79;
  const tax = Math.round(net * TAX_RATE);
  return {
    subtotal,
    shipping,
    discount,
    tax,
    total: net + shipping + tax,
    freeShippingGap: Math.max(0, FREE_DELIVERY_OVER - net),
  };
}

/** Coupons are placeholders until marketing issues real codes. */
export const COUPONS = [
  { code: "WELCOME10", kind: "percent" as const, value: 10, note: "10% off" },
  {
    code: "FIFTYOFF",
    kind: "percent" as const,
    value: 5,
    note: "5% off orders over ₹2,000",
  },
];

export const findCoupon = (code: string) =>
  COUPONS.find((c) => c.code === code.trim().toUpperCase());

/* ────────────────────────────────────────────────────────────────────────────
   Related products
   Same category first, then anything that shares a colour with what you are
   looking at. Cheap, but it is the reason a shop feels like it knows you.
   ──────────────────────────────────────────────────────────────────────────── */

export function relatedTo(p: Product, limit = 4): Product[] {
  const sameCategory = PRODUCTS.filter(
    (x) => x.id !== p.id && x.category === p.category,
  );
  const pColours = new Set(p.colors.map((c) => c.name));
  const others = PRODUCTS.filter(
    (x) => x.id !== p.id && x.category !== p.category,
  ).sort((a, b) => {
    const score = (x: Product) =>
      x.colors.filter((c) => pColours.has(c.name)).length;
    return score(b) - score(a);
  });
  return [...sameCategory, ...others].slice(0, limit);
}

/** Fills an outfit: the pieces that go with this one, not more of the same. */
export function completeTheLook(p: Product, limit = 3): Product[] {
  const shirts: CategoryId[] = ["full-sleeve", "half-sleeve", "t-shirts"];
  const bottoms: CategoryId[] = ["pants", "trousers"];
  const isBottom = bottoms.includes(p.category);

  const want = isBottom ? shirts : bottoms;
  const out = PRODUCTS.filter((x) => x.id !== p.id && want.includes(x.category))
    .sort(
      (a, b) =>
        Number(b.badge === "Bestseller") - Number(a.badge === "Bestseller"),
    )
    .slice(0, limit);

  return out;
}

export { SIZES, inr, categoryLabel, productById };
export type { Product };
