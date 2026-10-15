import {
  IconClock,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import Link from "next/link";
import { ContactForm } from "@/components/site/contact-form";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageCrumbs } from "@/components/site/page-crumbs";

export const metadata = {
  title: "Contact and stores — Good Zone",
  description:
    "Eight Good Zone stores across Bengaluru, Hyderabad, Chennai and Pune, with addresses and hours. Email, phone and a message form for orders, returns and sizing.",
};

/** Eight counters, listed under the four cities we trade in. */
const CITIES = [
  {
    city: "Bengaluru",
    stores: [
      "12th Main, Indiranagar",
      "80 Feet Road, Koramangala",
      "Jayanagar 4th Block",
    ],
    hours: "10:30am to 8:30pm, all seven days",
  },
  {
    city: "Hyderabad",
    stores: ["Road No. 12, Banjara Hills", "Jubilee Hills, Main Road"],
    hours: "11am to 9pm, Monday to Saturday",
  },
  {
    city: "Chennai",
    stores: ["Ranganathan Street, T Nagar", "Anna Salai, Adyar"],
    hours: "10:30am to 8pm, all seven days",
  },
  {
    city: "Pune",
    stores: ["North Main Road, Koregaon Park"],
    hours: "11am to 8pm, Monday to Saturday",
  },
];

const WAYS = [
  {
    Icon: IconMail,
    label: "hello@goodzone.in",
    note: "Answered within a working day.",
    href: "mailto:hello@goodzone.in",
  },
  {
    Icon: IconPhone,
    label: "+91 80 4718 2100",
    note: "10:30am to 6:30pm, Monday to Friday.",
    href: "tel:+918047182100",
  },
];

export default function ContactPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        <div className="shell py-10 lg:py-14">
          <PageCrumbs current="Contact" />

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="min-w-0 lg:col-span-7">
              <p className="label text-[color:var(--ink-3)]">Talk to us</p>
              <h1 className="t-h2 mt-5 max-w-[16ch]">
                A person answers. Usually the same one every time.
              </h1>
              <p className="prose mt-6">
                There is no chatbot on this site. Questions about an order, a
                size, an exchange or a store visit go to the same team that
                packs and stocks the shelves.
              </p>
            </div>

            <div className="min-w-0 lg:col-span-5 lg:pt-10">
              <ul className="space-y-5">
                {WAYS.map(({ Icon, label, note, href }) => (
                  <li key={label} className="flex items-start gap-3.5">
                    <Icon
                      size={18}
                      stroke={1.6}
                      className="mt-0.5 shrink-0 text-[color:var(--ink-3)]"
                    />
                    <span>
                      <a href={href} className="link-draw text-[0.98rem]">
                        {label}
                      </a>
                      <span className="mt-0.5 block text-[0.82rem] text-[color:var(--ink-3)]">
                        {note}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-7 border-t border-[color:var(--line)] pt-6 text-[0.85rem] text-[color:var(--ink-2)]">
                Already have an order running? The fastest answer is on the{" "}
                <Link href="/faq" className="link-draw">
                  questions page
                </Link>
                .
              </p>
            </div>
          </div>
        </div>

        {/* Stores */}
        <section className="shell py-10 lg:py-14 border-t border-[color:var(--line)]">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <p className="label text-[color:var(--ink-3)]">In person</p>
              <h2 className="t-h2 mt-4">Eight stores</h2>
              <p className="prose mt-5">
                Try the shirt on. Bring the shoes you will wear it with. Any
                counter will exchange a piece bought online, and none of them
                will charge you for it.
              </p>
            </div>

            <div className="min-w-0 lg:col-span-8">
              <div className="grid gap-px border border-[color:var(--line)] bg-[color:var(--line)] sm:grid-cols-2">
                {CITIES.map((c) => (
                  <div key={c.city} className="bg-[color:var(--paper)] p-5">
                    <h3 className="flex items-center gap-2.5 text-[1.05rem] font-medium">
                      <IconMapPin
                        size={16}
                        stroke={1.6}
                        className="shrink-0 text-[color:var(--ink-3)]"
                      />
                      {c.city}
                    </h3>
                    <ul className="mt-4 space-y-2">
                      {c.stores.map((s) => (
                        <li key={s} className="text-[0.9rem]">
                          {s}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 flex items-start gap-2 border-t border-[color:var(--line)] pt-3.5 text-[0.82rem] text-[color:var(--ink-3)]">
                      <IconClock
                        size={14}
                        stroke={1.6}
                        className="mt-0.5 shrink-0"
                      />
                      {c.hours}
                    </p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-[0.8rem] text-[color:var(--ink-3)]">
                Store timings change around public holidays. Send us a line
                before you travel and we will tell you where the shutters are
                actually up.
              </p>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="on-ink shell py-10 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="min-w-0 lg:col-span-4">
              <p className="label text-[color:var(--on-ink-muted)]">
                Write to us
              </p>
              <h2 className="t-h2 mt-4 text-[color:var(--paper)]">
                The form, or the email
              </h2>
              <p className="prose-ink mt-5">
                If it is urgent, email. A message through the form can sit in a
                browser until the next working day.
              </p>
            </div>

            <div className="min-w-0 rounded-2xl bg-[color:var(--paper)] p-6 text-[color:var(--ink)] lg:col-span-8 lg:p-9">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
