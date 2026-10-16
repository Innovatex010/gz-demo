import type { Metadata } from "next";
import { ProductsView } from "@/components/admin/products-view";

export const metadata: Metadata = {
  title: "Products — Good Zone desk",
};

export default function ProductsPage() {
  return <ProductsView />;
}
