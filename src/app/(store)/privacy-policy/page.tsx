import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PolicyPage, PolicySection } from "@/components/site/policy-page";

export const metadata = {
  title: "Privacy policy — Good Zone",
  description:
    "What Good Zone collects, why, how long we keep it, and how to ask us to delete it. Written in plain English, not to be impressive.",
};

const SECTIONS = [
  { id: "collect", label: "What we collect" },
  { id: "why", label: "Why we collect it" },
  { id: "share", label: "Who else sees it" },
  { id: "keep", label: "How long we keep it" },
  { id: "cookies", label: "Cookies" },
  { id: "rights", label: "Your rights" },
  { id: "children", label: "Children" },
  { id: "changes", label: "If this changes" },
  { id: "contact", label: "Contact" },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />

      <main className="flex-1">
        <PolicyPage
          title="Privacy policy"
          standfirst="We are a shop, not a data business. This page says what we collect, why, and how to make us delete it. We have written it to be read rather than to be impressive."
          updated="1 September 2026"
          sections={SECTIONS}
          related={[
            {
              label: "Terms and conditions",
              href: "/terms",
              note: "The rules of buying from us.",
            },
            {
              label: "Shipping policy",
              href: "/shipping-policy",
              note: "What happens to your parcel.",
            },
          ]}
        >
          <PolicySection id="collect" index={1} heading="What we collect">
            <p className="prose">
              When you order, we collect your name, delivery address, phone
              number, email address and what you bought. We need the phone
              number because the rider has to call you.
            </p>
            <p className="prose">
              When you write to us, we keep the message and your email address
              so we can answer and, if it comes to that, look up your order.
            </p>
            <p className="prose">
              If you leave a number for restock alerts, we keep the number and
              nothing else. We do not build advertising profiles and we do not
              sell data to anyone.
            </p>
          </PolicySection>

          <PolicySection id="why" index={2} heading="Why we collect it">
            <p className="prose">
              To take payment, to ship the order, to handle an exchange or a
              refund, and to answer you when you write. Those are the four
              reasons, and there is not a fifth one hidden underneath.
            </p>
            <p className="prose">
              We also look at how the site is used so we can fix pages that do
              not work. That information is aggregated and does not identify
              you.
            </p>
          </PolicySection>

          <PolicySection id="share" index={3} heading="Who else sees it">
            <p className="prose">
              Three kinds of company, and only those: the payment processor that
              takes your card or UPI, the courier that delivers your parcel, and
              whoever hosts this site and its database.
            </p>
            <p className="prose">
              They each get the minimum they need to do their part. The courier
              does not get what you bought, and the payment processor does not
              get your address.
            </p>
            <p className="prose">
              We will share your details with a government authority if we are
              legally required to. We will tell you, unless we are not allowed
              to.
            </p>
          </PolicySection>

          <PolicySection id="keep" index={4} heading="How long we keep it">
            <p className="prose">
              Order records are kept for eight years, because tax law requires
              it. Everything else — a support thread, a restock number, a
              newsletter signup — is deleted when you ask, or within a year of
              the last contact, whichever comes first.
            </p>
          </PolicySection>

          <PolicySection id="cookies" index={5} heading="Cookies">
            <p className="prose">
              We use a small number of cookies: one to keep your bag, one to
              remember you have seen a banner, and analytics that tell us which
              pages work.
            </p>
            <p className="prose">
              We do not run advertising cookies and we do not follow you around
              other websites. Clearing your browser cookies will empty your bag,
              which is the worst that happens.
            </p>
          </PolicySection>

          <PolicySection id="rights" index={6} heading="Your rights">
            <p className="prose">
              You can ask us what we hold about you, ask for a correction, or
              ask us to delete it. Write to hello@goodzone.in and a person will
              deal with it.
            </p>
            <p className="prose">
              We will answer within thirty days. We will not charge you for it
              and we will not make you fill in a form to ask.
            </p>
            <p className="prose">
              If you are unhappy with how we have handled it, you can complain
              to the Data Protection Board of India. We would rather you told us
              first, but that is your call to make.
            </p>
          </PolicySection>

          <PolicySection id="children" index={7} heading="Children">
            <p className="prose">
              This is a shop for adults. We do not knowingly collect anything
              from anyone under eighteen. If you are under eighteen, please ask
              a parent or guardian to place the order for you.
            </p>
          </PolicySection>

          <PolicySection id="changes" index={8} heading="If this changes">
            <p className="prose">
              If we change anything material on this page, we will update the
              date at the top and, for anything significant, email the customers
              it affects before the change takes effect.
            </p>
          </PolicySection>

          <PolicySection id="contact" index={9} heading="Contact">
            <p className="prose">
              Good Zone Clothing Pvt. Ltd. Our registered office address, GST
              registration number and CIN are stated on every invoice we issue.
              For anything on this page, write to hello@goodzone.in.
            </p>
          </PolicySection>
        </PolicyPage>
      </main>

      <Footer />
    </>
  );
}
