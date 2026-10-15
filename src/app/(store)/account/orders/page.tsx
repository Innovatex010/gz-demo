import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { OrdersView } from "@/components/site/orders-view";

export const metadata: Metadata = {
  title: "Your orders — Good Zone",
  description:
    "Every Good Zone order placed on this device, with tracking and totals.",
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <OrdersView />
      </main>
      <Footer />
    </>
  );
}
