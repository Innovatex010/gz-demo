"use client";

import {
  IconArrowDown,
  IconArrowUp,
  IconEye,
  IconGripVertical,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { cn } from "cn";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyNote, Panel, PanelHead } from "@/components/admin/kit";
import { ADMIN_PRODUCTS } from "@/lib/admin-data";
import {
  ANNOUNCEMENTS,
  type Announcement,
  CMS_PAGES,
  type CmsPage,
  FEATURED_COLLECTIONS,
  FEATURED_PRODUCT_IDS,
  HERO,
  type Hero,
  NAV_ITEMS,
  type NavItem,
  SECTIONS,
  type Section,
} from "@/lib/admin-storefront";

const h1Cls =
  "text-[1.45rem] font-semibold tracking-tight text-[color:var(--ink)]";
const lede =
  "mt-1 max-w-[66ch] text-[0.85rem] leading-relaxed text-[color:var(--ink-2)]";
const field =
  "h-9 border border-[color:var(--line-2)] bg-[color:var(--paper)] px-2.5 text-[0.85rem] placeholder:text-[color:var(--ink-3)] focus-visible:border-[color:var(--indigo)]";
const area =
  "min-h-[6rem] w-full resize-y border border-[color:var(--line-2)] bg-[color:var(--paper)] px-2.5 py-2 text-[0.85rem] placeholder:text-[color:var(--ink-3)] focus-visible:border-[color:var(--indigo)]";
const inkBtn =
  "flex items-center gap-1.5 bg-[color:var(--ink)] px-3 py-1.5 text-[0.8rem] font-medium text-[color:var(--paper)] transition-opacity hover:opacity-85";
const smallBtn =
  "flex items-center gap-1.5 border border-[color:var(--line-2)] px-2.5 py-1 text-[0.75rem] text-[color:var(--ink-2)] transition-colors hover:border-[color:var(--ink)] hover:text-[color:var(--ink)]";
const tabs = "flex border border-[color:var(--line-2)]";
const tabCls = (on: boolean) =>
  on
    ? "bg-[color:var(--ink)] px-3 py-1.5 text-[0.8rem] text-[color:var(--paper)]"
    : "px-3 py-1.5 text-[0.8rem] text-[color:var(--ink-2)] hover:bg-[color:var(--paper-3)]";

