import type { Metadata } from "next";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { ProfileView } from "@/components/site/profile-view";

export const metadata: Metadata = {
  title: "Your details — Good Zone",
  description: "Your Good Zone profile and saved delivery addresses.",
};

export default function Page() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <ProfileView />
      </main>
      <Footer />
    </>
  );
}
