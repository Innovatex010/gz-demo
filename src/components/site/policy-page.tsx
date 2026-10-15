import type { ReactNode } from "react";
import { PageCrumbs } from "@/components/site/page-crumbs";

/**
 * Shared shell for the four policy pages. They differ only in wording, so the
 * furniture — breadcrumb, title block, last-updated line, prose measure and
 * the jump-to-section rail — lives here once.
 */
export function PolicyPage({
  title,
  standfirst,
  updated,
  sections,
  children,
  related,
}: {
  title: string;
  standfirst: string;
  updated: string;
  /** Drives the rail on the left. Keep these in reading order. */
  sections: { id: string; label: string }[];
  children: ReactNode;
  related?: { label: string; href: string; note: string }[];
}) {
  return (
    <div className="shell py-10 lg:py-14">
      <PageCrumbs current={title} />

      <header className="mt-10 max-w-[62ch] border-b border-[color:var(--line)] pb-10">
        <p className="label text-[color:var(--ink-3)]">Good Zone</p>
        <h1 className="t-h2 mt-4">{title}</h1>
        <p className="prose mt-5">{standfirst}</p>
        <p className="mt-6 text-[0.8rem] text-[color:var(--ink-3)]">
          Last updated {updated}
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
        <nav
          aria-label="On this page"
          className="lg:col-span-3 lg:sticky lg:top-[104px] lg:self-start"
        >
          <p className="label text-[color:var(--ink-3)]">On this page</p>
          <ol className="mt-4 space-y-2.5">
            {sections.map((s, i) => (
              <li key={s.id} className="flex gap-3 text-[0.88rem]">
                <span className="num shrink-0 text-[color:var(--ink-3)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <a href={`#${s.id}`} className="link-draw">
                  {s.label}
                </a>
              </li>
            ))}
          </ol>

          {related && related.length > 0 && (
            <div className="mt-10 border-t border-[color:var(--line)] pt-6">
              <p className="label text-[color:var(--ink-3)]">Read next</p>
              <ul className="mt-4 space-y-4">
                {related.map((r) => (
                  <li key={r.href}>
                    <a href={r.href} className="link-draw text-[0.9rem]">
                      {r.label}
                    </a>
                    <p className="mt-1 text-[0.8rem] leading-snug text-[color:var(--ink-3)]">
                      {r.note}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        <div className="min-w-0 space-y-12 lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}

/** One numbered clause. `t-h2` heading, `prose` body, consistent measure. */
export function PolicySection({
  id,
  index,
  heading,
  children,
}: {
  id: string;
  index: number;
  heading: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="min-w-0">
      <div className="flex items-baseline gap-4 border-b border-[color:var(--line)] pb-4">
        <span className="num text-[0.9rem] text-[color:var(--ink-3)]">
          {String(index).padStart(2, "0")}
        </span>
        <h2 className="t-h3">{heading}</h2>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}
