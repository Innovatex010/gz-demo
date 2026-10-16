import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersView } from "@/components/admin/orders-view";

export const metadata: Metadata = {
  title: "Orders — Good Zone desk",
};

export default function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    pay?: string;
    when?: string;
    page?: string;
  }>;
}) {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-[76rem] px-4 py-8 lg:px-8" />}
    >
      <OrdersView searchParams={searchParams} />
    </Suspense>
  );
}
