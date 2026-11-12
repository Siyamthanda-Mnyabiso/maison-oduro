"use client";

import type { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { saveContent } from "@/app/admin/actions";
import {
  SECTION_LABELS,
  type EditableProduct,
  type LinkItem,
  defaultContent,
  mergeContent,
  type ContentKey,
  type SectionId,
  type SiteContent,
} from "@/lib/content-defaults";
import { productOptions } from "@/lib/data";
import { getBrowserClient } from "@/lib/supabase/browser";
import { MAX_VIDEO_MB } from "@/lib/supabase/config";
import AuthScreen from "./AuthScreen";
import Dashboard from "./Dashboard";
import MediaField from "./MediaField";
import SortableList from "./SortableList";

const inputCls = "h-11 w-full rounded-xl bg-white px-4 text-[13px] outline-none ring-1 ring-black/10 transition-shadow focus:ring-black";
const labelCls = "text-[11px] font-medium uppercase tracking-wider text-neutral-500";

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-svh bg-white font-sans text-[#111]">
      {!ready ? <p className="p-10 text-sm">Loading…</p> : session ? <Editor session={session} /> : <AuthScreen />}
    </div>
  );
}

function Editor({ session }: { session: Session }) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<ContentKey>("hero");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const supabase = getBrowserClient();
    let cancelled = false;
    (async () => {
      const [admin, rows] = await Promise.all([
        supabase.rpc("is_admin"),
        supabase.from("site_content").select("key,value"),
      ]);
      if (cancelled) return;
      setIsAdmin(admin.error ? false : admin.data === true);
      if (rows.error) {
        setLoadError(
          `Couldn't load the saved content (${rows.error.code ?? "error"}: ${rows.error.message}). ` +
            "Run supabase/schema.sql in the Supabase SQL Editor, then reload this page. The site keeps showing its original content until then.",
        );
      }
      setContent(mergeContent(rows.data ?? []));
    })();
    return () => {
      cancelled = true;
    };
  }, [session.user.id]);

  const update = useCallback(<K extends ContentKey>(key: K, value: SiteContent[K]) => {
    setContent((c) => (c ? { ...c, [key]: value } : c));
  }, []);

  if (!content || isAdmin === null) return <p className="p-10 text-sm">Loading…</p>;

  if (!isAdmin) {
    return (
      <main className="mx-auto flex min-h-svh max-w-lg flex-col justify-center gap-5 px-6">
        <h1 className="font-serif text-3xl">You&apos;re logged in</h1>
        <p className="text-sm leading-relaxed">
          <strong>{session.user.email}</strong> is a valid account, but it hasn&apos;t been approved as an admin yet, so it
          can&apos;t edit the site.
        </p>
        <p className="text-sm leading-relaxed text-neutral-600">
          To approve it, run this once in the Supabase SQL Editor, then sign out and back in:
        </p>
        <pre className="overflow-x-auto rounded bg-white p-4 text-xs leading-relaxed">{`insert into public.admins (user_id)\nselect id from auth.users\nwhere email = '${session.user.email}';`}</pre>
        <p className="text-xs text-neutral-600">
          (If that fails with &ldquo;relation public.admins does not exist&rdquo;, run <code>supabase/schema.sql</code> first.)
        </p>
        <div className="flex gap-4 text-xs uppercase tracking-wider">
          <button type="button" onClick={() => getBrowserClient().auth.signOut()} className="underline underline-offset-4">Sign out</button>
          <Link href="/" className="underline underline-offset-4">Back to site</Link>
        </div>
      </main>
    );
  }

  return (
    <Dashboard
      email={session.user.email ?? ""}
      content={content}
      tab={tab}
      onTab={setTab}
      onSignOut={() => getBrowserClient().auth.signOut()}
      notice={loadError}
    >
      {tab === "hero" && <HeroPanel value={content.hero} onChange={(v) => update("hero", v)} />}
      {tab === "story" && <StoryPanel value={content.story} onChange={(v) => update("story", v)} />}
      {tab === "popular" && <PopularPanel value={content.popular} onChange={(v) => update("popular", v)} />}
      {tab === "bottles" && <BottlesPanel value={content.bottles} onChange={(v) => update("bottles", v)} />}
      {tab === "layout" && <LayoutPanel value={content.layout} onChange={(v) => update("layout", v)} />}
      {tab === "products" && <ProductsPanel value={content.products} onChange={(v) => update("products", v)} />}
      {tab === "gallery" && <GalleryPanel value={content.gallery} onChange={(v) => update("gallery", v)} />}
      {tab === "productInfo" && <ProductInfoPanel value={content.productInfo} onChange={(v) => update("productInfo", v)} />}
      {tab === "announcement" && <AnnouncementPanel value={content.announcement} onChange={(v) => update("announcement", v)} />}
      {tab === "nav" && <NavPanel value={content.nav} onChange={(v) => update("nav", v)} />}
      {tab === "footer" && <FooterPanel value={content.footer} onChange={(v) => update("footer", v)} />}
      <SaveBar key={tab} sectionKey={tab} value={content[tab]} onReset={() => update(tab, defaultContent[tab] as never)} />
    </Dashboard>
  );
}

