import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = {
  title: {
    default: "The desk — Good Zone",
    template: "%s — Good Zone desk",
  },
  description: "Stock, orders and storefront for the Good Zone shop.",
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return <AdminShell>{children}</AdminShell>;
}
