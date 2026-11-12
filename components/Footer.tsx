import Image from "next/image";
import Link from "next/link";
import type { SiteContent } from "@/lib/content-defaults";

export default function Footer({ footer }: { footer: SiteContent["footer"] }) {
  return (
    <footer className="border-t border-oduro-champagne/50 bg-white">
      <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-16">
        <div style={{ "--cols": Math.max(1, footer.columns.length) } as React.CSSProperties} className="grid gap-10 md:grid-cols-[1.6fr_repeat(var(--cols),1fr)]">
          <div className="flex flex-col gap-4">
            <Image src="/images/logo-black.png" alt="Maison Oduro" width={60} height={40} className="h-10 w-[60px] object-contain" />
            <p className="max-w-[16rem] text-[13px] leading-relaxed text-oduro-rich">
              {footer.slogan}
            </p>
          </div>

          {footer.columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em]">{col.title}</h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((l) => (
                  <li key={l.id}>
                    <Link href={l.href || "#"} className="text-[13px] text-oduro-rich transition-colors hover:text-oduro-dark">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col justify-between gap-3 border-t border-oduro-champagne/60 pt-6 text-[11px] text-oduro-rich sm:flex-row">
          <p>{footer.copyright}</p>
          <p>{footer.legal}</p>
        </div>
      </div>
    </footer>
  );
}
