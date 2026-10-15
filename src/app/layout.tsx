import type { Metadata } from "next";
import { Archivo, Bodoni_Moda } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AccountProvider } from "@/lib/account";
import { StoreProvider } from "@/lib/stores";
import "./globals.css";

const sans = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
  axes: ["wdth"],
  display: "swap",
});

const display = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Good Zone — shirts, t-shirts, pants and trousers",
  description:
    "Good Zone is a clothing brand you can now shop online. Full-sleeve and half-sleeve shirts, t-shirts, pants and trousers, at the same prices as our stores. Free delivery over ₹1,499, 15-day returns.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sans.variable} ${display.variable} antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[color:var(--paper)]">
        <StoreProvider>
          <AccountProvider>{children}</AccountProvider>
        </StoreProvider>
        <Toaster />
      </body>
    </html>
  );
}