function SaveBar({ sectionKey, value, onReset }: { sectionKey: ContentKey; value: unknown; onReset: () => void }) {
  const [state, setState] = useState<{ kind: "idle" | "saving" | "ok" | "error"; text?: string }>({ kind: "idle" });

  const save = async () => {
    setState({ kind: "saving" });
    const { data } = await getBrowserClient().auth.getSession();
    const res = await saveContent(data.session?.access_token ?? "", sectionKey, value);
    setState(res.ok ? { kind: "ok", text: "Saved. The live site is updated." } : { kind: "error", text: res.error });
  };

  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 rounded-2xl bg-white p-3 pl-4 shadow-[0_8px_30px_rgba(0,0,0,.12)] ring-1 ring-black/5">
      <button type="button" onClick={save} disabled={state.kind === "saving"} className="h-11 rounded-xl bg-[#222] px-7 text-[13px] text-white transition-opacity hover:opacity-85 disabled:opacity-50">
        {state.kind === "saving" ? "Saving…" : "Save changes"}
      </button>
      <button type="button" onClick={onReset} className="text-[13px] text-neutral-600 underline underline-offset-4 hover:text-black">
        Reset to original
      </button>
      <p role="status" className={`text-[13px] ${state.kind === "error" ? "text-red-700" : "text-green-800"}`}>{state.text}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

const HERO_DEFAULT_MEDIA = { video: "/video/hero.mp4", image: "/images/hero-poster.jpg" } as const;
const OVERLAY_PRESETS = [
  { label: "None", value: 0 },
  { label: "Light", value: 25 },
  { label: "Medium", value: 45 },
  { label: "Strong", value: 65 },
] as const;

/** A white block inside the grey editor panel. */
function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div>
        <h3 className="text-[15px] font-medium">{title}</h3>
        {description && <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function HeroPanel({ value, onChange }: { value: SiteContent["hero"]; onChange: (v: SiteContent["hero"]) => void }) {
  // Remember each type's file so flipping Video <-> Image doesn't lose the other one.
  const [memory, setMemory] = useState<Partial<Record<"video" | "image", string>>>({});
  const isVideo = value.mediaType === "video";

  const switchType = (t: "video" | "image") => {
    if (t === value.mediaType) return;
    setMemory((m) => ({ ...m, [value.mediaType]: value.mediaUrl }));
    onChange({ ...value, mediaType: t, mediaUrl: memory[t] ?? HERO_DEFAULT_MEDIA[t] });
  };

  return (
    <>
      <h2 className="sr-only">Hero (top of the home page)</h2>
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-4">
          <Card title="What should the hero show?" description="The full-screen opening of the home page.">
            <div role="radiogroup" aria-label="Hero media type" className="grid grid-cols-2 gap-1 rounded-xl bg-[#f0f0f3] p-1">
              {(
                [
                  { t: "video", label: "Video", d: "M4 6h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm13 4 4-2.5v9L17 14" },
                  { t: "image", label: "Image", d: "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm0 12 4-4 4 4 3-3 4 4M9 9.5h.01" },
                ] as const
              ).map(({ t, label, d }) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={value.mediaType === t}
                  onClick={() => switchType(t)}
                  className={`flex h-11 items-center justify-center gap-2 rounded-lg text-[13px] transition-colors ${
                    value.mediaType === t ? "bg-[#222] text-white shadow" : "text-neutral-700 hover:bg-white"
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={d} />
                  </svg>
                  {label}
                </button>
              ))}
            </div>
          </Card>

          <Card title={isVideo ? "Hero video" : "Hero image"}>
            <MediaField
              key={value.mediaType}
              wide
              label={isVideo ? "Click or drop a video" : "Click or drop an image"}
              kind={value.mediaType}
              folder="hero"
              value={value.mediaUrl}
              onChange={(mediaUrl) => onChange({ ...value, mediaUrl })}
              hint={
                isVideo
                  ? `MP4 or WebM, up to ${MAX_VIDEO_MB} MB. Keep it short (10-20 seconds) and compressed so it loads fast.`
                  : "JPG, PNG or WebP. Large photos are resized automatically. Wide landscape images work best."
              }
            />
          </Card>

          {isVideo && (
            <Card title="Cover image" description="Shown while the video loads, and on phones that block autoplay.">
              <MediaField label="Cover image" folder="hero" value={value.posterUrl} onChange={(posterUrl) => onChange({ ...value, posterUrl })} />
            </Card>
          )}

          <Card title="Dark overlay" description="Darkens the media so the brand name stays easy to read on bright footage.">
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={0}
                max={80}
                step={5}
                value={value.overlay}
                aria-label="Dark overlay strength"
                onChange={(e) => onChange({ ...value, overlay: Number(e.target.value) })}
                className="h-2 w-full cursor-pointer accent-black"
              />
              <span className="w-14 shrink-0 rounded-lg bg-[#f0f0f3] py-1.5 text-center text-[13px] font-medium tabular-nums">{value.overlay}%</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {OVERLAY_PRESETS.map((o) => (
                <button
                  key={o.label}
                  type="button"
                  aria-pressed={value.overlay === o.value}
                  onClick={() => onChange({ ...value, overlay: o.value })}
                  className={`h-9 rounded-xl px-4 text-[13px] transition-colors ${
                    value.overlay === o.value ? "bg-[#222] text-white" : "bg-[#f0f0f3] text-neutral-700 hover:bg-neutral-200"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Live preview */}
        <div className="flex min-w-0 flex-col gap-3 xl:sticky xl:top-6">
          <p className={labelCls}>Live preview</p>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-black shadow-sm ring-1 ring-black/5">
            {isVideo ? (
              <video key={value.mediaUrl} src={value.mediaUrl} poster={value.posterUrl} muted loop playsInline autoPlay aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value.mediaUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-oduro-dark transition-opacity" style={{ opacity: value.overlay / 100 }} />
            <div className="absolute inset-x-0 top-0 flex h-9 items-center justify-between px-4 text-[9px] uppercase tracking-[0.18em] text-white/80">
              <span>Menu</span>
              <span>Bag</span>
            </div>
            <p className="absolute inset-0 flex items-center justify-center gap-1 text-white" aria-hidden="true">
              <span className="font-script text-[44px] leading-none sm:text-[56px]">Maison</span>
              <span className="font-serif text-[30px] uppercase tracking-wide sm:text-[40px]">Oduro</span>
            </p>
            <span aria-hidden="true" className="absolute bottom-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-white/70 text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
            </span>
          </div>
          <p className="text-xs leading-relaxed text-neutral-500">
            This is how the top of the home page will look. Changes show here straight away, but go live only when you press <strong>Save changes</strong>.
          </p>
        </div>
      </div>
    </>
  );
}

function StoryPanel({ value, onChange }: { value: SiteContent["story"]; onChange: (v: SiteContent["story"]) => void }) {
  return (
    <>
      <h2 className="sr-only">Story banner</h2>
      <MediaField label="Banner image" folder="story" value={value.imageUrl} onChange={(imageUrl) => onChange({ ...value, imageUrl })} hint="Also used as the last photo on product pages." />
      <Field label="Heading">
        <input className={inputCls} maxLength={120} value={value.heading} onChange={(e) => onChange({ ...value, heading: e.target.value })} />
      </Field>
      <Field label="Link text (leave empty to hide)">
        <input className={inputCls} maxLength={60} value={value.linkLabel} onChange={(e) => onChange({ ...value, linkLabel: e.target.value })} />
      </Field>
    </>
  );
}

function PopularPanel({ value, onChange }: { value: SiteContent["popular"]; onChange: (v: SiteContent["popular"]) => void }) {
  const setCard = (id: string, patch: Partial<SiteContent["popular"]["cards"][number]>) =>
    onChange({ cards: value.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  return (
    <>
      <h2 className="sr-only">Best sellers cards</h2>
      <p className="text-sm text-neutral-600">Drag the handle (or use the arrows) to arrange the cards in the order they appear on the site.</p>
      <SortableList
        items={value.cards}
        getKey={(c) => c.id}
        onChange={(cards) => onChange({ cards })}
        renderItem={(c) => (
          <div className="flex flex-col gap-4 sm:flex-row">
            <MediaField label="Photo" folder="cards" value={c.imageUrl} onChange={(imageUrl) => setCard(c.id, { imageUrl })} />
            <div className="flex flex-1 flex-col gap-3">
              <Field label="Title">
                <input className={inputCls} maxLength={60} value={c.title} onChange={(e) => setCard(c.id, { title: e.target.value })} />
              </Field>
              <Field label="Description">
                <input className={inputCls} maxLength={140} value={c.text} onChange={(e) => setCard(c.id, { text: e.target.value })} />
              </Field>
              <button type="button" onClick={() => onChange({ cards: value.cards.filter((x) => x.id !== c.id) })} className="self-start text-[13px] text-red-700 underline underline-offset-4">
                Remove card
              </button>
            </div>
          </div>
        )}
      />
      <button
        type="button"
        disabled={value.cards.length >= 24}
        onClick={() => onChange({ cards: [...value.cards, { id: crypto.randomUUID(), title: "New card", text: "", imageUrl: "/images/elixir.jpg" }] })}
        className="h-10 self-start rounded-xl bg-[#222] px-5 text-[13px] text-white hover:opacity-85 disabled:opacity-40"
      >
        Add card
      </button>
    </>
  );
}

function BottlesPanel({ value, onChange }: { value: SiteContent["bottles"]; onChange: (v: SiteContent["bottles"]) => void }) {
  return (
    <>
      <h2 className="sr-only">Bottle photos</h2>
      <p className="text-sm text-neutral-600">The photo shown for each format on product cards and product pages.</p>
      <div className="grid gap-6 sm:grid-cols-2">
        {productOptions.map((o) => (
          <MediaField key={o} label={o} folder="bottles" value={value[o]} onChange={(url) => onChange({ ...value, [o]: url })} />
        ))}
      </div>
    </>
  );
}

function LayoutPanel({ value, onChange }: { value: SiteContent["layout"]; onChange: (v: SiteContent["layout"]) => void }) {
  return (
    <>
      <h2 className="sr-only">Page layout</h2>
      <p className="text-sm text-neutral-600">Arrange the sections of the home page, top to bottom (below the hero).</p>
      <SortableList<SectionId>
        items={value.order}
        getKey={(id) => id}
        onChange={(order) => onChange({ order })}
        renderItem={(id) => <p className="py-2 text-sm font-medium">{SECTION_LABELS[id]}</p>}
      />
    </>
  );
}

const newId = () => crypto.randomUUID();

function ProductsPanel({ value, onChange }: { value: SiteContent["products"]; onChange: (v: SiteContent["products"]) => void }) {
  const collections = [
    { key: "softsense", title: "SoftSense™ collection" },
    { key: "vengeance", title: "Vengeance collection" },
  ] as const;

  return (
    <>
      <h2 className="sr-only">Products</h2>
      <p className="text-sm text-neutral-600">
        Edit names, variants, prices and descriptions (type the price as you want it shown, e.g. R860). Drag to reorder. Each product&apos;s page address comes from its name and variant, so renaming a product changes its link.
      </p>
      {collections.map(({ key, title }) => {
        const list = value[key];
        const set = (next: EditableProduct[]) => onChange({ ...value, [key]: next });
        const patch = (id: string, p: Partial<EditableProduct>) => set(list.map((x) => (x.id === id ? { ...x, ...p } : x)));
        return (
          <div key={key} className="flex flex-col gap-3">
            <h3 className={labelCls}>{title}</h3>
            <SortableList
              items={list}
              getKey={(p) => p.id}
              onChange={set}
              renderItem={(p) => (
                <div className="flex flex-col gap-3">
                  <div className="grid gap-3 sm:grid-cols-[2fr_2fr_1fr_auto] sm:items-end">
                    <Field label="Name"><input className={inputCls} maxLength={120} value={p.name} onChange={(e) => patch(p.id, { name: e.target.value })} /></Field>
                    <Field label="Variant"><input className={inputCls} maxLength={120} value={p.variant} onChange={(e) => patch(p.id, { variant: e.target.value })} /></Field>
                    <Field label="Price"><input className={inputCls} maxLength={20} value={p.price} onChange={(e) => patch(p.id, { price: e.target.value })} /></Field>
                    <button type="button" onClick={() => set(list.filter((x) => x.id !== p.id))} className="h-11 text-[13px] text-red-700 underline underline-offset-4">Remove</button>
                  </div>
                  <Field label="Description (shown on the product page)">
                    <textarea
                      className={`${inputCls} h-auto min-h-[84px] resize-y py-3 leading-relaxed`}
                      rows={3}
                      maxLength={1200}
                      placeholder="Tell shoppers about this product: notes, feel, when to wear it…"
                      value={p.description ?? ""}
                      onChange={(e) => patch(p.id, { description: e.target.value })}
                    />
                  </Field>
                  <Field label="Composition, care & origin (the expandable row on the product page)">
                    <textarea
                      className={`${inputCls} h-auto min-h-[84px] resize-y py-3 leading-relaxed`}
                      rows={3}
                      maxLength={1200}
                      placeholder="Top, heart and base notes, concentration, how to store it, where it's made…"
                      value={p.composition ?? ""}
                      onChange={(e) => patch(p.id, { composition: e.target.value })}
                    />
                  </Field>
                </div>
              )}
            />
            <button
              type="button"
              disabled={list.length >= 60}
              onClick={() => set([...list, { id: newId(), name: "New product", variant: "", price: "R0" }])}
              className="h-10 self-start rounded-xl bg-[#222] px-5 text-[13px] text-white hover:opacity-85 disabled:opacity-40"
            >
              Add product
            </button>
          </div>
        );
      })}
    </>
  );
}

function GalleryPanel({ value, onChange }: { value: SiteContent["gallery"]; onChange: (v: SiteContent["gallery"]) => void }) {
  return (
    <>
      <h2 className="sr-only">Product page photos</h2>
      <p className="text-sm text-neutral-600">
        The photos shown down every product page, top to bottom. The bottle for the format the shopper picks always goes first; arrange the rest here.
      </p>
      <SortableList
        items={value.images}
        getKey={(g) => g.id}
        onChange={(images) => onChange({ images })}
        renderItem={(g) => (
          <div className="flex flex-wrap items-end gap-4">
            <MediaField label="Photo" folder="gallery" value={g.url} onChange={(url) => onChange({ images: value.images.map((x) => (x.id === g.id ? { ...x, url } : x)) })} />
            <button type="button" onClick={() => onChange({ images: value.images.filter((x) => x.id !== g.id) })} className="pb-2 text-[13px] text-red-700 underline underline-offset-4">Remove</button>
          </div>
        )}
      />
      <button
        type="button"
        disabled={value.images.length >= 20}
        onClick={() => onChange({ images: [...value.images, { id: newId(), url: "/images/elixir.jpg" }] })}
        className="h-10 self-start rounded-xl bg-[#222] px-5 text-[13px] text-white hover:opacity-85 disabled:opacity-40"
      >
        Add photo
      </button>
    </>
  );
}

function ProductInfoPanel({ value, onChange }: { value: SiteContent["productInfo"]; onChange: (v: SiteContent["productInfo"]) => void }) {
  return (
    <>
      <h2 className="sr-only">Shipping, exchanges and returns</h2>
      <p className="text-sm text-neutral-600">
        The text inside the &ldquo;Shipping, exchanges and returns&rdquo; row on every product page.
      </p>
      <Field label="Shipping, exchanges and returns">
        <textarea
          className={`${inputCls} h-auto min-h-[140px] resize-y py-3 leading-relaxed`}
          rows={6}
          maxLength={1200}
          value={value.shipping}
          onChange={(e) => onChange({ shipping: e.target.value })}
        />
      </Field>
    </>
  );
}

function AnnouncementPanel({ value, onChange }: { value: SiteContent["announcement"]; onChange: (v: SiteContent["announcement"]) => void }) {
  return (
    <>
      <h2 className="sr-only">Announcement bar</h2>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={value.enabled} onChange={(e) => onChange({ ...value, enabled: e.target.checked })} />
        Show the bar at the top of every page
      </label>
      <Field label="Message">
        <input className={inputCls} maxLength={140} value={value.text} onChange={(e) => onChange({ ...value, text: e.target.value })} />
      </Field>
      <Field label="Link (optional)">
        <input className={inputCls} maxLength={300} placeholder="/product/… or https://…" value={value.href} onChange={(e) => onChange({ ...value, href: e.target.value })} />
        <span className="text-xs text-neutral-600">Must start with / or https://. Leave empty for plain text.</span>
      </Field>
    </>
  );
}

function LinksEditor({ links, onChange, addLabel }: { links: LinkItem[]; onChange: (l: LinkItem[]) => void; addLabel: string }) {
  const patch = (id: string, p: Partial<LinkItem>) => onChange(links.map((l) => (l.id === id ? { ...l, ...p } : l)));
  return (
    <div className="flex flex-col gap-3">
      <SortableList
        items={links}
        getKey={(l) => l.id}
        onChange={onChange}
        renderItem={(l) => (
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Field label="Text"><input className={inputCls} maxLength={60} value={l.label} onChange={(e) => patch(l.id, { label: e.target.value })} /></Field>
            <Field label="Goes to"><input className={inputCls} maxLength={300} placeholder="/ or https://… or #" value={l.href} onChange={(e) => patch(l.id, { href: e.target.value })} /></Field>
            <button type="button" onClick={() => onChange(links.filter((x) => x.id !== l.id))} className="h-10 text-[13px] text-red-700 underline underline-offset-4">Remove</button>
          </div>
        )}
      />
      <button type="button" onClick={() => onChange([...links, { id: newId(), label: "New link", href: "#" }])} className="h-9 self-start rounded-xl bg-[#222] px-4 text-[13px] text-white hover:opacity-85">
        {addLabel}
      </button>
    </div>
  );
}

function NavPanel({ value, onChange }: { value: SiteContent["nav"]; onChange: (v: SiteContent["nav"]) => void }) {
  return (
    <>
      <h2 className="sr-only">Header menu</h2>
      <p className="text-sm text-neutral-600">The links in the top bar and the mobile menu (up to 8). &ldquo;#&rdquo; means the link doesn&apos;t go anywhere yet.</p>
      <LinksEditor links={value.links} onChange={(links) => onChange({ links })} addLabel="Add menu link" />
    </>
  );
}

function FooterPanel({ value, onChange }: { value: SiteContent["footer"]; onChange: (v: SiteContent["footer"]) => void }) {
  const setCol = (id: string, p: Partial<SiteContent["footer"]["columns"][number]>) =>
    onChange({ ...value, columns: value.columns.map((c) => (c.id === id ? { ...c, ...p } : c)) });
  return (
    <>
      <h2 className="sr-only">Footer</h2>
      <Field label="Slogan (also shown in the mobile menu)">
        <input className={inputCls} maxLength={120} value={value.slogan} onChange={(e) => onChange({ ...value, slogan: e.target.value })} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Copyright line"><input className={inputCls} maxLength={120} value={value.copyright} onChange={(e) => onChange({ ...value, copyright: e.target.value })} /></Field>
        <Field label="Legal line"><input className={inputCls} maxLength={120} value={value.legal} onChange={(e) => onChange({ ...value, legal: e.target.value })} /></Field>
      </div>
      <h3 className={labelCls}>Columns (left to right)</h3>
      <SortableList
        items={value.columns}
        getKey={(c) => c.id}
        onChange={(columns) => onChange({ ...value, columns })}
        renderItem={(c) => (
          <div className="flex flex-col gap-4">
            <Field label="Column title"><input className={inputCls} maxLength={40} value={c.title} onChange={(e) => setCol(c.id, { title: e.target.value })} /></Field>
            <LinksEditor links={c.links} onChange={(links) => setCol(c.id, { links })} addLabel="Add link" />
            <button type="button" onClick={() => onChange({ ...value, columns: value.columns.filter((x) => x.id !== c.id) })} className="self-start text-[13px] text-red-700 underline underline-offset-4">Remove column</button>
          </div>
        )}
      />
      <button
        type="button"
        disabled={value.columns.length >= 6}
        onClick={() => onChange({ ...value, columns: [...value.columns, { id: newId(), title: "New column", links: [] }] })}
        className="h-10 self-start rounded-xl bg-[#222] px-5 text-[13px] text-white hover:opacity-85 disabled:opacity-40"
      >
        Add column
      </button>
    </>
  );
}
