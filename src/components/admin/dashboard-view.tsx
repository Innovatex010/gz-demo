"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  EmptyNote,
  OrderChip,
  Panel,
  PanelHead,
  PayChip,
  QuietLink,
  Row,
  Table,
  Td,
  Th,
} from "@/components/admin/kit";
import {
  RangeTabs,
  ReportButton,
  RevenueChart,
  StatRow,
} from "@/components/admin/revenue-chart";
import {
  BESTSELLERS,
  COLLECTION_BOARD,
  LOW_STOCK,
  PAYMENT_SPLIT,
  RANGE_LABEL,
  type RangeKey,
  SERIES,
  SERIES_PREV,
  statsFor,
} from "@/lib/admin-books";
import { ADMIN_ORDERS, fmtDay, inrShort, stockLevel } from "@/lib/admin-data";
import { inr } from "@/lib/catalog";

/* The dashboard reads like the shop's day book: the four numbers that matter,
   the plot of the period, then the boards that tell you where to walk next —
   bestsellers, stock at or below threshold, the orders that just came in, and
   how the money actually arrived. */

export function DashboardView() {
  const [range, setRange] = useState<RangeKey>("month");
  const stats = statsFor(range);
  const recent = ADMIN_ORDERS.slice(0, 6);

  return (
    <div className="mx-auto max-w-[76rem] px-4 py-8 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.45rem] font-semibold tracking-tight text-[color:var(--ink)]">
            The desk
          </h1>
          <p className="mt-1 text-[0.85rem] text-[color:var(--ink-2)]">
            Thursday, 15 October 2026. The shop is open until 9.
          </p>
        </div>
        <RangeTabs value={range} onChange={setRange} />
      </header>

      <div className="mt-6 flex flex-col gap-4">
        <StatRow stats={stats} range={RANGE_LABEL[range]} />

        <Panel>
          <PanelHead
            title="Gross sales"
            hint={`${RANGE_LABEL[range]}, compared with the ${range === "year" ? "previous years" : "period before"}`}
            action={<ReportButton series={SERIES[range]} range={range} />}
          />
          <RevenueChart
            series={SERIES[range]}
            previous={SERIES_PREV[range]}
            rangeLabel={RANGE_LABEL[range]}
          />
        </Panel>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <PanelHead
              title="Bestsellers"
              hint="Last 30 days, by units"
              action={
                <QuietLink href="/admin/products">All products</QuietLink>
              }
            />
            <Table
              caption="Bestselling products over the last 30 days"
              head={
                <>
                  <Th>Product</Th>
                  <Th numeric>Units</Th>
                  <Th numeric>Revenue</Th>
                  <Th numeric>Stock left</Th>
                </>
              }
            >
              {BESTSELLERS.map((b) => (
                <Row key={b.product.id}>
                  <Td>
                    <Link
                      href={`/admin/products/${b.product.id}`}
                      className="flex items-center gap-3 hover:text-[color:var(--indigo)]"
                    >
                      <span className="relative block h-10 w-8 shrink-0 overflow-hidden bg-[color:var(--paper-3)]">
                        <Image
                          src={b.product.image}
                          alt=""
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      </span>
                      <span>
                        {b.product.name}
                        <span className="block text-[0.75rem] text-[color:var(--ink-3)]">
                          {b.product.categoryLabel}
                        </span>
                      </span>
                    </Link>
                  </Td>
                  <Td numeric>{b.units}</Td>
                  <Td numeric>{inr(b.revenue)}</Td>
                  <Td numeric>
                    <span
                      className={
                        stockLevel(b.product) === "in"
                          ? "text-[color:var(--ink-2)]"
                          : "text-[color:var(--sale)]"
                      }
                    >
                      {inrShort(b.stockLeft).replace("₹", "")}
                      {b.stockLeft <= 10 ? " — reorder" : ""}
                    </span>
                  </Td>
                </Row>
              ))}
            </Table>
          </Panel>

          <Panel>
            <PanelHead
              title="Low stock"
              hint="At or below the reorder line"
              action={
                <QuietLink href="/admin/products">Adjust stock</QuietLink>
              }
            />
            {LOW_STOCK.length === 0 ? (
              <EmptyNote>
                Everything is above its reorder line. Nothing to pick tonight.
              </EmptyNote>
            ) : (
              <Table
                caption="Variants at or below the reorder line"
                head={
                  <>
                    <Th>Product</Th>
                    <Th>Size</Th>
                    <Th>SKU</Th>
                    <Th numeric>On hand</Th>
                  </>
                }
              >
                {LOW_STOCK.slice(0, 6).map((r) => (
                  <Row key={r.sku}>
                    <Td>
                      <Link
                        href={`/admin/products/${r.product.id}`}
                        className="hover:text-[color:var(--indigo)]"
                      >
                        {r.product.name}
                      </Link>
                    </Td>
                    <Td>{r.size}</Td>
                    <Td className="num text-[0.78rem] text-[color:var(--ink-3)]">
                      {r.sku}
                    </Td>
                    <Td numeric>
                      {r.stock <= 0 ? (
                        <span className="text-[color:var(--sale)]">Out</span>
                      ) : (
                        <span className="text-[color:var(--sale)]">
                          {r.stock}
                        </span>
                      )}
                    </Td>
                  </Row>
                ))}
              </Table>
            )}
          </Panel>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel>
            <PanelHead
              title="Orders just in"
              hint="Newest first"
              action={<QuietLink href="/admin/orders">Order desk</QuietLink>}
            />
            <Table
              caption="The six most recent orders"
              head={
                <>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Placed</Th>
                  <Th numeric>Total</Th>
                  <Th>Status</Th>
                </>
              }
            >
              {recent.map((o) => (
                <Row key={o.id}>
                  <Td>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="num hover:text-[color:var(--indigo)]"
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
                    {fmtDay(o.placedAt)}
                  </Td>
                  <Td numeric>{inr(o.totals.total)}</Td>
                  <Td>
                    <OrderChip status={o.status} />
                  </Td>
                </Row>
              ))}
            </Table>
          </Panel>

          <div className="flex flex-col gap-4">
            <Panel>
              <PanelHead
                title="Payment status"
                hint="Every order on the books"
              />
              <Table
                caption="Orders by payment status"
                head={
                  <>
                    <Th>Status</Th>
                    <Th numeric>Orders</Th>
                    <Th numeric>Amount</Th>
                  </>
                }
              >
                {PAYMENT_SPLIT.map((p) => (
                  <Row key={p.status}>
                    <Td>
                      <PayChip payment={p.status} />
                    </Td>
                    <Td numeric>{p.count}</Td>
                    <Td numeric>{inr(p.amount)}</Td>
                  </Row>
                ))}
              </Table>
              {PAYMENT_SPLIT.find((p) => p.status === "failed")?.count ? (
                <p className="border-t border-[color:var(--line)] px-4 py-2.5 text-[0.78rem] text-[color:var(--ink-2)]">
                  One card payment failed and the order was cancelled.{" "}
                  <QuietLink href="/admin/orders?pay=failed">Open it</QuietLink>{" "}
                  and send a payment link if the customer wants to retry.
                </p>
              ) : null}
            </Panel>

            <Panel>
              <PanelHead title="Collections" hint="Units sold, last 30 days" />
              <Table
                caption="Units sold by collection"
                head={
                  <>
                    <Th>Collection</Th>
                    <Th numeric>Units</Th>
                    <Th numeric>Share</Th>
                  </>
                }
              >
                {COLLECTION_BOARD.map((c) => (
                  <Row key={c.name}>
                    <Td>{c.name}</Td>
                    <Td numeric>{c.units}</Td>
                    <Td numeric>{(c.share * 100).toFixed(0)}%</Td>
                  </Row>
                ))}
              </Table>
            </Panel>
          </div>
        </div>

        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3.5">
            <p className="max-w-[60ch] text-[0.85rem] leading-relaxed text-[color:var(--ink-2)]">
              {LOW_STOCK.filter((r) => r.stock <= 0).length} sizes are out and{" "}
              {
                LOW_STOCK.filter((r) => r.stock > 0 && r.stock <= r.threshold)
                  .length
              }{" "}
              are close. The cutting room needs the list by Friday for the next
              run.
            </p>
            <div className="flex items-center gap-3">
              <p className="text-[0.82rem] text-[color:var(--ink-2)]">
                {stats[0].delta === null
                  ? "Gross sales are new this period."
                  : `Gross sales are ${stats[0].delta >= 0 ? "up" : "down"} ${Math.abs(stats[0].delta ?? 0)}% on the previous ${RANGE_LABEL[range]}.`}
              </p>
              <QuietLink href="/admin/products">Review the run list</QuietLink>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
