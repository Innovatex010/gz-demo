export type CategoryId =
  | "full-sleeve"
  | "half-sleeve"
  | "t-shirts"
  | "pants"
  | "trousers";

export type Category = {
  id: CategoryId;
  label: string;
  tagline: string;
  href: string;
  image: string;
};

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  compareAt?: number;
  colors: { name: string; hex: string }[];
  image: string;
  /** Second frame — the hover swap on a product card. */
  altImage: string;
  badge?: "New in" | "Bestseller" | "Last few left";
  fabric: string;
  fit: string;
};

export const CATEGORIES: Category[] = [
  {
    id: "full-sleeve",
    label: "Full-sleeve shirts",
    tagline: "From ₹1,299",
    href: "/shop?c=full-sleeve",
    image: "/images/product/shirt-chambray-seated.webp",
  },
  {
    id: "half-sleeve",
    label: "Half-sleeve shirts",
    tagline: "From ₹899",
    href: "/shop?c=half-sleeve",
    image: "/images/product/shirt-polo-navy.webp",
  },
  {
    id: "t-shirts",
    label: "T-shirts",
    tagline: "From ₹599",
    href: "/shop?c=t-shirts",
    image: "/images/product/tee-olive.webp",
  },
  {
    id: "pants",
    label: "Pants",
    tagline: "From ₹1,199",
    href: "/shop?c=pants",
    image: "/images/product/pant-chino-cream.webp",
  },
  {
    id: "trousers",
    label: "Trousers",
    tagline: "From ₹1,599",
    href: "/shop?c=trousers",
    image: "/images/product/trouser-cream.webp",
  },
];

