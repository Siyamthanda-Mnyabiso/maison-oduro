"use server";

import { updateTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { CONTENT_KEYS, mergeContent, type ContentKey, type SiteContent } from "@/lib/content-defaults";

type Result = { ok: true } | { ok: false; error: string };

const MEDIA_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/`;
const isSafeUrl = (u: string) => (u.startsWith("/") && !u.startsWith("//")) || u.startsWith(MEDIA_PREFIX);

function urlsIn(key: ContentKey, v: SiteContent[ContentKey]): string[] {
  switch (key) {
    case "hero": {
      const h = v as SiteContent["hero"];
      return [h.mediaUrl, h.posterUrl];
    }
    case "story":
      return [(v as SiteContent["story"]).imageUrl];
    case "popular":
      return (v as SiteContent["popular"]).cards.map((c) => c.imageUrl);
    case "bottles":
      return Object.values(v as SiteContent["bottles"]);
    case "gallery":
      return (v as SiteContent["gallery"]).images.map((g) => g.url);
    default:
      return [];
  }
}

/**
 * Saves one section of the site content. The caller's Supabase access token is forwarded,
 * so Row Level Security (public.is_admin()) decides whether the write is allowed.
 * The value is re-validated here; media URLs may only point at our own storage bucket or /public.
 */
export async function saveContent(accessToken: string, key: string, value: unknown): Promise<Result> {
  if (!CONTENT_KEYS.includes(key as ContentKey)) return { ok: false, error: "Unknown section." };
  if (typeof accessToken !== "string" || accessToken.length < 20) return { ok: false, error: "Please sign in again." };
  if (JSON.stringify(value ?? null).length > 50_000) return { ok: false, error: "That content is too large." };

  const k = key as ContentKey;
  const clean = mergeContent([{ key: k, value }])[k];
  const tooMany = (n: number, max: number, what: string) => (n > max ? `Use ${max} ${what} or fewer.` : "");
  const limitError =
    k === "popular" ? tooMany((clean as SiteContent["popular"]).cards.length, 24, "cards")
    : k === "gallery" ? tooMany((clean as SiteContent["gallery"]).images.length, 20, "photos")
    : k === "nav" ? tooMany((clean as SiteContent["nav"]).links.length, 8, "menu links")
    : k === "products"
      ? tooMany(Math.max(...Object.values(clean as SiteContent["products"]).map((l) => l.length)), 60, "products per collection")
    : k === "footer"
      ? tooMany((clean as SiteContent["footer"]).columns.length, 6, "footer columns") ||
        tooMany(Math.max(0, ...(clean as SiteContent["footer"]).columns.map((c) => c.links.length)), 12, "links per column")
    : "";
  if (limitError) return { ok: false, error: limitError };
  if (!urlsIn(k, clean).every(isSafeUrl)) {
    return { ok: false, error: "Media must be uploaded through the admin." };
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase
    .from("site_content")
    .upsert({ key: k, value: clean, updated_at: new Date().toISOString() });

  if (error) {
    const denied = error.code === "42501" || /row-level security|JWT/i.test(error.message);
    return { ok: false, error: denied ? "This account is not allowed to edit the site." : error.message };
  }

  updateTag("site-content");
  return { ok: true };
}
