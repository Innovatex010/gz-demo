import {
  type CategoryId,
  categoryLabel,
  PRODUCTS,
  type Product,
} from "./catalog";

/* ────────────────────────────────────────────────────────────────────────────
   THE DESK
   Everything the admin screens read, in one place. Mock data today — the
   shapes are the ones a real API will have to return. All values are fixed
   and deterministic: the same render always produces the same page, which
   is what lets the shell prerender under Cache Components.
   ──────────────────────────────────────────────────────────────────────────── */

/** The moment every date on the desk is relative to. */
export const AS_OF = new Date("2026-10-15T18:00:00+05:30");

export const AS_OF_LABEL = "15 October 2026, 6:00 pm IST";

/* ── Money and dates ─────────────────────────────────────────────────────── */

export const inr0 = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Compact Indian-style money for chart axes: ₹18.4k, ₹4.8L. */
export function inrShort(n: number): string {
  const a = Math.abs(n);
  if (a >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (a >= 1e5) return `₹${(n / 1e5).toFixed(1)}L`;
  if (a >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
  return inr0(n);
}

const DAY = 86_400_000;

/** ISO string for a day offset from AS_OF. */
export const dayISO = (offset: number) =>
  new Date(AS_OF.getTime() + offset * DAY).toISOString();

export const fmtDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

export const fmtFull = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

/* ── Products ─────────────────────────────────────────────────────────────── */

export type ProductStatus = "draft" | "published" | "archived";

export type Variant = {
  size: string;
  sku: string;
  stock: number;
  /** Units below this read as urgency rather than as stock. */
  threshold: number;
};

export type AdminProduct = {
  id: string;
  name: string;
  category: CategoryId;
  categoryLabel: string;
  price: number;
  compareAt?: number;
  cost: number;
  status: ProductStatus;
  fabric: string;
  fitName: string;
  image: string;
  colors: string[];
  variants: Variant[];
  unitsSold30d: number;
  badge?: string;
};

/** Rough cost per style — a clothing brand runs at 45–60% material+make. */
const COST_RATIO: Record<string, number> = {
  "GZ-102": 0.52,
  "GZ-103": 0.5,
  "GZ-104": 0.48,
  "GZ-105": 0.46,
  "GZ-106": 0.46,
  "GZ-201": 0.5,
  "GZ-202": 0.47,
  "GZ-203": 0.45,
  "GZ-301": 0.44,
  "GZ-302": 0.46,
  "GZ-305": 0.44,
  "GZ-401": 0.42,
  "GZ-402": 0.42,
  "GZ-403": 0.45,
  "GZ-501": 0.47,
  "GZ-502": 0.47,
  "GZ-503": 0.49,
  "GZ-504": 0.43,
};

const DEFAULT_THRESHOLD = 3;

/** SKU: GZ-102-M — style and size. Colourways share it; they are one SKU here,
    the way a counter sells by size, not by colour. */
const skuFor = (p: Product, size: string) => `${p.id}-${size}`;

const toAdminProduct = (
  p: Product,
  status: ProductStatus,
  unitsSold: number,
): AdminProduct => ({
  id: p.id,
  name: p.name,
  category: p.category,
  categoryLabel: categoryLabel(p.category),
  price: p.price,
  compareAt: p.compareAt,
  cost: Math.round(p.price * (COST_RATIO[p.id] ?? 0.5)),
  status,
  fabric: p.fabric,
  fitName: p.fitName,
  image: p.image,
  colors: p.colors.map((c) => c.name),
  badge: p.badge,
  variants: p.sizes.map((size) => ({
    size,
    sku: skuFor(p, size),
    stock: p.stock[size] ?? 0,
    threshold: DEFAULT_THRESHOLD,
  })),
  unitsSold30d: unitsSold,
});

/** Units sold in the last 30 days, per style. Roughly proportional to how
    the shop has been moving; the bestsellers board is computed from these. */
const UNITS_30D: Record<string, number> = {
  "GZ-102": 46,
  "GZ-103": 28,
  "GZ-104": 19,
  "GZ-105": 34,
  "GZ-106": 22,
  "GZ-201": 17,
  "GZ-202": 12,
  "GZ-203": 31,
  "GZ-301": 26,
  "GZ-302": 15,
  "GZ-305": 8,
  "GZ-401": 21,
  "GZ-402": 13,
  "GZ-403": 6,
  "GZ-501": 24,
  "GZ-502": 18,
  "GZ-503": 11,
  "GZ-504": 5,
};

const STATUS_OVERRIDE: Record<string, ProductStatus> = {
  "GZ-305": "draft",
  "GZ-403": "archived",
};

export const ADMIN_PRODUCTS: AdminProduct[] = PRODUCTS.map((p) =>
  toAdminProduct(p, STATUS_OVERRIDE[p.id] ?? "published", UNITS_30D[p.id] ?? 0),
);

export const adminProductById = (id: string) =>
  ADMIN_PRODUCTS.find((p) => p.id === id);

export const productUnits = (p: AdminProduct) =>
  p.variants.reduce((n, v) => n + v.stock, 0);

export type StockLevel = "out" | "low" | "in";

/** Variant or whole-product stock against its threshold. */
export const stockLevel = (p: AdminProduct, v?: Variant): StockLevel => {
  const n = v ? v.stock : productUnits(p);
  const threshold = v ? v.threshold : DEFAULT_THRESHOLD;
  if (n <= 0) return "out";
  if (n <= threshold) return "low";
  return "in";
};

/* ── Orders ───────────────────────────────────────────────────────────────── */

export type OrderStage =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered";

export const STAGES: OrderStage[] = [
  "placed",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
];

export const STAGE_LABEL: Record<OrderStage, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
};

export type OrderStatus = OrderStage | "cancelled" | "returned";

export type PayMethod = "upi" | "card" | "netbanking" | "cod";
export type PayStatus = "paid" | "pending" | "refunded" | "failed";

export const PAY_METHOD_LABEL: Record<PayMethod, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net banking",
  cod: "Cash on delivery",
};

