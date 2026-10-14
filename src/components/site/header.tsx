"use client";

import {
  IconHeart,
  IconSearch,
  IconShoppingBag,
  IconX,
} from "@tabler/icons-react";
import { cn } from "cn";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ScrollProgress } from "@/components/ui/moving-line";
import { Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu";
import { CATEGORIES, PRODUCTS } from "@/lib/catalog";

const NAV = [
  { label: "New in", href: "/shop" },
  { label: "Shirts", href: "/shop?c=full-sleeve" },
  { label: "T-shirts", href: "/shop?c=t-shirts" },
  { label: "Pants", href: "/shop?c=pants" },
  { label: "Trousers", href: "/shop?c=trousers" },
  { label: "Offers", href: "/#offers" },
];

export function Header() {
  const { scrollY } = useScroll();
  const [tight, setTight] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useMotionValueEvent(scrollY, "change", (v) => setTight(v > 56));

  useEffect(() => {
    if (search) searchRef.current?.focus();
  }, [search]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* The announcement bar belongs to the header so it scrolls away with it. */}
      <motion.div
        initial={false}
        animate={{ height: tight ? 0 : 38 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="on-ink overflow-hidden"
      >
        <div className="shell flex h-[38px] items-center justify-center gap-2 text-[0.78rem]">
          <span className="truncate">
            Free delivery over ₹1,499
            <span className="mx-2 opacity-40">·</span>
            15-day returns
            <span className="mx-2 hidden opacity-40 sm:inline">·</span>
            <span className="hidden sm:inline">
              Cash on delivery up to ₹10,000
            </span>
          </span>
        </div>
      </motion.div>

      <div
        className={cn(
          "sticky top-0 z-50 bg-[color:var(--paper)] transition-shadow duration-500",
          tight && "shadow-[0_1px_0_0_var(--line)]",
        )}
      >
        <ScrollProgress className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[color:var(--indigo)]" />
        <div
          className={cn(
            "shell flex items-center justify-between gap-6 transition-[height] duration-500",
            tight ? "h-[64px]" : "h-[76px]",
          )}
        >
          <Link
            href="/"
            className="font-display text-[1.55rem] leading-none tracking-[-0.015em]"
          >
            Good Zone
          </Link>

          <Menu
            setActive={setActive}
            className="hidden text-[0.9rem] font-medium lg:flex"
          >
            <MenuItem
              item="Shop"
              setActive={setActive}
              active={active}
              panelClassName="w-[22rem] rounded-sm border border-[color:var(--line-2)] bg-[color:var(--paper)] p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,.4)]"
            >
              {CATEGORIES.map((c) => (
                <ProductItem
                  key={c.id}
                  href={c.href}
                  title={c.label}
                  description={c.tagline}
                  flat={
                    <Image
                      src={c.image}
                      alt=""
                      width={48}
                      height={60}
                      className="size-12 object-cover"
                    />
                  }
                />
              ))}
            </MenuItem>
            {NAV.slice(1).map((n) => (
              <Link key={n.label} href={n.href} className="link-draw py-1">
                {n.label}
              </Link>
            ))}
          </Menu>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearch((v) => !v)}
              aria-label="Search"
              className="grid size-10 place-items-center transition-opacity hover:opacity-60"
            >
              <IconSearch size={20} stroke={1.5} />
            </button>
            <button
              type="button"
              aria-label="Wishlist"
              className="hidden size-10 place-items-center transition-opacity hover:opacity-60 sm:grid"
            >
              <IconHeart size={20} stroke={1.5} />
            </button>
            <button
              type="button"
              aria-label="Bag, 0 items"
              className="relative grid size-10 place-items-center transition-opacity hover:opacity-60"
            >
              <IconShoppingBag size={20} stroke={1.5} />
              <span className="num absolute -top-0.5 -right-0.5 grid size-[18px] place-items-center rounded-full bg-[color:var(--indigo)] text-[0.6rem] text-[color:var(--paper)]">
                0
              </span>
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="ml-1 flex h-10 flex-col items-center justify-center gap-[5px] lg:hidden"
            >
              <span className="block h-px w-5 bg-current" />
              <span className="block h-px w-5 bg-current" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {search && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden border-t border-[color:var(--line)]"
            >
              <div className="shell flex items-center gap-4 py-5">
                <IconSearch
                  size={20}
                  stroke={1.5}
                  className="shrink-0 opacity-50"
                />
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Search shirts, t-shirts, pants, trousers"
                  className="w-full bg-transparent text-lg outline-none placeholder:text-[color:var(--ink-3)]"
                />
                <button
                  type="button"
                  onClick={() => setSearch(false)}
                  aria-label="Close search"
                >
                  <IconX size={20} stroke={1.5} />
                </button>
              </div>
              <div className="shell flex flex-wrap gap-x-6 gap-y-2 pb-5">
                <span className="label text-[color:var(--ink-3)]">Popular</span>
                {[
                  "Linen shirt",
                  "Chino",
                  "Polo",
                  "Half sleeve",
                  "Formal trouser",
                ].map((s) => (
                  <Link
                    key={s}
                    href={`/shop?q=${encodeURIComponent(s)}`}
                    className="link-draw text-sm"
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="on-paper fixed inset-0 z-[60] flex flex-col bg-[color:var(--paper)] lg:hidden"
          >
            <div className="shell flex h-[76px] shrink-0 items-center justify-between">
              <span className="font-display text-[1.55rem] leading-none">
                Good Zone
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <IconX size={22} stroke={1.5} />
              </button>
            </div>

            <motion.nav
              initial="hidden"
              animate="show"
              variants={{
                show: {
                  transition: { staggerChildren: 0.045, delayChildren: 0.08 },
                },
              }}
              className="shell flex flex-1 flex-col justify-center gap-1 pb-24"
            >
              {[
                ...NAV,
                ...CATEGORIES.map((c) => ({ label: c.label, href: c.href })),
              ].map((n, i) => (
                <motion.div
                  key={`${n.label}-${i}`}
                  variants={{
                    hidden: { opacity: 0, y: 18 },
                    show: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="t-h3 block border-b border-[color:var(--line)] py-3"
                  >
                    {n.label}
                  </Link>
                </motion.div>
              ))}
            </motion.nav>

            <div className="shell shrink-0 border-t border-[color:var(--line)] py-5">
              <p className="text-sm text-[color:var(--ink-2)]">
                {PRODUCTS.length} pieces online · Free delivery over ₹1,499
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
