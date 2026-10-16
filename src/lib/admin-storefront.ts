import { ADMIN_PRODUCTS } from "./admin-data";

/* ── Announcement bars ────────────────────────────────────────────────────── */

export type Announcement = {
  id: string;
  text: string;
  linkLabel: string;
  linkHref: string;
  active: boolean;
};

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "AN-1",
    text: "New linen shirts in three colours. Free delivery over ₹1,000.",
    linkLabel: "View new in",
    linkHref: "/new-in",
    active: true,
  },
  {
    id: "AN-2",
    text: "The monsoon set: 15% off trousers this week.",
    linkLabel: "Shop the set",
    linkHref: "/collections/monsoon-set",
    active: false,
  },
];

/* ── Homepage hero ─────────────────────────────────────────────────────────── */

export type Hero = {
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  images: string[];
  autoPlay: boolean;
  published: boolean;
};

export const HERO: Hero = {
  eyebrow: "October 2026",
  title: "The long-sleeve season begins.",
  body: "Oxford shirts, brushed cotton and the trousers that go with them. Made slowly, worn daily.",
  ctaLabel: "Shop shirts",
  ctaHref: "/shop?cat=shirts",
  images: ["/hero/autumn-1.jpg", "/hero/autumn-2.jpg", "/hero/autumn-3.jpg"],
  autoPlay: true,
  published: true,
};

/* ── Homepage sections (orderable) ────────────────────────────────────────── */

export type Section = {
  id: string;
  label: string;
  note: string;
  enabled: boolean;
};

export const SECTIONS: Section[] = [
  {
    id: "hero",
    label: "Hero",
    note: "Full-width opener with the campaign image.",
    enabled: true,
  },
  {
    id: "announcement",
    label: "Announcement bar",
    note: "Thin band above the hero.",
    enabled: true,
  },
  {
    id: "benefits",
    label: "Benefits strip",
    note: "Delivery, returns, payments.",
    enabled: true,
  },
  { id: "new-in", label: "New in", note: "Latest four styles.", enabled: true },
  {
    id: "category-tiles",
    label: "Category tiles",
    note: "Shirts, trousers, tees.",
    enabled: true,
  },
  {
    id: "editorial",
    label: "Editorial band",
    note: "Long-form story with two images.",
    enabled: true,
  },
  {
    id: "collection",
    label: "Featured collection",
    note: "Hand-picked styles.",
    enabled: true,
  },
  {
    id: "reviews",
    label: "Reviews",
    note: "Three published reviews.",
    enabled: true,
  },
  { id: "footer", label: "Footer", note: "Always last.", enabled: true },
];

/* ── Featured content ─────────────────────────────────────────────────────── */

export const FEATURED_PRODUCT_IDS = ADMIN_PRODUCTS.slice(0, 4).map((p) => p.id);

export const FEATURED_COLLECTIONS = [
  "Linen summer",
  "Monsoon set",
  "Workwear",
  "Weekend",
];

/* ── Navigation menu ───────────────────────────────────────────────────────── */

export type NavItem = { label: string; href: string; enabled: boolean };

export const NAV_ITEMS: NavItem[] = [
  { label: "Shop", href: "/shop", enabled: true },
  { label: "Shirts", href: "/shop?cat=shirts", enabled: true },
  { label: "Trousers", href: "/shop?cat=trousers", enabled: true },
  { label: "T-shirts", href: "/shop?cat=tees", enabled: true },
  { label: "New in", href: "/new-in", enabled: true },
  { label: "Collections", href: "/collections", enabled: true },
  { label: "Lookbook", href: "/lookbook", enabled: true },
  { label: "About", href: "/about", enabled: true },
];

/* ── Footer columns ────────────────────────────────────────────────────────── */

export const FOOTER_COLUMNS: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "Shop",
    links: [
      { label: "All shirts", href: "/shop?cat=shirts" },
      { label: "Trousers", href: "/shop?cat=trousers" },
      { label: "New in", href: "/new-in" },
      { label: "Collections", href: "/collections" },
    ],
  },
  {
    title: "Good Zone",
    links: [
      { label: "Our story", href: "/about" },
      { label: "Lookbook", href: "/lookbook" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Shipping", href: "/shipping-policy" },
      { label: "Returns", href: "/returns-policy" },
      { label: "Track order", href: "/track-order" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];

/* ── CMS pages ─────────────────────────────────────────────────────────────── */

export type CmsPage = {
  slug: string;
  title: string;
  body: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
};

export const CMS_PAGES: CmsPage[] = [
  {
    slug: "lookbook",
    title: "Lookbook",
    body: "A walk through the season: linen against stone, shirts unbuttoned at the collar, trousers rolled above the ankle.",
    seoTitle: "Lookbook — Good Zone",
    seoDescription: "The current season, photographed in and around the shop.",
    published: true,
  },
  {
    slug: "about",
    title: "About us",
    body: "Good Zone began in 2019 with a single table and a promise: shirts that hold a crease and trousers that sit right.",
    seoTitle: "About — Good Zone",
    seoDescription: "The story of the shop and the people who make it.",
    published: true,
  },
  {
    slug: "faq",
    title: "Frequently asked",
    body: "Delivery, sizing, returns and stock — the questions the counter hears most.",
    seoTitle: "FAQ — Good Zone",
    seoDescription: "Answers to the questions customers ask most.",
    published: true,
  },
  {
    slug: "privacy-policy",
    title: "Privacy policy",
    body: "What we collect, why we collect it, and how to have it removed.",
    seoTitle: "Privacy policy — Good Zone",
    seoDescription: "How Good Zone handles your data.",
    published: true,
  },
  {
    slug: "terms",
    title: "Terms of service",
    body: "The terms under which the shop sells and ships.",
    seoTitle: "Terms of service — Good Zone",
    seoDescription: "The terms of sale for Good Zone.",
    published: true,
  },
];
