import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { TrackOrder } from "@/components/site/track-order";

export const metadata: Metadata = {
  title: "Track your order — Good Zone",
  description: "Track a Good Zone order with your order number and mobile.",
};

export default function TrackOrderPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* useSearchParams needs a boundary when the route is prerendered */}
        <Suspense fallback={<div className="shell py-10 lg:py-14" />}>
          <TrackOrder />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
