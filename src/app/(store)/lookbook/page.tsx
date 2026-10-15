import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PageCrumbs } from "@/components/site/page-crumbs";
import { inr, productById } from "@/lib/catalog";

export const metadata = {
  title: "Lookbook — Good Zone",
  description:
    "Four outfits built from the Good Zone range, with the pieces linked so you can buy them straight away.",
};

/** Product codes, so a piece that leaves the range breaks one link, not a layout. */
const LOOKS = [
  {
    id: "meeting",
    title: "A meeting you would rather sit through",
    note: "Slim poplin shirt tucked in, pleated trouser on leather. Tuck the sleeves once and leave them alone.",
    pieces: ["GZ-103", "GZ-501"],
  },
  {
    id: "friday",
    title: "Friday, but still a shirt",
    note: "Pique polo, sleeves out, chinos in cream. The only thing in this look that needs ironing is the collar.",
    pieces: ["GZ-201", "GZ-401"],
  },
  {
    id: "long-day",
    title: "A long day and a short train home",
    note: "Heavyweight tee over a chino. The one to pack, because it washes tonight and it is wearable by morning.",
    pieces: ["GZ-301", "GZ-402"],
  },
  {
    id: "evening",
    title: "An evening with no air conditioning",
    note: "Rose linen shirt open at the collar, cream linen trouser. Linen creases. Roll the sleeves twice and stop.",
    pieces: ["GZ-105", "GZ-502"],
  },
];

export default function LookbookPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        <div className="shell py-10 lg:py-14">
          <PageCrumbs current="Lookbook" />

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="min-w-0 lg:col-span-7">
              <p className="label text-[color:var(--ink-3)]">Four outfits</p>
              <h1 className="t-h2 mt-5 max-w-[15ch]">
                Everything below is in stock now
              </h1>
            </div>
            <div className="min-w-0 lg:col-span-5 lg:pt-9">
              <p className="prose">
                Nothing styled here is a special edition or a lookbook-only
                colour. These are ordinary pieces from the range, worn the way
                they are meant to be worn. Every link goes straight to the
                product page.
              </p>
            </div>
          </div>
        </div>

        {LOOKS.map((look, i) => {
          const pieces = look.pieces
            .map((id) => productById(id))
            .filter((p) => p !== undefined);
          const lead = pieces[0];

          return (
            <section
              key={look.id}
              id={look.id}
              className="shell py-10 lg:py-14 border-t border-[color:var(--line)]"
            >
              <div className="grid gap-8 lg:grid-cols-12 lg:gap-14">
                <div className="min-w-0 lg:col-span-5">
                  {lead && (
                    <div className="relative aspect-4/5 overflow-hidden bg-[color:var(--paper-3)]">
                      <Link
                        href={`/shop/${lead.id}`}
                        className="absolute inset-0 block"
                      >
                        <Image
                          src={lead.image}
                          alt={`${lead.name} in ${lead.colors[0].name}, the first piece of this look`}
                          fill
                          priority
                          sizes="(max-width: 1024px) 100vw, 42vw"
                          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] hover:scale-[1.03]"
                        />
                      </Link>
                    </div>
                  )}
                </div>

                <div className="min-w-0 lg:col-span-7 lg:flex lg:flex-col lg:justify-center">
                  <p className="label mb-4 text-[color:var(--ink-3)]">
                    Look {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="t-h2 max-w-[17ch]">{look.title}</h2>
                  <p className="prose mt-5">{look.note}</p>

                  <ul className="mt-9 grid gap-px border border-[color:var(--line)] bg-[color:var(--line)] sm:grid-cols-2">
                    {pieces.map((p) => (
                      <li key={p.id} className="bg-[color:var(--paper)]">
                        <Link
                          href={`/shop/${p.id}`}
                          className="group flex items-center gap-4 p-4"
                        >
                          <span className="relative block size-20 shrink-0 overflow-hidden bg-[color:var(--paper-3)]">
                            <Image
                              src={p.image}
                              alt={`${p.name} in ${p.colors[0].name}`}
                              fill
                              sizes="80px"
                              className="object-cover transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105"
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="link-draw block text-[0.9rem] leading-snug font-medium">
                              {p.name}
                            </span>
                            <span className="mt-1 block text-[0.8rem] text-[color:var(--ink-3)]">
                              {p.colors.map((c) => c.name).join(" · ")}
                            </span>
                            <span className="num mt-1.5 block text-[0.9rem]">
                              {inr(p.price)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}

        <section className="shell border-t border-[color:var(--line)] py-14">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 pb-0.5 text-[0.95rem] font-medium"
          >
            <span className="link-draw">See the whole range</span>
            <IconArrowRight
              size={16}
              stroke={1.8}
              className="transition-transform duration-500 group-hover:translate-x-1"
            />
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
