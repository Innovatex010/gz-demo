"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Entry = { q: string; a: string };

const GROUPS: { id: string; title: string; note: string; items: Entry[] }[] = [
  {
    id: "shipping",
    title: "Shipping and delivery",
    note: "Two to four days anywhere we deliver. Free above ₹1,499.",
    items: [
      {
        q: "How long does delivery take?",
        a: "Two to four days in serviceable pin codes. Orders placed before 11am in a city where we have a store can often be with you the same day.",
      },
      {
        q: "Is delivery free?",
        a: "Above ₹1,499 it is. Below that we add a flat ₹79 to the total and it shows at checkout before you pay.",
      },
      {
        q: "Do you deliver outside India?",
        a: "Not at the moment. We are a domestic brand with eight stores and a single warehouse in Bengaluru, and we would rather ship things properly than ship them everywhere.",
      },
      {
        q: "Can I collect from a store instead?",
        a: "Yes. Choose store collection at checkout, pick any of the eight counters, and it will be ready the next working day. Nothing is charged for it.",
      },
      {
        q: "How will I know it has shipped?",
        a: "You get a message with the tracking link when the parcel leaves Bengaluru. If it has been three working days and nothing has arrived, write to us with your order number.",
      },
      {
        q: "The address I gave was wrong. What now?",
        a: "Tell us immediately on hello@goodzone.in. If the parcel has not left we will change it. If it has, the courier will attempt delivery twice and return it to us, and we will send it out again at our cost.",
      },
      {
        q: "Do you ship internationally or to NRI addresses?",
        a: "No. If you are visiting and want something held for collection, choose store collection and use the counter in that city.",
      },
    ],
  },
  {
    id: "sizing",
    title: "Sizing and fit",
    note: "XS to XXL. Shirt chest measurements are in inches.",
    items: [
      {
        q: "How do I measure my chest?",
        a: "Around the fullest part, under the arms, with the tape level all the way round and not pulled tight. Add an inch if you are between two sizes.",
      },
      {
        q: "Do I size up or down?",
        a: "Shirts are cut with room in the chest and shoulder, so most people take their usual size. Our slim shirts say size down for a slimmer line, and our fitted tees say size up. The fit line on each product page tells you which.",
      },
      {
        q: "What sizes do you run?",
        a: "XS to XXL on everything. Pants and trousers follow the same letter scale, cut to your waist rather than your chest.",
      },
      {
        q: "My size is out of stock. Will it come back?",
        a: "Usually. Core shirts and t-shirts come back within six weeks because we cut another run of the same block rather than redesigning the garment. Leave your number at checkout and we will write the day it lands.",
      },
      {
        q: "I am between sizes and cannot decide.",
        a: "Take the larger one if you want room, the smaller if you want a clean line. Either way you have fifteen days to exchange it once it arrives, and pickup is on us.",
      },
    ],
  },
  {
    id: "payment",
    title: "Payment",
    note: "UPI, cards, net banking, or cash when the rider gets there.",
    items: [
      {
        q: "What payment methods do you take?",
        a: "UPI, all major cards, net banking, and cash on delivery up to ₹10,000. Above ₹10,000 we take card or UPI only.",
      },
      {
        q: "Is the price online the same as in store?",
        a: "Yes. We have not changed a single price for the launch. What you see here is what you pay at the counter.",
      },
      {
        q: "Can I pay cash on delivery?",
        a: "On orders up to ₹10,000. Above that we take card or UPI only. Please keep the exact amount if you can, the rider may not carry change.",
      },
      {
        q: "Is my payment information safe?",
        a: "Card details go straight to our payment processor and never touch our servers. We keep the last four digits and the transaction reference so we can look an order up when you call.",
      },
      {
        q: "Do you offer EMI or instalments?",
        a: "Not directly. Some card issuers let you split a payment on their own app after the fact, which is between you and them.",
      },
      {
        q: "When am I charged for a cash on delivery order?",
        a: "When the parcel is handed over. If the rider cannot reach you and the parcel comes back, nothing was charged.",
      },
    ],
  },
  {
    id: "returns",
    title: "Returns and exchange",
    note: "Fifteen days from delivery. We collect from your door.",
    items: [
      {
        q: "How long do I have to return something?",
        a: "Fifteen days from the day it reaches you. Write to us within that window and we will book a pickup.",
      },
      {
        q: "Who pays for the return pickup?",
        a: "We do. The rider comes to your door and there is no charge for the pickup, for cash on delivery orders or prepaid ones.",
      },
      {
        q: "Do I have to return the original packaging?",
        a: "The tags have to be on. The box, the plastic bag and the tissue paper are not part of the deal.",
      },
      {
        q: "Why do you prefer exchange to refund?",
        a: "Because most returns are a sizing question, and an exchange gets you a shirt you can wear without a second delivery. We will refund you if you ask for one, we just ask that you consider the exchange first.",
      },
      {
        q: "My size is out of stock for the exchange. What happens?",
        a: "We tell you on WhatsApp or email, we hold your refund until the replacement is cut, and we ship the new one as soon as it is there. You are not left without the money and without the shirt.",
      },
      {
        q: "Can I exchange in a store instead of posting it back?",
        a: "Yes. Bring the piece and the tags to any of the eight counters and they will swap it there and then. If the size is not on that rail we will order it in for you.",
      },
      {
        q: "When do I get my money back?",
        a: "Refunds go out within five working days of the parcel reaching us, to the same method you paid with. Banks sometimes take a day or two more to show it.",
      },
      {
        q: "Can I return something that was on sale?",
        a: "Same fifteen days, same free pickup. The price you paid is the price refunded, including the reduced amount.",
      },
    ],
  },
  {
    id: "orders",
    title: "Orders",
    note: "Changes, cancellations and the awkward questions.",
    items: [
      {
        q: "Can I change or cancel an order?",
        a: "Until it is packed. Email hello@goodzone.in with your order number as fast as you can and we will usually catch it. Once it has left Bengaluru it is a return instead.",
      },
      {
        q: "Can I change the size after ordering?",
        a: "If it has not shipped, yes. Write to us and we will change it on the pick list before it is packed.",
      },
      {
        q: "How do I check where my order is?",
        a: "The tracking link in your dispatch message shows it. If the link has stopped, email us the order number and we will look it up by hand.",
      },
      {
        q: "I ordered two of the same shirt in different sizes. Can I send both back?",
        a: "Yes. Each order number is handled separately, so tell us both when you write.",
      },
      {
        q: "Something arrived damaged.",
        a: "Send a photograph to hello@goodzone.in within fifteen days and we will replace it on the next run, or refund you. You do not need to send the damaged piece back.",
      },
      {
        q: "I never got a confirmation email.",
        a: "Check spam first, then email us with the phone number you ordered from. We can find it, and it is usually sitting in the promotions folder.",
      },
      {
        q: "Do you restock a sold-out colour, or replace it with a new one?",
        a: "We restock the same block in the same colour. A new colour is a new shirt to us, not a restock, and it gets its own product page.",
      },
    ],
  },
];

