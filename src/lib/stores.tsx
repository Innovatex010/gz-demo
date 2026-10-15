"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { PRODUCTS, type Product, productById } from "./catalog";
import { maxSelectable } from "./commerce";

/* ────────────────────────────────────────────────────────────────────────────
   Client-side stores.

   Everything here is localStorage. That is a deliberate, temporary choice, not
   a permanent one: it makes the whole shopping journey clickable and testable
   with no backend, and it gives us the real shapes to design the API against.
   It also has the obvious limits — no sync across devices, no server render of
   cart contents, and a cleared key on a private tab looks like an empty basket.
   Swap the read/write in these four hooks for API calls and nothing above them
   has to change.
   ──────────────────────────────────────────────────────────────────────────── */

const KEYS = {
  cart: "gz.cart",
  wishlist: "gz.wishlist",
  recent: "gz.recent",
  compare: "gz.compare",
} as const;

const RECENT_MAX = 8;
const COMPARE_MAX = maxSelectable;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode, quota, or a serialiser that choked. Not worth a crash. */
  }
}

/** Only touch storage once mounted, so server and client markup agree. */
function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  // Every call site passes a fresh literal, so it cannot go in the dependency
  // list without re-running the effect on every render. A ref keeps the first
  // one and drops the lint suppression.
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  useEffect(() => {
    setValue(read(key, fallbackRef.current));
    setHydrated(true);
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        write(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [value, update, hydrated] as const;
}

/* ── cart ─────────────────────────────────────────────────────────────────── */

export type CartLine = {
  /** `${productId}::${size}::${color}` — a stable key for one variant. */
  key: string;
  productId: string;
  size: string;
  color: string;
  qty: number;
  /** Saved-for-later lines stay in the basket but are not paid for. */
  saved: boolean;
};

export const lineKey = (productId: string, size: string, color: string) =>
  `${productId}::${size}::${color}`;

/* ── context ─────────────────────────────────────────────────────────────── */

type Store = {
  hydrated: boolean;

  cart: CartLine[];
  cartCount: number;
  addToCart: (
    product: Product,
    size: string,
    color: string,
    qty?: number,
  ) => void;
  setQty: (key: string, qty: number) => void;
  setSaved: (key: string, saved: boolean) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;

  wishlist: string[];
  toggleWishlist: (product: Product) => boolean;
  inWishlist: (id: string) => boolean;

  recent: string[];
  markViewed: (id: string) => void;

  compare: string[];
  toggleCompare: (product: Product) => boolean;
  inCompare: (id: string) => boolean;
  clearCompare: () => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart, cartReady] = useStored<CartLine[]>(KEYS.cart, []);
  const [wishlist, setWishlist, wishlistReady] = useStored<string[]>(
    KEYS.wishlist,
    [],
  );
  const [recent, setRecent, recentReady] = useStored<string[]>(KEYS.recent, []);
  const [compare, setCompare, compareReady] = useStored<string[]>(
    KEYS.compare,
    [],
  );

  // Only true once every key has actually been read back. Anything rendered off
  // `hydrated` would otherwise flash an empty basket to someone who has one.
  const hydrated = cartReady && wishlistReady && recentReady && compareReady;

  /* cart ---------------------------------------------------------------- */

  const addToCart = useCallback<Store["addToCart"]>(
    (product, size, color, qty = 1) => {
      const key = lineKey(product.id, size, color);
      let added = false;
      setCart((prev) => {
        const found = prev.find((l) => l.key === key);
        added = !found;
        if (found)
          return prev.map((l) =>
            l.key === key
              ? { ...l, qty: Math.min(10, l.qty + qty), saved: false }
              : l,
          );
        return [
          ...prev,
          { key, productId: product.id, size, color, qty, saved: false },
        ];
      });
      return added;
    },
    [setCart],
  );

  const setQty = useCallback<Store["setQty"]>(
    (key, qty) =>
      setCart((prev) =>
        qty <= 0
          ? prev.filter((l) => l.key !== key)
          : prev.map((l) =>
              l.key === key ? { ...l, qty: Math.min(10, qty) } : l,
            ),
      ),
    [setCart],
  );

  const setSaved = useCallback<Store["setSaved"]>(
    (key, saved) =>
      setCart((prev) => prev.map((l) => (l.key === key ? { ...l, saved } : l))),
    [setCart],
  );

  const removeLine = useCallback<Store["removeLine"]>(
    (key) => setCart((prev) => prev.filter((l) => l.key !== key)),
    [setCart],
  );

  const clearCart = useCallback(() => setCart([]), [setCart]);

  /* wishlist ------------------------------------------------------------ */

  const toggleWishlist = useCallback<Store["toggleWishlist"]>(
    (product) => {
      let nowSaved = false;
      setWishlist((prev) => {
        nowSaved = !prev.includes(product.id);
        return nowSaved
          ? [product.id, ...prev]
          : prev.filter((id) => id !== product.id);
      });
      return nowSaved;
    },
    [setWishlist],
  );

  const inWishlist = useCallback(
    (id: string) => wishlist.includes(id),
    [wishlist],
  );

  /* recently viewed ------------------------------------------------------ */

  const markViewed = useCallback<Store["markViewed"]>(
    (id) =>
      setRecent((prev) =>
        [id, ...prev.filter((x) => x !== id)].slice(0, RECENT_MAX),
      ),
    [setRecent],
  );

  /* compare -------------------------------------------------------------- */

  const toggleCompare = useCallback<Store["toggleCompare"]>(
    (product) => {
      let added = false;
      setCompare((prev) => {
        if (prev.includes(product.id)) {
          added = false;
          return prev.filter((id) => id !== product.id);
        }
        if (prev.length >= COMPARE_MAX) {
          added = false;
          toast(
            `You can compare ${COMPARE_MAX} styles at a time. Remove one first.`,
            {
              description: "Three is the most that stays readable on a phone.",
            },
          );
          return prev;
        }
        added = true;
        return [...prev, product.id];
      });
      return added;
    },
    [setCompare],
  );

  const inCompare = useCallback(
    (id: string) => compare.includes(id),
    [compare],
  );

  const clearCompare = useCallback(() => setCompare([]), [setCompare]);

  const cartCount = useMemo(
    () => cart.filter((l) => !l.saved).reduce((n, l) => n + l.qty, 0),
    [cart],
  );

  const value = useMemo<Store>(
    () => ({
      hydrated,
      cart,
      cartCount,
      addToCart,
      setQty,
      setSaved,
      removeLine,
      clearCart,
      wishlist,
      toggleWishlist,
      inWishlist,
      recent,
      markViewed,
      compare,
      toggleCompare,
      inCompare,
      clearCompare,
    }),
    [
      hydrated,
      cart,
      cartCount,
      addToCart,
      setQty,
      setSaved,
      removeLine,
      clearCart,
      wishlist,
      toggleWishlist,
      inWishlist,
      recent,
      markViewed,
      compare,
      toggleCompare,
      inCompare,
      clearCompare,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside <StoreProvider>");
  return s;
}

/* ── selectors ───────────────────────────────────────────────────────────── */

/** Hydrates ids to products and drops anything no longer in the catalogue. */
export const resolveProducts = (ids: string[]): Product[] =>
  ids.map(productById).filter((p): p is Product => Boolean(p));

/** The paid-for lines, with their products resolved. */
export const paidLines = (cart: CartLine[]) =>
  cart
    .filter((l) => !l.saved)
    .map((l) => ({ line: l, product: productById(l.productId) }))
    .filter((x): x is { line: CartLine; product: Product } =>
      Boolean(x.product),
    );

export const ALL_PRODUCT_IDS = PRODUCTS.map((p) => p.id);
