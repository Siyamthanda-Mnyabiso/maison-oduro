/**
 * Hero video lives at /public/video/hero.mp4 (cosmos_1551657857).
 * It fills the whole screen (minus the announcement bar). The poster is shown while it loads.
 */
export default function Hero() {
  return (
    <section className="relative flex h-[calc(100svh-2.25rem)] min-h-[520px] items-center justify-center overflow-hidden bg-oduro-dark">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/hero-poster.jpg"
        aria-hidden="true"
      >
        <source src="/video/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-oduro-dark/45" />

      <h1 className="relative z-10 px-6 text-center font-serif text-5xl font-normal leading-tight text-white md:text-[64px]">
        Maison Oduro
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
