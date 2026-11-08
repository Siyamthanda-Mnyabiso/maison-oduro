import Link from "next/link";

/**
 * Hero video lives at /public/video/hero.mp4 (cosmos_1551657857).
 * The poster is shown while it loads.
 */
export default function Hero() {
  return (
    <section className="relative flex h-[560px] items-center justify-center overflow-hidden bg-oduro-dark">
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

      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center text-white">
        <h1 className="font-serif text-5xl font-normal leading-tight md:text-[64px]">
          Inspired by icons.
        </h1>
        <Link
          href="#collection"
          className="text-xs font-medium uppercase tracking-[0.18em] underline underline-offset-[6px] transition-opacity hover:opacity-70"
        >
          Shop the collection
        </Link>
      </div>
    </section>
  );
}
