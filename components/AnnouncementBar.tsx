import Link from "next/link";
import type { SiteContent } from "@/lib/content-defaults";

/** Returns null when switched off in the admin (pages then drop the 36px offset via `hasBar`). */
export default function AnnouncementBar({ announcement }: { announcement: SiteContent["announcement"] }) {
  if (!announcement.enabled || !announcement.text.trim()) return null;
  const cls =
    "flex h-9 items-center justify-center bg-white px-4 text-center text-[11px] font-normal uppercase tracking-[0.18em] text-oduro-dark";
  return announcement.href ? (
    <Link href={announcement.href} className={`${cls} hover:opacity-70`}>
      {announcement.text}
    </Link>
  ) : (
    <div className={cls}>{announcement.text}</div>
  );
}

export const hasAnnouncement = (a: SiteContent["announcement"]) => a.enabled && a.text.trim().length > 0;
