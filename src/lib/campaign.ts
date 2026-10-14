/**
 * THE CAMPAIGN SLOT
 * =================
 * This is the only file the marketing team needs to touch to run campaigns.
 * Add, reorder or remove an entry and ship — nothing in the banner component
 * has to move, and nothing else on the page changes with it.
 *
 *   image      the creative. Wide (roughly 21:9) on desktop; on mobile the
 *              banner crops to 4:5, so shoot or crop with the subject in the
 *              middle third or it will be lost.
 *   position   where the subject sits in the frame, so a new photo does not
 *              need a code change to crop correctly
 *   align      which side the copy sits. Put this opposite the subject: if the
 *              person is on the right, align "left". The scrim flips to match.
 *   headline   one line, ideally under eight words
 *   offer      optional pill; the reason the campaign exists
 *   label      what it is and how long it runs
 *   text       set false to run a pure-creative banner with no copy at all
 */

export type Campaign = {
  id: string;
  image: string;
  position?: string;
  alt: string;
  /** Which side the copy sits. Keep it opposite the subject. */
  align?: "left" | "right";
  offer?: string;
  label?: string;
  headline: string;
  /** Optional controlled line breaks, so a campaign's headline can be set to
      land on two lines without anyone touching type sizes. */
  lines?: string[];
  body?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  /** false = creative only, no overlay */
  text?: boolean;
};

export const CAMPAIGNS: Campaign[] = [
  {
    id: "online",
    image: "/images/editorial/banner-coffee.webp",
    position: "68% 34%",
    align: "left",
    alt: "A Good Zone customer at the counter with a coffee",
    offer: "Autumn drop is live",
    label: "Ends 21 October",
    headline: "The shop, now online.",
    lines: ["The shop,", "now online."],
    body: "The same shirts, t-shirts, pants and trousers we have been selling over the counter since 2014 — delivered to your door. Same prices, same exchange offer, no extra charge for going online.",
    primary: { label: "Shop new in", href: "/shop" },
    secondary: { label: "Find a store", href: "#stores" },
    text: true,
  },
  {
    id: "store-visit",
    image: "/images/editorial/banner-store.webp",
    position: "62% 45%",
    align: "left",
    alt: "The counter inside a Good Zone store",
    offer: "Eight stores, four cities",
    label: "Come in and try it on",
    headline: "Still a shop. Now also a website.",
    lines: ["Still a shop.", "Try it on."],
    body: "We would rather you tried a shirt on than scrolled through three sizes of a return policy. Nothing has changed about the stock — it just arrives at your door now too.",
    primary: { label: "Find a store", href: "#stores" },
    secondary: { label: "Shop everything", href: "/shop" },
    text: true,
  },
  {
    id: "returns",
    image: "/images/editorial/banner-white.webp",
    position: "34% 40%",
    align: "right",
    alt: "A man in a Good Zone t-shirt against a tiled wall",
    offer: "Fifteen days",
    label: "No questions asked",
    headline: "Change your mind, twice if you like.",
    lines: ["Change your", "mind, freely."],
    body: "Wrong size, wrong colour, or you simply ordered three of everything. Send it back and we collect from your door. Most people use it as an exchange rather than a refund, which is fine.",
    primary: { label: "Shop new in", href: "/shop" },
    secondary: { label: "Read the size guide", href: "#fit" },
    text: true,
  },
];

/**
 * What is true whether or not a campaign is running. Deliberately outside
 * CAMPAIGNS — a shipping promise should not be editable by whoever is writing
 * the creative.
 */
export const ALWAYS = [
  { value: "Free delivery", note: "on orders over ₹1,499" },
  { value: "15-day returns", note: "picked up from your door" },
  { value: "Cash on delivery", note: "up to ₹10,000" },
  { value: "Runs of 200", note: "restocked, not replaced" },
] as const;
