import type { Metadata } from "next";
import { CompareView } from "@/components/site/compare-view";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";

export const metadata: Metadata = {
  title: "Compare styles — Good Zone",
  description: "Put up to three Good Zone styles side by side.",
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <CompareView />
      </main>
      <Footer />
    </>
  );
}
