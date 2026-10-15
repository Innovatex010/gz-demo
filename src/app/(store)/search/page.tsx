import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { SearchResults } from "./search-results";

export const metadata: Metadata = {
  title: "Search — Good Zone",
  description: "Search Good Zone shirts, t-shirts, pants and trousers.",
};

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* searchParams is read inside the boundary so the shell streams first */}
        <Suspense fallback={<div className="shell py-10 lg:py-14" />}>
          <SearchBody searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function SearchBody({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <SearchResults query={typeof q === "string" ? q : ""} />;
}
