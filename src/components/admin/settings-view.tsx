"use client";

import { IconDownload, IconTrash } from "@tabler/icons-react";
import { cn } from "cn";
import { type ComponentProps, useState } from "react";
import { toast } from "sonner";
import { Panel, PanelHead, Row, Table, Td, Th } from "@/components/admin/kit";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fmtFull, fmtTime } from "@/lib/admin-data";
import {
  ACTIVITY,
  BRAND,
  PAYMENT_METHODS,
  SHIPPING_ZONES,
  type ShippingZone,
  TAX_SETTING,
  TEAM,
  type TeamMember,
} from "@/lib/admin-marketing";
import { inr } from "@/lib/catalog";

/* ── SETTINGS ───────────────────────────────────────────────────────────────
   The shop's own file: what it is called, where the parcels go, what the tax
   line says, how the money arrives, who can sign in, and what happened today.
   ──────────────────────────────────────────────────────────────────────────── */

const ROLES = ["Owner", "Manager", "Store"];

const PERMISSIONS = [
  "Orders",
  "Products and stock",
  "Customers",
  "Storefront",
  "Settings",
];

/** The log reads newest first, whatever order the file was written in. */
const LOG = [...ACTIVITY].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

const labelClass = "block text-[0.72rem] text-[color:var(--ink-3)]";
const lineClass = "block text-[0.85rem] text-[color:var(--ink)]";
const muted = "text-[0.85rem] text-[color:var(--ink-2)]";
const fieldClass =
  "mt-1 h-9 w-full border border-[color:var(--line-2)] bg-[color:var(--paper)] px-2.5 text-[0.85rem] focus-visible:border-[color:var(--indigo)]";
const numField =
  "num h-8 w-20 border border-[color:var(--line-2)] bg-[color:var(--paper)] px-2 text-right text-[0.85rem] focus-visible:border-[color:var(--indigo)]";
const textField =
  "h-8 w-[9.5rem] border border-[color:var(--line-2)] bg-[color:var(--paper)] px-2 text-[0.85rem] focus-visible:border-[color:var(--indigo)]";
const check = "size-3.5 accent-[color:var(--indigo)]";

/** An emptied box reads as zero, never as NaN. */
const zero = (v: string) => Math.max(0, Number(v));

type Draft = { id: string; name: string; role: string; permissions: string[] };

/** "Everything" is the owner's line; the others are named one by one. */
const fromPermissions = (text: string) =>
  text === "Everything"
    ? PERMISSIONS
    : PERMISSIONS.filter((p) => text.includes(p));

const toPermissions = (list: string[]) =>
  list.length === PERMISSIONS.length ? "Everything" : list.join(", ");

/** One shop detail: the label sits over the box, the way the counter writes. */
function Field({
  label,
  mono,
  wide,
  ...input
}: {
  label: string;
  mono?: boolean;
  wide?: boolean;
} & ComponentProps<"input">) {
  return (
    <div className={cn(wide && "sm:col-span-2")}>
      <label className={labelClass}>
        <span className="block">{label}</span>
        <input {...input} className={cn(fieldClass, mono && "num")} />
      </label>
    </div>
  );
}

/** The strip that carries a save button under a panel's content. */
function SaveRow({ label, onSave }: { label: string; onSave: () => void }) {
  return (
    <div className="border-t border-[color:var(--line)] px-4 py-3">
      <Button size="sm" onClick={onSave}>
        {label}
      </Button>
    </div>
  );
}

