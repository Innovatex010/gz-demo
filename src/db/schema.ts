/**
 * Drizzle ORM schema.
 *
 * Better-Auth tables use camelCase JavaScript property names so the adapter's
 * schema-check can match them. Database column names follow snake_case (PostgreSQL
 * convention) — the adapter resolves columns by JS property name, not column name.
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// ── Better-Auth core tables ────────────────────────────────────────────────

export const user = pgTable("user", {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  razorpayCustomerId: text("razorpay_customer_id").unique(),
});

export const session = pgTable(
  "session",
  {
    id: text().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at").notNull(),
    token: text().notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (table) => [index("session_user_id_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text(),
    password: text(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("account_user_id_idx").on(table.userId),
    index("account_account_id_idx").on(table.accountId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text().primaryKey(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("verification_identifier_idx").on(table.identifier),
    index("verification_value_idx").on(table.value),
  ],
);

// Subscription table — required by @amank-root/better-auth-razorpay
export const subscription = pgTable(
  "subscription",
  {
    id: text().primaryKey(),
    plan: text().notNull(),
    referenceId: text("reference_id").notNull(),
    razorpayCustomerId: text("razorpay_customer_id"),
    razorpaySubscriptionId: text("razorpay_subscription_id"),
    razorpayPlanId: text("razorpay_plan_id"),
    status: text().notNull().default("created"),
    currentStart: timestamp("current_start"),
    currentEnd: timestamp("current_end"),
    endedAt: timestamp("ended_at"),
    quantity: integer().default(1),
    totalCount: integer("total_count"),
    paidCount: integer("paid_count").default(0),
    remainingCount: integer("remaining_count"),
    cancelledAt: timestamp("cancelled_at"),
    pausedAt: timestamp("paused_at"),
    shortUrl: text("short_url"),
    cancelAtCycleEnd: boolean("cancel_at_cycle_end").default(false),
    billingPeriod: text("billing_period"),
    trialStart: timestamp("trial_start"),
    trialEnd: timestamp("trial_end"),
    metadata: text(),
    renewedAt: timestamp("renewed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("subscription_user_id_idx").on(table.referenceId),
    index("subscription_razorpay_customer_id_idx").on(table.razorpayCustomerId),
  ],
);

// ── E-commerce tables ────────────────────────────────────────────────────

export const productStatusEnum = pgEnum("product_status", [
  "active",
  "draft",
  "archived",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);
export const payMethodEnum = pgEnum("pay_method", [
  "card",
  "upi",
  "wallet",
  "cod",
]);
export const payStatusEnum = pgEnum("pay_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

export const product = pgTable("product", {
  id: text().primaryKey(),
  name: text().notNull(),
  category: text().notNull(),
  price: integer().notNull(),
  compareAt: integer("compare_at"),
  badge: text(),
  fabric: text().notNull(),
  fit: text().notNull(),
  fitName: text("fit_name").notNull(),
  image: text().notNull(),
  altImage: text("alt_image"),
  model: jsonb().notNull(),
  care: text().notNull(),
  status: productStatusEnum().notNull().default("active"),
  cost: integer(),
  unitsSold30d: integer("units_sold_30d").default(0),
});

export const productColor = pgTable(
  "product_color",
  {
    id: text().primaryKey(),
    name: text().notNull(),
    hex: text().notNull(),
    images: text().array().notNull().default([]),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
  },
  (table) => [index("product_color_product_id_idx").on(table.productId)],
);

export const productVariant = pgTable(
  "product_variant",
  {
    id: text().primaryKey(),
    size: text().notNull(),
    sku: text().notNull().unique(),
    stock: integer().default(0),
    threshold: integer().default(0),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("product_variant_product_id_idx").on(table.productId),
    index("product_variant_sku_idx").on(table.sku),
  ],
);

export const collection = pgTable("collection", {
  slug: text().primaryKey(),
  title: text().notNull(),
  blurb: text(),
  image: text(),
});

export const collectionProduct = pgTable(
  "collection_product",
  {
    collectionSlug: text("collection_slug")
      .notNull()
      .references(() => collection.slug, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.collectionSlug, table.productId] }),
    index("collection_product_slug_idx").on(table.collectionSlug),
    index("collection_product_product_idx").on(table.productId),
  ],
);

export const order = pgTable(
  "order_table",
  {
    id: text().primaryKey(),
    placedAt: timestamp("placed_at").notNull().defaultNow(),
    customerId: text("customer_id").references(() => user.id),
    name: text().notNull(),
    phone: text().notNull(),
    email: text().notNull(),
    address: text().notNull(),
    pin: text().notNull(),
    city: text().notNull(),
    deliveryMethod: text("delivery_method").notNull(),
    cod: boolean().notNull().default(true),
    paymentMethod: payMethodEnum("payment_method"),
    paymentStatus: payStatusEnum("payment_status").notNull().default("pending"),
    status: orderStatusEnum().notNull().default("pending"),
    coupon: text(),
    carrier: text(),
    tracking: text(),
    totals: jsonb().notNull(),
  },
  (table) => [
    index("order_customer_id_idx").on(table.customerId),
    index("order_placed_at_idx").on(table.placedAt),
  ],
);

// Rename to "order" in queries if needed — table name is order_table to avoid
// SQL reserved word conflict, but all application code uses the `order` symbol.
export const orderLine = pgTable(
  "order_line",
  {
    id: text().primaryKey(),
    key: text().notNull(),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    name: text().notNull(),
    size: text().notNull(),
    color: text().notNull(),
    qty: integer().notNull(),
    price: integer().notNull(),
  },
  (table) => [index("order_line_order_id_idx").on(table.orderId)],
);

export const orderEvent = pgTable(
  "order_event",
  {
    id: text().primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    stage: orderStatusEnum().notNull(),
    at: text().notNull(),
    note: text(),
  },
  (table) => [index("order_event_order_id_idx").on(table.orderId)],
);

export const address = pgTable(
  "address",
  {
    id: text().primaryKey(),
    customerId: text("customer_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    label: text().notNull(),
    name: text().notNull(),
    phone: text().notNull(),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text().notNull(),
    pin: text().notNull(),
    state: text().notNull(),
    isDefault: boolean("default").default(false),
  },
  (table) => [index("address_customer_id_idx").on(table.customerId)],
);

export const coupon = pgTable("coupon", {
  code: text().primaryKey(),
  kind: text(),
  value: integer(),
  note: text(),
  used: integer().default(0),
  active: boolean().default(true),
});

export const review = pgTable(
  "review",
  {
    id: text().primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    productName: text("product_name").notNull(),
    author: text().notNull(),
    rating: integer().notNull(),
    text: text().notNull(),
    at: text().notNull(),
    status: text().notNull().default("pending"),
  },
  (table) => [index("review_product_id_idx").on(table.productId)],
);

// ── Export a flat schema object for Drizzle Kit introspection ────────────
export const schema = {
  user,
  session,
  account,
  verification,
  subscription,
  product,
  productColor,
  productVariant,
  collection,
  collectionProduct,
  order,
  orderLine,
  orderEvent,
  address,
  coupon,
  review,
};
