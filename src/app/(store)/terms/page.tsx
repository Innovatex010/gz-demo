import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PolicyPage, PolicySection } from "@/components/site/policy-page";

export const metadata = {
  title: "Terms and conditions — Good Zone",
  description:
    "The rules of buying from Good Zone: who may order, how a contract is formed, pricing, delivery, returns, and the parts the law requires us to say.",
};

const SECTIONS = [
  { id: "who", label: "Who you are" },
  { id: "contract", label: "When the order is placed" },
  { id: "prices", label: "Prices and payment" },
  { id: "stock", label: "Stock and availability" },
  { id: "delivery-risk", label: "Risk and title" },
  { id: "returns", label: "Returns and refunds" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "liability", label: "Liability" },
  { id: "law", label: "Law and jurisdiction" },
];

export default function TermsPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        <PolicyPage
          title="Terms and conditions"
          standfirst="These are the rules of buying from us. They are written to be understood, and the parts of them that the law insists on are the only parts that sound like it."
          updated="1 September 2026"
          sections={SECTIONS}
          related={[
            {
              label: "Returns and exchange",
              href: "/returns-policy",
              note: "Fifteen days, free pickup.",
            },
            {
              label: "Privacy policy",
              href: "/privacy-policy",
              note: "What we keep, and for how long.",
            },
          ]}
        >
          <PolicySection id="who" index={1} heading="Who you are">
            <p className="prose">
              You must be at least eighteen years old to enter into a contract
              with us. If you are buying for someone else, they are the person
              the contract is with.
            </p>
            <p className="prose">
              Good Zone Clothing Pvt. Ltd., a company registered in India, with
              its registered office in Bengaluru. Our GST registration number
              and CIN appear on every invoice we issue.
            </p>
          </PolicySection>

          <PolicySection
            id="contract"
            index={2}
            heading="When the order is placed"
          >
            <p className="prose">
              Placing an order is an offer to buy. The contract is made when we
              accept it, which we do by dispatching the goods and sending you a
              dispatch confirmation.
            </p>
            <p className="prose">
              We may decline an order before that point, for instance if an item
              turns out to be out of stock, if the price was listed in error, or
              if we cannot identify the buyer. If we have already taken payment,
              we refund it in full.
            </p>
          </PolicySection>

          <PolicySection id="prices" index={3} heading="Prices and payment">
            <p className="prose">
              Prices are in Indian rupees and include GST. Delivery is charged
              at checkout, ₹79 below an order value of ₹1,499 and free above it.
            </p>
            <p className="prose">
              If a price is listed in obvious error, we are not obliged to
              honour it. We will tell you, and you can decide. The same applies
              to an error in a product description that changes what you are
              buying.
            </p>
            <p className="prose">
              Cash on delivery is available up to ₹10,000. Orders above that
              amount are prepaid by card or UPI.
            </p>
          </PolicySection>

          <PolicySection id="stock" index={4} heading="Stock and availability">
            <p className="prose">
              We cut in runs of two hundred. A size can sell out during the day,
              and the website and the shop floor do not always update at exactly
              the same moment. If the size you ordered is gone, we will tell you
              before dispatch and either send a substitute or refund you.
            </p>
            <p className="prose">
              We restock the same block rather than replacing the design. Most
              core shirts and t-shirts are back within six weeks.
            </p>
          </PolicySection>

          <PolicySection id="delivery-risk" index={5} heading="Risk and title">
            <p className="prose">
              The goods remain ours until delivery is complete. When they reach
              you they are yours, whether or not you have paid — which is why
              cash on delivery ends the same way as a prepaid order.
            </p>
            <p className="prose">
              Your statutory rights against us as a consumer are unaffected by
              anything on this page.
            </p>
          </PolicySection>

          <PolicySection id="returns" index={6} heading="Returns and refunds">
            <p className="prose">
              You have fifteen days from delivery to return or exchange anything
              we sell, for any reason, with the tags still on. We collect from
              your door at no cost.
            </p>
            <p className="prose">
              We ask for an exchange over a refund, because it is usually faster
              for you. It is a request, not a condition. Read the full terms on
              the returns page.
            </p>
          </PolicySection>

          <PolicySection id="acceptable-use" index={7} heading="Acceptable use">
            <p className="prose">
              Do not use this site to post unlawful material, to impersonate
              someone else, or to attempt to get at anything you have not paid
              for. We may block an address or an account that does.
            </p>
            <p className="prose">
              Prices, photography and text on this site belong to Good Zone
              Clothing Pvt. Ltd. You may share links. You may not republish the
              catalogue wholesale.
            </p>
          </PolicySection>

          <PolicySection id="liability" index={8} heading="Liability">
            <p className="prose">
              We are responsible for doing what we said we would do, and for
              goods being as described and of satisfactory quality. That is the
              standard the law sets and we do not contract out of it.
            </p>
            <p className="prose">
              We are not liable for indirect losses that were not reasonably
              foreseeable when you placed the order. Nothing here limits our
              liability for death or personal injury caused by negligence, for
              fraud, or for anything else the law says we cannot limit.
            </p>
          </PolicySection>

          <PolicySection id="law" index={9} heading="Law and jurisdiction">
            <p className="prose">
              These terms are governed by the law of India. Courts in Bengaluru,
              Karnataka have jurisdiction over any dispute.
            </p>
            <p className="prose">
              If any part of these terms is found unenforceable, the rest
              stands. We may update this page, and the date at the top tells you
              when we last did.
            </p>
          </PolicySection>
        </PolicyPage>
      </main>

      <Footer />
    </>
  );
}
