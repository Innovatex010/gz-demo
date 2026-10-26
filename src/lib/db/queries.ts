import type { SQL } from "drizzle-orm";
import { and, asc, eq, gt } from "drizzle-orm";
import {
  collectionProduct,
  product,
  productColor,
  productVariant,
} from "@/db/schema";
import type { Order as FrontendOrder } from "../account";
import type { Product as FrontendProduct } from "../catalog";
import { db } from "./drizzle";

/** Load a single product from the DB and transform it to the frontend Product type. */
export async function getProduct(id: string): Promise<FrontendProduct | null> {
  const rows = await db.select().from(product).where(eq(product.id, id));
  const p = rows[0];
  if (!p) return null;
  const [colors, variants] = await Promise.all([
    db.select().from(productColor).where(eq(productColor.productId, p.id)),
    db
      .select()
      .from(productVariant)
      .where(eq(productVariant.productId, p.id))
      .orderBy(asc(productVariant.size)),
  ]);
  return transformProduct({ ...p, colors, variants, collections: [] });
}

/** Load all products (with filtering) and transform to frontend Product type. */
export async function getProducts(opts: {
  category?: string;
  collection?: string;
  limit?: number;
  cursor?: string;
}): Promise<{ products: FrontendProduct[]; nextCursor: string | null }> {
  const { category, collection: collSlug, limit = 50, cursor } = opts;

  if (collSlug) {
    // Filter by collection — query join table, then fetch each product
    const collRows = await db
      .select({ productId: collectionProduct.productId })
      .from(collectionProduct)
      .where(eq(collectionProduct.collectionSlug, collSlug))
      .orderBy(asc(collectionProduct.productId));

    if (collRows.length === 0) return { products: [], nextCursor: null };

    let productIds = collRows.map((r) => r.productId);
    if (cursor) productIds = productIds.filter((id) => id > cursor);

    const hasNext = productIds.length > limit;
    const toLoad = hasNext ? productIds.slice(0, limit) : productIds;
    const nextCursorVal = hasNext ? (toLoad[toLoad.length - 1] ?? null) : null;

    const products = (
      await Promise.all(toLoad.map((id) => loadProduct(id)))
    ).filter((p): p is FrontendProduct => p !== null);
    return { products, nextCursor: nextCursorVal };
  }

  // No collection filter — query products directly
  const conditions: SQL[] = [];
  if (category) conditions.push(eq(product.category, category));
  if (cursor) conditions.push(gt(product.id, cursor));

  const rows =
    conditions.length > 0
      ? await db
          .select()
          .from(product)
          .where(and(...conditions))
          .orderBy(asc(product.id))
          .limit(limit + 1)
      : await db
          .select()
          .from(product)
          .orderBy(asc(product.id))
          .limit(limit + 1);

  const hasNext = rows.length > limit;
  const toTransform = hasNext ? rows.slice(0, limit) : rows;
  const nextCursorVal = hasNext
    ? (toTransform[toTransform.length - 1]?.id ?? null)
    : null;

  const products = (
    await Promise.all(toTransform.map((r) => loadProduct(r.id)))
  ).filter((p): p is FrontendProduct => p !== null);
  return { products, nextCursor: nextCursorVal };
}

/** Helper: load a product row with its colors, variants, and collections. */
async function loadProduct(id: string): Promise<FrontendProduct | null> {
  const rows = await db.select().from(product).where(eq(product.id, id));
  const p = rows[0];
  if (!p) return null;

  const [colors, variants, collRows] = await Promise.all([
    db.select().from(productColor).where(eq(productColor.productId, id)),
    db
      .select()
      .from(productVariant)
      .where(eq(productVariant.productId, id))
      .orderBy(asc(productVariant.size)),
    db
      .select({ collectionSlug: collectionProduct.collectionSlug })
      .from(collectionProduct)
      .where(eq(collectionProduct.productId, id)),
  ]);

  const _collectionSlugs = collRows.map((c) => c.collectionSlug);
  return transformProduct({ ...p, colors, variants, collections: collRows });
}

/** Transform a DB Product row to the frontend Product type. */
function transformProduct(product: any): FrontendProduct {
  const colors = (product.colors ?? []).map((c: any) => ({
    name: c.name,
    hex: c.hex,
    images: c.images,
  }));

  const sizes = (product.variants ?? []).map((v: any) => v.size);
  const stock: Record<string, number> = {};
  for (const v of product.variants ?? []) {
    stock[v.size] = v.stock;
  }

  // Handle both join rows with { collectionSlug } and raw rows
  const collectionSlugs = (product.collections ?? []).map(
    (c: any) => c.collectionSlug ?? c.slug,
  );

  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    compareAt: product.compareAt ?? undefined,
    colors,
    image: product.image,
    altImage: product.altImage ?? "",
    badge: product.badge ?? undefined,
    fabric: product.fabric,
    fit: product.fit,
    sizes,
    stock,
    fitName: product.fitName,
    model: product.model,
    care: product.care,
    collections: collectionSlugs,
  };
}

/** Transform a DB Order row to the frontend Order type. */
export function transformOrder(order: any): FrontendOrder {
  const lines = (order.lines ?? []).map((l: any) => ({
    key: l.key,
    productId: l.productId,
    size: l.size,
    color: l.color,
    qty: l.qty,
  }));

  return {
    id: order.id,
    placedAt:
      order.placedAt instanceof Date
        ? order.placedAt.toISOString()
        : order.placedAt,
    name: order.name,
    phone: order.phone,
    email: order.email,
    address: order.address,
    pin: order.pin,
    city: order.city,
    method: order.deliveryMethod,
    cod: order.cod,
    coupon: order.coupon ?? undefined,
    lines,
    totals: order.totals ?? {
      subtotal: 0,
      shipping: 0,
      discount: 0,
      tax: 0,
      total: 0,
    },
  };
}
