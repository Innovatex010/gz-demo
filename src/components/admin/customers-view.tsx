"use client";

import {
  IconDownload,
  IconMail,
  IconShoppingCart,
  IconStar,
  IconTag,
} from "@tabler/icons-react";
import { cn } from "cn";
import Link from "next/link";
import { type FormEvent, type ReactNode, useState } from "react";
import { toast } from "sonner";
import {
  Chip,
  EmptyNote,
  OrderChip,
  Panel,
  PanelHead,
  QuietLink,
  Row,
  Table,
  Td,
  Th,
} from "@/components/admin/kit";
import { ADMIN_ORDERS, fmtDay, fmtFull } from "@/lib/admin-data";
import {
  CARTS,
  COUPONS,
  type Coupon,
  CUSTOMERS,
  REVIEWS,
  type Review,
  SEGMENT_LABEL,
  type Segment,
  SUBSCRIBER_COUNT,
  SUBSCRIBERS,
} from "@/lib/admin-marketing";
import { inr } from "@/lib/catalog";

/* ────────────────────────────────────────────────────────────────────────────
   THE CUSTOMER HALF OF THE DESK
   The regulars table is the spine: pick a name and the orders that person
   placed come up under it. Around it sit the four conversations the shop is
   still having with people who have not bought yet — coupons, reviews waiting
   to go up, carts left behind, and the newsletter list.
   ──────────────────────────────────────────────────────────────────────────── */

const SEGMENTS: { key: Segment | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "returning", label: "Returning" },
  { key: "high-value", label: "High value" },
];

const smallBtn =
  "flex items-center gap-1.5 border border-[color:var(--line-2)] px-2.5 py-1 text-[0.75rem] text-[color:var(--ink-2)] transition-colors hover:border-[color:var(--ink)] hover:text-[color:var(--ink)]";
const inkBtn =
  "flex items-center gap-1.5 bg-[color:var(--ink)] px-3 py-1.5 text-[0.8rem] font-medium text-[color:var(--paper)] transition-opacity hover:opacity-85";
const field =
  "h-9 border border-[color:var(--line-2)] bg-[color:var(--paper)] px-2.5 text-[0.85rem] placeholder:text-[color:var(--ink-3)] focus-visible:border-[color:var(--indigo)]";
const tabs = "flex border border-[color:var(--line-2)]";
const formRow =
  "flex flex-wrap items-end gap-2 border-b border-[color:var(--line)] px-4 py-3";
const hair = "border-b border-[color:var(--line)] last:border-b-0";
const numLink = "num hover:text-[color:var(--indigo)]";
const ink2 = "text-[0.8rem] text-[color:var(--ink-2)]";
const ink3 = "text-[0.72rem] text-[color:var(--ink-3)]";
const strong = "text-[0.85rem] font-medium text-[color:var(--ink)]";
const body = "mt-1.5 text-[0.85rem] leading-relaxed text-[color:var(--ink-2)]";
const meta = `mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 ${ink3}`;
const lede =
  "mt-1 max-w-[66ch] text-[0.85rem] leading-relaxed text-[color:var(--ink-2)]";
const h1Cls =
  "text-[1.45rem] font-semibold tracking-tight text-[color:var(--ink)]";
const hintCls = `border-t border-[color:var(--line)] px-4 py-2.5 ${ink3}`;
const cartLine = `${hair} flex flex-wrap items-end justify-between gap-3 px-4 py-3`;
const subLine = `${hair} flex items-center justify-between gap-3 px-4 py-2.5`;
const check = "size-3.5 accent-[color:var(--indigo)]";

const tabCls = (on: boolean) =>
  on
    ? "bg-[color:var(--ink)] px-3 py-1.5 text-[0.8rem] text-[color:var(--paper)]"
    : "px-3 py-1.5 text-[0.8rem] text-[color:var(--ink-2)] hover:bg-[color:var(--paper-3)]";

const segmentTone = (s: Segment) => (s === "high-value" ? "ink" : "outline");

function Btn({
  onClick,
  ink,
  children,
}: {
  onClick: () => void;
  ink?: boolean;
  children: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={ink ? inkBtn : smallBtn}>
      {children}
    </button>
  );
}

