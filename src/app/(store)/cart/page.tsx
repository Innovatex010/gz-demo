import type { Metadata } from "next";
import { CartView } from "@/components/site/cart-view";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

export const metadata: Metadata = {
  title: "Your bag — Good Zone",
  description:
    "Everything in your Good Zone bag, with delivery and discount totals.",
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <CartView />
      </main>
      <Footer />
    </>
  );
}
