"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { Product, ProductOption } from "@/lib/data";
import { formatDescriptions, optionImages, productOptions } from "@/lib/data";

/** Zara-style product page: stacked image grid on the left, sticky details on the right. */
export default function ProductView({
  product,
  initialFormat,
}: {
  product: Product;
  initialFormat: ProductOption;
}) {
  const { add } = useCart();
  const [format, setFormat] = useState<ProductOption>(initialFormat);

  // Selected format's bottle first, then the rest of the gallery.
  const gallery = Array.from(new Set([optionImages[format], ...Object.values(optionImages), "/images/story.jpg"]));

  return (
    <main className="mx-auto w-full max-w-[1440px] md:grid md:grid-cols-[1fr_380px] lg:grid-cols-[1fr_420px]">
      <div className="grid grid-cols-1 gap-px bg-white sm:grid-cols-2">
        {gallery.map((src, i) => (
          <div
            key={src}
            className={`relative aspect-[3/4] ${src.includes("story") ? "bg-oduro-dark" : "bg-oduro-ash"} ${
              i === 0 ? "sm:col-span-2 sm:aspect-[4/3]" : ""
            }`}
          >
            <Image
              src={src}
              alt={i === 0 ? product.name : ""}
              fill
              priority={i === 0}
              sizes={i === 0 ? "(min-width:768px) 65vw, 100vw" : "(min-width:768px) 33vw, 50vw"}
              className={`${src.includes("story") ? "object-cover" : "object-contain mix-blend-multiply"}`}
            />
          </div>
        ))}
      </div>

      <aside className="px-6 py-8 md:px-8">
        <div className="md:sticky md:top-6 md:flex md:max-h-[calc(100svh-3rem)] md:flex-col md:justify-between md:gap-10">
          <div>
            <nav aria-label="Breadcrumb" className="mb-8 text-[11px] uppercase tracking-[0.18em] text-oduro-rich/70">
              <Link href="/" className="hover:text-oduro-dark">Home</Link> / Elixirs
            </nav>

            <h1 className="text-sm font-medium uppercase leading-snug tracking-[0.06em]">{product.name}</h1>
            <p className="mt-2 text-[13px] font-medium">{product.price}</p>
            <p className="mt-1 text-[11px] text-oduro-rich/70">Taxes included</p>

            <p className="mt-6 text-[13px] leading-relaxed text-oduro-rich">{formatDescriptions[format]}</p>
            <p className="mt-3 text-[12px] text-oduro-rich/70">{product.variant}</p>

            <div className="mt-8">
              <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-oduro-rich/70">Format</p>
              <div role="radiogroup" aria-label="Format" className="flex flex-col border-t border-oduro-champagne/40">
                {productOptions.map((o) => (
                  <button
                    key={o}
                    type="button"
                    role="radio"
                    aria-checked={format === o}
                    onClick={() => setFormat(o)}
                    className={`flex h-12 items-center justify-between border-b border-oduro-champagne/40 text-[13px] uppercase tracking-[0.08em] transition-colors ${
                      format === o ? "text-oduro-dark" : "text-oduro-rich/60 hover:text-oduro-dark"
                    }`}
                  >
                    {o}
                    {format === o && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-oduro-dark" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              add({
                name: product.name,
                variant: product.variant,
                format,
                priceLabel: product.price,
                image: optionImages[format],
              })
            }
            className="mt-8 h-12 w-full bg-oduro-dark text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-oduro-rich md:mt-0"
          >
            Add
          </button>
        </div>
      </aside>
    </main>
  );
}
