import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

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

export default function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* params is read inside the boundary so the shell can stream
            immediately instead of blocking on the URL */}
        <Suspense fallback={<div className="shell py-24" />}>
          <ProductBody params={params} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function ProductBody({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = productById(id);
  if (!product) notFound();

  // Same category first, then anything else — the row is a suggestion, not a
  // strict "you might also like" claim.
  const related = PRODUCTS.filter((p) => p.id !== product.id)
    .sort((a, b) => {
      const aSame = a.category === product.category ? 0 : 1;
      const bSame = b.category === product.category ? 0 : 1;
      return aSame - bSame;
    })
    .slice(0, 4);

  return <ProductDetail product={product} related={related} />;
}