export const PAY_STATUS_LABEL: Record<PayStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  refunded: "Refunded",
  failed: "Failed",
};

export type OrderEvent = {
  stage: OrderStatus;
  at: string;
  note?: string;
};

export type OrderLine = {
  productId: string;
  name: string;
  size: string;
  color: string;
  qty: number;
  price: number;
};

export type AdminOrder = {
  id: string;
  placedAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    line1: string;
    line2?: string;
    city: string;
    pin: string;
    state: string;
  };
  method: PayMethod;
  payment: PayStatus;
  status: OrderStatus;
  lines: OrderLine[];
  totals: {
    subtotal: number;
    shipping: number;
    discount: number;
    tax: number;
    total: number;
  };
  coupon?: string;
  carrier?: string;
  tracking?: string;
  events: OrderEvent[];
  /** Set when the parcel is expected — one line on the detail page. */
  expectedBy?: string;
};

type OrderSeed = {
  id: string;
  day: number;
  hour: number;
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  pin: string;
  state: string;
  method: PayMethod;
  payment: PayStatus;
  status: OrderStatus;
  coupon?: string;
  carrier?: string;
  tracking?: string;
  items: [productId: string, size: string, color: string, qty: number][];
};

const CUSTOMERS: Omit<
  OrderSeed,
  "id" | "day" | "hour" | "method" | "payment" | "status" | "items"
