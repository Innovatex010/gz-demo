import type { Metadata } from "next";
import { StorefrontView } from "@/components/admin/storefront-view";

export const metadata: Metadata = {
  title: "Storefront — Good Zone desk",
};

export default function StorefrontPage() {
  return <StorefrontView />;
}
