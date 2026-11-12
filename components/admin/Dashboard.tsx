"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { ContentKey, SiteContent } from "@/lib/content-defaults";

type Group = { id: string; label: string; icon: string; tabs: ContentKey[] };

export const TAB_META: Record<ContentKey, { label: string; keywords: string }> = {
  hero: { label: "Hero", keywords: "video image banner top home cover overlay" },
  story: { label: "Story banner", keywords: "heading image link discover" },
  popular: { label: "Best sellers", keywords: "cards photos reorder arrange popular" },
  layout: { label: "Page layout", keywords: "order sections arrange home" },
  products: { label: "Products", keywords: "price name variant collection softsense vengeance" },
  bottles: { label: "Bottle photos", keywords: "premium standard rollers format image" },
  gallery: { label: "Product page photos", keywords: "gallery images order product" },
  announcement: { label: "Announcement bar", keywords: "shipping message top bar" },
  nav: { label: "Header menu", keywords: "navigation links menu" },
  footer: { label: "Footer", keywords: "slogan copyright columns links" },
};

const GROUPS: Group[] = [
  { id: "home", label: "Home page", icon: "M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z", tabs: ["hero", "story", "popular", "layout"] },
  { id: "catalog", label: "Products", icon: "M12 3 4 7v10l8 4 8-4V7l-8-4Zm0 9L4 7.5M12 12l8-4.5M12 12v9", tabs: ["products", "bottles", "gallery"] },
  { id: "site", label: "Site-wide", icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7.4-2a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z", tabs: ["announcement", "nav", "footer"] },
];

const groupOf = (tab: ContentKey) => GROUPS.find((g) => g.tabs.includes(tab)) ?? GROUPS[0];

function Icon({ d, className = "" }: { d: string; className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={d} />
    </svg>
  );
}

const ICON_SEARCH = "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 3-4.5-4.5";
const ICON_EXTERNAL = "M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5";
const ICON_LOGOUT = "M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9";

export default function Dashboard({
  email,
  content,
  tab,
  onTab,
  onSignOut,
  notice,
  children,
}: {
  email: string;
  content: SiteContent;
  tab: ContentKey;
  onTab: (t: ContentKey) => void;
  onSignOut: () => void;
  notice?: string;
  children: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const group = groupOf(tab);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return (Object.keys(TAB_META) as ContentKey[]).filter((k) => `${TAB_META[k].label} ${TAB_META[k].keywords}`.toLowerCase().includes(q));
  }, [query]);

  const productCount = content.products.softsense.length + content.products.vengeance.length;
  const hero = content.hero;
  const initial = (email[0] ?? "A").toUpperCase();

  return (
    <div className="min-h-svh bg-white font-sans text-[#111] lg:grid lg:grid-cols-[250px_1fr]">
      {/* Sidebar */}
      <aside className="hidden flex-col gap-1 p-5 lg:sticky lg:top-0 lg:flex lg:h-svh">
        <Link href="/" className="mb-6 flex items-center gap-3 px-2">
          <Image src="/images/logo-black.png" alt="" width={40} height={27} className="h-7 w-10 object-contain" />
          <span className="flex items-baseline gap-0.5 whitespace-nowrap text-oduro-gold">
            <span className="font-script text-[26px] leading-none">Maison</span>
            <span className="font-serif text-[15px] uppercase tracking-wide">Oduro</span>
          </span>
        </Link>

        <nav aria-label="Admin sections" className="flex flex-col gap-1.5">
          {GROUPS.map((g) => {
            const active = g.id === group.id;
            return (
              <button
                key={g.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onTab(g.tabs[0])}
                className={`flex h-11 items-center gap-3 rounded-xl px-4 text-left text-[13px] transition-colors ${
                  active ? "bg-[#222] text-white shadow-md" : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <Icon d={g.icon} />
                {g.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 flex flex-col gap-1.5">
          <Link href="/" target="_blank" className="flex h-11 items-center gap-3 rounded-xl px-4 text-[13px] text-neutral-700 hover:bg-neutral-100">
            <Icon d={ICON_EXTERNAL} />
            View live site
          </Link>
          <button type="button" onClick={onSignOut} className="flex h-11 items-center gap-3 rounded-xl px-4 text-left text-[13px] text-neutral-700 hover:bg-neutral-100">
            <Icon d={ICON_LOGOUT} />
            Log out
          </button>
        </div>

        <div className="mt-auto rounded-3xl bg-[#f0f0f3] p-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-oduro-ash">
            <Image src={content.bottles.Premium} alt="" fill sizes="220px" className="object-cover mix-blend-multiply" />
          </div>
          <Link href="/" target="_blank" className="mt-3 flex h-10 items-center justify-center rounded-xl bg-[#111] text-[12px] text-white hover:opacity-85">
            Preview the site
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-col gap-5 p-4 lg:p-6 lg:pl-2">
        {/* Top bar */}
        <div className="flex items-center gap-3">
          <Link href="/" className="lg:hidden" aria-label="Maison Oduro home">
            <Image src="/images/logo-black.png" alt="" width={40} height={27} className="h-7 w-10 object-contain" />
          </Link>
          <div className="relative flex-1">
            <Icon d={ICON_SEARCH} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a section, e.g. hero, price, footer"
              aria-label="Search sections"
              className="h-12 w-full rounded-2xl bg-[#f0f0f3] pl-11 pr-4 text-[13px] outline-none ring-1 ring-transparent placeholder:text-neutral-500 focus:ring-black"
            />
            {query.trim() && (
              <ul className="absolute inset-x-0 top-14 z-20 overflow-hidden rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5">
                {results.length === 0 && <li className="px-3 py-2 text-[13px] text-neutral-500">No matching section.</li>}
                {results.map((k) => (
                  <li key={k}>
                    <button
                      type="button"
                      onClick={() => {
                        onTab(k);
                        setQuery("");
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[13px] hover:bg-neutral-100"
                    >
                      {TAB_META[k].label}
                      <span className="text-[11px] text-neutral-500">{groupOf(k).label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex items-center gap-3 pl-1">
            <span aria-hidden="true" className="hidden h-6 w-px bg-neutral-300 sm:block" />
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#222] text-[13px] font-medium text-white">{initial}</span>
              <div className="hidden leading-tight sm:block">
                <p className="max-w-[160px] truncate text-[12px] font-medium">{email}</p>
                <p className="text-[11px] text-neutral-500">Admin</p>
              </div>
            </div>
            <button type="button" onClick={onSignOut} aria-label="Log out" className="flex h-9 w-9 items-center justify-center rounded-xl text-neutral-700 hover:bg-neutral-100 lg:hidden">
              <Icon d={ICON_LOGOUT} />
            </button>
          </div>
        </div>

        {/* Mobile section switcher */}
        <nav aria-label="Admin sections" className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              aria-current={g.id === group.id ? "page" : undefined}
              onClick={() => onTab(g.tabs[0])}
              className={`h-10 shrink-0 rounded-xl px-4 text-[13px] ${g.id === group.id ? "bg-[#222] text-white" : "bg-[#f0f0f3]"}`}
            >
              {g.label}
            </button>
          ))}
        </nav>

        {notice && <p role="alert" className="rounded-2xl bg-amber-50 p-4 text-[13px] text-amber-900">{notice}</p>}

        {/* Stat cards */}
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.7fr]">
          <div className="flex min-h-[150px] flex-col justify-between rounded-3xl bg-[#141414] p-5 text-white">
            <p className="text-[14px] text-white/80">Products</p>
            <div className="flex items-end justify-between gap-2">
              <p className="font-serif text-[40px] leading-none">{productCount}</p>
              <span className="rounded-lg bg-[#d9b985] px-2.5 py-1 text-[11px] font-medium text-[#1a1409]">2 collections</span>
            </div>
          </div>
          <div className="flex min-h-[150px] flex-col justify-between rounded-3xl bg-[#efd98f] p-5">
            <p className="text-[14px] text-black/70">Best seller cards</p>
            <div className="flex items-end justify-between gap-2">
              <p className="font-serif text-[40px] leading-none">{content.popular.cards.length}</p>
              <span className="rounded-lg bg-[#141414] px-2.5 py-1 text-[11px] text-white">Drag to reorder</span>
            </div>
          </div>
          <div className="relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-3xl bg-[#141414] p-5 text-white">
            {hero.mediaType === "video" ? (
              <video key={hero.mediaUrl} src={hero.mediaUrl} poster={hero.posterUrl} muted loop playsInline autoPlay aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-70" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={hero.mediaUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
            <p className="relative text-[14px]">Live hero</p>
            <div className="relative flex items-end justify-between">
              <button type="button" onClick={() => onTab("hero")} className="rounded-lg bg-white/90 px-2.5 py-1 text-[11px] font-medium text-black hover:bg-white">Change</button>
              <p className="font-serif text-[28px] capitalize leading-none">{hero.mediaType}</p>
            </div>
          </div>
        </div>

        {/* Editor panel */}
        <section className="rounded-3xl bg-[#f0f0f3] p-4 md:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-serif text-[28px] font-normal">{TAB_META[tab].label}</h1>
            <div role="tablist" aria-label={`${group.label} sections`} className="flex max-w-full flex-wrap gap-1 rounded-2xl bg-white p-1">
              {group.tabs.map((k) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => onTab(k)}
                  className={`h-9 rounded-xl px-4 text-[13px] transition-colors ${tab === k ? "bg-[#222] text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
                >
                  {TAB_META[k].label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6">{children}</div>
        </section>
      </div>
    </div>
  );
}
