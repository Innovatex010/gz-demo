"use client";

import {
  IconPhoto,
  IconStar,
  IconStarFilled,
  IconX,
} from "@tabler/icons-react";
import { cn } from "cn";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/catalog";

export type Review = {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  size: string;
  fitNote: string;
  /** 1–5, so a distribution bar can be built without storing every rating. */
  stars: Record<"5" | "4" | "3" | "2" | "1", number>;
  photos: string[];
  helpful: number;
  /** True while these are illustrative rather than from a real customer. */
  sample?: boolean;
};

/* ────────────────────────────────────────────────────────────────────────────
   IMPORTANT — read before this ships.

   The seed reviews below are written by us to demonstrate the layout. They are
   NOT from customers. They must not reach production: a store displaying
   invented reviews as though real people wrote them is making false claims to
   customers, and in India that is also a consumer-protection problem, not just
   an ethical one.

   Every seeded review carries `sample: true`, and the section renders a visible
   notice while any exist. To go live: delete the seed array (the section falls
   back to a truthful empty state with a write-a-review form) and replace
   `submitReview` with a call to your reviews API.

   Aggregated platform ratings (a 4.3 from 1,200 buyers on your store page) are
   a separate matter — those come from the marketplace you sell on and must be
   fetched and displayed with their source, never typed in by hand.
   ──────────────────────────────────────────────────────────────────────────── */

const SEED: Review[] = [
  {
    id: "r1",
    author: "Sample review",
    rating: 5,
    title: "The cloth is the reason I came back",
    body: "Ordered two, kept both. The weave is heavier than I expected for the price, and it survived four washes without losing shape.",
    size: "L",
    fitNote: "True to size",
    stars: { "5": 1, "4": 0, "3": 0, "2": 0, "1": 0 },
    photos: [],
    helpful: 0,
    sample: true,
  },
  {
    id: "r2",
    author: "Sample review",
    rating: 4,
    title: "Good, one note on the cuffs",
    body: "Runs a touch long in the sleeve for me at L. Would have liked it half an inch shorter, but the body fit is exactly right.",
    size: "L",
    fitNote: "Size down if you want a shorter sleeve",
    stars: { "5": 0, "4": 1, "3": 0, "2": 0, "1": 0 },
    photos: [],
    helpful: 0,
    sample: true,
  },
];

