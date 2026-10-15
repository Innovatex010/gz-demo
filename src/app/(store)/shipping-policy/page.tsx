import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PolicyPage, PolicySection } from "@/components/site/policy-page";

export const metadata = {
  title: "Shipping policy — Good Zone",
  description:
    "How Good Zone delivers: two to four days, free above ₹1,499, flat ₹79 below, store collection in eight cities, and what happens if a parcel goes wrong.",
};

const SECTIONS = [
  { id: "where", label: "Where we deliver" },
  { id: "when", label: "How long it takes" },
  { id: "cost", label: "What delivery costs" },
  { id: "tracking", label: "Tracking and dispatch" },
  { id: "collection", label: "Collecting from a store" },
  { id: "problems", label: "If something goes wrong" },
];

const RELATED = [
  {
    label: "Returns and exchange",
    href: "/returns-policy",
    note: "Fifteen days, collected from your door.",
  },
  {
    label: "Questions",
    href: "/faq",
    note: "The short answers, by subject.",
  },
];

export default function ShippingPolicyPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        <PolicyPage
          title="Shipping policy"
          standfirst="We ship from Bengaluru. Everything below is what actually happens to a parcel after you press pay — no estimates dressed up as guarantees."
          updated="1 September 2026"
          sections={SECTIONS}
          related={RELATED}
        >
          <PolicySection id="where" index={1} heading="Where we deliver">
            <p className="prose">
              We deliver across India to any serviceable postal pin code. Orders
              are packed and handed to the courier in Bengaluru, usually the
              same working day if you order before 2pm.
            </p>
            <p className="prose">
              We do not ship outside India. If you are travelling and want
              something set aside, choose store collection and use the counter
              in the city you are in.
            </p>
          </PolicySection>

          <PolicySection id="when" index={2} heading="How long it takes">
            <p className="prose">
              Two to four working days from dispatch for most pin codes. Metro
              cities are usually at the fast end of that, and remote pin codes
              at the slow end.
            </p>
            <p className="prose">
              In Bengaluru, Hyderabad, Chennai and Pune, orders placed before
              11am can often be with you the same day. We will say so in the
              dispatch message if that applies to yours.
            </p>
            <p className="prose">
              If a parcel has not reached you four working days after dispatch,
              email hello@goodzone.in with the order number. We chase the
              courier the same day.
            </p>
          </PolicySection>

          <PolicySection id="cost" index={3} heading="What delivery costs">
            <p className="prose">
              Free on orders above ₹1,499. Below that we add a flat ₹79. The
              total you see at checkout already includes it, so there is nothing
              to pay on delivery.
            </p>
            <p className="prose">
              Cash on delivery is available up to ₹10,000. Orders above that
              amount are prepaid, by card or UPI.
            </p>
            <p className="prose">
              If a parcel has to come back to us and go out again because of an
              error on our side, that second delivery is free.
            </p>
          </PolicySection>

          <PolicySection
            id="tracking"
            index={4}
            heading="Tracking and dispatch"
          >
            <p className="prose">
              You get an email with a tracking link when the parcel leaves our
              warehouse. The courier also sends its own message once it is out
              for delivery.
            </p>
            <p className="prose">
              If a tracking link has not updated for two days, that usually
              means the parcel is sitting at a local sorting office. Nothing is
              lost and nothing is lost on our side either. Write to us and we
              will raise it with the courier.
            </p>
          </PolicySection>

          <PolicySection
            id="collection"
            index={5}
            heading="Collecting from a store"
          >
            <p className="prose">
              You can choose store collection at checkout instead of delivery.
              The order is held at any of our eight counters and is ready from
              the next working day. Nothing is charged for it.
            </p>
            <p className="prose">
              Bring your order number. Whoever is on the counter will hand it
              over and, if it is worth doing, tell you the size they would have
              picked.
            </p>
          </PolicySection>

          <PolicySection
            id="problems"
            index={6}
            heading="If something goes wrong"
          >
            <p className="prose">
              Wrong address. Tell us straight away. Before dispatch we can
              change it. After dispatch the courier will attempt delivery twice
              and return the parcel to us, and we will send it again at our
              cost.
            </p>
            <p className="prose">
              Damaged on arrival. Send a photograph to hello@goodzone.in within
              fifteen days of delivery. We will replace the piece on the next
              production run or refund it, whichever you would rather have. You
              do not need to post the damaged item back.
            </p>
            <p className="prose">
              Lost in transit. After the courier has confirmed a parcel as lost
              we will send a replacement or refund in full. We do not ask you to
              wait for the courier to close the claim first.
            </p>
          </PolicySection>
        </PolicyPage>
      </main>

      <Footer />
    </>
  );
}