export function CustomersView() {
  const [filter, setFilter] = useState<Segment | "all">("all");
  const [picked, setPicked] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>(COUPONS);
  const [reviews, setReviews] = useState<Review[]>(REVIEWS);
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<Coupon["kind"]>("percent");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");

  const rows = CUSTOMERS.filter(
    (c) => filter === "all" || c.segment === filter,
  );
  const pickedCustomer = CUSTOMERS.find((c) => c.id === picked) ?? null;
  // The order file is newest first, so a filtered slice stays newest first.
  const history = pickedCustomer
    ? ADMIN_ORDERS.filter((o) => o.customer.email === pickedCustomer.email)
    : [];
  const pending = reviews.filter((r) => r.status === "pending").length;
  const shown = [...reviews].sort((a, b) =>
    a.status === b.status ? 0 : a.status === "pending" ? -1 : 1,
  );

  const createCoupon = (e: FormEvent) => {
    e.preventDefault();
    const name = code.trim().toUpperCase();
    const amount = Number(value);
    if (!name || !(amount > 0)) {
      toast("A code and a value are needed before it can go live.");
      return;
    }
    setCoupons((cs) => [
      {
        code: name,
        kind,
        value: amount,
        note: note.trim() || "No note",
        used: 0,
        active: true,
      },
      ...cs,
    ]);
    setCode("");
    setValue("");
    setNote("");
    toast(`${name} created. It is live from today.`);
  };

  const toggleCoupon = (name: string) =>
    setCoupons((cs) =>
      cs.map((c) => (c.code === name ? { ...c, active: !c.active } : c)),
    );

  const publishReview = (r: Review) => {
    setReviews((rs) =>
      rs.map((x) => (x.id === r.id ? { ...x, status: "published" } : x)),
    );
    toast(`Review ${r.id} published.`);
  };

  const removeReview = (r: Review) => {
    setReviews((rs) => rs.filter((x) => x.id !== r.id));
    toast("Removed.");
  };

  const exportCsv = () => {
    const head = ["email", "date"];
    const lines = SUBSCRIBERS.map((s) => [s.email, s.at].join(","));
    const csv = [head.join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "good-zone-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast("Exported the list to good-zone-subscribers.csv");
  };

  return (
    <div className="mx-auto max-w-[76rem] px-4 py-8 lg:px-8">
      <header>
        <h1 className={h1Cls}>Customers</h1>
        <p className={lede}>
          {CUSTOMERS.length} regulars are on the books, and this is what each of
          them has bought. Coupons, reviews, carts left behind and the list sit
          alongside, because they are the same conversation.
        </p>
      </header>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Segment" className={tabs}>
          {SEGMENTS.map((s) => (
            <button
              key={s.key}
              type="button"
              role="tab"
              aria-selected={filter === s.key}
              onClick={() => setFilter(s.key)}
              className={tabCls(filter === s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className={`num ${ink3}`}>
          {rows.length} of {CUSTOMERS.length} shown
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <Panel>
          <PanelHead title="Regulars" hint="Orders, spend, segment" />
          {rows.length === 0 ? (
            <EmptyNote
              action={<Btn onClick={() => setFilter("all")}>Show everyone</Btn>}
            >
              Nobody sits in this segment yet. Show everyone and start from the
              whole list.
            </EmptyNote>
          ) : (
            <Table
              caption="Customers with their orders, spend and segment"
              head={
                <>
                  <Th>Name</Th>
                  <Th>Contact</Th>
                  <Th>City</Th>
                  <Th numeric>Orders</Th>
                  <Th numeric>Spent</Th>
                  <Th>Segment</Th>
                  <Th>Last order</Th>
                </>
              }
            >
              {rows.map((c) => (
                <Row key={c.id} highlight={picked === c.id}>
                  <Td>
                    <button
                      type="button"
                      aria-pressed={picked === c.id}
                      onClick={() => setPicked(picked === c.id ? null : c.id)}
                      className={cn(
                        "text-left font-semibold hover:text-[color:var(--indigo)]",
                        picked === c.id && "text-[color:var(--indigo)]",
                      )}
                    >
                      {c.name}
                      <span className={`num block font-normal ${ink3}`}>
                        {c.id}
                      </span>
                    </button>
                  </Td>
                  <Td>
                    {c.email}
                    <span className={`num block ${ink3}`}>{c.phone}</span>
                  </Td>
                  <Td>{c.city}</Td>
                  <Td numeric>{c.orders}</Td>
                  <Td numeric>{inr(c.spent)}</Td>
                  <Td>
                    <Chip tone={segmentTone(c.segment)}>
                      {SEGMENT_LABEL[c.segment]}
                    </Chip>
                  </Td>
                  <Td className={ink2}>{fmtFull(c.lastOrder)}</Td>
                </Row>
              ))}
            </Table>
          )}
          {!pickedCustomer && rows.length > 0 ? (
            <p className={hintCls}>Pick a name to see what they have bought.</p>
          ) : null}
        </Panel>

        {pickedCustomer ? (
          <Panel>
            <PanelHead
              title={`What ${pickedCustomer.name} bought`}
              hint={`${history.length} orders, ${inr(pickedCustomer.spent)} spent`}
              action={<QuietLink href="/admin/orders">All orders</QuietLink>}
            />
            <Table
              caption={`Orders placed by ${pickedCustomer.name}`}
              head={
                <>
                  <Th>Order</Th>
                  <Th>Placed</Th>
                  <Th numeric>Total</Th>
                  <Th>Status</Th>
                </>
              }
            >
              {history.map((o) => (
                <Row key={o.id}>
                  <Td>
                    <Link href={`/admin/orders/${o.id}`} className={numLink}>
                      {o.id}
                    </Link>
                  </Td>
                  <Td className={ink2}>{fmtFull(o.placedAt)}</Td>
                  <Td numeric>{inr(o.totals.total)}</Td>
                  <Td>
                    <OrderChip status={o.status} />
                  </Td>
                </Row>
              ))}
            </Table>
          </Panel>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <PanelHead title="Coupons" hint="Live codes and their worth" />
            <form onSubmit={createCoupon} className={formRow}>
              <label htmlFor="c-code" className="sr-only">
                Coupon code
              </label>
              <input
                id="c-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="SUMMER20"
                className={cn(field, "w-[8rem]")}
              />
              <label htmlFor="c-kind" className="sr-only">
                Discount type
              </label>
              <select
                id="c-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as Coupon["kind"])}
                className={cn(field, "w-[7rem]")}
              >
                <option value="percent">Percent</option>
                <option value="flat">Flat rupees</option>
              </select>
              <label htmlFor="c-value" className="sr-only">
                Value
              </label>
              <input
                id="c-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="20"
                className={cn(field, "num w-[5rem]")}
              />
              <label htmlFor="c-note" className="sr-only">
                What the coupon does
              </label>
              <input
                id="c-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What it does"
                className={cn(field, "min-w-[12rem] flex-1")}
              />
              <button type="submit" className={inkBtn}>
                <IconTag size={14} stroke={1.6} aria-hidden />
                Create
              </button>
            </form>
            <Table
              caption="Coupons on the desk"
              head={
                <>
                  <Th>Code</Th>
                  <Th>Offer</Th>
                  <Th>Value</Th>
                  <Th numeric>Used</Th>
                  <Th>Active</Th>
                </>
              }
            >
              {coupons.map((c) => (
                <Row key={c.code}>
                  <Td className="num">{c.code}</Td>
                  <Td className={ink2}>{c.note}</Td>
                  <Td>
                    <span className="num">
                      {c.kind === "percent" ? `${c.value}%` : inr(c.value)}
                    </span>
                    <span className={`ml-1 ${ink3}`}>off</span>
                  </Td>
                  <Td numeric>{c.used}</Td>
                  <Td>
                    <input
                      type="checkbox"
                      aria-label={`${c.code} is live`}
                      checked={c.active}
                      onChange={() => toggleCoupon(c.code)}
                      className={check}
                    />
                  </Td>
                </Row>
              ))}
            </Table>
          </Panel>

          <Panel>
            <PanelHead
              title="Reviews"
              hint={`${pending} waiting to go up`}
              action={<QuietLink href="/admin/products">Style pages</QuietLink>}
            />
            {shown.length === 0 ? (
              <EmptyNote>
                Every review that came in is on the shop already.
              </EmptyNote>
            ) : (
              <ul>
                {shown.map((r) => (
                  <li key={r.id} className={`${hair} px-4 py-3`}>
                    <p className={strong}>
                      {r.productName}
                      {r.status === "published" ? (
                        <Chip className="ml-2">Published</Chip>
                      ) : null}
                    </p>
                    <p className={meta}>
                      {r.author}
                      <span className="num">{fmtFull(r.at)}</span>
                      <IconStar size={14} stroke={1.6} aria-hidden />
                      <span className="num">{r.rating}</span> out of 5
                    </p>
                    <p className={body}>{r.text}</p>
                    {r.status === "pending" ? (
                      <div className="mt-2.5 flex items-center gap-2">
                        <Btn onClick={() => publishReview(r)}>Publish</Btn>
                        <Btn onClick={() => removeReview(r)}>Remove</Btn>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <PanelHead title="Abandoned carts" hint="Filled, never paid for" />
            <ul>
              {CARTS.map((c) => (
                <li key={c.id} className={cartLine}>
                  <div className="flex gap-3">
                    <IconShoppingCart size={15} stroke={1.6} aria-hidden />
                    <div>
                      <p className={strong}>{c.customer}</p>
                      <p className={`mt-0.5 ${ink2}`}>{c.items.join(", ")}</p>
                      <p className={`mt-0.5 ${ink3}`}>
                        {c.city} <span className="num">{fmtDay(c.at)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="num text-[0.85rem]">{inr(c.value)}</span>
                    <Btn
                      onClick={() => toast(`Reminder sent to ${c.customer}.`)}
                    >
                      <IconMail size={14} stroke={1.6} aria-hidden />
                      Send a reminder
                    </Btn>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelHead
              title="Newsletter"
              hint="Everyone on the list"
              action={
                <Btn onClick={exportCsv}>
                  <IconDownload size={14} stroke={1.6} aria-hidden />
                  Export list
                </Btn>
              }
            />
            <div className="px-4 py-4">
              <p className="num text-[2.1rem] leading-none text-[color:var(--ink)]">
                {SUBSCRIBER_COUNT.toLocaleString("en-IN")}
              </p>
              <p className={`mt-1.5 ${ink3}`}>
                subscribers, {SUBSCRIBERS.length} of them in the last few days
              </p>
            </div>
            <ul>
              {SUBSCRIBERS.map((s) => (
                <li key={s.email} className={subLine}>
                  <span className="text-[0.82rem] text-[color:var(--ink)]">
                    {s.email}
                  </span>
                  <span className={`num ${ink3}`}>{fmtFull(s.at)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