export function Reviews({ product }: { product: Product }) {
  // Once reviews are real this comes from the API, keyed on product id.
  const [reviews] = useState<Review[]>(SEED);
  const [helpful, setHelpful] = useState<string[]>([]);

  const hasSample = reviews.some((r) => r.sample);
  const count = reviews.length;
  const avg = count ? reviews.reduce((n, r) => n + r.rating, 0) / count : 0;

  const distribution = (star: "5" | "4" | "3" | "2" | "1") =>
    count ? reviews.filter((r) => String(r.rating) === star).length / count : 0;

  return (
    <section
      id="reviews"
      className="mt-20 scroll-mt-24 border-t border-[color:var(--line)] pt-12"
    >
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="t-h2">Reviews</h2>
        <WriteReview product={product} />
      </div>

      {hasSample && (
        <p className="mt-6 border-l-2 border-[color:var(--sale)] bg-[color:var(--paper-3)] px-4 py-3 text-[0.83rem]">
          <strong className="font-medium">Sample content.</strong> These reviews
          were written by us to show the layout. They are not from customers and
          must be removed before this goes live.
        </p>
      )}

      {count === 0 ? (
        <p className="prose mt-8 max-w-prose">
          No reviews on this style yet. If you have bought it, yours would be
          the first.
        </p>
      ) : (
        <>
          <div className="mt-8 grid gap-10 sm:grid-cols-[auto_1fr] sm:gap-16">
            {/* Summary */}
            <div>
              <p className="num text-[3rem] leading-none">{avg.toFixed(1)}</p>
              <Stars value={avg} size={16} className="mt-2" />
              <p className="mt-2 text-[0.8rem] text-[color:var(--ink-3)]">
                {count} {count === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Distribution */}
            <dl className="space-y-1.5 self-center">
              {(["5", "4", "3", "2", "1"] as const).map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <dt className="num w-8 shrink-0 text-[0.78rem] text-[color:var(--ink-3)]">
                    {s}★
                  </dt>
                  <dd className="flex-1">
                    <span className="block h-1.5 w-full bg-[color:var(--paper-3)]">
                      <span
                        className="block h-full bg-[color:var(--ink)]"
                        style={{ width: `${distribution(s) * 100}%` }}
                      />
                    </span>
                  </dd>
                  <span className="num w-6 shrink-0 text-right text-[0.75rem] text-[color:var(--ink-3)]">
                    {Math.round(distribution(s) * count)}
                  </span>
                </div>
              ))}
            </dl>
          </div>

          <ul className="mt-12 divide-y divide-[color:var(--line)] border-t border-[color:var(--line)]">
            {reviews.map((r) => {
              const voted = helpful.includes(r.id);
              return (
                <li key={r.id} className="py-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Stars value={r.rating} size={14} />
                    <span className="text-[0.78rem] text-[color:var(--ink-3)]">
                      {r.sample ? "Sample review" : r.author}
                    </span>
                  </div>

                  <h3 className="mt-3 text-[0.95rem] font-medium">{r.title}</h3>
                  <p className="prose mt-2 max-w-prose text-[0.9rem]">
                    {r.body}
                  </p>

                  {r.photos.length > 0 && (
                    <ul className="mt-4 flex gap-2">
                      {r.photos.map((src) => (
                        <li
                          key={src}
                          className="relative aspect-4/5 w-20 overflow-hidden bg-[color:var(--paper-3)]"
                        >
                          <Image
                            src={src}
                            alt=""
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="mt-4 text-[0.8rem] text-[color:var(--ink-3)]">
                    Size bought: {r.size} · {r.fitNote}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setHelpful((h) =>
                        voted ? h.filter((x) => x !== r.id) : [...h, r.id],
                      )
                    }
                    disabled={r.sample}
                    className={cn(
                      "mt-4 text-[0.8rem] transition-colors",
                      r.sample
                        ? "cursor-not-allowed text-[color:var(--ink-3)] opacity-50"
                        : voted
                          ? "text-[color:var(--ink)]"
                          : "text-[color:var(--ink-3)] hover:text-[color:var(--ink)]",
                    )}
                  >
                    {r.sample
                      ? "Helpful"
                      : voted
                        ? "Marked helpful"
                        : "Helpful"}
                    {!r.sample && r.helpful > 0 && ` (${r.helpful})`}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

function Stars({
  value,
  size = 14,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex gap-0.5", className)}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) =>
        value >= i - 0.25 ? (
          <IconStarFilled
            key={i}
            size={size}
            className="text-[color:var(--ink)]"
          />
        ) : (
          <IconStar
            key={i}
            size={size}
            className="text-[color:var(--line-2)]"
          />
        ),
      )}
    </span>
  );
}

function WriteReview({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [fit, setFit] = useState("True to size");
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (rating === 0) errs.push("Pick a star rating.");
    if (title.trim().length < 3) errs.push("Give it a short title.");
    if (body.trim().length < 15)
      errs.push("A sentence or two, so it helps someone.");
    setErrors(errs);
    if (errs.length) return;

    // The seam. Replace with a POST to your reviews endpoint. Nothing is
    // stored and no confirmation is faked, because there is nowhere to store it.
    toast.success("Review ready to submit", {
      description:
        "There is no reviews service connected yet, so this was not saved.",
    });
    setOpen(false);
    setRating(0);
    setTitle("");
    setBody("");
    setPhotos([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="rounded-4xl px-5 py-2.5 text-[0.85rem]"
        >
          Write a review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="t-h3">Review {product.name}</DialogTitle>
          <DialogDescription className="prose">
            Say how it fits, not just that it is good. The size note is the part
            people actually read.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5">
          <fieldset>
            <legend className="label text-[color:var(--ink-3)]">Rating</legend>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i)}
                  aria-label={`${i} star${i > 1 ? "s" : ""}`}
                  aria-pressed={rating === i}
                  className="p-1"
                >
                  {i <= rating ? (
                    <IconStarFilled
                      size={22}
                      className="text-[color:var(--ink)]"
                    />
                  ) : (
                    <IconStar
                      size={22}
                      className="text-[color:var(--line-2)]"
                    />
                  )}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="rv-title"
              className="label text-[color:var(--ink-3)]"
            >
              Title
            </label>
            <input
              id="rv-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full border border-[color:var(--line-2)] px-3 py-3 text-[0.95rem] outline-none focus:border-[color:var(--ink)]"
            />
          </div>

          <div>
            <label
              htmlFor="rv-body"
              className="label text-[color:var(--ink-3)]"
            >
              Your review
            </label>
            <Textarea
              id="rv-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="mt-2 w-full border border-[color:var(--line-2)] px-3 py-3 text-[0.95rem] outline-none focus:border-[color:var(--ink)]"
            />
          </div>

          <div>
            <label htmlFor="rv-fit" className="label text-[color:var(--ink-3)]">
              How did it fit?
            </label>
            <select
              id="rv-fit"
              value={fit}
              onChange={(e) => setFit(e.target.value)}
              className="mt-2 w-full border border-[color:var(--line-2)] px-3 py-3 text-[0.95rem] outline-none focus:border-[color:var(--ink)]"
            >
              {[
                "Runs small — size up",
                "True to size",
                "Runs large — size down",
                "Fits differently in the shoulders",
              ].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="label text-[color:var(--ink-3)]">Photos</span>
            <label className="mt-2 flex cursor-pointer items-center gap-2 border border-dashed border-[color:var(--line-2)] px-4 py-6 text-[0.85rem] text-[color:var(--ink-3)]">
              <IconPhoto size={16} stroke={1.5} />
              {photos.length
                ? `${photos.length} photo${photos.length > 1 ? "s" : ""} chosen`
                : "Add photos"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  for (const f of files) {
                    const url = URL.createObjectURL(f);
                    setPhotos((p) => [...p, url]);
                  }
                  e.target.value = "";
                }}
              />
            </label>
            {photos.length > 0 && (
              <ul className="mt-2 flex gap-2">
                {photos.map((src, i) => (
                  <li
                    key={src}
                    className="relative aspect-4/5 w-16 overflow-hidden bg-[color:var(--paper-3)]"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPhotos((p) => {
                          URL.revokeObjectURL(p[i]);
                          return p.filter((_, j) => j !== i);
                        })
                      }
                      aria-label="Remove photo"
                      className="absolute top-0 right-0 grid size-5 place-items-center bg-[color:var(--ink)] text-[color:var(--paper)]"
                    >
                      <IconX size={11} stroke={2} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {errors.length > 0 && (
            <ul
              role="alert"
              className="space-y-1 text-[0.83rem] text-[color:var(--sale)]"
            >
              {errors.map((e) => (
                <li key={e} className="flex items-start gap-2">
                  <IconX size={13} stroke={2} className="mt-1 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          )}

          <Button type="submit" className="w-full rounded-4xl py-3.5">
            Submit review
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
