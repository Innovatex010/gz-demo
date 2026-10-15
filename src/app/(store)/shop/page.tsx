import { Suspense } from "react";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { ShopView } from "@/components/site/shop-view";

export const metadata = {
  title: "Shop all — Good Zone",
  description:
    "Every shirt, t-shirt, pant and trouser we make, in stock and shipping nationwide.",
};

export default function ShopPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="shell py-20" />}>
          <ShopView />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
