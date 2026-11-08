"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { popularCards, popularTabs } from "@/lib/data";

export default function PopularRightNow() {
  const [tab, setTab] = useState<(typeof popularTabs)[number]>("Women");

  return (
    <section className="mx-auto w-full max-w-[1440px] px-5 pb-16 pt-6 md:px-10 md:pb-24">
      <h2 className="font-serif text-xl font-medium uppercase tracking-wide">Popular right now</h2>

      <div role="tablist" aria-label="Shop by" className="mt-5 flex gap-2">
        {popularTabs.map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`h-9 border px-5 text-[13px] transition-colors ${
              tab === t
                ? "border-oduro-dark text-oduro-dark"
                : "border-oduro-champagne/60 text-oduro-rich/60 hover:text-oduro-dark"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {popularCards.map((c) => (
          <Link key={c.title} href="#" className="group block">
            <div className="relative aspect-[4/5] overflow-hidden bg-oduro-ivory">
              <Image
                src="/images/elixir.jpg"
                alt=""
                fill
                sizes="(min-width:1024px) 25vw, 50vw"
                className="object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
            </div>
            <h3 className="mt-3 text-sm font-semibold">{c.title}</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-oduro-rich">{c.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
