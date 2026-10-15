import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { ProductGrid } from "@/components/site/product-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  COLLECTIONS,
  collectionBySlug,
  productsInCollection,
} from "@/lib/commerce";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = collectionBySlug(slug);
  if (!c) return { title: "Not found — Good Zone" };
  return { title: `${c.title} — Good Zone`, description: c.blurb };
}

export default function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* params is read inside the boundary so the shell streams immediately
            instead of blocking on the URL */}
        <Suspense fallback={<div className="shell py-10 lg:py-14" />}>
          <CollectionBody params={params} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function CollectionBody({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = collectionBySlug(slug);
  if (!collection) notFound();

  const products = productsInCollection(slug);

  return (
    <div className="shell py-10 lg:py-14">
      <Breadcrumb>
        <BreadcrumbList className="text-[0.8rem] text-[color:var(--ink-3)]">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/collections">Collections</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-[color:var(--ink-2)]">
              {collection.title}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <h1 className="t-banner">{collection.title}</h1>
          <p className="prose mt-5 max-w-prose">{collection.blurb}</p>
        </div>
        <div className="relative aspect-3/2 overflow-hidden bg-[color:var(--paper-3)] lg:col-span-5">
          <Image
            src={collection.image}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="mt-14 border-t border-[color:var(--line)] pt-6">
        <ProductGrid
          products={products}
          className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6"
          emptyNote="This collection is empty right now."
        />
      </div>
    </div>
  );
}
