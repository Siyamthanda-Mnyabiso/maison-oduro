import { footerColumns, navLinks, softsense, vengeance, slugify, type Product, type ProductOption } from "./data";

export type HeroContent = {
  mediaType: "video" | "image";
  mediaUrl: string;
  posterUrl: string;
  /** Darkness of the overlay on the hero, 0-80 (%). */
  overlay: number;
};

export type StoryContent = {
  imageUrl: string;
  heading: string;
  linkLabel: string;
};

export type PopularCard = { id: string; title: string; text: string; imageUrl: string };

export const SECTION_IDS = ["collection", "story", "vengeance", "popular"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const SECTION_LABELS: Record<SectionId, string> = {
  collection: "SoftSense collection",
  story: "Story banner",
  vengeance: "Vengeance collection",
  popular: "Best sellers",
};

export type EditableProduct = Product & { id: string };
export type LinkItem = { id: string; label: string; href: string };
export type FooterColumn = { id: string; title: string; links: LinkItem[] };
export type GalleryImage = { id: string; url: string };

export type SiteContent = {
  hero: HeroContent;
  story: StoryContent;
  popular: { cards: PopularCard[] };
  bottles: Record<ProductOption, string>;
  layout: { order: SectionId[] };
  products: { softsense: EditableProduct[]; vengeance: EditableProduct[] };
  announcement: { enabled: boolean; text: string; href: string };
  nav: { links: LinkItem[] };
  footer: { slogan: string; columns: FooterColumn[]; copyright: string; legal: string };
  /** Photos shown on every product page, in order (the chosen format's bottle always leads). */
  gallery: { images: GalleryImage[] };
  /** Text shared by every product page. */
  productInfo: { shipping: string };
};

export type ContentKey = keyof SiteContent;
export const CONTENT_KEYS: ContentKey[] = [
  "hero", "story", "popular", "bottles", "layout", "products", "announcement", "nav", "footer", "gallery", "productInfo",
];

const withIds = (list: Product[]): EditableProduct[] => list.map((p, i) => ({ ...p, id: `${slugify(p)}-${i}` }));
const toLinks = (labels: string[], prefix: string): LinkItem[] => labels.map((label, i) => ({ id: `${prefix}-${i}`, label, href: "#" }));

export const defaultContent: SiteContent = {
  hero: {
    mediaType: "video",
    mediaUrl: "/video/hero.mp4",
    posterUrl: "/images/hero-poster.jpg",
    overlay: 45,
  },
  story: {
    imageUrl: "/images/story.jpg",
    heading: "Iconic scents, reimagined.",
    linkLabel: "Discover the house",
  },
  popular: {
    cards: [
      { id: "best-sellers", title: "Best Sellers", text: "The elixirs everyone keeps coming back to.", imageUrl: "/images/elixir.jpg" },
      { id: "gift-sets", title: "Gift Sets", text: "Beautifully boxed, ready to give.", imageUrl: "/images/elixir.jpg" },
      { id: "new-arrivals", title: "New Arrivals", text: "Fresh from the house, just launched.", imageUrl: "/images/elixir.jpg" },
      { id: "discovery-set", title: "Discovery Set", text: "Try the full collection in travel sizes.", imageUrl: "/images/elixir.jpg" },
    ],
  },
  bottles: {
    Premium: "/images/elixir.jpg",
    Standard: "/images/elixir-standard.jpg",
    Rollers: "/images/elixir.jpg",
  },
  layout: { order: [...SECTION_IDS] },
  products: { softsense: withIds(softsense), vengeance: withIds(vengeance) },
  announcement: { enabled: true, text: "Complimentary shipping on orders over R1,500", href: "" },
  nav: { links: toLinks(navLinks, "nav") },
  footer: {
    slogan: "Inspired By Icons. Made For You.",
    columns: footerColumns.map((c, i) => ({ id: `col-${i}`, title: c.title, links: toLinks(c.links, `col-${i}`) })),
    copyright: "© Maison Oduro. All rights reserved.",
    legal: "Privacy · Terms · Cookies",
  },
  gallery: {
    images: [
      { id: "g-0", url: "/images/elixir.jpg" },
      { id: "g-1", url: "/images/elixir-standard.jpg" },
      { id: "g-2", url: "/images/story.jpg" },
    ],
  },
  productInfo: {
    shipping: "Complimentary shipping on orders over R1,500. Unopened items can be returned within 30 days.",
  },
};

/** Links may point inside the site, to https pages, to an anchor, or to mail/phone. */
export const isSafeHref = (h: string) => h === "" || h.startsWith("#") || (h.startsWith("/") && !h.startsWith("//")) || /^(https:\/\/|mailto:|tel:)/.test(h);

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback: string) => (typeof v === "string" && v.length > 0 ? v : fallback);

