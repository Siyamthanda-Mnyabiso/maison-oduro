// The project URL and publishable (anon) key are public by design: they ship to
// every browser. What protects the data is Row Level Security (supabase/schema.sql),
// not secrecy of this key. Never put the secret/service-role key here.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://voyrerlmmtobyhdonkvq.supabase.co";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "sb_publishable_HvXXMNfHkzm-vOEEAH0CdQ_Ln5wxEB3";

export const MEDIA_BUCKET = "site-media";

// Largest video the admin accepts. Supabase's FREE plan caps any single upload at 50 MB.
// After upgrading to Pro, raise "Upload file size limit" in Storage settings AND here
// (and file_size_limit in supabase/schema.sql).
export const MAX_VIDEO_MB = 50;
