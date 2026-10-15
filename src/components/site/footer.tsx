"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { COLLECTIONS } from "@/lib/commerce";
import { Fade } from "./motion";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "Collections", href: "/collections" },
      ...COLLECTIONS.map((c) => ({
        label: c.title,
        href: `/collections/${c.slug}`,
      })),
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Frequently asked", href: "/faq" },
      { label: "Shipping and delivery", href: "/shipping-policy" },
      { label: "Returns and exchange", href: "/returns-policy" },
      { label: "Track an order", href: "/track-order" },
      { label: "Size guide", href: "/#fit" },
      { label: "Contact us", href: "/contact" },
    ],
  },
  {
    title: "You",
    links: [
      { label: "Your bag", href: "/cart" },
      { label: "Saved styles", href: "/wishlist" },
      { label: "Compare", href: "/compare" },
      { label: "Search", href: "/search" },
    ],
  },
  {
    title: "Good Zone",
    links: [
      { label: "About us", href: "/about" },
      { label: "Lookbook", href: "/lookbook" },
    ],
  },
];
export function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <footer className="on-ink mt-auto">
      {/* Newsletter */}
      <div className="shell grid gap-10 border-b border-[color:var(--on-ink-line)] py-16 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <h2 className="t-h2 text-[color:var(--paper)]">Restock alerts</h2>
          <p className="prose-ink mt-4 text-[0.95rem]">
            We message you when a sold-out size comes back, and once a month
            when something new reaches the site. No offers you did not ask for.
          </p>
        </div>

        <div className="lg:col-span-7">
          <Fade>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-wrap items-end gap-3"
            >
              <div className="min-w-[16rem] flex-1">
                <label
                  htmlFor="newsletter"
                  className="label block text-[color:var(--on-ink-muted)]"
                >
                  Email address
                </label>
                <input
                  id="newsletter"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSent(false);
                  }}
                  placeholder="you@example.com"
                  className="mt-2 w-full border-b border-[color:var(--on-ink-line-2)] bg-transparent pb-2.5 text-lg text-[color:var(--paper)] outline-none placeholder:text-[color:var(--on-ink-muted)]/60 focus:border-[color:var(--paper)]"
                />
              </div>

              <MagneticButton strength={0.2}>
                <StatefulButton
                  id="newsletter"
                  type="submit"
                  onClick={() => {
                    if (email.includes("@")) {
                      setSent(true);
                      toast.success("You're on the restock list", {
                        description: "We'll write when a size comes back.",
                      });
                    }
                  }}
                >
                  Sign up
                </StatefulButton>
              </MagneticButton>
            </form>

            <output className="mt-3 block min-h-5 text-[0.82rem] text-[color:var(--on-ink-muted)]">
              {sent
                ? "Done. We'll write when a size comes back."
                : "We never pass your number to anyone."}
            </output>
          </Fade>
        </div>
      </div>

      {/* Links */}
      <div className="shell grid gap-10 py-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Link
            href="/"
            className="font-display text-[2.4rem] leading-none tracking-[-0.02em]"
          >
            Good Zone
          </Link>
          <p className="mt-4 max-w-[34ch] text-[0.875rem] leading-relaxed text-[color:var(--on-ink-muted)]">
            Shirts, t-shirts, pants and trousers. Made in small runs since 2014,
            sold in eight stores and now, finally, online.
          </p>
          <p className="mt-6 text-[0.82rem] text-[color:var(--on-ink-muted)]">
            Write to us at hello@goodzone.in and a person will answer.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="label text-[color:var(--on-ink-muted)]">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="link-draw text-[0.9rem]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="shell flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--on-ink-line)] py-6 text-[0.78rem] text-[color:var(--on-ink-muted)]"
      >
        <p>© 2026 Good Zone Clothing Pvt. Ltd.</p>
        <div className="flex flex-wrap gap-6">
          <Link href="/privacy-policy" className="link-draw">
            Privacy
          </Link>
          <Link href="/terms" className="link-draw">
            Terms
          </Link>
          <Link href="/shipping-policy" className="link-draw">
            Shipping policy
          </Link>
        </div>
        <p>Made in India</p>
      </motion.div>
    </footer>
  );
}
