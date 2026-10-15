import type { Metadata } from "next";
import { CheckoutView } from "@/components/site/checkout-view";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

export const metadata: Metadata = {
  title: "Checkout — Good Zone",
  description: "Complete your Good Zone order.",
};

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <CheckoutView />
      </main>
      <Footer />
    </>
  );
}
