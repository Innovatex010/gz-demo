import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { WishlistView } from "@/components/site/wishlist-view";

export const metadata: Metadata = {
  title: "Saved styles — Good Zone",
  description: "The Good Zone styles you have saved for later.",
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <WishlistView />
      </main>
      <Footer />
    </>
  );
}
