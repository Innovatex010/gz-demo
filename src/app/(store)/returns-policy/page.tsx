import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PolicyPage, PolicySection } from "@/components/site/policy-page";

export const metadata = {
  title: "Returns and exchange policy — Good Zone",
  description:
    "Fifteen days from delivery to return or exchange any Good Zone piece. Free pickup from your door, exchange preferred over refund, tags still on.",
};

const SECTIONS = [
  { id: "window", label: "The window" },
  { id: "starting", label: "Starting a return" },
  { id: "pickup", label: "Pickup from your door" },
  { id: "exchange", label: "Exchange over refund" },
  { id: "condition", label: "What we can accept back" },
  { id: "refunds", label: "Getting your money back" },
  { id: "in-store", label: "Returning in a store" },
  { id: "exceptions", label: "What we cannot take" },
];

const RELATED = [
  {
    label: "Shipping policy",
    href: "/shipping-policy",
    note: "Two to four days, free above ₹1,499.",
  },
  {
    label: "Questions",
    href: "/faq",
    note: "Returns and exchange, in short.",
  },
];

export default function ReturnsPolicyPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        <PolicyPage
          title="Returns and exchange"
          standfirst="Fifteen days from the day a parcel reaches you. We collect from your door and we do not charge for the collection. Most people exchange rather than refund, and that is fine either way."
          updated="1 September 2026"
          sections={SECTIONS}
          related={RELATED}
        >
          <PolicySection id="window" index={1} heading="The window">
            <p className="prose">
              You have fifteen days from delivery to start a return or an
              exchange. Write to us inside that window and we will book it.
            </p>
            <p className="prose">
              The window starts when the parcel is delivered, not when you open
              it. If you were away and it sat with a neighbour, the clock still
              ran — tell us and we will extend it.
            </p>
          </PolicySection>

          <PolicySection id="starting" index={2} heading="Starting a return">
            <p className="prose">
              Email hello@goodzone.in with your order number and what you would
              like to do: exchange for another size, exchange for another
              colour, or refund. One email is enough. You do not need a form and
              you do not need to call.
            </p>
            <p className="prose">
              We reply within a working day with a pickup slot and, if you are
              exchanging, with a check on whether the size you want is actually
              on the shelf.
            </p>
          </PolicySection>

          <PolicySection id="pickup" index={3} heading="Pickup from your door">
            <p className="prose">
              The rider comes to collect. There is no pickup charge, on prepaid
              orders or cash on delivery orders, and there is no charge for the
              second delivery if the exchange is ours to ship.
            </p>
            <p className="prose">
              If the first attempt fails, we will try twice more on consecutive
              days. After that the parcel goes back to us and we will write to
              arrange it again rather than cancelling your return.
            </p>
          </PolicySection>

          <PolicySection id="exchange" index={4} heading="Exchange over refund">
            <p className="prose">
              We ask for an exchange because most returns are a sizing question,
              and an exchange puts a shirt you can wear in front of you without
              a second delivery. If your size is out of stock we will tell you
              on WhatsApp or email.
            </p>
            <p className="prose">
              While you decide, we hold your refund rather than cancelling it.
              When the replacement is cut we ship it, and you get the money back
              at the same time. You are not left with neither.
            </p>
            <p className="prose">
              If you would rather have the money, say so. We will refund you and
              you do not have to justify it.
            </p>
          </PolicySection>

          <PolicySection
            id="condition"
            index={5}
            heading="What we can accept back"
          >
            <p className="prose">
              The garment needs to be unworn and unwashed, with its tags still
              attached. Try it on the way you would wear it, over your own
              undershirt, and that is fine.
            </p>
            <p className="prose">
              The box, the bag and the tissue paper are not part of the deal. If
              you have thrown them away, keep the garment and the tags and send
              it anyway.
            </p>
          </PolicySection>

          <PolicySection
            id="refunds"
            index={6}
            heading="Getting your money back"
          >
            <p className="prose">
              Refunds are issued within five working days of the parcel reaching
              us. Your bank may take a further day or two to show it.
            </p>
            <p className="prose">
              We refund to the method you paid with. Card orders go back to the
              card, UPI orders to the same handle, and cash on delivery orders
              by bank transfer to an account you give us.
            </p>
            <p className="prose">
              If you paid cash on delivery, we will ask for an account number
              before we send the refund. We are not going to post cash.
            </p>
          </PolicySection>

          <PolicySection id="in-store" index={7} heading="Returning in a store">
            <p className="prose">
              Any of our eight counters will take a return or an exchange,
              online order or not. Bring the garment with its tags and your
              order number if you have one.
            </p>
            <p className="prose">
              Exchanges done at a counter are usually instant, because the rail
              behind the till is deeper than the site. If the size is not there,
              the store will order it in for you.
            </p>
          </PolicySection>

          <PolicySection
            id="exceptions"
            index={8}
            heading="What we cannot take"
          >
            <p className="prose">
              Garments that have been washed, bleached, altered or clearly worn
              out. Linen creases are not wear — linen is meant to crease, and
              returning it for that is not a thing.
            </p>
            <p className="prose">
              Anything without its tags, once we have already sent you a
              replacement for the same item.
            </p>
            <p className="prose">
              If a return reaches us and we cannot accept it, we photograph it,
              tell you why, and post it back to you at our cost. Nothing is
              quietly written off.
            </p>
          </PolicySection>
        </PolicyPage>
      </main>

      <Footer />
    </>
  );
}
