"use client";

import { IconArrowRight, IconSearch, IconX } from "@tabler/icons-react";
import { cn } from "cn";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { type Suggestion, suggest } from "@/lib/commerce";

/**
 * Search with a live suggestion list.
 *
 * Deliberately a page and not a dropdown-over-everything: people land on
 * /search from Google, from a shared link, and from the header, and all three
 * want a page they can reload and send to someone else. The suggestions are a
 * shortcut into that page, not the page itself.
 *
 * Results come from `suggest`/`searchProducts`, which are plain synchronous
 * functions over the catalogue. Swapping them for a real index is a one-function
 * change; nothing in this file knows how the results were produced.
 */
/**
 * Controlled by the parent so the suggestion dropdown and the results grid can
 * never show two different queries.
 */
export function SearchView({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const router = useRouter();
  const q = value;
  const setQ = onChange;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const deferred = useDeferredValue(q);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = deferred.trim();
  const hasQuery = trimmed.length >= 2;
  const items: Suggestion[] = hasQuery ? suggest(deferred) : [];

  // Close on outside click and on Escape — a suggestion list that traps the page
  // is worse than one that disappears.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const go = (href: string) => {
    setOpen(false);
    inputRef.current?.blur();
    router.push(href);
  };

  const submit = () => {
    if (!trimmed) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || items.length === 0) {
      if (e.key === "ArrowDown" && items.length) {
        setOpen(true);
        setActive(0);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + items.length) % items.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0) go(items[active].href);
      else submit();
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <search>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <div className="flex items-center gap-3 border-b border-[color:var(--ink)] pb-3">
            <IconSearch size={22} stroke={1.4} className="shrink-0" />
            <input
              id="site-search"
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
                setActive(-1);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              type="search"
              autoComplete="off"
              placeholder="Shirts, tees, linen, GZ-102…"
              className="w-full bg-transparent text-[1.6rem] leading-tight outline-none placeholder:text-[color:var(--ink-3)] md:text-[2rem]"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="shrink-0 text-[color:var(--ink-3)] hover:text-[color:var(--ink)]"
              >
                <IconX size={20} stroke={1.5} />
              </button>
            )}
          </div>
        </form>
      </search>
      {open && hasQuery && items.length > 0 && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 border border-[color:var(--line-2)] bg-[color:var(--paper)]">
          <ul>
            {items.map((s, i) => (
              <li key={`${s.kind}-${s.href}-${s.label}`}>
                <button
                  type="button"
                  onClick={() => go(s.href)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                    active === i
                      ? "bg-[color:var(--ink)] text-[color:var(--paper)]"
                      : "hover:bg-[color:var(--paper-3)]",
                  )}
                >
                  {"image" in s && s.image && (
                    <span className="relative size-10 shrink-0 overflow-hidden bg-[color:var(--paper-3)]">
                      <Image
                        src={s.image}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.9rem]">
                      {s.label}
                    </span>
                    <span
                      className={cn(
                        "num block text-[0.75rem]",
                        active === i
                          ? "opacity-70"
                          : "text-[color:var(--ink-3)]",
                      )}
                    >
                      {s.meta}
                    </span>
                  </span>
                  <IconArrowRight size={15} stroke={1.5} className="shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {open && q.trim().length === 1 && (
        <p className="absolute inset-x-0 top-full z-30 mt-2 border border-[color:var(--line-2)] bg-[color:var(--paper)] px-3 py-3 text-[0.85rem] text-[color:var(--ink-2)]">
          One more character.
        </p>
      )}
    </div>
  );
}
