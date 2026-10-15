import { FaqView } from "@/components/site/faq-view";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageCrumbs } from "@/components/site/page-crumbs";

export const metadata = {
  title: "Questions — Good Zone",
  description:
    "Delivery, sizing, payment, returns and orders, answered plainly. Fifteen days to return, free pickup from your door, cash on delivery up to ₹10,000.",
};

const RAIL = [
  { id: "shipping", label: "Shipping and delivery" },
  { id: "sizing", label: "Sizing and fit" },
  { id: "payment", label: "Payment" },
  { id: "returns", label: "Returns and exchange" },
  { id: "orders", label: "Orders" },
];

export default function FaqPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        <div className="shell py-10 lg:py-14">
          <PageCrumbs current="Questions" />

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="min-w-0 lg:col-span-7">
              <p className="label text-[color:var(--ink-3)]">
                The things people ask
              </p>
              <h1 className="t-h2 mt-5 max-w-[14ch]">
                Questions, answered before you have to ask
              </h1>
              <p className="prose mt-6">
                Everything here is the same answer the counter gives. If yours
                is not covered, the contact page reaches the same people.
              </p>
            </div>

            <nav
              aria-label="Jump to a section"
              className="min-w-0 lg:col-span-5 lg:pt-10"
            >
              <p className="label text-[color:var(--ink-3)]">Jump to</p>
              <ul className="mt-4 border-y border-[color:var(--line)]">
                {RAIL.map((r, i) => (
                  <li
                    key={r.id}
                    className="border-b border-[color:var(--line)] last:border-b-0"
                  >
                    <a
                      href={`#${r.id}`}
                      className="flex items-baseline gap-3 py-3 text-[0.9rem]"
                    >
                      <span className="num text-[0.75rem] text-[color:var(--ink-3)]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="link-draw">{r.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-14 border-t border-[color:var(--line)] pt-12">
            <FaqView />
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
