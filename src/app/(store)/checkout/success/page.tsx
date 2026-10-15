import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { OrderSuccess } from "@/components/site/order-success";

export const metadata: Metadata = {
  title: "Order placed — Good Zone",
  description: "Your Good Zone order has been placed.",
};

export default function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* searchParams is read inside the boundary so the shell streams first */}
        <Suspense fallback={<div className="shell py-10 lg:py-14" />}>
          <SuccessBody searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function SuccessBody({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <OrderSuccess orderId={typeof order === "string" ? order : undefined} />
  );
}
