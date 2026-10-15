import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { ProductDetail } from "@/components/site/product-detail";
import { PRODUCTS, productById } from "@/lib/catalog";
import { completeTheLook, relatedTo } from "@/lib/commerce";

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

  // Same category first, then anything sharing a colourway. "Complete the
  // look" is a different job — it deliberately crosses categories to fill in
  // the rest of the outfit rather than showing more of the same thing.
  const related = relatedTo(product, 4);
  const complete = completeTheLook(product, 3);

  return (
    <ProductDetail product={product} related={related} complete={complete} />
  );
}
