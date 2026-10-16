import Link from "next/link";
import {
  EmptyNote,
  OrderChip,
  Panel,
  PayChip,
  QuietLink,
  Row,
  Table,
  Td,
  Th,
} from "@/components/admin/kit";
import {
  ADMIN_ORDERS,
  AS_OF,
  fmtFull,
  type OrderStatus,
  PAY_METHOD_LABEL,
  type PayStatus,
} from "@/lib/admin-data";
import { inr } from "@/lib/catalog";

/* ────────────────────────────────────────────────────────────────────────────
   THE ORDER DESK
   Every order, filterable by what the team actually asks: what is it, who
   placed it, how did they pay, where is it now, how old is it. Filters live
   in the URL so a filtered view can be pasted into a message.
   ──────────────────────────────────────────────────────────────────────────── */

const STATUSES: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "Any status" },
  { value: "placed", label: "Placed — needs confirming" },
  { value: "confirmed", label: "Confirmed" },
  { value: "packed", label: "Packed — ready to ship" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "returned", label: "Returned" },
];

const PAYMENTS: { value: PayStatus | "all"; label: string }[] = [
  { value: "all", label: "Any payment" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
];

const WINDOWS: { value: string; label: string; days: number }[] = [
  { value: "7", label: "Last 7 days", days: 7 },
  { value: "30", label: "Last 30 days", days: 30 },
  { value: "all", label: "All time", days: 10_000 },
];

const PAGE_SIZE = 10;

const selectClass =
  "h-9 border border-[color:var(--line-2)] bg-[color:var(--paper)] px-2 text-[0.85rem] text-[color:var(--ink)] focus-visible:border-[color:var(--indigo)]";

function FilterBar({
  q,
  status,
  pay,
  when,
}: {
  q: string;
  status: string;
  pay: string;
  when: string;
}) {
  return (
    <search className="block">
      <form
        method="get"
        action="/admin/orders"
        className="flex flex-wrap items-end gap-3"
      >
        <div className="flex flex-col gap-1">
          <label
            htmlFor="f-q"
            className="text-[0.72rem] text-[color:var(--ink-3)]"
          >
            Search
          </label>
          <input
            id="f-q"
            name="q"
            defaultValue={q}
            placeholder="Name, order, city"
            className="h-9 w-[15rem] border border-[color:var(--line-2)] bg-[color:var(--paper)] px-2.5 text-[0.85rem] placeholder:text-[color:var(--ink-3)] focus-visible:border-[color:var(--indigo)]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="f-status"
            className="text-[0.72rem] text-[color:var(--ink-3)]"
          >
            Status
          </label>
          <select
            id="f-status"
            name="status"
            defaultValue={status}
            className={selectClass}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="f-pay"
            className="text-[0.72rem] text-[color:var(--ink-3)]"
          >
            Payment
          </label>
          <select
            id="f-pay"
            name="pay"
            defaultValue={pay}
            className={selectClass}
          >
            {PAYMENTS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="f-when"
            className="text-[0.72rem] text-[color:var(--ink-3)]"
          >
            Placed
          </label>
          <select
            id="f-when"
            name="when"
            defaultValue={when}
            className={selectClass}
          >
            {WINDOWS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="h-9 bg-[color:var(--ink)] px-4 text-[0.85rem] font-medium text-[color:var(--paper)] transition-opacity hover:opacity-85"
        >
          Apply
        </button>

        {q || status !== "all" || pay !== "all" || when !== "all" ? (
          <Link
            href="/admin/orders"
            className="h-9 border border-[color:var(--line-2)] px-3 text-[0.85rem] leading-[2.1rem] text-[color:var(--ink-2)] hover:border-[color:var(--ink)]"
          >
            Clear
          </Link>
        ) : null}
      </form>
    </search>
  );
}

function pager(current: number, pages: number, base: URLSearchParams) {
  const link = (p: number) => {
    const params = new URLSearchParams(base);
    if (p > 0) params.set("page", String(p + 1));
    else params.delete("page");
    return `/admin/orders?${params.toString()}`;
  };
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <p className="num text-[0.78rem] text-[color:var(--ink-3)]">
        Page {current + 1} of {pages}
      </p>
      <div className="flex gap-2">
        {current > 0 ? (
          <Link
            href={link(current - 1)}
            className="border border-[color:var(--line-2)] px-3 py-1.5 text-[0.78rem] text-[color:var(--ink-2)] hover:border-[color:var(--ink)]"
          >
            Newer
          </Link>
        ) : null}
        {current < pages - 1 ? (
          <Link
            href={link(current + 1)}
            className="border border-[color:var(--line-2)] px-3 py-1.5 text-[0.78rem] text-[color:var(--ink-2)] hover:border-[color:var(--ink)]"
          >
            Older
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export async function OrdersView({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    pay?: string;
    when?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const status = sp.status ?? "all";
  const pay = sp.pay ?? "all";
  const when = sp.when ?? "all";
  const page = Math.max(0, Number.parseInt(sp.page ?? "1", 10) - 1 || 0);

  const days = WINDOWS.find((w) => w.value === when)?.days ?? 10_000;
  const cutoff = AS_OF.getTime() - days * 86_400_000;

  const filtered = ADMIN_ORDERS.filter((o) => {
    if (status !== "all" && o.status !== status) return false;
    if (pay !== "all" && o.payment !== pay) return false;
    if (Date.parse(o.placedAt) < cutoff) return false;
    if (!q) return true;
    return (
      o.id.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q) ||
      o.address.city.toLowerCase().includes(q)
    );
  }).sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt));

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages - 1);
  const rows = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status !== "all") params.set("status", status);
  if (pay !== "all") params.set("pay", pay);
  if (when !== "all") params.set("when", when);

  const filteredTotal = filtered.reduce((n, o) => n + o.totals.total, 0);

  return (
    <div className="mx-auto max-w-[76rem] px-4 py-8 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.45rem] font-semibold tracking-tight text-[color:var(--ink)]">
            Orders
          </h1>
          <p className="mt-1 text-[0.85rem] text-[color:var(--ink-2)]">
            {filtered.length === 0
              ? "No orders match these filters."
              : `${filtered.length} orders, ${inr(filteredTotal)} in the window.`}{" "}
            Pick, confirm, ship — and print from the order itself.
          </p>
        </div>
        <QuietLink href="/admin/orders?status=placed">
          {ADMIN_ORDERS.filter((o) => o.status === "placed").length} waiting to
          be confirmed
        </QuietLink>
      </header>

      <div className="mt-6">
        <FilterBar q={q} status={status} pay={pay} when={when} />
      </div>

      <div className="mt-4">
        <Panel>
          {rows.length === 0 ? (
            <EmptyNote
              action={
                <Link
                  href="/admin/orders"
                  className="border border-[color:var(--line-2)] px-3 py-1.5 text-[0.8rem] text-[color:var(--ink-2)] hover:border-[color:var(--ink)]"
                >
                  Clear the filters
                </Link>
              }
            >
              Nothing here. Widen the dates, or clear the status filter — a
              cancelled order and a delivered one are both worth seeing.
            </EmptyNote>
          ) : (
            <>
              <Table
                caption="Orders, newest first"
                head={
                  <>
                    <Th>Order</Th>
                    <Th>Customer</Th>
                    <Th>Placed</Th>
                    <Th>Items</Th>
                    <Th>Payment</Th>
                    <Th numeric>Total</Th>
                    <Th>Status</Th>
                  </>
                }
              >
                {rows.map((o) => (
                  <Row key={o.id}>
                    <Td>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="num font-medium hover:text-[color:var(--indigo)]"
                      >
                        {o.id}
                      </Link>
                    </Td>
                    <Td>
                      {o.customer.name}
                      <span className="block text-[0.75rem] text-[color:var(--ink-3)]">
                        {o.address.city}
                      </span>
                    </Td>
                    <Td className="text-[0.8rem] text-[color:var(--ink-2)]">
                      {fmtFull(o.placedAt)}
                    </Td>
                    <Td className="num text-[color:var(--ink-2)]">
                      {o.lines.reduce((n, l) => n + l.qty, 0)}
                    </Td>
                    <Td>
                      <span className="flex items-center gap-2">
                        <PayChip payment={o.payment} />
                        <span className="text-[0.75rem] text-[color:var(--ink-3)]">
                          {PAY_METHOD_LABEL[o.method]}
                        </span>
                      </span>
                    </Td>
                    <Td numeric>{inr(o.totals.total)}</Td>
                    <Td>
                      <OrderChip status={o.status} />
                    </Td>
                  </Row>
                ))}
              </Table>
              {pages > 1 ? pager(safePage, pages, params) : null}
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