export const PRODUCTS: Product[] = [
  // ── Full-sleeve shirts ─────────────────────────────────────────────────
  {
    id: "GZ-102",
    name: "Oxford Regular Fit Shirt",
    category: "full-sleeve",
    price: 1299,
    colors: [
      { name: "White", hex: "#F2F0EA" },
      { name: "Sky", hex: "#A8C4DE" },
    ],
    image: "/images/product/shirt-white-walk.webp",
    altImage: "/images/editorial/editorial-white-wall.webp",
    badge: "Bestseller",
    fabric: "Cotton oxford, 140 gsm",
    fit: "Regular. Size down for a slimmer line.",
  },
  {
    id: "GZ-103",
    name: "Slim Formal Shirt",
    category: "full-sleeve",
    price: 1399,
    compareAt: 1799,
    colors: [
      { name: "White", hex: "#F2F0EA" },
      { name: "Navy", hex: "#2B3550" },
    ],
    image: "/images/product/shirt-oxford-tie.webp",
    altImage: "/images/editorial/editorial-city.webp",
    fabric: "Cotton poplin, 120 gsm",
    fit: "Slim through the chest and waist.",
  },
  {
    id: "GZ-104",
    name: "Denim Chambray Shirt",
    category: "full-sleeve",
    price: 1799,
    colors: [
      { name: "Indigo", hex: "#4A6489" },
      { name: "Stone", hex: "#BFB4A0" },
    ],
    image: "/images/product/shirt-chambray-seated.webp",
    altImage: "/images/product/shirt-chambray-detail.webp",
    fabric: "Yarn-dyed cotton, 140 gsm",
    fit: "Relaxed. Works over a tee.",
  },
  {
    id: "GZ-105",
    name: "Rose Linen Shirt",
    category: "full-sleeve",
    price: 1899,
    colors: [
      { name: "Rose", hex: "#E6C3BE" },
      { name: "Sand", hex: "#D8C7AE" },
    ],
    image: "/images/product/shirt-rose-pink.webp",
    altImage: "/images/editorial/editorial-orange.webp",
    badge: "New in",
    fabric: "Linen-cotton, 160 gsm",
    fit: "Relaxed. Creases on purpose.",
  },
  {
    id: "GZ-106",
    name: "Relaxed Linen Shirt",
    category: "full-sleeve",
    price: 1699,
    colors: [
      { name: "Chalk", hex: "#E8E4D8" },
      { name: "Olive", hex: "#6E7355" },
    ],
    image: "/images/product/shirt-linen-relaxed.webp",
    altImage: "/images/product/shirt-casual-sky.webp",
    fabric: "Linen blend, 150 gsm",
    fit: "Relaxed. Straight hem.",
  },

  // ── Half-sleeve ───────────────────────────────────────────────────────
  {
    id: "GZ-201",
    name: "Pique Half-Sleeve Polo",
    category: "half-sleeve",
    price: 899,
    colors: [
      { name: "Navy", hex: "#2C3A5C" },
      { name: "Oxblood", hex: "#5C2B30" },
    ],
    image: "/images/product/shirt-polo-navy.webp",
    altImage: "/images/product/shirt-polo-navy-trouser.webp",
    badge: "Bestseller",
    fabric: "Cotton pique, 220 gsm",
    fit: "Regular. Ribbed sleeve cuffs.",
  },
  {
    id: "GZ-202",
    name: "Half-Sleeve Knit Polo",
    category: "half-sleeve",
    price: 1099,
    colors: [
      { name: "Navy", hex: "#2C3A5C" },
      { name: "Chalk", hex: "#EDE9DF" },
    ],
    image: "/images/product/shirt-polo-navy-trouser.webp",
    altImage: "/images/product/shirt-polo-navy.webp",
    fabric: "Cotton slub knit, 200 gsm",
    fit: "Regular.",
  },
  {
    id: "GZ-203",
    name: "Striped Casual Shirt",
    category: "half-sleeve",
    price: 1199,
    colors: [
      { name: "Sky stripe", hex: "#9FC0D8" },
      { name: "Sage stripe", hex: "#9AA98F" },
    ],
    image: "/images/product/shirt-blue-casual.webp",
    altImage: "/images/product/shirt-formal-grey.webp",
    badge: "New in",
    fabric: "Cotton-linen, 140 gsm",
    fit: "Relaxed. Half button placket.",
  },

  // ── T-shirts ──────────────────────────────────────────────────────────
  {
    id: "GZ-301",
    name: "Heavyweight Cotton Tee",
    category: "t-shirts",
    price: 699,
    colors: [
      { name: "White", hex: "#F4F2EC" },
      { name: "Black", hex: "#1D1B22" },
    ],
    image: "/images/product/tee-white-outdoor.webp",
    altImage: "/images/product/tee-white-back.webp",
    badge: "Bestseller",
    fabric: "220 gsm combed cotton",
    fit: "Regular. Ribbed collar, twin-needle hem.",
  },
  {
    id: "GZ-302",
    name: "Plain Back Tee",
    category: "t-shirts",
    price: 599,
    colors: [
      { name: "White", hex: "#F4F2EC" },
      { name: "Sage", hex: "#9AA98F" },
    ],
    image: "/images/product/tee-white-back.webp",
    altImage: "/images/product/tee-white-print.webp",
    fabric: "180 gsm cotton",
    fit: "Regular.",
  },
  {
    id: "GZ-303",
    name: "Fitted Black Tee",
    category: "t-shirts",
    price: 749,
    colors: [
      { name: "Black", hex: "#1D1B22" },
      { name: "Charcoal", hex: "#3A3A40" },
    ],
    image: "/images/product/tee-black-fitted.webp",
    altImage: "/images/product/tee-olive.webp",
    fabric: "Elastane blend, 200 gsm",
    fit: "Slim. Size up for a relaxed fit.",
  },
  {
    id: "GZ-304",
    name: "Olive Pocket Tee",
    category: "t-shirts",
    price: 849,
    colors: [
      { name: "Olive", hex: "#6E7355" },
      { name: "Stone", hex: "#BFB4A0" },
    ],
    image: "/images/product/tee-olive.webp",
    altImage: "/images/product/tee-white-backpack.webp",
    fabric: "Slub cotton, 200 gsm",
    fit: "Regular. Chest pocket.",
  },
  {
    id: "GZ-305",
    name: "Weekend Tee",
    category: "t-shirts",
    price: 649,
    colors: [
      { name: "White", hex: "#F4F2EC" },
      { name: "Sky", hex: "#A8C4DE" },
    ],
    image: "/images/product/tee-white-backpack.webp",
    altImage: "/images/product/tee-white-outdoor.webp",
    badge: "Last few left",
    fabric: "Cotton jersey, 180 gsm",
    fit: "Regular.",
  },

  // ── Pants ─────────────────────────────────────────────────────────────
  {
    id: "GZ-401",
    name: "Cotton Chino Pant",
    category: "pants",
    price: 1399,
    colors: [
      { name: "Cream", hex: "#E3DAC6" },
      { name: "Olive", hex: "#6E7355" },
    ],
    image: "/images/product/pant-chino-cream.webp",
    altImage: "/images/product/pant-detail-shoes.webp",
    badge: "Bestseller",
    fabric: "Cotton twill, 260 gsm",
    fit: "Slim. Mid rise, cropped length.",
  },
  {
    id: "GZ-402",
    name: "Cotton Trouser Pant",
    category: "pants",
    price: 1499,
    colors: [
      { name: "Chocolate", hex: "#5B463A" },
      { name: "Charcoal", hex: "#3A3A40" },
    ],
    image: "/images/product/pant-cotton-brown.webp",
    altImage: "/images/product/pant-denim-seated.webp",
    fabric: "Cotton twill, 280 gsm",
    fit: "Relaxed. Full length.",
  },
  {
    id: "GZ-403",
    name: "Cargo Pant",
    category: "pants",
    price: 1699,
    colors: [
      { name: "Sand", hex: "#CDBB9B" },
      { name: "Black", hex: "#1D1B22" },
    ],
    image: "/images/product/pant-cargo-sand.webp",
    altImage: "/images/product/pant-detail-jeans.webp",
    badge: "New in",
    fabric: "Ripstop cotton, 240 gsm",
    fit: "Relaxed. Six pockets.",
  },

  // ── Trousers ──────────────────────────────────────────────────────────
  {
    id: "GZ-501",
    name: "Pleated Formal Trouser",
    category: "trousers",
    price: 1799,
    colors: [
      { name: "Charcoal", hex: "#3A3A40" },
      { name: "Navy", hex: "#2B3550" },
    ],
    image: "/images/product/trouser-formal-navy.webp",
    altImage: "/images/product/trouser-cream.webp",
    fabric: "Poly-viscose suiting, 200 gsm",
    fit: "Mid rise, straight leg. Full length.",
  },
  {
    id: "GZ-502",
    name: "Cream Linen Trouser",
    category: "trousers",
    price: 1899,
    colors: [
      { name: "Cream", hex: "#E8E0CE" },
      { name: "Sand", hex: "#D8C7AE" },
    ],
    image: "/images/product/trouser-cream.webp",
    altImage: "/images/product/trouser-formal-grey-coat.webp",
    badge: "New in",
    fabric: "Linen-blend, 220 gsm",
    fit: "Relaxed. Elasticated back waist.",
  },
  {
    id: "GZ-503",
    name: "Suiting Trouser",
    category: "trousers",
    price: 1699,
    colors: [
      { name: "Wine", hex: "#5C2B30" },
      { name: "Charcoal", hex: "#3A3A40" },
    ],
    image: "/images/product/trouser-formal-maroon.webp",
    altImage: "/images/product/trouser-formal-grey-coat.webp",
    fabric: "Wool-blend suiting, 230 gsm",
    fit: "Mid rise, slim through the thigh.",
  },
  {
    id: "GZ-504",
    name: "Tapered Trouser",
    category: "trousers",
    price: 1599,
    colors: [
      { name: "Stone", hex: "#BFB4A0" },
      { name: "Black", hex: "#1D1B22" },
    ],
    image: "/images/product/trouser-formal-taupe.webp",
    altImage: "/images/product/trouser-bomber-charcoal.webp",
    fabric: "Cotton-poly twill, 250 gsm",
    fit: "Mid rise, tapered. Full length.",
  },
];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/** Five ways to wear it — drives the sticky-scroll section. */
export const LOOKS = [
  {
    id: "office",
    title: "For the office",
    copy: "Slim formal shirt, pleated trouser, clean shoes. Nothing on it that will show a mark by 6pm.",
    image: "/images/product/trouser-formal-navy.webp",
    pieces: ["Slim Formal Shirt", "Pleated Formal Trouser"],
  },
  {
    id: "friday",
    title: "For a Friday",
    copy: "Half-sleeve polo with chinos. Comfortable enough to survive a long lunch and still look like you meant it.",
    image: "/images/product/shirt-polo-navy-trouser.webp",
    pieces: ["Pique Half-Sleeve Polo", "Cotton Chino Pant"],
  },
  {
    id: "everyday",
    title: "For an ordinary day",
    copy: "A t-shirt you can wash tonight and wear tomorrow morning. The reason most of our stock is t-shirts.",
    image: "/images/product/tee-white-outdoor.webp",
    pieces: ["Heavyweight Cotton Tee", "Cotton Trouser Pant"],
  },
  {
    id: "evening",
    title: "For the evening",
    copy: "Linen shirt, sleeves rolled once, trousers that move when you do. The whole point of linen.",
    image: "/images/product/shirt-rose-pink.webp",
    pieces: ["Rose Linen Shirt", "Cream Linen Trouser"],
  },
  {
    id: "travel",
    title: "For travelling",
    copy: "Wrinkle-resistant shirt and a trouser with a drawcord waist. Wear it on the plane, don't think about it again.",
    image: "/images/product/trouser-cream.webp",
    pieces: ["Striped Casual Shirt", "Cream Linen Trouser"],
  },
];

