"use client";

import { IconPlus, IconTrash } from "@tabler/icons-react";
import { cn } from "cn";
import { useState } from "react";
import { toast } from "sonner";
import { type Address, useAccount } from "@/lib/account";

const BLANK: Omit<Address, "id"> = {
  label: "Home",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  pin: "",
  default: false,
};

/** Profile and saved addresses. Local until the backend exists. */
export function ProfileView() {
  const {
    profile,
    setProfile,
    addresses,
    addAddress,
    removeAddress,
    makeDefault,
    hydrated,
  } = useAccount();

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Omit<Address, "id">>(BLANK);

  // The store is the source of truth. Copying it into local state here toggled
  // on a value that might still be empty while the store was hydrating, so the
  // form would silently show blank fields for a profile that does exist.
  if (!hydrated) return <div className="shell py-10 lg:py-14" />;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Saved");
  };

  const saveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (draft.name.trim().length < 2 || !/^\d{6}$/.test(draft.pin)) {
      toast.error("A name and a six-digit pincode are needed.");
      return;
    }
    addAddress({ ...draft, default: addresses.length === 0 });
    setDraft(BLANK);
    setAdding(false);
    toast.success(`${draft.label || "Address"} saved`);
  };

  return (
    <div className="shell py-10 lg:py-14">
      <h1 className="t-banner">Your details</h1>

      <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Profile */}
        <section className="lg:col-span-5">
          <h2 className="t-h3">Personal</h2>
          <form onSubmit={save} className="mt-6 space-y-5">
            <F
              id="pf-name"
              label="Name"
              value={profile.name}
              onChange={(v) => setProfile({ ...profile, name: v })}
              autoComplete="name"
            />
            <F
              id="pf-email"
              label="Email"
              type="email"
              value={profile.email}
              onChange={(v) => setProfile({ ...profile, email: v })}
              autoComplete="email"
            />
            <F
              id="pf-phone"
              label="Mobile"
              value={profile.phone}
              onChange={(v) =>
                setProfile({
                  ...profile,
                  phone: v.replace(/\D/g, "").slice(0, 10),
                })
              }
              autoComplete="tel"
            />
            <button
              type="submit"
              className="rounded-4xl bg-[color:var(--ink)] px-8 py-3.5 text-sm font-medium text-[color:var(--paper)]"
            >
              Save details
            </button>
          </form>
        </section>

        {/* Addresses */}
        <section className="lg:col-span-7">
          <div className="flex items-center justify-between gap-4">
            <h2 className="t-h3">Addresses</h2>
            <button
              type="button"
              onClick={() => setAdding((v) => !v)}
              className="link-draw inline-flex items-center gap-1.5 text-[0.85rem]"
            >
              <IconPlus size={14} stroke={1.6} />
              {adding ? "Cancel" : "Add address"}
            </button>
          </div>

          {addresses.length === 0 && !adding && (
            <p className="prose mt-6">
              None saved. The address you check out with gets saved here
              automatically.
            </p>
          )}

          <ul className="mt-6 space-y-4">
            {addresses.map((a) => (
              <li
                key={a.id}
                className={cn(
                  "border p-5 text-[0.9rem]",
                  a.default
                    ? "border-[color:var(--ink)]"
                    : "border-[color:var(--line-2)]",
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      {a.label}
                      {a.default && (
                        <span className="ml-2 text-[0.75rem] text-[color:var(--ink-3)]">
                          default
                        </span>
                      )}
                    </p>
                    <p className="mt-1.5">{a.name}</p>
                    <p className="text-[color:var(--ink-2)]">{a.line1}</p>
                    {a.line2 && (
                      <p className="text-[color:var(--ink-2)]">{a.line2}</p>
                    )}
                    <p className="num mt-1 text-[color:var(--ink-2)]">
                      {a.city} {a.pin}
                    </p>
                    <p className="num mt-1 text-[color:var(--ink-3)]">
                      {a.phone}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAddress(a.id)}
                    aria-label={`Delete ${a.label} address`}
                    className="text-[color:var(--ink-3)] hover:text-[color:var(--sale)]"
                  >
                    <IconTrash size={16} stroke={1.5} />
                  </button>
                </div>

                {!a.default && (
                  <button
                    type="button"
                    onClick={() => makeDefault(a.id)}
                    className="link-draw mt-3 text-[0.8rem]"
                  >
                    Make default
                  </button>
                )}
              </li>
            ))}
          </ul>

          {adding && (
            <form
              onSubmit={saveAddress}
              className="mt-6 space-y-5 border-t border-[color:var(--line)] pt-6"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <F
                  id="ad-label"
                  label="Label"
                  value={draft.label}
                  onChange={(v) => setDraft({ ...draft, label: v })}
                  placeholder="Home, Office"
                />
                <F
                  id="ad-name"
                  label="Name"
                  value={draft.name}
                  onChange={(v) => setDraft({ ...draft, name: v })}
                  autoComplete="name"
                />
                <div className="sm:col-span-2">
                  <F
                    id="ad-line1"
                    label="Address"
                    value={draft.line1}
                    onChange={(v) => setDraft({ ...draft, line1: v })}
                    autoComplete="street-address"
                  />
                </div>
                <div className="sm:col-span-2">
                  <F
                    id="ad-line2"
                    label="Landmark (optional)"
                    value={draft.line2 ?? ""}
                    onChange={(v) => setDraft({ ...draft, line2: v })}
                  />
                </div>
                <F
                  id="ad-city"
                  label="City"
                  value={draft.city}
                  onChange={(v) => setDraft({ ...draft, city: v })}
                  autoComplete="address-level2"
                />
                <F
                  id="ad-pin"
                  label="Pincode"
                  value={draft.pin}
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      pin: v.replace(/\D/g, "").slice(0, 6),
                    })
                  }
                  autoComplete="postal-code"
                />
              </div>
              <label className="flex items-center gap-2.5 text-[0.875rem]">
                <input
                  type="checkbox"
                  checked={draft.default}
                  onChange={(e) =>
                    setDraft({ ...draft, default: e.target.checked })
                  }
                />
                Use this as my default address
              </label>
              <button
                type="submit"
                className="rounded-4xl bg-[color:var(--ink)] px-8 py-3.5 text-sm font-medium text-[color:var(--paper)]"
              >
                Save address
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

function F({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="label text-[color:var(--ink-3)]">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full border border-[color:var(--line-2)] px-3 py-3 text-[0.95rem] outline-none transition-colors focus:border-[color:var(--ink)]"
      />
    </div>
  );
}
