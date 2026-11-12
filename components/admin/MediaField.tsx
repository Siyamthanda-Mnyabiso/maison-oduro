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
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  kind?: "image" | "video";
  folder: string;
  hint?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">{label}</span>
      <div className="flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl bg-[#e9e9ee] sm:w-64">
        {value ? (
          kind === "video" ? (
            <video key={value} src={value} muted loop playsInline autoPlay className="h-full w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          )
        ) : (
          <span className="text-xs text-neutral-500">Nothing selected</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="h-9 rounded-xl bg-[#222] px-4 text-[13px] text-white hover:opacity-85 disabled:opacity-50"
        >
          {busy ? "Uploading…" : value ? "Replace" : "Upload"}
        </button>
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
      </div>
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
