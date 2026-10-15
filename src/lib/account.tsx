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
import { inr, PRODUCTS, type Product } from "./catalog";
import { COD_LIMIT, findCoupon, totals } from "./commerce";

/* ────────────────────────────────────────────────────────────────────────────
   Orders and profile.

   Orders are written locally when checkout completes, and read back here. That
   is enough for order history, tracking and addresses to be real interfaces
   today rather than mock-ups — and it means the shapes below are the ones the
   API will have to return.

   The honest limitation: an order only exists on the device that placed it.
   Someone who checks order history on their phone after ordering on a laptop
   sees nothing, and that will not be fixed until this is server-side.
   ──────────────────────────────────────────────────────────────────────────── */

export type OrderLine = {
  key: string;
  productId: string;
  size: string;
  color: string;
  qty: number;
};

export type Order = {
  id: string;
  placedAt: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  pin: string;
  city: string;
  method: "standard" | "express" | "store";
  cod: boolean;
  coupon?: string;
  lines: OrderLine[];
  totals: {
    subtotal: number;
    shipping: number;
    discount: number;
    tax: number;
    total: number;
  };
};

export type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  pin: string;
  default: boolean;
};

const KEYS = {
  orders: "gz.orders",
  profile: "gz.profile",
  addresses: "gz.addresses",
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or full quota — not worth breaking checkout over */
  }
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

  // Every call site passes a fresh literal, so it cannot go in the dependency
  // list without re-running on every render. A ref keeps the first one.
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  useEffect(() => {
    setValue(read(key, fallbackRef.current));
    setReady(true);
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

  return [value, update, ready] as const;
}

export type Profile = {
  name: string;
  email: string;
  phone: string;
};

type Account = {
  hydrated: boolean;

  orders: Order[];
  placeOrder: (input: Omit<Order, "id" | "placedAt">) => Order;
  orderById: (id: string) => Order | undefined;

  profile: Profile;
  setProfile: (p: Profile) => void;

  addresses: Address[];
  addAddress: (a: Omit<Address, "id">) => void;
  updateAddress: (id: string, a: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  makeDefault: (id: string) => void;

  products: Record<string, Product>;
};

const Ctx = createContext<Account | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders, ordersReady] = useStored<Order[]>(KEYS.orders, []);
  const [profile, setProfileRaw, profileReady] = useStored<Profile>(
    KEYS.profile,
    { name: "", email: "", phone: "" },
  );
  const [addresses, setAddresses, addrReady] = useStored<Address[]>(
    KEYS.addresses,
    [],
  );

  const placeOrder = useCallback<Account["placeOrder"]>(
    (input) => {
      const order: Order = {
        ...input,
        id: `GZ${Date.now().toString().slice(-8)}`,
        placedAt: new Date().toISOString(),
      };
      setOrders((prev) => [order, ...prev]);
      // Seed the profile from the first order, so /account is not empty after
      // a first purchase without anyone having to retype their own details.
      setProfileRaw((prev) =>
        prev.name
          ? prev
          : { name: order.name, email: order.email, phone: order.phone },
      );
      setAddresses((prev) => {
        if (prev.length > 0 || !order.address) return prev;
        return [
          {
            id: `addr_${Date.now()}`,
            label: "Home",
            name: order.name,
            phone: order.phone,
            line1: order.address,
            city: order.city,
            pin: order.pin,
            default: true,
          },
        ];
      });
      return order;
    },
    [setOrders, setProfileRaw, setAddresses],
  );

  const orderById = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders],
  );

  const setProfile = useCallback<Account["setProfile"]>(
    (p) => setProfileRaw(p),
    [setProfileRaw],
  );

  const addAddress = useCallback<Account["addAddress"]>(
    (a) =>
      setAddresses((prev) => [
        ...prev.map((x) => (a.default ? { ...x, default: false } : x)),
        { ...a, id: `addr_${Date.now()}` },
      ]),
    [setAddresses],
  );

  const updateAddress = useCallback<Account["updateAddress"]>(
    (id, patch) =>
      setAddresses((prev) =>
        prev.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      ),
    [setAddresses],
  );

  const removeAddress = useCallback<Account["removeAddress"]>(
    (id) =>
      setAddresses((prev) => {
        const next = prev.filter((a) => a.id !== id);
        // Never leave the list with no default while entries remain.
        if (next.length > 0 && !next.some((a) => a.default))
          next[0] = { ...next[0], default: true };
        return next;
      }),
    [setAddresses],
  );

  const makeDefault = useCallback<Account["makeDefault"]>(
    (id) =>
      setAddresses((prev) => prev.map((a) => ({ ...a, default: a.id === id }))),
    [setAddresses],
  );

  const products = useMemo(
    () => Object.fromEntries(PRODUCTS.map((p) => [p.id, p])),
    [],
  );

  const value = useMemo<Account>(
    () => ({
      hydrated: ordersReady && profileReady && addrReady,
      orders,
      placeOrder,
      orderById,
      profile,
      setProfile,
      addresses,
      addAddress,
      updateAddress,
      removeAddress,
      makeDefault,
      products,
    }),
    [
      ordersReady,
      profileReady,
      addrReady,
      orders,
      placeOrder,
      orderById,
      profile,
      setProfile,
      addresses,
      addAddress,
      updateAddress,
      removeAddress,
      makeDefault,
      products,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAccount() {
  const a = useContext(Ctx);
  if (!a) throw new Error("useAccount must be used inside <AccountProvider>");
  return a;
}

/** Recomputes an order's totals. Used if shipping or tax rules change. */
export function recalculate(order: Order): Order {
  const lines = order.lines.map((l) => {
    const p = PRODUCTS.find((x) => x.id === l.productId);
    return { price: p?.price ?? 0, qty: l.qty };
  });
  const coupon = order.coupon ? findCoupon(order.coupon) : undefined;
  return { ...order, totals: totals(lines, coupon ?? null) };
}

export { inr, COD_LIMIT };
