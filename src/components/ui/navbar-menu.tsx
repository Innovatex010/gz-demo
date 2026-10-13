"use client";

import { cn } from "cn";
import { motion } from "motion/react";
import type React from "react";

/**
 * Registry: @aceternity/navbar-menu — repointed. The demo pill nav and the
 * spring-scale popover are replaced with a panel that unfolds from the item
 * itself, and the product rows carry garment flats instead of stock photos.
 */
export const MenuItem = ({
  setActive,
  active,
  item,
  children,
  className,
  panelClassName,
}: {
  setActive: (item: string | null) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
  className?: string;
  panelClassName?: string;
}) => (
  /* biome-ignore lint/a11y/noStaticElementInteractions: hover/focus only open a
     visual panel; the button below is the real control */
  <div
    role="presentation"
    onMouseEnter={() => setActive(item)}
    onFocus={() => setActive(item)}
    className={cn("relative", className)}
  >
    <motion.button
      type="button"
      aria-expanded={active === item}
      onClick={() => setActive(active === item ? null : item)}
      transition={{ duration: 0.3 }}
      className="cursor-pointer text-current hover:opacity-70"
    >
      {item}
    </motion.button>
    {active === item && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "absolute left-0 top-[calc(100%+0.9rem)] z-50",
          panelClassName,
        )}
      >
        {children}
      </motion.div>
    )}
  </div>
);

export const Menu = ({
  setActive,
  children,
  className,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <nav
    onMouseLeave={() => setActive(null)}
    className={cn("relative flex items-center gap-7 text-current", className)}
  >
    {children}
  </nav>
);

/** A row in the shop dropdown: the category flat, its name, and how many are in it. */
export const ProductItem = ({
  title,
  description,
  href,
  flat,
}: {
  title: string;
  description: string;
  href: string;
  flat: React.ReactNode;
}) => (
  <a
    href={href}
    className="flex items-center gap-4 border-b border-current/15 py-3.5 transition-opacity hover:opacity-60"
  >
    <span className="flex size-12 shrink-0 items-center justify-center bg-[color:var(--indigo)]/30">
      {flat}
    </span>
    <span className="block">
      <span className="block text-sm font-medium">{title}</span>
      <span className="data-mark block pt-1 opacity-55">{description}</span>
    </span>
  </a>
);