export const STORE_CITIES = [
  { city: "Bengaluru", count: 3 },
  { city: "Hyderabad", count: 2 },
  { city: "Chennai", count: 2 },
  { city: "Pune", count: 1 },
];

export const FAQ = [
  {
    q: "Is the price online the same as in store?",
    a: "Yes. We have not changed a single price for the launch. What you see here is what you pay at the counter.",
  },
  {
    q: "How do returns work?",
    a: "Fifteen days from delivery, for any reason. Pick it up from your doorstep, we don't charge for the pickup. Bring the tags on.",
  },
  {
    q: "Do you offer exchange instead of refund?",
    a: "Yes, and most people use it. If your size is out of stock we will tell you on WhatsApp and hold your refund until a replacement arrives.",
  },
  {
    q: "Can I pay cash on delivery?",
    a: "On orders up to ₹10,000. Above that we take card or UPI only.",
  },
  {
    q: "How long does delivery take?",
    a: "Two to four days in serviceable pin codes. Same-day for orders placed before 11am in cities where we have a store.",
  },
  {
    q: "Do you restock sold-out sizes?",
    a: "Most core shirts and t-shirts come back within six weeks. We will message you if you leave your number at checkout.",
  },
];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id);

export const categoryLabel = (id: CategoryId) =>
  CATEGORIES.find((c) => c.id === id)?.label ?? id;

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
