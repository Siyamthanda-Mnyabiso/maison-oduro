"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product, ProductOption } from "@/lib/data";
import { optionImages, productOptions, slugify } from "@/lib/data";


const uniqueImages = Array.from(new Set(Object.values(optionImages)));

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const href = `/product/${slugify(product)}`;
  const [selected, setSelected] = useState<ProductOption>("Premium");
  const [preview, setPreview] = useState<ProductOption | null>(null);

  // Hovering (or focusing) a format previews its bottle; clicking selects it.
  const shown = optionImages[preview ?? selected];

  return (
    <article className="group w-[62%] shrink-0 snap-start sm:w-[calc((100%-48px)/3)] lg:w-[calc((100%-96px)/5)]">
      <div className="relative aspect-[4/5] overflow-hidden bg-oduro-ash">
        <Link href={href} aria-label={product.name} className="absolute inset-0">
          {uniqueImages.map((src) => (
            <Image
              key={src}
              src={src}
              alt={src === shown ? product.name : ""}
              fill
              sizes="(min-width:1024px) 20vw, (min-width:640px) 33vw, 62vw"
              className={`object-cover mix-blend-multiply transition-all duration-700 ease-out group-hover:scale-[1.03] ${
                src === shown ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </Link>

        {/* Formats revealed on hover / keyboard focus (always visible on touch screens) */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-white/95 px-4 pb-4 pt-3 text-center opacity-0 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
          <p className="mb-2.5 text-[9px] font-medium uppercase tracking-[0.28em] text-oduro-copper">
            Choose your format
          </p>
          <div
            role="radiogroup"
            aria-label={`${product.name} format`}
            onMouseLeave={() => setPreview(null)}
            className="flex items-center justify-between border-t border-oduro-champagne/50 pt-3"
          >
            {productOptions.map((o) => {
              const active = (preview ?? selected) === o;
              return (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={selected === o}
                  onClick={() => {
                    setSelected(o);
                    router.push(`${href}?format=${encodeURIComponent(o)}`);
                  }}
                  onMouseEnter={() => setPreview(o)}
                  onFocus={() => setPreview(o)}
                  onBlur={() => setPreview(null)}
                  className={`relative whitespace-nowrap pb-1.5 text-[10px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-center after:bg-oduro-gold after:transition-transform after:duration-300 ${
                    active
                      ? "text-oduro-dark after:scale-x-100"
                      : "text-oduro-rich/55 after:scale-x-0"
                  }`}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Link href={href} className="block px-1 pt-4 text-center">
        <h3 className="flex min-h-[3.5rem] items-start justify-center font-serif text-lg leading-snug">
          {product.name}
        </h3>
        <p className="mt-1.5 text-xs text-oduro-rich">{product.variant}</p>
        <p className="mt-1.5 text-[13px] font-medium">{product.price}</p>
      </Link>
    </article>
  );
}
