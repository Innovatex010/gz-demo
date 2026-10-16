import { ADMIN_ORDERS, ADMIN_PRODUCTS, type AdminOrder } from "./admin-data";

/* ── Customers ────────────────────────────────────────────────────────────── */

export type Segment = "new" | "returning" | "high-value";

export const SEGMENT_LABEL: Record<Segment, string> = {
  new: "New",
  returning: "Returning",
  "high-value": "High value",
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  orders: number;
  spent: number;
  segment: Segment;
  lastOrder: string;
};

const byEmail = new Map<string, { orders: AdminOrder[] }>();
for (const o of ADMIN_ORDERS) {
  const entry = byEmail.get(o.customer.email) ?? { orders: [] };
  entry.orders.push(o);
  byEmail.set(o.customer.email, entry);
}

export const CUSTOMERS: Customer[] = [...byEmail.entries()].map(
  ([email, { orders }], i) => {
    const sorted = [...orders].sort(
      (a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt),
    );
    const spent = orders.reduce((n, o) => n + o.totals.total, 0);
    const first = orders[0].customer;
    return {
      id: `CU-${String(1001 + i)}`,
      name: first.name,
      email,
      phone: first.phone,
      city: orders[0].address.city,
      orders: orders.length,
      spent,
      segment:
        spent > 8000 ? "high-value" : orders.length > 1 ? "returning" : "new",
      lastOrder: sorted[0].placedAt,
    };
  },
);

/* ── Coupons ──────────────────────────────────────────────────────────────── */

export type Coupon = {
  code: string;
  kind: "percent" | "flat";
  value: number;
  note: string;
  used: number;
  active: boolean;
};

export const COUPONS: Coupon[] = [
  {
    code: "WELCOME10",
    kind: "percent",
    value: 10,
    note: "10% off the first order",
    used: 214,
    active: true,
  },
  {
    code: "FIFTYOFF",
    kind: "percent",
    value: 5,
    note: "5% off orders over ₹2,000",
    used: 88,
    active: true,
  },
  {
    code: "LINEN500",
    kind: "flat",
    value: 500,
    note: "₹500 off linen shirts and trousers",
    used: 41,
    active: true,
  },
  {
    code: "DIWALI",
    kind: "percent",
    value: 15,
    note: "Festive season, not yet live",
    used: 0,
    active: false,
  },
];

/* ── Reviews ──────────────────────────────────────────────────────────────── */

export type Review = {
  id: string;
  productId: string;
  productName: string;
  author: string;
  rating: number;
  text: string;
  at: string;
  status: "published" | "pending";
};

export const REVIEWS: Review[] = [
  {
    id: "RV-091",
    productId: "GZ-102",
    productName: "Oxford Regular Fit Shirt",
    author: "Arjun M.",
    rating: 5,
    text: "Second one I have bought. The oxford holds a crease through the day.",
    at: "2026-10-14T09:20:00+05:30",
    status: "published",
  },
  {
    id: "RV-090",
    productId: "GZ-105",
    productName: "Linen Relaxed Shirt",
    author: "Sneha R.",
    rating: 4,
    text: "Lovely cloth. Sized up on the advice in the guide and it was right.",
    at: "2026-10-13T18:05:00+05:30",
    status: "published",
  },
  {
    id: "RV-089",
    productId: "GZ-203",
    productName: "Linen Half-Sleeve Shirt",
    author: "Karthik I.",
    rating: 5,
    text: "Cool in Chennai humidity, which is all I asked of it.",
    at: "2026-10-12T20:41:00+05:30",
    status: "published",
  },
  {
    id: "RV-088",
    productId: "GZ-301",
    productName: "Pima Cotton T-shirt",
    author: "Priya D.",
    rating: 3,
    text: "Good cotton but the grey ran a little in the first wash.",
    at: "2026-10-11T11:12:00+05:30",
    status: "pending",
  },
  {
    id: "RV-087",
    productId: "GZ-501",
    productName: "Linen Blend Trouser",
    author: "Vikram N.",
    rating: 5,
    text: "Wore them to work four days straight before admitting they needed a wash.",
    at: "2026-10-10T16:30:00+05:30",
    status: "published",
  },
  {
    id: "RV-086",
    productId: "GZ-401",
    productName: "Cotton Chino Pant",
    author: "Rohit B.",
    rating: 2,
    text: "Waist runs small — exchanged for a 34 and that one fit.",
    at: "2026-10-09T08:55:00+05:30",
    status: "pending",
  },
];

