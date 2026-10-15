"use client";

import { cn } from "cn";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { inr, type Product } from "@/lib/catalog";
import { sizeStock, stockLine } from "@/lib/commerce";
import { useStore } from "@/lib/stores";

/**
 * One dialog for the whole grid.
 *
 * A grid of twenty products would otherwise mount twenty `Dialog` instances,
 * each with its own focus trap and scroll lock. The open state lives in a
 * provider once, and cards only ever send a product through it.
 */
type QV = {
  product: Product | null;
  open: (p: Product) => void;
  close: () => void;
  /** False when rendered outside a provider — see `useQuickView`. */
  available: boolean;
};

const QvCtx = createContext<QV | null>(null);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  const open = useCallback((p: Product) => setProduct(p), []);
  const close = useCallback(() => setProduct(null), []);
  const value = useMemo(
    () => ({ product, open, close, available: true }),
    [product, open, close],
  );
  return <QvCtx.Provider value={value}>{children}</QvCtx.Provider>;
}

/**
 * Safe to call outside a provider. A card is sometimes rendered on its own —
 * in the "goes with it" rows on a product page, for instance — and a grid that
 * has not mounted a provider should still work: the trigger just sends you to
 * the product page instead, which is where you would have ended up anyway.
 */
const NO_PROVIDER = {
  product: null,
  open: () => {},
  close: () => {},
  available: false,
};

export function useQuickView() {
  const c = useContext(QvCtx);
  return c ?? NO_PROVIDER;
}

/** Mounted once, anywhere in a grid. Renders the dialog itself. */
export function QuickViewHost() {
  const { product, close } = useQuickView();
  return <QuickView product={product} onClose={close} />;
}

/** The trigger a card puts over its frame. */
export function QuickViewButton({
  product,
  className,
  children,
}: {
  product: Product;
  className?: string;
  children?: ReactNode;
}) {
  const { open, available } = useQuickView();
  const router = useRouter();

  // Always a <button>, never a <Link>. This sits over a card that is itself a
  // link, and an anchor inside an anchor is invalid HTML — the browser closes
  // the outer one early and React throws a hydration mismatch. Without a
  // provider mounted it navigates instead, which still goes somewhere useful.
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (available) open(product);
        else router.push(`/shop/${product.id}`);
      }}
      className={className}
    >
      {children ?? "Quick view"}
    </button>
  );
}

/**
 * Quick view — the whole reason a grid is browsable.
 *
 * Opening a full product page for a look you have not decided on is the
 * fastest way to lose someone. This gives the three decisions that matter
 * (colour, size, add to bag) without losing the grid.
 *
 * It renders nothing at all until `product` is set, so there is no hidden
 * dialog sitting in the DOM for every card on the page.
 */
export function QuickView({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const { addToCart } = useStore();
  const router = useRouter();
  const [colour, setColour] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  // Reset whenever a different product opens, so state never leaks between them.
  useEffect(() => {
    if (!product) return;
    setColour(0);
    setSize(null);
    setQty(1);
  }, [product]);

  if (!product) return null;

  const cw = product.colors[colour] ?? product.colors[0];
  const shot = cw?.images?.[0] ?? product.image;
  const n = size ? sizeStock(product, size) : 0;

  const add = () => {
    if (!size) {
      toast.error("Pick a size first");
      return;
    }
    addToCart(product, size, cw.name, qty);
    toast.success(`${product.name} added to your bag`, {
      description: `${size} · ${cw.name} · ${inr(product.price * qty)}`,
    });
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        showCloseButton
        className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="relative aspect-4/5 overflow-hidden bg-[color:var(--paper-3)]">
            <Image
              src={shot}
              alt={`${product.name} in ${cw?.name}`}
              fill
              sizes="(max-width: 640px) 100vw, 45vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col">
            <DialogTitle className="t-h3">{product.name}</DialogTitle>

            <p className="num mt-2 text-[1.15rem]">
              {inr(product.price)}
              {product.compareAt && (
                <span className="ml-2 text-[0.85rem] text-[color:var(--ink-3)] line-through">
                  {inr(product.compareAt)}
                </span>
              )}
            </p>

            <p className="prose mt-3 text-[0.875rem]">{product.fabric}</p>

            <div className="mt-5">
              <div className="flex items-baseline justify-between">
                <span className="label text-[color:var(--ink-3)]">Colour</span>
                <span className="text-[0.82rem]">{cw?.name}</span>
              </div>
              <div className="mt-2.5 flex gap-2.5">
                {product.colors.map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColour(i)}
                    aria-pressed={colour === i}
                    aria-label={c.name}
                    className={cn(
                      "size-8 rounded-full ring-1 ring-[color:var(--line-2)] ring-offset-2 ring-offset-[color:var(--paper)]",
                      colour === i && "ring-2 ring-[color:var(--ink)]",
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <div className="mt-5">
              <span className="label text-[color:var(--ink-3)]">Size</span>
              <div className="mt-2.5 grid grid-cols-6 gap-1.5">
                {product.sizes.map((s) => {
                  const out = sizeStock(product, s) === 0;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={out}
                      onClick={() => setSize(s)}
                      aria-pressed={size === s}
                      className={cn(
                        "border py-2 text-[0.8rem] transition-colors",
                        size === s
                          ? "border-[color:var(--ink)] bg-[color:var(--ink)] text-[color:var(--paper)]"
                          : "border-[color:var(--line-2)] hover:border-[color:var(--ink)]",
                        out &&
                          "cursor-not-allowed text-[color:var(--ink-3)] line-through opacity-55",
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              <p
                aria-live="polite"
                className="mt-2 min-h-4 text-[0.8rem] text-[color:var(--ink-2)]"
              >
                {size ? stockLine(product, size) : ""}
              </p>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex items-center border border-[color:var(--line-2)]">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Reduce quantity"
                  className="px-3 py-2.5 text-[0.9rem] disabled:opacity-35"
                >
                  −
                </button>
                <span className="num w-8 text-center text-[0.9rem]">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  disabled={qty >= Math.min(10, n || 10)}
                  aria-label="Increase quantity"
                  className="px-3 py-2.5 text-[0.9rem] disabled:opacity-35"
                >
                  +
                </button>
              </div>
              <span className="num text-[1.05rem]">
                {inr(product.price * qty)}
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <Button
                onClick={add}
                disabled={!size || n === 0}
                className="w-full rounded-4xl py-4"
              >
                {size
                  ? `Add to bag — ${inr(product.price * qty)}`
                  : "Pick a size"}
              </Button>
              {/* A button, not a link: the sibling quantity controls make this
                  column, and a button inside an anchor is invalid HTML. */}
              <button
                type="button"
                onClick={() => {
                  router.push(`/shop/${product.id}`);
                  onClose();
                }}
                className="link-draw py-1 text-center text-[0.85rem]"
              >
                Full details, sizing and delivery
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
