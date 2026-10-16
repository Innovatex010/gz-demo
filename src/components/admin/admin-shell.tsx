"use client";

import {
  IconArrowLeft,
  IconLayoutBoardSplit,
  IconLayoutDashboard,
  IconPackage,
  IconSearch,
  IconSettings,
  IconShirt,
  IconUsers,
} from "@tabler/icons-react";
import { cn } from "cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LOW_STOCK } from "@/lib/admin-books";
import { AS_OF_LABEL, countByStatus } from "@/lib/admin-data";

/* ────────────────────────────────────────────────────────────────────────────
   THE BACK OF THE SHOP
   The rail is the ink ground the storefront keeps for its dark bands — step
   behind the counter and the whole shell changes tone, so you always know
   which mode you are in. Content stays on paper.
   ──────────────────────────────────────────────────────────────────────────── */

const NAV = [
  { href: "/admin", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: IconPackage },
  { href: "/admin/products", label: "Products", icon: IconShirt },
  {
    href: "/admin/storefront",
    label: "Storefront",
    icon: IconLayoutBoardSplit,
  },
  { href: "/admin/customers", label: "Customers", icon: IconUsers },
  { href: "/admin/settings", label: "Settings", icon: IconSettings },
] as const;

/** Work waiting on the desk: paid orders not yet confirmed, and sizes that
    have run out. Counts, not decoration — each one is a row on a page. */
function useBadges() {
  const needsOrders =
    countByStatus("placed") +
    countByStatus("confirmed") +
    countByStatus("packed");
  const outOfStock = LOW_STOCK.filter((r) => r.stock <= 0).length;
  return {
    "/admin/orders": needsOrders,
    "/admin/products": outOfStock,
  } as Record<string, number>;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const badges = useBadges();

  return (
    <nav className="flex flex-col gap-0.5" aria-label="Admin sections">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active =
          href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        const badge = badges[href];
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 px-3 py-2.5 text-[0.9rem] transition-colors",
              active
                ? "bg-[color:var(--paper)]/10 text-[color:var(--paper)]"
                : "text-[color:var(--on-ink-muted)] hover:bg-[color:var(--paper)]/5 hover:text-[color:var(--paper)]",
            )}
          >
            {/* The indigo tick is the only coloured thing in the rail */}
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 transition-opacity",
                active
                  ? "bg-[color:var(--indigo)] opacity-100"
                  : "opacity-0 group-hover:opacity-40",
              )}
            />
            <Icon size={18} stroke={1.6} />
            {label}
            {badge ? (
              <span className="num ml-auto text-[0.75rem] text-[color:var(--paper)]/70">
                {badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function Rail({ className }: { className?: string }) {
  return (
    <div
      className={cn("on-ink flex h-full flex-col gap-6 px-4 py-6", className)}
    >
      <div className="px-1">
        <Link href="/admin" className="block">
          <span className="font-display text-[1.35rem] leading-none tracking-tight text-[color:var(--paper)]">
            Good Zone
          </span>
          <span className="mt-1.5 block text-[0.7rem] text-[color:var(--on-ink-muted)]">
            Behind the counter
          </span>
        </Link>
      </div>

      <NavLinks />

      <div className="mt-auto flex flex-col gap-4">
        <div className="border-t border-[color:var(--on-ink-line)] pt-4">
          <p className="text-[0.8rem] text-[color:var(--paper)]">
            Ravi Kulkarni
          </p>
          <p className="text-[0.72rem] text-[color:var(--on-ink-muted)]">
            Owner · full access
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-2 px-1 text-[0.8rem] text-[color:var(--on-ink-muted)] transition-colors hover:text-[color:var(--paper)]"
        >
          <IconArrowLeft size={15} stroke={1.6} />
          Back to the shop
        </Link>
      </div>
    </div>
  );
}

function TopSearch() {
  const [q, setQ] = useState("");
  return (
    <search className="relative hidden sm:block">
      <form action="/admin/orders" method="get">
        <label htmlFor="admin-search" className="sr-only">
          Search orders
        </label>
        <IconSearch
          size={15}
          stroke={1.6}
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[color:var(--ink-3)]"
        />
        <Input
          id="admin-search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search orders by name, id or city"
          className="w-[19rem] rounded-none border-0 border-b border-[color:var(--line-2)] bg-transparent pl-9 shadow-none focus-visible:border-[color:var(--indigo)] focus-visible:ring-0"
        />
      </form>
    </search>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // The mobile drawer shares the rail; close it whenever the route changes.
  const pathname = usePathname();
  /* biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the
     trigger, not a value the callback reads — the drawer must close on every
     navigation, and the route itself is what changes */
  useEffect(() => setOpen(false), [pathname]);
  return (
    <div className="min-h-svh bg-[color:var(--paper)] lg:grid lg:grid-cols-[15rem_1fr]">
      {/* Desktop rail */}
      <aside className="on-ink sticky top-0 hidden h-svh lg:block">
        <Rail />
      </aside>

      <div className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[color:var(--line)] bg-[color:var(--paper)]/95 px-4 backdrop-blur lg:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="lg:hidden"
                aria-label="Open the admin menu"
              >
                <IconLayoutBoardSplit size={18} stroke={1.6} />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="on-ink w-[15rem] gap-0 rounded-none border-none p-0"
            >
              <SheetTitle className="sr-only">Admin menu</SheetTitle>
              <Rail />
            </SheetContent>
          </Sheet>

          <Link
            href="/"
            className="flex items-center gap-2 text-[0.85rem] text-[color:var(--ink-2)] transition-colors hover:text-[color:var(--ink)] lg:hidden"
          >
            <IconArrowLeft size={15} stroke={1.6} />
            The shop
          </Link>

          <TopSearch />

          <p className="ml-auto hidden text-[0.78rem] text-[color:var(--ink-3)] md:block">
            Stock and sales as of {AS_OF_LABEL}
          </p>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