/* ── Abandoned carts ──────────────────────────────────────────────────────── */

export type Cart = {
  id: string;
  customer: string;
  city: string;
  items: string[];
  value: number;
  at: string;
};

export const CARTS: Cart[] = [
  {
    id: "CB-2210",
    customer: "arjun.mehta@gmail.com",
    city: "Bengaluru",
    items: ["Oxford Regular Fit Shirt", "Pima Cotton T-shirt"],
    value: 2098,
    at: "2026-10-15T11:42:00+05:30",
  },
  {
    id: "CB-2209",
    customer: "sneha.r@outlook.com",
    city: "Chennai",
    items: ["Linen Relaxed Shirt"],
    value: 1899,
    at: "2026-10-14T21:15:00+05:30",
  },
  {
    id: "CB-2208",
    customer: "fatima.sheikh@gmail.com",
    city: "Mumbai",
    items: ["Linen Blend Trouser", "Denim Chambray Shirt"],
    value: 3598,
    at: "2026-10-14T13:08:00+05:30",
  },
  {
    id: "CB-2207",
    customer: "nikhil.joshi@rediffmail.com",
    city: "Pune",
    items: ["Pima Cotton T-shirt", "Pima Cotton T-shirt"],
    value: 1198,
    at: "2026-10-13T22:47:00+05:30",
  },
];

export const SUBSCRIBER_COUNT = 3184;

export const SUBSCRIBERS = [
  { email: "meera.k@icloud.com", at: "2026-10-15" },
  { email: "sameer.khan@gmail.com", at: "2026-10-15" },
  { email: "divya.menon@gmail.com", at: "2026-10-14" },
  { email: "aditya.rao@gmail.com", at: "2026-10-14" },
  { email: "karthik.iyer@proton.me", at: "2026-10-13" },
];

/* ── Activity log ─────────────────────────────────────────────────────────── */

export type Activity = {
  id: string;
  who: string;
  what: string;
  at: string;
};

export const ACTIVITY: Activity[] = [
  {
    id: "AC-441",
    who: "Ravi K.",
    what: "marked order GZ-5124 delivered",
    at: "2026-10-15T17:58:00+05:30",
  },
  {
    id: "AC-440",
    who: "Anita S.",
    what: "added tracking BD7730124598 to GZ-5122",
    at: "2026-10-15T15:20:00+05:30",
  },
  {
    id: "AC-439",
    who: "Ravi K.",
    what: "refunded ₹1,258 for GZ-5123",
    at: "2026-10-15T12:04:00+05:30",
  },
  {
    id: "AC-438",
    who: "Faiz A.",
    what: "set Oxford Regular Fit Shirt stock to L:0, XL:6",
    at: "2026-10-15T10:45:00+05:30",
  },
  {
    id: "AC-437",
    who: "Anita S.",
    what: "published the Linen season banner",
    at: "2026-10-14T19:30:00+05:30",
  },
  {
    id: "AC-436",
    who: "Ravi K.",
    what: "raised the low-stock threshold for tees to 4",
    at: "2026-10-14T16:12:00+05:30",
  },
];

/* ── Settings ─────────────────────────────────────────────────────────────── */

