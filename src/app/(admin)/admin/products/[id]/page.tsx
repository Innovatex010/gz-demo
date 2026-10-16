import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/product-editor";
import { ADMIN_PRODUCTS } from "@/lib/admin-data";

export function generateStaticParams() {
  return ADMIN_PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = ADMIN_PRODUCTS.find((x) => x.id === id);
  return { title: p ? `${p.name} — Good Zone desk` : "Style not found" };
}

export default async function ProductPage({
  params,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const product = ADMIN_PRODUCTS.find((p) => p.id === id);
  if (!product) notFound();
  return <ProductEditor key={product.id} product={product} />;
}
