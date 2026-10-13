import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { ProductDetail } from "@/components/site/product-detail";
import { PRODUCTS, productById } from "@/lib/catalog";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = productById(id);
  if (!product) return { title: "Not found — Good Zone" };
  return {
    title: `${product.name} — Good Zone`,
    description: `${product.fabric}. ${product.fit} ₹${product.price}.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = productById(id);
  if (!product) notFound();

  const related = PRODUCTS.filter(
    (p) => p.id !== product.id && p.category === product.category,
  )
    .concat(
      PRODUCTS.filter(
        (p) => p.category !== product.category && p.id !== product.id,
      ),
    )
    .slice(0, 4);

  return (
    <>
      <Header />
      <main className="flex-1">
        <ProductDetail product={product} related={related} />
      </main>
      <Footer />
    </>
  );
}
