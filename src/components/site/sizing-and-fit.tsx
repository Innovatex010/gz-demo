"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { FAQ, SIZES } from "@/lib/catalog";
import { HeadingLines } from "./motion";

/** Chest measurement in inches, which is how Indian shirt sizing actually works. */
const SIZE_CHART = [
  ["XS", "32–34", "36–38"],
  ["S", "35–37", "39–41"],
  ["M", "38–40", "42–44"],
  ["L", "41–43", "45–47"],
  ["XL", "44–46", "48–50"],
  ["XXL", "47–49", "51–53"],
];

export function SizingAndFit() {
  const [open, setOpen] = useState<string | undefined>("q0");

  return (
    <section
      id="fit"
      className="shell band border-t border-[color:var(--line)]"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <HeadingLines
            as="h2"
            className="t-h2"
            lines={["Getting the", "size right"]}
          />
          <p className="prose mt-5">
            Measure around the fullest part of your chest, keep the tape level,
            and add an inch if you are between sizes. Our shirts are cut with
            room in the chest and shoulder, so most people take their usual
            size.
          </p>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[26rem] border-collapse text-left text-[0.88rem]">
              <caption className="sr-only">
                Chest measurements by size, in inches
              </caption>
              <thead>
                <tr className="border-b border-[color:var(--line-2)]">
                  <th
                    scope="col"
                    className="label py-2.5 font-medium text-[color:var(--ink-3)]"
                  >
                    Size
                  </th>
                  <th
                    scope="col"
                    className="label py-2.5 font-medium text-[color:var(--ink-3)]"
                  >
                    Chest (in)
                  </th>
                  <th
                    scope="col"
                    className="label py-2.5 font-medium text-[color:var(--ink-3)]"
                  >
                    Waist (in)
                  </th>
                </tr>
              </thead>
              <tbody>
                {SIZE_CHART.map(([size, chest, waist]) => (
                  <tr
                    key={size}
                    className="border-b border-[color:var(--line)]"
                  >
                    <th
                      scope="row"
                      className="num py-2.5 text-[0.95rem] font-normal"
                    >
                      {size}
                    </th>
                    <td className="num py-2.5">{chest}</td>
                    <td className="num py-2.5">{waist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[0.8rem] text-[color:var(--ink-3)]">
            Full-sleeve shirts and trousers, in inches. Sizes {SIZES[0]}–
            {SIZES[SIZES.length - 1]}.
          </p>
        </div>

        <div className="lg:col-span-7">
          <p className="label mb-6 text-[color:var(--ink-3)]">
            Ordering online, from people who like that
          </p>
          <Accordion
            type="single"
            collapsible
            value={open}
            onValueChange={setOpen}
            className="w-full border-t border-[color:var(--line)]"
          >
            {FAQ.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`q${i}`}
                className="border-b border-[color:var(--line)]"
              >
                <AccordionTrigger className="py-5 text-[1rem] font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="max-w-[62ch] pb-6 text-[0.925rem] leading-relaxed text-[color:var(--ink-2)]">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
