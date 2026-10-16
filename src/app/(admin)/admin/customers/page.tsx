import type { Metadata } from "next";
import { CustomersView } from "@/components/admin/customers-view";

export const metadata: Metadata = {
  title: "Customers — Good Zone desk",
};

export default function CustomersPage() {
  return <CustomersView />;
}
