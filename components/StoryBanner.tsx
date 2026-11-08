import Image from "next/image";
import Link from "next/link";

export default function StoryBanner() {
  return (
    <section className="relative flex h-[440px] items-end overflow-hidden">
      <Image
        src="/images/story.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-oduro-dark/40" />
      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-start gap-6 px-5 pb-14 text-white md:px-10 md:pb-16">
        <h2 className="font-serif text-4xl font-normal leading-tight md:text-[56px]">
          Iconic scents, reimagined.
        </h2>
        <Link
          href="#"
          className="text-xs font-medium uppercase tracking-[0.18em] underline underline-offset-[6px] transition-opacity hover:opacity-70"
        >
          Discover the house
        </Link>
      </div>
    </section>
  );
}
