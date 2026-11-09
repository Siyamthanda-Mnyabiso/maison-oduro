"use client";

import Image from "next/image";
import { useEffect } from "react";
import type { Product, ProductOption } from "@/lib/data";
import { formatDescriptions, optionImages, productOptions } from "@/lib/data";

/** Product details panel: opens when a product or format is selected. */
export default function ProductDetail({
  product,
  format,
  onFormat,
  onAdd,
  onClose,
}: {
  product: Product;
  format: ProductOption;
  onFormat: (f: ProductOption) => void;
  onAdd: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const shown = optionImages[format];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-oduro-dark/50 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${product.name} details`}
        className="relative grid max-h-full w-full max-w-[960px] overflow-y-auto bg-white md:grid-cols-2"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 transition-colors hover:bg-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>

        <div className="relative aspect-[4/5] bg-oduro-ash">
          <Image
            src={shown}
            alt={product.name}
            fill
            sizes="(min-width:768px) 480px, 100vw"
            className="object-cover mix-blend-multiply"
          />
        </div>

        <div className="flex flex-col justify-center gap-6 p-7 md:p-10">
          <div>
            <h2 className="font-serif text-2xl leading-snug">{product.name}</h2>
            <p className="mt-2 text-xs text-oduro-rich">{product.variant}</p>
            <p className="mt-3 text-base font-medium">{product.price}</p>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.28em] text-oduro-copper">Format</p>
            <div role="radiogroup" aria-label="Format" className="flex gap-6 border-t border-oduro-champagne/50 pt-3">
              {productOptions.map((o) => (
                <button
                  key={o}
                  type="button"
                  role="radio"
                  aria-checked={format === o}
                  onClick={() => onFormat(o)}
                  className={`relative pb-1.5 text-[11px] font-medium uppercase tracking-[0.16em] transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-oduro-gold after:transition-transform ${
                    format === o ? "text-oduro-dark after:scale-x-100" : "text-oduro-rich/55 after:scale-x-0"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.28em] text-oduro-copper">Description</p>
            <p className="text-sm leading-relaxed text-oduro-rich">{formatDescriptions[format]}</p>
          </div>

          <button
            type="button"
            onClick={onAdd}
            className="h-12 bg-oduro-dark text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-oduro-rich"
          >
            Add to bag
          </button>
        </div>
      </div>
    </div>
  );
}
