import type { Metadata } from "next";
import { Archivo, Bodoni_Moda } from "next/font/google";
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
      className={`${sans.variable} ${display.variable} antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[color:var(--paper)]">
        {children}
      </body>
    </html>
  );
}