export function SettingsView() {
  const [shop, setShop] = useState({
    name: BRAND.name,
    tagline: BRAND.tagline,
    email: BRAND.contactEmail,
    phone: BRAND.contactPhone,
    since: BRAND.since,
  });
  const [zones, setZones] = useState<ShippingZone[]>(SHIPPING_ZONES);
  const [methods, setMethods] = useState(PAYMENT_METHODS);
  const [team, setTeam] = useState<TeamMember[]>(TEAM);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const { name, tagline, email, phone, since } = shop;

  const on =
    (key: keyof typeof shop) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setShop((s) => ({ ...s, [key]: e.target.value }));

  const draftFor = (m: TeamMember) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    permissions: fromPermissions(m.permissions),
  });

  const patch = (z: ShippingZone, p: Partial<ShippingZone>) =>
    setZones((zs) => zs.map((x) => (x.id === z.id ? { ...x, ...p } : x)));

  const setMethod = (id: string, enabled: boolean) =>
    setMethods((ms) => ms.map((m) => (m.id === id ? { ...m, enabled } : m)));

  /** Cash on delivery can go dark, but say so before a customer finds out. */
  const codOff = methods.some(
    (m) => m.name === "Cash on delivery" && !m.enabled,
  );

  const togglePerm = (on: boolean, p: string) =>
    setDraft((d) => {
      if (!d) return d;
      const permissions = on
        ? [...d.permissions, p]
        : d.permissions.filter((x) => x !== p);
      return { ...d, permissions };
    });

  const savePermissions = () => {
    if (!draft) return;
    setTeam((ts) =>
      ts.map((t) =>
        t.id === draft.id
          ? {
              ...t,
              role: draft.role,
              permissions: toPermissions(draft.permissions),
            }
          : t,
      ),
    );
    toast(`Permissions updated for ${draft.name}.`);
    setDraft(null);
  };

  const reset = () => {
    setResetOpen(false);
    toast("Local data cleared.");
  };

  const exportCsv = () => {
    const lines = LOG.map((a) => [a.who, `"${a.what}"`, a.at].join(","));
    const csv = [["who", "what", "when"].join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "good-zone-activity.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${LOG.length} lines to good-zone-activity.csv`);
  };

  return (
    <div className="mx-auto max-w-[76rem] px-4 py-8 lg:px-8">
      <header>
        <h1 className="text-[1.45rem] font-semibold tracking-tight text-[color:var(--ink)]">
          Settings
        </h1>
        <p className="mt-1 max-w-[68ch] text-[0.85rem] leading-relaxed text-[color:var(--ink-2)]">
          The shop's own file: what it is called, where the parcels go, what the
          tax line says, who can sign in, and what happened today.
        </p>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHead title="The shop" hint="What the customer reads" />
          <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
            <Field label="Name" value={name} onChange={on("name")} />
            <Field
              label="Selling since"
              value={since}
              onChange={on("since")}
              mono
            />
            <Field
              label="Tagline"
              value={tagline}
              onChange={on("tagline")}
              wide
            />
            <Field label="Contact email" value={email} onChange={on("email")} />
            <Field label="Contact phone" value={phone} onChange={on("phone")} />
          </div>
          <div className="grid gap-2 border-t border-[color:var(--line)] px-4 py-3.5 sm:grid-cols-2">
            <p className={muted}>
              <span className={labelClass}>Currency</span>
              Indian rupee (₹)
            </p>
            <p className={muted}>
              <span className={labelClass}>Logo</span>
              <span className="num text-[0.82rem]">{BRAND.logo}</span>
            </p>
          </div>
          <SaveRow
            label="Save changes"
            onSave={() => toast("Shop details saved.")}
          />
        </Panel>

        <Panel>
          <PanelHead title="Shipping zones" hint="Three zones" />
          <Table
            caption="Delivery charge, free-delivery line and cash on delivery, by zone"
            head={
              <>
                <Th>Zone</Th>
                <Th>Cities</Th>
                <Th numeric>Charge (₹)</Th>
                <Th numeric>Free over</Th>
                <Th>ETA</Th>
                <Th>COD</Th>
              </>
            }
          >
            {zones.map((z) => (
              <Row key={z.id}>
                <Td className="font-medium">{z.name}</Td>
                <Td className="text-[0.78rem] text-[color:var(--ink-3)]">
                  {z.cities}
                </Td>
                <Td numeric>
                  <input
                    type="number"
                    value={z.charge}
                    aria-label={`Delivery charge for ${z.name}`}
                    onChange={(e) => patch(z, { charge: zero(e.target.value) })}
                    className={numField}
                  />
                </Td>
                <Td numeric>
                  <input
                    type="number"
                    value={z.freeOver === 0 ? "" : z.freeOver}
                    placeholder="—"
                    aria-label={`Free delivery over for ${z.name}`}
                    onChange={(e) =>
                      patch(z, { freeOver: zero(e.target.value) })
                    }
                    className={numField}
                  />
                </Td>
                <Td>
                  <input
                    value={z.eta}
                    aria-label={`Delivery estimate for ${z.name}`}
                    onChange={(e) => patch(z, { eta: e.target.value })}
                    className={textField}
                  />
                </Td>
                <Td>
                  <input
                    type="checkbox"
                    checked={z.cod}
                    aria-label={`Cash on delivery in ${z.name}`}
                    onChange={(e) => patch(z, { cod: e.target.checked })}
                    className={check}
                  />
                </Td>
              </Row>
            ))}
          </Table>
          <p className="border-t border-[color:var(--line)] px-4 py-2.5 text-[0.75rem] text-[color:var(--ink-3)]">
            Store cities walk the parcel to the courier the same day if the
            order lands before 11.
          </p>
          <SaveRow
            label="Save zones"
            onSave={() => toast("Shipping zones saved.")}
          />
        </Panel>

        <Panel>
          <PanelHead title="Tax" />
          <div className="px-4 py-5">
            <p className="text-[0.85rem] leading-relaxed text-[color:var(--ink-2)]">
              {TAX_SETTING.note}
            </p>
            <p className="num mt-5 text-[2.2rem] leading-none text-[color:var(--ink)]">
              5%
            </p>
            <p className="mt-2 text-[0.85rem] text-[color:var(--ink)]">
              GST on apparel up to {inr(1000)}
            </p>
            <p className={muted}>
              12% above it, collected automatically at checkout.
            </p>
            <p className="mt-5 border-t border-[color:var(--line)] pt-3 text-[0.75rem] text-[color:var(--ink-3)]">
              Rates are set by the tax rules, not by the shop.
            </p>
          </div>
        </Panel>

        <Panel>
          <PanelHead title="Payment methods" hint="What the checkout offers" />
          <div className="flex flex-col gap-2.5 px-4 py-3.5">
            {methods.map((m) => (
              <label
                className="flex cursor-pointer items-start gap-2.5"
                key={m.id}
              >
                <input
                  type="checkbox"
                  checked={m.enabled}
                  onChange={(e) => setMethod(m.id, e.target.checked)}
                  className={cn(check, "mt-0.5")}
                />
                <span>
                  <span className={lineClass}>{m.name}</span>
                  <span className={labelClass}>{m.note}</span>
                </span>
              </label>
            ))}
          </div>
          {codOff ? (
            <p className="border-t border-[color:var(--line)] px-4 py-2.5 text-[0.78rem] text-[color:var(--sale)]">
              Cash on delivery is off. Customers will only see prepaid methods.
            </p>
          ) : null}
        </Panel>

        <Panel>
          <PanelHead title="Who can do what" hint="Three people, one shop" />
          <Table
            caption="Team members, roles and permissions"
            head={
              <>
                <Th>Name</Th>
                <Th>Role</Th>
                <Th>Permissions</Th>
                <Th className="w-14">
                  <span className="sr-only">Edit</span>
                </Th>
              </>
            }
          >
            {team.map((m) => (
              <Row key={m.id}>
                <Td className="font-medium">{m.name}</Td>
                <Td className={muted}>{m.role}</Td>
                <Td className={muted}>{m.permissions}</Td>
                <Td className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDraft(draftFor(m))}
                  >
                    Edit
                  </Button>
                </Td>
              </Row>
            ))}
          </Table>
        </Panel>

        <Panel>
          <PanelHead
            title="Activity log"
            hint={`${LOG.length} lines, newest first`}
            action={
              <Button size="sm" variant="outline" onClick={exportCsv}>
                <IconDownload size={14} stroke={1.6} />
                Download log
              </Button>
            }
          />
          <ul className="px-4 py-2">
            {LOG.map((a) => (
              <li
                className="flex flex-wrap items-baseline gap-x-3 border-b border-[color:var(--line)] py-2.5 last:border-b-0"
                key={a.id}
              >
                <span className="text-[0.85rem] font-medium text-[color:var(--ink)]">
                  {a.who}
                </span>
                <span className="num ml-auto text-[0.75rem] text-[color:var(--ink-3)]">
                  {fmtFull(a.at)}, {fmtTime(a.at)}
                </span>
                <span className={cn(muted, "w-full")}>{a.what}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="flex flex-wrap items-center justify-between gap-4 px-4 py-3.5">
          <p
            className={cn(muted, "max-w-[62ch] leading-relaxed text-[0.82rem]")}
          >
            Resetting clears local carts, wishlists and saved addresses on every
            device. Orders and products live in the shop's file and stay.
          </p>
          <Button
            variant="destructive"
            className="text-[color:var(--sale)]"
            onClick={() => setResetOpen(true)}
          >
            <IconTrash size={14} stroke={1.6} />
            Reset the shop
          </Button>
        </Panel>
      </div>

      <Dialog
        open={draft !== null}
        onOpenChange={(open) => !open && setDraft(null)}
      >
        <DialogContent className="rounded-none sm:max-w-[26rem]">
          <DialogHeader>
            <DialogTitle>Permissions for {draft?.name}</DialogTitle>
            <DialogDescription>
              Pick the role and the parts of the desk this person can open. An
              owner keeps everything.
            </DialogDescription>
          </DialogHeader>
          <div>
            <label className={labelClass} htmlFor="perm-role">
              Role
            </label>
            <select
              id="perm-role"
              value={draft?.role ?? ""}
              onChange={(e) =>
                setDraft((d) => d && { ...d, role: e.target.value })
              }
              className={fieldClass}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <fieldset className="mt-4">
              <legend className={labelClass}>Permissions</legend>
              <div className="mt-2 flex flex-col gap-2">
                {PERMISSIONS.map((p) => (
                  <label className="flex items-center gap-2.5" key={p}>
                    <input
                      type="checkbox"
                      checked={draft?.permissions.includes(p) ?? false}
                      onChange={(e) => togglePerm(e.target.checked, p)}
                      className={check}
                    />
                    <span className={lineClass}>{p}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep as is</Button>
            </DialogClose>
            <Button onClick={savePermissions}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="rounded-none sm:max-w-[26rem]">
          <DialogHeader>
            <DialogTitle>Reset everything?</DialogTitle>
            <DialogDescription>
              This clears local browsing data on every device. Orders and the
              catalogue stay. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep everything</Button>
            </DialogClose>
            <Button variant="destructive" onClick={reset}>
              Reset the shop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