>[] = [
  {
    name: "Arjun Mehta",
    email: "arjun.mehta@gmail.com",
    phone: "+91 98450 21134",
    line1: "42, 3rd Cross, Indiranagar",
    line2: "Near 12th Main",
    city: "Bengaluru",
    pin: "560038",
    state: "Karnataka",
  },
  {
    name: "Sneha Raghavan",
    email: "sneha.r@outlook.com",
    phone: "+91 90031 55210",
    line1: "7B, Sea Breeze Apartments",
    line2: "Bishop Garden, Besant Nagar",
    city: "Chennai",
    pin: "600090",
    state: "Tamil Nadu",
  },
  {
    name: "Vikram Nair",
    email: "vikram.nair@yahoo.in",
    phone: "+91 97400 33281",
    line1: "201, Ravi Residency",
    line2: "Road No. 12, Banjara Hills",
    city: "Hyderabad",
    pin: "500034",
    state: "Telangana",
  },
  {
    name: "Priya Deshmukh",
    email: "priya.d@gmail.com",
    phone: "+91 88790 10045",
    line1: "15, Laxmi Society",
    line2: "Kothrud",
    city: "Pune",
    pin: "411038",
    state: "Maharashtra",
  },
  {
    name: "Rohit Bansal",
    email: "rohit.bansal@hotmail.com",
    phone: "+91 98110 77452",
    line1: "C-44, Greater Kailash II",
    city: "New Delhi",
    pin: "110048",
    state: "Delhi",
  },
  {
    name: "Fatima Sheikh",
    email: "fatima.sheikh@gmail.com",
    phone: "+91 70210 66503",
    line1: "23, Hill Road",
    line2: "Bandra West",
    city: "Mumbai",
    pin: "400050",
    state: "Maharashtra",
  },
  {
    name: "Karthik Iyer",
    email: "karthik.iyer@proton.me",
    phone: "+91 99620 41877",
    line1: "56, Sterling Apartments",
    line2: "Nungambakkam",
    city: "Chennai",
    pin: "600006",
    state: "Tamil Nadu",
  },
  {
    name: "Aditya Rao",
    email: "aditya.rao@gmail.com",
    phone: "+91 91080 92213",
    line1: "9, Embassy Golf Links",
    city: "Bengaluru",
    pin: "560071",
    state: "Karnataka",
  },
  {
    name: "Meera Krishnan",
    email: "meera.k@icloud.com",
    phone: "+91 94440 30198",
    line1: "3rd Floor, Alappatt House",
    line2: "MG Road",
    city: "Kochi",
    pin: "682035",
    state: "Kerala",
  },
  {
    name: "Sameer Khan",
    email: "sameer.khan@gmail.com",
    phone: "+91 93220 51166",
    line1: "78, Linking Road",
    line2: "Khar West",
    city: "Mumbai",
    pin: "400052",
    state: "Maharashtra",
  },
  {
    name: "Divya Menon",
    email: "divya.menon@gmail.com",
    phone: "+91 80880 27744",
    line1: "12, Panampilly Nagar",
    city: "Kochi",
    pin: "682036",
    state: "Kerala",
  },
  {
    name: "Nikhil Joshi",
    email: "nikhil.joshi@rediffmail.com",
    phone: "+91 98900 63321",
    line1: "Flat 5, Shivneri CHS",
    line2: "Aundh",
    city: "Pune",
    pin: "411007",
    state: "Maharashtra",
  },
];

/* id, day offset from AS_OF, hour, customer index, method, payment, status,
   carrier/tracking when shipped, items */
