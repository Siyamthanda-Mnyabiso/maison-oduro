import Image from "next/image";
import type { HeroContent } from "@/lib/content-defaults";

/**
 * Full-screen hero (minus the announcement bar). Its video/image is edited in /admin;
 * the poster shows while a video loads.
 */
export default function Hero({ hero, hasBar = true }: { hero: HeroContent; hasBar?: boolean }) {
  return (
    <section className={`relative flex ${hasBar ? "h-[calc(100svh-2.25rem)]" : "h-svh"} min-h-[520px] items-center justify-center overflow-hidden bg-oduro-dark`}>
      {hero.mediaType === "video" ? (
        <video
          key={hero.mediaUrl}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={hero.posterUrl}
          aria-hidden="true"
        >
          <source src={hero.mediaUrl} />
        </video>
      ) : (
        <Image src={hero.mediaUrl} alt="" fill priority sizes="100vw" className="object-cover" />
      )}
      <div className="absolute inset-0 bg-oduro-dark" style={{ opacity: hero.overlay / 100 }} />

      <h1
        aria-label="Maison Oduro"
        className="relative z-10 flex items-baseline justify-center gap-1 px-6 text-center font-normal leading-tight text-white"
      >
        <span aria-hidden="true" className="font-script text-6xl md:text-[84px]">Maison</span>
        <span aria-hidden="true" className="font-serif text-5xl uppercase tracking-wide md:text-[68px]">Oduro</span>
      </h1>

      <a
        href="#collection"
        aria-label="Scroll to the collection"
        className="absolute bottom-8 left-1/2 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-white/70 text-white transition-colors hover:bg-white hover:text-oduro-dark"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </a>
    </section>
  );
}