export function FaqView() {
  const [open, setOpen] = useState<string[]>([]);

  return (
    <div className="space-y-14">
      {GROUPS.map((g, gi) => (
        <section key={g.id} id={g.id} className="min-w-0">
          <div className="flex items-baseline gap-4 border-b border-[color:var(--line)] pb-4">
            <span className="num text-[0.9rem] text-[color:var(--ink-3)]">
              {String(gi + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h2 className="t-h3">{g.title}</h2>
              <p className="mt-1 text-[0.85rem] text-[color:var(--ink-3)]">
                {g.note}
              </p>
            </div>
          </div>

          <Accordion
            type="multiple"
            value={open}
            onValueChange={setOpen}
            className="mt-2 w-full border-t border-transparent"
          >
            {g.items.map((item, qi) => {
              const value = `${g.id}-${qi}`;
              return (
                <AccordionItem
                  key={value}
                  value={value}
                  className="border-b border-[color:var(--line)]"
                >
                  <AccordionTrigger className="py-5 text-[1rem] font-medium hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="max-w-[62ch] pb-6 text-[0.925rem] leading-relaxed text-[color:var(--ink-2)]">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </section>
      ))}

      <section className="border border-[color:var(--line)] px-6 py-8">
        <h2 className="t-h3">Still stuck</h2>
        <p className="prose mt-3">
          Write to{" "}
          <a href="mailto:hello@goodzone.in" className="link-draw">
            hello@goodzone.in
          </a>{" "}
          with your order number if you have one. If it is easier to talk, call
          us on 10:30am to 6:30pm, Monday to Friday.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex rounded-4xl bg-[color:var(--ink)] px-6 py-3 text-sm font-medium text-[color:var(--paper)]"
        >
          Contact us
        </Link>
      </section>
    </div>
  );
}
