"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Product } from "@/lib/data";
import ProductCard from "./ProductCard";

export default function ProductSection({
  id,
  title,
  products,
}: {
  id?: string;
  title: string;
  products: Product[];
}) {
  const track = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section id={id} className="mx-auto w-full max-w-[1440px] px-5 py-16 md:px-10 md:py-[72px]">
      <div className="mb-9 flex items-center justify-between">
        <div className="flex items-baseline gap-4">
          <h2 className="font-serif text-xl font-medium uppercase tracking-wide">{title}</h2>
          <Link href="#" className="text-[13px] text-oduro-copper underline underline-offset-4">
            View All
          </Link>
        </div>
        <div className="hidden gap-3 md:flex">
          {(["‹", "›"] as const).map((a, i) => (
            <button
              key={a}
              type="button"
              aria-label={i === 0 ? "Previous" : "Next"}
              onClick={() => scroll(i === 0 ? -1 : 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-oduro-champagne text-base transition-colors hover:bg-white"
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={track}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth"
      >
        {products.map((p, i) => (
          <ProductCard key={`${p.name}-${i}`} product={p} />
        ))}
      </div>
    </section>
  );
}
