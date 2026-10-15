"use client";

import {
  IconArrowLeft,
  IconLock,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "@/lib/account";
import { inr, PRODUCTS } from "@/lib/catalog";
import { COD_LIMIT, findCoupon, totals } from "@/lib/commerce";
import { type CartLine, useStore } from "@/lib/stores";

type Method = "standard" | "express" | "store";

const METHODS: {
  id: Method;
  label: string;
  note: string;
  days: string;
  price: number;
}[] = [
  {
    id: "standard",
    label: "Standard",
    note: "All serviceable pincodes",
    days: "2–4 days",
    price: 79,
  },
  {
    id: "express",
    label: "Express",
    note: "Metro pincodes only",
    days: "1–2 days",
    price: 149,
  },
  {
    id: "store",
    label: "Collect from a store",
    note: "Bengaluru, Hyderabad, Chennai, Pune",
    days: "Same day",
    price: 0,
  },
];

type Errors = Partial<
  Record<"name" | "phone" | "email" | "address" | "pin" | "city", string>
>;

/**
 * Checkout.
 *
 * The form is real and validated, but nothing is submitted anywhere — pressing
 * the button writes a fabricated order to storage and moves to the confirmation
 * page. That is the seam the backend drops into: replace `placeOrder` with a
 * real call and the confirmation page becomes a real confirmation.
 *
 * Card details are deliberately not collected. Taking a card number in a form
 * with no payment gateway behind it is how you end up with someone's full card
 * sitting in your own database. Cash on delivery and UPI-at-delivery are the
 * honest options for a shop with no processor yet.
 */
export function CheckoutView() {
  const router = useRouter();
  const { cart, hydrated, clearCart } = useStore();
  const { placeOrder: saveOrder } = useAccount();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [pin, setPin] = useState("");
  const [city, setCity] = useState("");
  const [method, setMethod] = useState<Method>("standard");
  const [cod, setCod] = useState(true);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<ReturnType<typeof findCoupon>>();
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const paid = cart.filter((l) => !l.saved);
  const base = totals(
    paid.map((l) => {
      const p = cartProduct(l);
      return { price: p?.price ?? 0, qty: l.qty };
    }),
    applied ?? undefined,
  );
  const chosen = METHODS.find((m) => m.id === method) ?? METHODS[0];
  const shipping = base.shipping === 0 ? 0 : chosen.price;
  const grand = base.total - base.shipping + shipping;
  const codOk = grand <= COD_LIMIT;

  if (!hydrated) return <div className="shell py-10 lg:py-14" />;

  if (paid.length === 0)
    return (
      <div className="shell py-10 lg:py-14">
        <h1 className="t-banner">Checkout</h1>
        <p className="prose mt-5 max-w-prose">Your bag is empty.</p>
        <Link
          href="/shop"
          className="link-draw mt-6 inline-block text-[0.95rem]"
        >
          Browse the catalogue
        </Link>
      </div>
    );

  const validate = (): boolean => {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = "We need a name for the delivery.";
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, "")))
      e.phone = "A 10-digit mobile number, so the courier can call.";
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = "For the order confirmation.";
    if (method !== "store") {
      if (address.trim().length < 6) e.address = "Flat, building, street.";
      if (!/^\d{6}$/.test(pin)) e.pin = "Six digits.";
      if (city.trim().length < 2) e.city = "Required for delivery.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) {
      toast.error("Check the highlighted fields", {
        description: "The courier needs these to reach you.",
      });
      return;
    }
    setBusy(true);

    // The seam. `placeOrder` is the single call to replace with a real API
    // request; everything downstream reads from the same shapes.
    const order = saveOrder({
      name,
      phone,
      email,
      address,
      pin,
      city,
      method,
      cod: cod && codOk,
      coupon: applied?.code,
      lines: paid,
      totals: { ...base, shipping, total: grand },
    });
    clearCart();
    router.push(`/checkout/success?order=${order.id}`);
  };

  return (
    <div className="shell py-10 lg:py-14">
      <Link
        href="/cart"
        className="link-draw inline-flex items-center gap-1.5 text-[0.82rem]"
      >
        <IconArrowLeft size={14} stroke={1.6} />
        Back to bag
      </Link>
      <h1 className="t-banner mt-6">Checkout</h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="space-y-12 lg:col-span-7">
          {/* Contact */}
          <section>
            <h2 className="t-h3">Contact</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field id="f-name" label="Full name" error={errors.name}>
                <input
                  id="f-name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? `f-name-error` : undefined}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className={inputCls(!!errors.name)}
                />
              </Field>
              <Field id="f-phone" label="Mobile" error={errors.phone}>
                <input
                  id="f-phone"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? `f-phone-error` : undefined}
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  inputMode="numeric"
                  autoComplete="tel"
                  className={inputCls(!!errors.phone)}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field id="f-email" label="Email" error={errors.email}>
                  <input
                    id="f-email"
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? `f-email-error` : undefined
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    className={inputCls(!!errors.email)}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Delivery */}
          <section>
            <h2 className="t-h3">Delivery</h2>
            <div className="mt-6 space-y-3">
              {METHODS.map((m) => (
                <label
                  key={m.id}
                  htmlFor={`method-${m.id}`}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 border p-4 transition-colors",
                    method === m.id
                      ? "border-[color:var(--ink)]"
                      : "border-[color:var(--line-2)] hover:border-[color:var(--ink)]",
                  )}
                >
                  <input
                    id={`method-${m.id}`}
                    type="radio"
                    name="method"
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                    className="mt-1"
                  />
                  <span className="flex-1">
                    <span className="block text-[0.95rem] font-medium">
                      {m.label}
                    </span>
                    <span className="block text-[0.8rem] text-[color:var(--ink-3)]">
                      {m.note} · {m.days}
                    </span>
                  </span>
                  <span className="num text-[0.9rem]">
                    {m.price === 0 ? "Free" : `₹${m.price}`}
                  </span>
                </label>
              ))}
            </div>

            {method !== "store" && (
              <div className="mt-6 grid gap-5 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <Field id="f-address" label="Address" error={errors.address}>
                    <input
                      id="f-address"
                      aria-invalid={!!errors.address}
                      aria-describedby={
                        errors.address ? `f-address-error` : undefined
                      }
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      autoComplete="street-address"
                      placeholder="Flat, building, street, area"
                      className={inputCls(!!errors.address)}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-4">
                  <Field id="f-pin" label="Pincode" error={errors.pin}>
                    <input
                      id="f-pin"
                      aria-invalid={!!errors.pin}
                      aria-describedby={errors.pin ? `f-pin-error` : undefined}
                      value={pin}
                      onChange={(e) =>
                        setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      inputMode="numeric"
                      autoComplete="postal-code"
                      className={inputCls(!!errors.pin)}
                    />
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field id="f-city" label="City" error={errors.city}>
                    <input
                      id="f-city"
                      aria-invalid={!!errors.city}
                      aria-describedby={
                        errors.city ? `f-city-error` : undefined
                      }
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      autoComplete="address-level2"
                      className={inputCls(!!errors.city)}
                    />
                  </Field>
                </div>
              </div>
            )}
          </section>

          {/* Payment */}
          <section>
            <h2 className="t-h3">Payment</h2>
            <div className="mt-6 space-y-3">
              <label
                htmlFor="pay-cod"
                className={cn(
                  "flex cursor-pointer items-start gap-3 border p-4 transition-colors",
                  cod && codOk
                    ? "border-[color:var(--ink)]"
                    : "border-[color:var(--line-2)] opacity-55",
                )}
              >
                <input
                  id="pay-cod"
                  type="radio"
                  name="pay"
                  checked={cod && codOk}
                  disabled={!codOk}
                  onChange={() => setCod(true)}
                  className="mt-1"
                />
                <span className="flex-1">
                  <span className="block text-[0.95rem] font-medium">
                    Cash on delivery
                  </span>
                  <span className="block text-[0.8rem] text-[color:var(--ink-3)]">
                    {codOk
                      ? "Pay the courier when it arrives."
                      : `Not available over ${inr(COD_LIMIT)}.`}
                  </span>
                </span>
              </label>

              <label
                htmlFor="pay-upi"
                className={cn(
                  "flex cursor-pointer items-start gap-3 border p-4 transition-colors",
                  !cod && "border-[color:var(--ink)]",
                  codOk
                    ? "border-[color:var(--line-2)]"
                    : "border-[color:var(--ink)]",
                )}
              >
                <input
                  id="pay-upi"
                  type="radio"
                  name="pay"
                  checked={!cod}
                  onChange={() => setCod(false)}
                  className="mt-1"
                />
                <span className="flex-1">
                  <span className="block text-[0.95rem] font-medium">UPI</span>
                  <span className="block text-[0.8rem] text-[color:var(--ink-3)]">
                    Pay on delivery by UPI. A payment link is sent with the
                    order confirmation.
                  </span>
                </span>
              </label>
            </div>

            <p className="mt-4 flex items-start gap-2 text-[0.8rem] text-[color:var(--ink-3)]">
              <IconLock size={14} stroke={1.5} className="mt-0.5 shrink-0" />
              We do not take card details. Both options are settled when the
              parcel reaches you.
            </p>
          </section>
        </div>

        {/* Summary */}
        <div className="lg:col-span-5">
          <div className="border border-[color:var(--line-2)] p-6">
            <h2 className="t-h3">Your order</h2>

            <ul className="mt-5 space-y-3 border-b border-[color:var(--line)] pb-5">
              {paid.map((l) => {
                const p = cartProduct(l);
                if (!p) return null;
                return (
                  <li key={l.key} className="flex gap-3">
                    <span className="relative aspect-4/5 w-14 shrink-0 overflow-hidden bg-[color:var(--paper-3)]">
                      <Image
                        src={p.image}
                        alt=""
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                      <span className="num absolute top-0 right-0 bg-[color:var(--ink)] px-1.5 text-[0.65rem] text-[color:var(--paper)]">
                        {l.qty}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1 text-[0.85rem]">
                      <span className="block truncate">{p.name}</span>
                      <span className="block text-[0.78rem] text-[color:var(--ink-3)]">
                        {l.color} · {l.size}
                      </span>
                    </span>
                    <span className="num text-[0.85rem]">
                      {inr(p.price * l.qty)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const found = findCoupon(code);
                if (found) {
                  setApplied(found);
                  toast.success(`${found.code} applied`, {
                    description: found.note,
                  });
                } else {
                  toast.error(
                    `“${code.trim().toUpperCase()}” is not a code we recognise`,
                  );
                }
              }}
              className="mt-5 flex gap-2"
            >
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Discount code"
                aria-label="Discount code"
                className="min-w-0 flex-1 border border-[color:var(--line-2)] px-3 py-2.5 text-[0.85rem] uppercase outline-none focus:border-[color:var(--ink)]"
              />
              <button
                type="submit"
                className="border border-[color:var(--ink)] px-4 text-[0.85rem] transition-colors hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)]"
              >
                Apply
              </button>
            </form>

            <dl className="mt-6 space-y-2.5 border-t border-[color:var(--line)] pt-5 text-[0.9rem]">
              <Row label="Subtotal" value={inr(base.subtotal)} />
              {base.discount > 0 && (
                <Row
                  label={`Discount (${applied?.code})`}
                  value={`−${inr(base.discount)}`}
                  accent
                />
              )}
              <Row
                label={`Delivery · ${chosen.label}`}
                value={shipping === 0 ? "Free" : inr(shipping)}
              />
              <Row label="GST (5%)" value={inr(base.tax)} />
              <div className="flex items-baseline justify-between border-t border-[color:var(--line)] pt-3 text-[1.05rem]">
                <dt className="font-medium">Total</dt>
                <dd className="num">{inr(grand)}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="mt-6 w-full rounded-4xl bg-[color:var(--ink)] px-8 py-4 text-sm font-medium text-[color:var(--paper)] disabled:opacity-50"
            >
              Place order — {inr(grand)}
            </button>

            <p className="mt-4 flex items-start gap-2 text-[0.8rem] text-[color:var(--ink-3)]">
              <IconTruckDelivery
                size={14}
                stroke={1.5}
                className="mt-0.5 shrink-0"
              />
              {chosen.days}. 15 days to exchange once it reaches you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[color:var(--ink-2)]">{label}</dt>
      <dd className={cn("num", accent && "text-[color:var(--sale)]")}>
        {value}
      </dd>
    </div>
  );
}

/** Labelled input. The error is wired up with aria-describedby, not just shown. */
function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="label text-[color:var(--ink-3)]">
        {label}
      </label>
      <div className="mt-2">{children}</div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-[0.8rem] text-[color:var(--sale)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}

const inputCls = (bad: boolean) =>
  cn(
    "w-full border px-3 py-3 text-[0.95rem] outline-none transition-colors focus:border-[color:var(--ink)]",
    bad ? "border-[color:var(--sale)]" : "border-[color:var(--line-2)]",
  );

/** Reads a product off a cart line without importing the whole catalogue map. */
function cartProduct(line: CartLine) {
  return PRODUCTS.find((p) => p.id === line.productId);
}
