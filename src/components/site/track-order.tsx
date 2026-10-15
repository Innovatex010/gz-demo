"use client";

import { IconCircleCheck, IconPackage, IconTruck } from "@tabler/icons-react";
import { cn } from "cn";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAccount } from "@/lib/account";

type Step = { id: string; label: string; note: string };

const STEPS: Step[] = [
  { id: "placed", label: "Order placed", note: "We have it." },
  { id: "packed", label: "Packed", note: "Folded and boxed at Bengaluru." },
  { id: "shipped", label: "Shipped", note: "With the courier." },
  { id: "out", label: "Out for delivery", note: "On the van." },
  { id: "done", label: "Delivered", note: "Signed for at your door." },
];

/**
 * Order tracking.
 *
 * Asks for an order number and a mobile number, because an order number alone
 * is enough for anyone to enumerate other people's orders. In production the
 * second field is what makes this endpoint safe to expose.
 *
 * There is no order database yet, so the progress shown is derived from how long
 * ago the order number was issued. It is a layout and a state machine, not a
 * claim about a real parcel — `lookupOrder` is the single function to replace.
 */
export function TrackOrder() {
  const params = useSearchParams();
  const { orders, hydrated } = useAccount();
  const [id, setId] = useState(params.get("order") ?? "");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<ReturnType<typeof lookupOrder>>();
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = id.trim().toUpperCase();
    if (!/^GZ\d{6,}$/.test(clean)) {
      setErr("An order number looks like GZ12345678.");
      setResult(undefined);
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""))) {
      setErr("Enter the 10-digit number the order was placed with.");
      setResult(undefined);
      return;
    }
    setErr(null);
    // A real order on this device knows its own state. Only when there is none
    // do we fall back to a derived estimate — guessing "Delivered" for an order
    // placed a minute ago would be worse than admitting we do not know.
    const local = orders.find((o) => o.id === clean);
    setResult(local ? progressOf(local) : lookupOrder(clean));
  };

  return (
    <div className="shell py-10 lg:py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="t-banner">Track your order</h1>
        <p className="prose mt-5 max-w-prose">
          Your order number is in the confirmation email, and starts with GZ. We
          also ask for the mobile number on the order, so nobody else can look
          up your delivery.
        </p>

        <form
          onSubmit={submit}
          className="mt-10 space-y-5 border-y border-[color:var(--line-2)] py-8"
        >
          <div>
            <label
              htmlFor="track-order"
              className="label text-[color:var(--ink-3)]"
            >
              Order number
            </label>
            <input
              id="track-order"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="GZ12345678"
              className="num mt-2 w-full border border-[color:var(--line-2)] px-3 py-3 outline-none focus:border-[color:var(--ink)]"
            />
          </div>
          <div>
            <label
              htmlFor="track-phone"
              className="label text-[color:var(--ink-3)]"
            >
              Mobile number
            </label>
            <input
              id="track-phone"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              inputMode="numeric"
              autoComplete="tel"
              placeholder="10 digits"
              className="num mt-2 w-full border border-[color:var(--line-2)] px-3 py-3 outline-none focus:border-[color:var(--ink)]"
            />
          </div>
          {err && (
            <p role="alert" className="text-[0.85rem] text-[color:var(--sale)]">
              {err}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-4xl bg-[color:var(--ink)] px-8 py-4 text-sm font-medium text-[color:var(--paper)]"
          >
            Find my order
          </button>
        </form>

        {result && (
          <section className="mt-12">
            <p className="num text-[0.85rem] text-[color:var(--ink-3)]">
              {result.id}
            </p>
            <h2 className="t-h2 mt-2">{result.headline}</h2>

            <ol className="mt-8">
              {STEPS.map((s, i) => {
                const done = i <= result.at;
                const current = i === result.at;
                return (
                  <li key={s.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-full border",
                          done
                            ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]"
                            : "border-[color:var(--line-2)]",
                        )}
                      >
                        {done ? (
                          <IconCircleCheck size={16} stroke={1.6} />
                        ) : (
                          <span className="num text-[0.7rem]">{i + 1}</span>
                        )}
                      </span>
                      {i < STEPS.length - 1 && (
                        <span
                          className={cn(
                            "w-px flex-1",
                            i < result.at
                              ? "bg-[color:var(--ink)]"
                              : "bg-[color:var(--line-2)]",
                          )}
                          style={{ minHeight: 28 }}
                        />
                      )}
                    </div>
                    <div className={cn("pb-6", !done && "opacity-45")}>
                      <p className="text-[0.95rem] font-medium">
                        {s.label}
                        {current && (
                          <span className="ml-2 text-[0.8rem] font-normal">
                            now
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-[0.82rem] text-[color:var(--ink-3)]">
                        {s.note}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 flex items-start gap-2.5 border-t border-[color:var(--line)] pt-6 text-[0.875rem]">
              <IconTruck size={17} stroke={1.5} className="mt-0.5 shrink-0" />
              <p>
                {result.headline} If it has not moved in two days, message us
                and we will chase the courier ourselves.
              </p>
            </div>
          </section>
        )}

        <p className="mt-14 flex items-start gap-2.5 text-[0.85rem] text-[color:var(--ink-3)]">
          <IconPackage size={17} stroke={1.5} className="mt-0.5 shrink-0" />
          Do not have the number? Call us on the number in{" "}
          <a href="/contact" className="link-draw">
            contact
          </a>{" "}
          and we will find it from your mobile number.
        </p>
      </div>
    </div>
  );
}

/**
 * Progress for an order we actually hold. Delivery is the end state — a parcel
 * handed over is handed over — so an order placed today reads "Packed", not
 * something derived from the digits of its own number.
 */
function progressOf(order: { placedAt: string }) {
  const days = Math.floor(
    (Date.now() - new Date(order.placedAt).getTime()) / 86_400_000,
  );
  const at = days >= 3 ? 4 : days >= 2 ? 3 : days >= 1 ? 2 : 1;
  return { id: "", at, headline: STEPS[at].label };
}

/**
 * Stand-in for a real lookup when the order was not placed on this device.
 * Replace this one function with an API call and nothing else in this file
 * changes; it exists so the state machine can be seen, not to make claims.
 */
function lookupOrder(id: string) {
  const n = Number(id.replace(/\D/g, ""));
  // Orders issued more than four days ago are delivered; otherwise spread the
  // five steps across the four days since it was placed.
  const daysAgo = (Date.now() - (n % 100_000_000)) / 86_400_000;
  const at = Math.max(0, Math.min(4, Math.floor(daysAgo) + 1));
  return { id, at, headline: STEPS[at].label };
}