const ORDER_SEEDS: OrderSeed[] = [
  {
    id: "GZ-5128",
    day: 0,
    hour: 17,
    name: "Arjun Mehta",
    email: "arjun.mehta@gmail.com",
    phone: "+91 98450 21134",
    line1: "42, 3rd Cross, Indiranagar",
    line2: "Near 12th Main",
    city: "Bengaluru",
    pin: "560038",
    state: "Karnataka",
    method: "upi",
    payment: "paid",
    status: "placed",
    items: [
      ["GZ-102", "L", "White", 2],
      ["GZ-301", "M", "Olive", 1],
    ],
  },
  {
    id: "GZ-5127",
    day: 0,
    hour: 14,
    name: "Sneha Raghavan",
    email: "sneha.r@outlook.com",
    phone: "+91 90031 55210",
    line1: "7B, Sea Breeze Apartments",
    line2: "Bishop Garden, Besant Nagar",
    city: "Chennai",
    pin: "600090",
    state: "Tamil Nadu",
    method: "card",
    payment: "paid",
    status: "confirmed",
    items: [["GZ-105", "S", "Rose", 1]],
  },
  {
    id: "GZ-5126",
    day: 0,
    hour: 11,
    name: "Vikram Nair",
    email: "vikram.nair@yahoo.in",
    phone: "+91 97400 33281",
    line1: "201, Ravi Residency",
    line2: "Road No. 12, Banjara Hills",
    city: "Hyderabad",
    pin: "500034",
    state: "Telangana",
    method: "cod",
    payment: "pending",
    status: "packed",
    items: [
      ["GZ-203", "M", "Ecru", 1],
      ["GZ-501", "32", "Sand", 1],
    ],
  },
  {
    id: "GZ-5125",
    day: -1,
    hour: 19,
    name: "Priya Deshmukh",
    email: "priya.d@gmail.com",
    phone: "+91 88790 10045",
    line1: "15, Laxmi Society",
    line2: "Kothrud",
    city: "Pune",
    pin: "411038",
    state: "Maharashtra",
    method: "upi",
    payment: "paid",
    status: "shipped",
    carrier: "Delhivery",
    tracking: "DH4821095734",
    items: [["GZ-401", "32", "Cream", 1]],
  },
  {
    id: "GZ-5124",
    day: -1,
    hour: 12,
    name: "Rohit Bansal",
    email: "rohit.bansal@hotmail.com",
    phone: "+91 98110 77452",
    line1: "C-44, Greater Kailash II",
    city: "New Delhi",
    pin: "110048",
    state: "Delhi",
    method: "netbanking",
    payment: "paid",
    status: "delivered",
    items: [["GZ-103", "XL", "Navy", 3]],
  },
  {
    id: "GZ-5123",
    day: -1,
    hour: 10,
    name: "Fatima Sheikh",
    email: "fatima.sheikh@gmail.com",
    phone: "+91 70210 66503",
    line1: "23, Hill Road",
    line2: "Bandra West",
    city: "Mumbai",
    pin: "400050",
    state: "Maharashtra",
    method: "card",
    payment: "refunded",
    status: "returned",
    items: [["GZ-302", "L", "Black", 1]],
  },
  {
    id: "GZ-5122",
    day: -2,
    hour: 16,
    name: "Karthik Iyer",
    email: "karthik.iyer@proton.me",
    phone: "+91 99620 41877",
    line1: "56, Sterling Apartments",
    line2: "Nungambakkam",
    city: "Chennai",
    pin: "600006",
    state: "Tamil Nadu",
    method: "upi",
    payment: "paid",
    status: "shipped",
    carrier: "Blue Dart",
    tracking: "BD7730124598",
    items: [
      ["GZ-502", "34", "Off-white", 1],
      ["GZ-202", "M", "Peach", 1],
    ],
  },
  {
    id: "GZ-5121",
    day: -2,
    hour: 13,
    name: "Aditya Rao",
    email: "aditya.rao@gmail.com",
    phone: "+91 91080 92213",
    line1: "9, Embassy Golf Links",
    city: "Bengaluru",
    pin: "560071",
    state: "Karnataka",
    method: "cod",
    payment: "pending",
    status: "packed",
    items: [
      ["GZ-102", "M", "Sky", 1],
      ["GZ-105", "M", "Rose", 1],
      ["GZ-301", "S", "Olive", 1],
    ],
  },
  {
    id: "GZ-5120",
    day: -3,
    hour: 18,
    name: "Meera Krishnan",
    email: "meera.k@icloud.com",
    phone: "+91 94440 30198",
    line1: "3rd Floor, Alappatt House",
    line2: "MG Road",
    city: "Kochi",
    pin: "682035",
    state: "Kerala",
    method: "upi",
    payment: "paid",
    status: "delivered",
    coupon: "WELCOME10",
    items: [["GZ-201", "L", "Stripe", 1]],
  },
  {
    id: "GZ-5119",
    day: -3,
    hour: 15,
    name: "Sameer Khan",
    email: "sameer.khan@gmail.com",
    phone: "+91 93220 51166",
    line1: "78, Linking Road",
    line2: "Khar West",
    city: "Mumbai",
    pin: "400052",
    state: "Maharashtra",
    method: "card",
    payment: "failed",
    status: "cancelled",
    items: [["GZ-402", "M", "Navy", 1]],
  },
  {
    id: "GZ-5118",
    day: -4,
    hour: 20,
    name: "Divya Menon",
    email: "divya.menon@gmail.com",
    phone: "+91 80880 27744",
    line1: "12, Panampilly Nagar",
    city: "Kochi",
    pin: "682036",
    state: "Kerala",
    method: "upi",
    payment: "paid",
    status: "delivered",
    items: [
      ["GZ-503", "36", "Charcoal", 1],
      ["GZ-301", "L", "White", 1],
    ],
  },
  {
    id: "GZ-5117",
    day: -4,
    hour: 11,
    name: "Nikhil Joshi",
    email: "nikhil.joshi@rediffmail.com",
    phone: "+91 98900 63321",
    line1: "Flat 5, Shivneri CHS",
    line2: "Aundh",
    city: "Pune",
    pin: "411007",
    state: "Maharashtra",
    method: "netbanking",
    payment: "paid",
    status: "shipped",
    carrier: "Ekart",
    tracking: "EK9112043768",
    items: [["GZ-104", "L", "Indigo", 2]],
  },
  {
    id: "GZ-5116",
    day: -6,
    hour: 17,
    name: "Arjun Mehta",
    email: "arjun.mehta@gmail.com",
    phone: "+91 98450 21134",
    line1: "42, 3rd Cross, Indiranagar",
    line2: "Near 12th Main",
    city: "Bengaluru",
    pin: "560038",
    state: "Karnataka",
    method: "upi",
    payment: "paid",
    status: "delivered",
    items: [["GZ-203", "S", "Ecru", 1]],
  },
  {
    id: "GZ-5115",
    day: -6,
    hour: 12,
    name: "Sneha Raghavan",
    email: "sneha.r@outlook.com",
    phone: "+91 90031 55210",
    line1: "7B, Sea Breeze Apartments",
    line2: "Bishop Garden, Besant Nagar",
    city: "Chennai",
    pin: "600090",
    state: "Tamil Nadu",
    method: "card",
    payment: "paid",
    status: "delivered",
    items: [["GZ-301", "M", "Olive", 2]],
  },
  {
    id: "GZ-5114",
    day: -8,
    hour: 19,
    name: "Vikram Nair",
    email: "vikram.nair@yahoo.in",
    phone: "+91 97400 33281",
    line1: "201, Ravi Residency",
    line2: "Road No. 12, Banjara Hills",
    city: "Hyderabad",
    pin: "500034",
    state: "Telangana",
    method: "cod",
    payment: "paid",
    status: "delivered",
    items: [["GZ-102", "XL", "White", 1]],
  },
  {
    id: "GZ-5113",
    day: -9,
    hour: 10,
    name: "Priya Deshmukh",
    email: "priya.d@gmail.com",
    phone: "+91 88790 10045",
    line1: "15, Laxmi Society",
    line2: "Kothrud",
    city: "Pune",
    pin: "411038",
    state: "Maharashtra",
    method: "upi",
    payment: "paid",
    status: "delivered",
    coupon: "FIFTYOFF",
    items: [["GZ-501", "32", "Sand", 1]],
  },
  {
    id: "GZ-5112",
    day: -12,
    hour: 16,
    name: "Rohit Bansal",
    email: "rohit.bansal@hotmail.com",
    phone: "+91 98110 77452",
    line1: "C-44, Greater Kailash II",
    city: "New Delhi",
    pin: "110048",
    state: "Delhi",
    method: "card",
    payment: "paid",
    status: "delivered",
    items: [["GZ-401", "34", "Cream", 1]],
  },
  {
    id: "GZ-5111",
    day: -14,
    hour: 13,
    name: "Meera Krishnan",
    email: "meera.k@icloud.com",
    phone: "+91 94440 30198",
    line1: "3rd Floor, Alappatt House",
    line2: "MG Road",
    city: "Kochi",
    pin: "682035",
    state: "Kerala",
    method: "upi",
    payment: "paid",
    status: "delivered",
    items: [["GZ-105", "M", "Rose", 1]],
  },
];

