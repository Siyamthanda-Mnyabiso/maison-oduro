"use client";

import { useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { MAX_VIDEO_MB, MEDIA_BUCKET } from "@/lib/supabase/config";

const MAX_SOURCE_IMAGE_MB = 40; // what you may pick; it is shrunk before upload
const MAX_EDGE = 2400; // longest side after resizing, in pixels

/** Resizes and re-encodes a photo as WebP so big camera files upload fast and stay under the storage limit. */
async function shrinkImage(file: File): Promise<File> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.86));
    if (!blob || blob.size >= file.size) return file; // already small: keep the original
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

/** Preview + upload for one image or video. Files go straight to the Supabase Storage bucket. */
export default function MediaField({
  label,
  value,
  onChange,
  kind = "image",
  folder,
  hint,
  wide = false,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  kind?: "image" | "video";
  folder: string;
  hint?: string;
  /** Full-width 16:9 preview instead of the small thumbnail. */
  wide?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const upload = async (picked: File) => {
    setError("");
    const limit = kind === "video" ? MAX_VIDEO_MB : MAX_SOURCE_IMAGE_MB;
    if (!picked.type.startsWith(`${kind}/`)) return setError(`Please choose ${kind === "video" ? "a video" : "an image"} file.`);
    if (picked.size > limit * 1024 * 1024) {
      return setError(
        kind === "video"
          ? `That video is ${(picked.size / 1048576).toFixed(0)} MB; the limit is ${limit} MB. Compress it (for example with HandBrake, 1080p, "Web Optimized") or trim it, then try again.`
          : `That photo is over ${limit} MB.`,
      );
    }

    setBusy(true);
    const file = kind === "image" ? await shrinkImage(picked) : picked;
    const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const supabase = getBrowserClient();
    const { error: err } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
    });
    setBusy(false);
    if (err) return setError(err.message);
    onChange(supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl);
  };

  const pick = () => input.current?.click();
  const noun = kind === "video" ? "video" : "image";

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">{label}</span>

      <div
        role="button"
        tabIndex={0}
        aria-label={`${value ? "Replace" : "Upload"} ${noun}: ${label}`}
        onClick={pick}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), pick())}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void upload(f);
        }}
        className={`group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-[#e9e9ee] outline-none ring-2 transition-shadow focus-visible:ring-black ${
          dragOver ? "ring-black" : "ring-transparent"
        } ${wide ? "aspect-video w-full" : "h-40 w-full sm:w-64"}`}
      >
        {value ? (
          kind === "video" ? (
            <video key={value} src={value} muted loop playsInline autoPlay className="h-full w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          )
        ) : (
          <span className="px-4 text-center text-xs text-neutral-500">No {noun} yet</span>
        )}

        {/* Hover / drag / busy prompt */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/55 text-white transition-opacity ${
            busy || dragOver ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
          }`}
        >
          {busy ? (
            <>
              <span aria-hidden="true" className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span className="text-[13px]">Uploading…</span>
            </>
          ) : (
            <>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 16V4m0 0L7 9m5-5 5 5M5 20h14" />
              </svg>
              <span className="text-[13px]">{dragOver ? `Drop the ${noun} here` : `${value ? "Replace" : "Upload"} ${noun}`}</span>
              {!dragOver && <span className="text-[11px] text-white/70">or drag a file onto this box</span>}
            </>
          )}
        </div>
      </div>

      <input
        ref={input}
        type="file"
        accept={kind === "video" ? "video/mp4,video/webm" : "image/jpeg,image/png,image/webp"}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void upload(f);
        }}
      />
      {hint && <p className="text-xs leading-relaxed text-neutral-500">{hint}</p>}
      {error && <p role="alert" className="text-xs leading-relaxed text-red-700">{error}</p>}
    </div>
  );
}
