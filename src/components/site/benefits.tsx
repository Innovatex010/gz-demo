import {
  IconRefresh,
  IconShieldCheck,
  IconTruckDelivery,
  IconWallet,
} from "@tabler/icons-react";
import { Marquee, MarqueeItem } from "@/components/ui/marquee";

/** The three promises the marquee carries. These are the shop's whole pitch. */
const PROMISES = [
  {
    icon: IconWallet,
    lead: "Cash on delivery",
    note: "on orders up to ₹10,000",
  },
  {
    icon: IconRefresh,
    lead: "Exchange instead of return",
    note: "we collect from your door",
  },
  {
    icon: IconShieldCheck,
    lead: "Same price as our store",
    note: "nothing extra for going online",
  },
];

/** The detail behind each one. Slower row, so the two never line up. */
const DETAILS = [
  "Free delivery over ₹1,499",
  "15 days to change your mind",
  "Same exchange offer as the counter",
  "Restocked in runs of 200, not replaced",
  "8 stores across 4 cities",
  "Two to four day delivery",
];

const PROPS = [
  {
    icon: IconTruckDelivery,
    title: "Delivery in 2–4 days",
    body: "Same-day in cities where we have a store, if you order before 11am.",
  },
  {
    icon: IconRefresh,
    title: "Exchange, don't return",
    body: "Wrong size or wrong colour? Swap it. We only refund if you want a refund.",
  },
  {
    icon: IconWallet,
    title: "Pay how you like",
    body: "Card, UPI, netbanking or cash on delivery up to ₹10,000.",
  },
  {
    icon: IconShieldCheck,
    title: "15 days to decide",
    body: "Unworn, with tags on. We collect it from your address.",
  },
];

export function Benefits() {
  return (
    <>
      {/* The marquee: the three promises, then the detail behind them */}
      <section
        id="offers"
        aria-label="How ordering from us works"
        className="on-ink border-y border-[color:var(--on-ink-line)] py-7"
      >
        <Marquee speed={46} className="text-[color:var(--paper)]">
          {PROMISES.map((p) => (
            <MarqueeItem key={p.lead}>
              <p.icon size={19} stroke={1.5} className="shrink-0 opacity-80" />
              <span className="flex items-baseline gap-2.5">
                <span className="text-[1.05rem] font-medium">{p.lead}</span>
                <span className="text-[0.8rem] text-[color:var(--on-ink-muted)]">
                  {p.note}
                </span>
              </span>
            </MarqueeItem>
          ))}
        </Marquee>

        <Marquee
          speed={62}
          reverse
          fade={false}
          className="mt-4 text-[color:var(--paper)]/55"
        >
          {DETAILS.map((d) => (
            <MarqueeItem key={d}>
              <span className="text-[0.82rem]">{d}</span>
            </MarqueeItem>
          ))}
        </Marquee>
      </section>

      <section className="shell py-10 lg:py-14">
        <ul className="grid gap-px border border-[color:var(--line)] bg-[color:var(--line)] sm:grid-cols-2 lg:grid-cols-4">
          {PROPS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="bg-[color:var(--paper)] p-6">
              <Icon
                size={22}
                stroke={1.4}
                className="text-[color:var(--indigo)]"
              />
              <h3 className="mt-4 text-[0.95rem] font-medium">{title}</h3>
              <p className="mt-1.5 text-[0.875rem] leading-relaxed text-[color:var(--ink-2)]">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