const TAX_RATE = 0.05;
const FREE_OVER = 1499;
const SHIPPING_FLAT = 79;

function buildOrder(seed: OrderSeed): AdminOrder {
  const at = new Date(AS_OF.getTime() + seed.day * DAY);
  at.setHours(
    seed.hour,
    (Number.parseInt(seed.id.slice(-2), 10) * 7) % 60,
    0,
    0,
  );

  const lines: OrderLine[] = seed.items.map(([productId, size, color, qty]) => {
    const p = PRODUCTS.find((x) => x.id === productId);
    return {
      productId,
      name: p?.name ?? productId,
      size,
      color,
      qty,
      price: p?.price ?? 0,
    };
  });

  const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
  const discount = seed.coupon
    ? Math.round((subtotal * (seed.coupon === "WELCOME10" ? 10 : 5)) / 100)
    : 0;
  const net = subtotal - discount;
  const shipping =
    seed.status === "cancelled" || net === 0 || net >= FREE_OVER
      ? 0
      : SHIPPING_FLAT;
  const tax = Math.round(net * TAX_RATE);
  const total = seed.status === "cancelled" ? 0 : net + shipping + tax;

  // Courier days from the warehouse (Bengaluru) to the state.
  const courierDays =
    seed.state === "Karnataka"
      ? 2
      : seed.state === "Telangana" || seed.state === "Tamil Nadu"
        ? 3
        : 4;

  const events: OrderEvent[] = [
    {
      stage: "placed",
      at: at.toISOString(),
      note: `Order placed on the website by ${seed.name.split(" ")[0].toLowerCase()}`,
    },
  ];
  const stageOrder: OrderStage[] = [
    "confirmed",
    "packed",
    "shipped",
    "delivered",
  ];
  const reached: OrderStage[] =
    seed.status === "cancelled" || seed.status === "returned"
      ? seed.status === "cancelled"
        ? ["placed"]
        : ["placed", "confirmed", "packed", "shipped"]
      : stageOrder.slice(0, STAGES.indexOf(seed.status as OrderStage));

  const notes: Record<string, string> = {
    confirmed: "Payment received, order confirmed with the cutting room",
    packed: "Picked and packed at the Bengaluru store",
    shipped: seed.tracking
      ? `Handed to ${seed.carrier} — ${seed.tracking}`
      : "Handed to the courier",
    delivered: "Delivered and signed for",
  };

  let cursor = at.getTime();
  for (const stage of reached.slice(1)) {
    cursor += (courierDays * DAY) / Math.max(1, reached.length - 1);
    events.push({
      stage,
      at: new Date(cursor).toISOString(),
      note: notes[stage],
    });
  }

  if (seed.status === "cancelled") {
    events.push({
      stage: "cancelled",
      at: new Date(at.getTime() + 2 * 3600_000).toISOString(),
      note: "Cancelled by the shop — card payment failed",
    });
  }
  if (seed.status === "returned") {
    events.push({
      stage: "returned",
      at: new Date(AS_OF.getTime() - 1 * DAY).toISOString(),
      note: "Returned for a refund — customer collected by courier",
    });
  }

  const expectedBy =
    seed.status === "shipped"
      ? new Date(AS_OF.getTime() + courierDays * DAY).toISOString()
      : undefined;

  return {
    id: seed.id,
    placedAt: at.toISOString(),
    customer: { name: seed.name, email: seed.email, phone: seed.phone },
    address: {
      line1: seed.line1,
      line2: seed.line2,
      city: seed.city,
      pin: seed.pin,
      state: seed.state,
    },
    method: seed.method,
    payment: seed.payment,
    status: seed.status,
    lines,
    totals: { subtotal, shipping, discount, tax, total },
    coupon: seed.coupon,
    carrier: seed.carrier,
    tracking: seed.tracking,
    events,
    expectedBy,
  };
}

export const ADMIN_ORDERS: AdminOrder[] = ORDER_SEEDS.map(buildOrder);

export const orderById = (id: string) => ADMIN_ORDERS.find((o) => o.id === id);

/** Orders that still need a human: paid-but-unconfirmed, unpacked, unpaid. */
export const ordersNeedingAttention = ADMIN_ORDERS.filter(
  (o) =>
    (o.status === "placed" && o.payment === "paid") || o.payment === "failed",
);

export const countByStatus = (status: OrderStatus) =>
  ADMIN_ORDERS.filter((o) => o.status === status).length;

export { CUSTOMERS };
