import {
  IconRefresh,
  IconShieldCheck,
  IconTruckDelivery,
  IconWallet,
} from "@tabler/icons-react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

const TICKER = [
  "Free delivery over ₹1,499",
  "15-day returns, picked up from your door",
  "Cash on delivery up to ₹10,000",
  "Exchange instead of refund, any time",
  "Same prices as our stores",
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
      {/* The one moving line on the page */}
      <div className="on-ink border-y border-[color:var(--on-ink-line)] py-3.5">
        <InfiniteMovingCards
          items={TICKER}
          speed="slow"
          separator="—"
          itemClassName="text-[0.82rem]"
          className="text-[color:var(--paper)]"
        />
      </div>

      <section id="offers" className="shell band">
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
