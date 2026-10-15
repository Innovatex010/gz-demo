"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const REASONS = [
  "An order I have placed",
  "A return or an exchange",
  "Sizing and fit",
  "A store visit",
  "Something else",
];

/**
 * Interface only. There is no endpoint behind it yet, so it stops at a local
 * confirmation rather than pretending a message was sent.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name">
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Anita Rao"
          />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" htmlFor="phone" hint="Optional">
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="98765 43210"
          />
        </Field>
        <Field
          label="Order number"
          htmlFor="order"
          hint="If it is about an order"
        >
          <Input id="order" name="order" placeholder="GZ-48210" />
        </Field>
      </div>

      <fieldset>
        <legend className="label text-[color:var(--ink-3)]">
          What is it about
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <label
              key={r}
              className="flex cursor-pointer items-center gap-2 rounded-4xl border border-[color:var(--line-2)] px-3.5 py-2 text-[0.85rem] transition-colors hover:bg-[color:var(--paper-2)] has-checked:border-[color:var(--ink)] has-checked:bg-[color:var(--paper-3)]"
            >
              <input
                type="radio"
                name="reason"
                value={r}
                defaultChecked={r === REASONS[0]}
                className="size-3.5 accent-[color:var(--ink)]"
              />
              {r}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="Message" htmlFor="message">
        <Textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Tell us what happened, and which size or order it is about."
        />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" size="lg">
          Send the message
        </Button>
        <p className="text-[0.8rem] text-[color:var(--ink-3)]">
          A person reads these. Not a ticket queue.
        </p>
      </div>

      <output
        aria-live="polite"
        className="block min-h-6 border-t border-[color:var(--line)] pt-4 text-[0.85rem] text-[color:var(--ink-2)]"
      >
        {sent
          ? "That is what a working form looks like — nothing is sent yet. Write to hello@goodzone.in and it reaches the same people."
          : ""}
      </output>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="flex items-baseline justify-between gap-3 text-[0.875rem] font-medium"
      >
        {label}
        {hint && (
          <span className="text-[0.78rem] font-normal text-[color:var(--ink-3)]">
            {hint}
          </span>
        )}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