/** Builds a complete SiteContent from whatever rows exist, falling back to defaults field by field. */
export function mergeContent(rows: { key: string; value: unknown }[]): SiteContent {
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  const d = defaultContent;

  const h = byKey.get("hero");
  const hero: HeroContent = isObj(h)
    ? {
        mediaType: h.mediaType === "image" ? "image" : "video",
        mediaUrl: str(h.mediaUrl, d.hero.mediaUrl),
        posterUrl: str(h.posterUrl, d.hero.posterUrl),
        overlay: typeof h.overlay === "number" ? Math.min(80, Math.max(0, h.overlay)) : d.hero.overlay,
      }
    : d.hero;

  const s = byKey.get("story");
  const story: StoryContent = isObj(s)
    ? {
        imageUrl: str(s.imageUrl, d.story.imageUrl),
        heading: str(s.heading, d.story.heading),
        linkLabel: typeof s.linkLabel === "string" ? s.linkLabel : d.story.linkLabel,
      }
    : d.story;

  const p = byKey.get("popular");
  const cards =
    isObj(p) && Array.isArray(p.cards)
      ? p.cards.filter(isObj).map((c, i) => ({
          id: str(c.id, `card-${i}`),
          title: typeof c.title === "string" ? c.title : "",
          text: typeof c.text === "string" ? c.text : "",
          imageUrl: str(c.imageUrl, "/images/elixir.jpg"),
        }))
      : d.popular.cards;

  const b = byKey.get("bottles");
  const bottles: SiteContent["bottles"] = isObj(b)
    ? {
        Premium: str(b.Premium, d.bottles.Premium),
        Standard: str(b.Standard, d.bottles.Standard),
        Rollers: str(b.Rollers, d.bottles.Rollers),
      }
    : d.bottles;

  const l = byKey.get("layout");
  const seen = new Set<SectionId>();
  const order: SectionId[] = [];
  if (isObj(l) && Array.isArray(l.order)) {
    for (const id of l.order) {
      if ((SECTION_IDS as readonly unknown[]).includes(id) && !seen.has(id as SectionId)) {
        seen.add(id as SectionId);
        order.push(id as SectionId);
      }
    }
  }
  for (const id of SECTION_IDS) if (!seen.has(id)) order.push(id);

  const pr = byKey.get("products");
  const productList = (raw: unknown, fallback: EditableProduct[]): EditableProduct[] =>
    Array.isArray(raw)
      ? raw.filter(isObj).map((x, i) => ({
          id: str(x.id, `p-${i}`),
          name: str(x.name, "Untitled"),
          variant: typeof x.variant === "string" ? x.variant : "",
          price: typeof x.price === "string" ? x.price : "",
          description: typeof x.description === "string" ? x.description.slice(0, 1200) : "",
          composition: typeof x.composition === "string" ? x.composition.slice(0, 1200) : "",
        }))
      : fallback;
  const products = {
    softsense: productList(isObj(pr) ? pr.softsense : undefined, d.products.softsense),
    vengeance: productList(isObj(pr) ? pr.vengeance : undefined, d.products.vengeance),
  };

  const a = byKey.get("announcement");
  const announcement = isObj(a)
    ? {
        enabled: a.enabled !== false,
        text: typeof a.text === "string" ? a.text : d.announcement.text,
        href: typeof a.href === "string" && isSafeHref(a.href) ? a.href : "",
      }
    : d.announcement;

  const linkList = (raw: unknown, fallback: LinkItem[]): LinkItem[] =>
    Array.isArray(raw)
      ? raw.filter(isObj).map((x, i) => ({
          id: str(x.id, `l-${i}`),
          label: typeof x.label === "string" ? x.label : "",
          href: typeof x.href === "string" && isSafeHref(x.href) ? x.href : "#",
        }))
      : fallback;

  const n = byKey.get("nav");
  const nav = { links: linkList(isObj(n) ? n.links : undefined, d.nav.links) };

  const f = byKey.get("footer");
  const footer: SiteContent["footer"] = isObj(f)
    ? {
        slogan: typeof f.slogan === "string" ? f.slogan : d.footer.slogan,
        copyright: typeof f.copyright === "string" ? f.copyright : d.footer.copyright,
        legal: typeof f.legal === "string" ? f.legal : d.footer.legal,
        columns: Array.isArray(f.columns)
          ? f.columns.filter(isObj).map((c, i) => ({
              id: str(c.id, `col-${i}`),
              title: typeof c.title === "string" ? c.title : "",
              links: linkList(c.links, []),
            }))
          : d.footer.columns,
      }
    : d.footer;

  const g = byKey.get("gallery");
  const gallery = {
    images:
      isObj(g) && Array.isArray(g.images)
        ? g.images.filter(isObj).map((x, i) => ({ id: str(x.id, `g-${i}`), url: str(x.url, "/images/elixir.jpg") }))
        : d.gallery.images,
  };

  const pi = byKey.get("productInfo");
  const productInfo = {
    shipping: isObj(pi) && typeof pi.shipping === "string" ? pi.shipping.slice(0, 1200) : d.productInfo.shipping,
  };

  return { hero, story, popular: { cards }, bottles, layout: { order }, products, announcement, nav, footer, gallery, productInfo };
}
