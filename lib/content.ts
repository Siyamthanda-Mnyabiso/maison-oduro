import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase/config";
import { defaultContent, mergeContent, type SiteContent } from "./content-defaults";

/**
 * Reads the editable site content from Supabase. Cached until the admin saves
 * (the save action calls updateTag("site-content")). If Supabase is unreachable
 * or not set up yet, the built-in defaults are used so the site never breaks.
 */
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheTag("site-content");

  let content: SiteContent = defaultContent;
  let ok = false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?select=key,value`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    });
    if (res.ok) {
      content = mergeContent(await res.json());
      ok = true;
    }
  } catch {
    // fall through to defaults
  }

  // A failed read is re-checked after a minute (expire must stay long enough to be prerendered).
  if (ok) cacheLife("hours");
  else cacheLife({ stale: 60, revalidate: 60, expire: 3600 });
  return content;
}
