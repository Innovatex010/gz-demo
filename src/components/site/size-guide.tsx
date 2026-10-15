"use client";

import { IconRulerMeasure } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Product } from "@/lib/catalog";
import { SIZE_CHEST } from "@/lib/commerce";

/**
 * Size guide, opened from the product page.
 *
 * The chart itself already exists on /#fit — this pulls it next to the size
 * buttons, which is the only place anyone will ever actually want it. Opening a
 * new page to check a number mid-purchase is how people leave.
 */
export function SizeGuide({ product }: { product: Product }) {
  const sizes = product.sizes;
  const isBottom =
    product.category === "pants" || product.category === "trousers";

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="link-draw h-auto p-0 text-[0.8rem]">
          <IconRulerMeasure size={14} stroke={1.5} />
          Size guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="t-h3">Size guide</DialogTitle>
          <DialogDescription className="prose">
            {isBottom
              ? "Waist in inches. If you are between two, take the larger one — the waistbands give."
              : "Chest in inches, measured flat across the chest under the arms."}
          </DialogDescription>
        </DialogHeader>

        <table className="w-full border-collapse text-[0.85rem]">
          <thead>
            <tr className="border-b border-[color:var(--line-2)]">
              <th className="label py-2 text-left text-[color:var(--ink-3)]">
                Size
              </th>
              <th className="label py-2 text-left text-[color:var(--ink-3)]">
                {isBottom ? "Waist" : "Chest"}
              </th>
              <th className="label py-2 text-left text-[color:var(--ink-3)]">
                {isBottom ? "Hip" : "Waist"}
              </th>
            </tr>
          </thead>
          <tbody className="num">
            {sizes.map((s, i) => (
              <tr
                key={s}
                className="border-b border-[color:var(--line)] last:border-0"
              >
                <th scope="row" className="py-2.5 text-left font-medium">
                  {s}
                </th>
                <td className="py-2.5">
                  {isBottom ? `${30 + i * 2}"` : (SIZE_CHEST[s] ?? "—")}
                </td>
                <td className="py-2.5">
                  {isBottom ? `${36 + i * 2}"` : `${28 + i * 2}"`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-2 border-t border-[color:var(--line)] pt-5 text-[0.85rem]">
          <p className="font-medium">Not sure?</p>
          <p className="prose mt-1.5">
            {product.fitName} fit. {product.fit} Order your usual size, or size
            down for a closer line. If it is wrong, exchange is free for 15 days
            and we collect it from your door.
          </p>
        </div>

        <div className="border-t border-[color:var(--line)] pt-5">
          <p className="label text-[color:var(--ink-3)]">On the model</p>
          <p className="prose mt-2">
            {product.model.height} tall, wearing {product.model.wears} — chest{" "}
            {product.model.chest}, waist {product.model.waist}. The fit you see
            is the fit you get.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
