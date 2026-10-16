import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderDetail } from "@/components/admin/order-detail";
import { ADMIN_ORDERS } from "@/lib/admin-data";

export function generateStaticParams() {
  return ADMIN_ORDERS.map((o) => ({ id: o.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const order = ADMIN_ORDERS.find((o) => o.id === id);
  if (!order) return { title: "Order not found — Good Zone desk" };
  return {
    title: `${order.id} — Good Zone desk`,
    description: `${order.customer.name}, ${order.address.city}. ${order.lines.length} items.`,
  };
}

export default async function OrderPage({
  params,
}: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = ADMIN_ORDERS.find((o) => o.id === id);
  if (!order) notFound();
  return <OrderDetail key={order.id} order={order} />;
}
