"use client";

import { IconMapPin, IconTruckDelivery } from "@tabler/icons-react";
import { cn } from "cn";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { estimateDelivery } from "@/lib/commerce";

/**
 * "When does it actually arrive?"
 *
 * A shop that only says "2–4 days" makes everyone guess. Asking for a pincode
 * turns a promise into a date, and it is the single most common question at
 * checkout in Indian e-commerce.
 *
 * The estimate is derived, not stored — see `estimateDelivery` in commerce.ts.
 * Every number here comes from the site's own shipping policy, so the two can
 * never drift apart.
 */
export function DeliveryEstimate({ className }: { className?: string }) {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<ReturnType<
    typeof estimateDelivery
  > | null>(null);

  const check = () => {
    setResult(estimateDelivery(pin));
  };

  return (
    <div className={cn("border-t border-[color:var(--line)] pt-6", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="label text-[color:var(--ink-3)]">Delivery</h2>
        <span className="text-[0.8rem] text-[color:var(--ink-3)]">
          Enter a pincode
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          check();
        }}
        className="mt-3 flex gap-2"
      >
        <Input
          value={pin}
          onChange={(e) =>
            setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="560001"
          aria-label="Six-digit pincode"
          className="num max-w-[10rem] rounded-none border-[color:var(--line-2)]"
        />
        <button
          type="submit"
          disabled={pin.length !== 6}
          className="border border-[color:var(--ink)] px-4 text-[0.85rem] transition-colors hover:bg-[color:var(--ink)] hover:text-[color:var(--paper)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-[color:var(--ink)]"
        >
          Check
        </button>
      </form>

      <div aria-live="polite">
        {result && !result.ok && (
          <p className="mt-3 text-[0.85rem] text-[color:var(--ink-2)]">
            {result.problem}
          </p>
        )}

        {result?.ok && (
          <div className="mt-3 flex items-start gap-2.5 text-[0.875rem]">
            <IconTruckDelivery
              size={17}
              stroke={1.5}
              className="mt-0.5 shrink-0"
            />
            <p>
              Arrives in <strong className="font-medium">{result.days}</strong>
              {result.by && (
                <>
                  {" "}
                  — by <span className="num">{result.by}</span>
                </>
              )}
              .{" "}
              {result.city ? (
                <>
                  Free delivery from our {result.city} store, or ₹79 if the
                  order is under ₹1,499.
                </>
              ) : (
                "Free over ₹1,499, otherwise ₹79."
              )}
              {!result.cod && result.city === undefined && (
                <> Cash on delivery is not available on this pincode.</>
              )}
            </p>
          </div>
        )}
      </div>

      <p className="mt-4 flex items-start gap-2.5 text-[0.875rem]">
        <IconMapPin size={17} stroke={1.5} className="mt-0.5 shrink-0" />
        Order before 11am in Bengaluru, Hyderabad, Chennai or Pune and it goes
        out the same day.
      </p>
    </div>
  );
}