export function StorefrontView() {
  const [tab, setTab] = useState<
    "content" | "layout" | "featured" | "menus" | "pages" | "preview"
  >("content");
  const [published, setPublished] = useState(true);
  const [hero, setHero] = useState<Hero>({ ...HERO });
  const [announcements, setAnnouncements] =
    useState<Announcement[]>(ANNOUNCEMENTS);
  const [sections, setSections] = useState<Section[]>(
    SECTIONS.map((s) => ({ ...s })),
  );
  const [nav, setNav] = useState<NavItem[]>(NAV_ITEMS.map((n) => ({ ...n })));
  const [pages, setPages] = useState<CmsPage[]>(
    CMS_PAGES.map((p) => ({ ...p })),
  );
  const [featured, setFeatured] = useState<string[]>(FEATURED_PRODUCT_IDS);
  const [newAnn, setNewAnn] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);

  const move = (id: string, dir: -1 | 1) => {
    setSections((ss) => {
      const i = ss.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= ss.length) return ss;
      const next = [...ss];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const onDragStart = (id: string) => setDragging(id);
  const onDrop = (id: string) => {
    if (!dragging || dragging === id) return;
    setSections((ss) => {
      const from = ss.findIndex((s) => s.id === dragging);
      const to = ss.findIndex((s) => s.id === id);
      if (from < 0 || to < 0) return ss;
      const next = [...ss];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
    setDragging(null);
  };

  const toggleSection = (id: string) =>
    setSections((ss) =>
      ss.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)),
    );

  const toggleNav = (href: string) =>
    setNav((ns) =>
      ns.map((n) => (n.href === href ? { ...n, enabled: !n.enabled } : n)),
    );

  const togglePage = (slug: string) =>
    setPages((ps) =>
      ps.map((p) => (p.slug === slug ? { ...p, published: !p.published } : p)),
    );

  const addAnnouncement = () => {
    if (!newAnn.trim()) {
      toast("Write the announcement first.");
      return;
    }
    setAnnouncements((as) => [
      {
        id: `AN-${as.length + 1}`,
        text: newAnn.trim(),
        linkLabel: "Read more",
        linkHref: "/",
        active: true,
      },
      ...as,
    ]);
    setNewAnn("");
    toast("Announcement added.");
  };

  const removeAnnouncement = (id: string) => {
    setAnnouncements((as) => as.filter((a) => a.id !== id));
    toast("Removed.");
  };

  const publish = () => {
    setPublished(true);
    toast("Storefront changes published.");
  };

  const draft = () => {
    setPublished(false);
    toast("Saved as draft. Nothing is live yet.");
  };

  return (
    <div className="mx-auto max-w-[76rem] px-4 py-8 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={h1Cls}>Storefront</h1>
          <p className={lede}>
            What the shop shows: the banners, the ordering of the page, the
            featured styles, the menus people navigate by, and the pages behind
            them. Preview before publishing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[0.8rem] text-[color:var(--ink-3)]">
            {published ? "Live" : "Draft"}
          </span>
          <button type="button" onClick={draft} className={smallBtn}>
            Save draft
          </button>
          <button type="button" onClick={publish} className={inkBtn}>
            <IconEye size={14} stroke={1.6} aria-hidden />
            Publish
          </button>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Storefront sections" className={tabs}>
          {(
            [
              ["content", "Content"],
              ["layout", "Homepage layout"],
              ["featured", "Featured"],
              ["menus", "Menus"],
              ["pages", "Pages"],
              ["preview", "Preview"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={tabCls(tab === key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {tab === "content" && (
          <>
            <Panel>
              <PanelHead
                title="Announcement bar"
                hint="Thin band above the hero"
              />
              <div className="flex flex-col">
                {announcements.length === 0 ? (
                  <EmptyNote>No announcements on the desk.</EmptyNote>
                ) : (
                  announcements.map((a) => (
                    <div
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--line)] px-4 py-3 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={a.active}
                          onChange={() =>
                            setAnnouncements((as) =>
                              as.map((x) =>
                                x.id === a.id ? { ...x, active: !x.active } : x,
                              ),
                            )
                          }
                          className="size-3.5 accent-[color:var(--indigo)]"
                          aria-label={`${a.id} active`}
                        />
                        <span className="text-[0.85rem] text-[color:var(--ink)]">
                          {a.text}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAnnouncement(a.id)}
                        className={smallBtn}
                      >
                        <IconTrash size={13} stroke={1.6} aria-hidden />
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-[color:var(--line)] px-4 py-3">
                <input
                  value={newAnn}
                  onChange={(e) => setNewAnn(e.target.value)}
                  placeholder="Write a new announcement"
                  className={cn(field, "min-w-[16rem] flex-1")}
                />
                <button
                  type="button"
                  onClick={addAnnouncement}
                  className={inkBtn}
                >
                  <IconPlus size={14} stroke={1.6} aria-hidden />
                  Add
                </button>
              </div>
            </Panel>

            <Panel>
              <PanelHead title="Hero" hint="Full-width opener" />
              <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <p className="text-[0.72rem] text-[color:var(--ink-3)]">
                    Eyebrow
                  </p>
                  <input
                    value={hero.eyebrow}
                    onChange={(e) =>
                      setHero((h) => ({ ...h, eyebrow: e.target.value }))
                    }
                    className={cn(field, "mt-1 w-full")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[0.72rem] text-[color:var(--ink-3)]">
                    Title
                  </p>
                  <input
                    value={hero.title}
                    onChange={(e) =>
                      setHero((h) => ({ ...h, title: e.target.value }))
                    }
                    className={cn(field, "mt-1 w-full")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[0.72rem] text-[color:var(--ink-3)]">
                    Body
                  </p>
                  <textarea
                    value={hero.body}
                    onChange={(e) =>
                      setHero((h) => ({ ...h, body: e.target.value }))
                    }
                    className={cn(area, "mt-1")}
                  />
                </div>
                <div>
                  <p className="text-[0.72rem] text-[color:var(--ink-3)]">
                    Button label
                  </p>
                  <input
                    value={hero.ctaLabel}
                    onChange={(e) =>
                      setHero((h) => ({ ...h, ctaLabel: e.target.value }))
                    }
                    className={cn(field, "mt-1 w-full")}
                  />
                </div>
                <div>
                  <p className="text-[0.72rem] text-[color:var(--ink-3)]">
                    Button link
                  </p>
                  <input
                    value={hero.ctaHref}
                    onChange={(e) =>
                      setHero((h) => ({ ...h, ctaHref: e.target.value }))
                    }
                    className={cn(field, "mt-1 w-full num")}
                  />
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[0.72rem] text-[color:var(--ink-3)]">
                    Hero images (one path per line, auto-slideshow)
                  </p>
                  <textarea
                    value={hero.images.join("\n")}
                    onChange={(e) =>
                      setHero((h) => ({
                        ...h,
                        images: e.target.value.split("\n").filter(Boolean),
                      }))
                    }
                    className={cn(area, "mt-1")}
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hero.autoPlay}
                    onChange={(e) =>
                      setHero((h) => ({ ...h, autoPlay: e.target.checked }))
                    }
                    className="size-3.5 accent-[color:var(--indigo)]"
                    aria-label="Hero auto-play"
                  />
                  <span className="text-[0.8rem] text-[color:var(--ink-2)]">
                    Auto-play the hero slideshow
                  </span>
                </div>
                <div className="sm:col-span-2 flex items-center gap-2 border-t border-[color:var(--line)] pt-3">
                  <input
                    type="checkbox"
                    checked={hero.published}
                    onChange={(e) =>
                      setHero((h) => ({ ...h, published: e.target.checked }))
                    }
                    className="size-3.5 accent-[color:var(--indigo)]"
                    aria-label="Hero published"
                  />
                  <span className="text-[0.8rem] text-[color:var(--ink-2)]">
                    Hero is live on the homepage
                  </span>
                </div>
              </div>
            </Panel>
          </>
        )}

        {tab === "layout" && (
          <Panel>
            <PanelHead
              title="Homepage layout"
              hint="Drag to reorder, or use the arrows. Toggle to hide a section."
            />
            <ul>
              {sections.map((s, i) => (
                <li
                  key={s.id}
                  draggable
                  onDragStart={() => onDragStart(s.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(s.id)}
                  className={cn(
                    "flex items-center gap-3 border-b border-[color:var(--line)] px-4 py-3 last:border-b-0",
                    dragging === s.id && "opacity-40",
                  )}
                >
                  <IconGripVertical
                    size={16}
                    stroke={1.4}
                    aria-hidden
                    className="text-[color:var(--ink-3)]"
                  />
                  <input
                    type="checkbox"
                    checked={s.enabled}
                    onChange={() => toggleSection(s.id)}
                    className="size-3.5 accent-[color:var(--indigo)]"
                    aria-label={`${s.label} enabled`}
                  />
                  <div className="flex-1">
                    <p className="text-[0.85rem] font-medium text-[color:var(--ink)]">
                      {s.label}
                    </p>
                    <p className="text-[0.75rem] text-[color:var(--ink-3)]">
                      {s.note}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={`Move ${s.label} up`}
                      disabled={i === 0}
                      onClick={() => move(s.id, -1)}
                      className={smallBtn}
                    >
                      <IconArrowUp size={13} stroke={1.6} aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${s.label} down`}
                      disabled={i === sections.length - 1}
                      onClick={() => move(s.id, 1)}
                      className={smallBtn}
                    >
                      <IconArrowDown size={13} stroke={1.6} aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {tab === "featured" && (
          <>
            <Panel>
              <PanelHead
                title="Featured products"
                hint="Shown in the featured collection rail"
              />
              <div className="flex flex-col">
                {ADMIN_PRODUCTS.map((p) => {
                  const on = featured.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-3 border-b border-[color:var(--line)] px-4 py-2.5 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() =>
                          setFeatured((fs) =>
                            on ? fs.filter((x) => x !== p.id) : [...fs, p.id],
                          )
                        }
                        className="size-3.5 accent-[color:var(--indigo)]"
                      />
                      <span className="text-[0.85rem] text-[color:var(--ink)]">
                        {p.name}
                      </span>
                      <span className="text-[0.75rem] text-[color:var(--ink-3)]">
                        {p.categoryLabel}
                      </span>
                    </label>
                  );
                })}
              </div>
            </Panel>
            <Panel>
              <PanelHead
                title="Featured collections"
                hint="Curated groups on the homepage"
              />
              <ul>
                {FEATURED_COLLECTIONS.map((c) => (
                  <li
                    key={c}
                    className="flex items-center justify-between border-b border-[color:var(--line)] px-4 py-2.5 last:border-b-0"
                  >
                    <span className="text-[0.85rem] text-[color:var(--ink)]">
                      {c}
                    </span>
                    <span className="text-[0.75rem] text-[color:var(--ink-3)]">
                      Collection
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </>
        )}

        {tab === "menus" && (
          <>
            <Panel>
              <PanelHead title="Navigation menu" hint="Top bar links" />
              <ul>
                {nav.map((n) => (
                  <li
                    key={n.href}
                    className="flex items-center gap-3 border-b border-[color:var(--line)] px-4 py-2.5 last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={n.enabled}
                      onChange={() => toggleNav(n.href)}
                      className="size-3.5 accent-[color:var(--indigo)]"
                      aria-label={`${n.label} enabled`}
                    />
                    <span className="flex-1 text-[0.85rem] text-[color:var(--ink)]">
                      {n.label}
                    </span>
                    <span className="num text-[0.75rem] text-[color:var(--ink-3)]">
                      {n.href}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel>
              <PanelHead
                title="Footer"
                hint="Three columns, edited in code for now"
              />
              <p className="px-4 py-3.5 text-[0.85rem] text-[color:var(--ink-2)]">
                The footer carries the shop, the story and the help columns.
                Edit their links in the codebase until a WYSIWYG editor lands.
              </p>
            </Panel>
          </>
        )}

        {tab === "pages" && (
          <Panel>
            <PanelHead title="Pages" hint="Lookbook, about, FAQ and policies" />
            <ul>
              {pages.map((p) => (
                <li
                  key={p.slug}
                  className="border-b border-[color:var(--line)] px-4 py-3.5 last:border-b-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[0.85rem] font-medium text-[color:var(--ink)]">
                        {p.title}
                      </p>
                      <p className="text-[0.75rem] text-[color:var(--ink-3)]">
                        /{p.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={p.published}
                        onChange={() => togglePage(p.slug)}
                        className="size-3.5 accent-[color:var(--indigo)]"
                        aria-label={`${p.title} published`}
                      />
                      <span className="text-[0.78rem] text-[color:var(--ink-2)]">
                        {p.published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                  <textarea
                    value={p.body}
                    onChange={(e) =>
                      setPages((ps) =>
                        ps.map((x) =>
                          x.slug === p.slug
                            ? { ...x, body: e.target.value }
                            : x,
                        ),
                      )
                    }
                    className={cn(area, "mt-2")}
                  />
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <input
                      value={p.seoTitle}
                      onChange={(e) =>
                        setPages((ps) =>
                          ps.map((x) =>
                            x.slug === p.slug
                              ? { ...x, seoTitle: e.target.value }
                              : x,
                          ),
                        )
                      }
                      placeholder="SEO title"
                      className={cn(field, "w-full")}
                    />
                    <input
                      value={p.seoDescription}
                      onChange={(e) =>
                        setPages((ps) =>
                          ps.map((x) =>
                            x.slug === p.slug
                              ? { ...x, seoDescription: e.target.value }
                              : x,
                          ),
                        )
                      }
                      placeholder="SEO description"
                      className={cn(field, "w-full")}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {tab === "preview" && (
          <Panel>
            <PanelHead
              title="Preview"
              hint="A sketch of the homepage with the current changes"
            />
            <div className="px-4 py-6">
              {sections
                .filter((s) => s.enabled)
                .map((s) => (
                  <div
                    key={s.id}
                    className="mb-3 border border-[color:var(--line-2)] px-4 py-3"
                  >
                    <p className="text-[0.85rem] font-medium text-[color:var(--ink)]">
                      {s.label}
                    </p>
                    <p className="text-[0.75rem] text-[color:var(--ink-3)]">
                      {s.note}
                    </p>
                    {s.id === "hero" && (
                      <div className="mt-2 border-t border-[color:var(--line)] pt-2 text-[0.85rem] text-[color:var(--ink-2)]">
                        <p className="text-[0.7rem] uppercase tracking-[0.12em] text-[color:var(--ink-3)]">
                          {hero.eyebrow}
                        </p>
                        <p className="font-semibold text-[color:var(--ink)]">
                          {hero.title}
                        </p>
                        <p>{hero.body}</p>
                      </div>
                    )}
                  </div>
                ))}
              <button
                type="button"
                onClick={() =>
                  toast("Open the storefront in a new tab to see it live.")
                }
                className={inkBtn}
              >
                <IconEye size={14} stroke={1.6} aria-hidden />
                Open live preview
              </button>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