export const BRAND = {
  name: "Good Zone",
  tagline: "A shop you can walk into, now something you can open.",
  since: "2014",
  contactEmail: "care@goodzone.in",
  contactPhone: "+91 80 4123 8890",
  logo: "/images/brand/wordmark.svg",
};

export type ShippingZone = {
  id: string;
  name: string;
  cities: string;
  charge: number;
  freeOver: number;
  eta: string;
  cod: boolean;
};

export const SHIPPING_ZONES: ShippingZone[] = [
  {
    id: "ZS-1",
    name: "Store cities",
    cities: "Bengaluru, Hyderabad, Chennai, Pune",
    charge: 0,
    freeOver: 0,
    eta: "1–2 working days",
    cod: true,
  },
  {
    id: "ZS-2",
    name: "Metro",
    cities: "Mumbai, Delhi NCR, Kolkata, Ahmedabad",
    charge: 99,
    freeOver: 1499,
    eta: "2–4 working days",
    cod: true,
  },
  {
    id: "ZS-3",
    name: "Rest of India",
    cities: "All other serviceable pincodes",
    charge: 129,
    freeOver: 1499,
    eta: "4–7 working days",
    cod: false,
  },
];

export const TAX_SETTING = {
  note: "5% GST on apparel priced up to ₹1,000; 12% above it. Collected at checkout.",
  rate: 0.05,
};

export type PaymentMethod = {
  id: string;
  name: string;
  note: string;
  enabled: boolean;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "PM-1",
    name: "UPI",
    note: "Collects to the current account",
    enabled: true,
  },
  { id: "PM-2", name: "Cards", note: "Visa, Mastercard, RuPay", enabled: true },
  { id: "PM-3", name: "Net banking", note: "38 banks", enabled: true },
  {
    id: "PM-4",
    name: "Cash on delivery",
    note: "Up to ₹10,000, metro pincodes only",
    enabled: true,
  },
];

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  permissions: string;
};

export const TEAM: TeamMember[] = [
  {
    id: "TM-1",
    name: "Ravi Kulkarni",
    role: "Owner",
    permissions: "Everything",
  },
  {
    id: "TM-2",
    name: "Anita Sharma",
    role: "Manager",
    permissions: "Orders, customers, storefront",
  },
  {
    id: "TM-3",
    name: "Faiz Ahmed",
    role: "Store",
    permissions: "Products and stock",
  },
];

/* ── Storefront CMS ───────────────────────────────────────────────────────── */

export type HomeSection = {
  id: string;
  name: string;
  note: string;
  visible: boolean;
};

export const HOME_SECTIONS: HomeSection[] = [
  {
    id: "hero",
    name: "Campaign banner",
    note: "The slideshow at the top",
    visible: true,
  },
  {
    id: "categories",
    name: "Category tiles",
    note: "Five ways into the catalogue",
    visible: true,
  },
  { id: "range", name: "Range rail", note: "Price-led strip", visible: true },
  {
    id: "new-in",
    name: "New in",
    note: "Last two production runs",
    visible: true,
  },
  {
    id: "editorial",
    name: "Editorial band",
    note: "The cloth story, on ink",
    visible: true,
  },
  {
    id: "looks",
    name: "Looks",
    note: "Sticky full-outfit rail",
    visible: true,
  },
  {
    id: "benefits",
    name: "Benefits strip",
    note: "Delivery, returns, COD, runs",
    visible: true,
  },
  {
    id: "sizing",
    name: "Sizing and fit",
    note: "Size guide and fit notes",
    visible: true,
  },
];

export const ANNOUNCEMENT =
  "Free delivery over ₹1,499 · Fifteen-day returns, picked up from your door";

export const FEATURED = {
  products: ["GZ-105", "GZ-203", "GZ-301", "GZ-501"],
  collections: ["linen-season", "new-arrivals"],
};

export const PRODUCT_OPTIONS = ADMIN_PRODUCTS.filter(
  (p) => p.status !== "archived",
);
