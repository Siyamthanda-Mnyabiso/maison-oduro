"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import type { Product, ProductOption } from "@/lib/data";
import { formatDescriptions, productOptions, slugify } from "@/lib/data";

const BG = "bg-[#ebeae6]";

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group py-[5px]">
      <summary className="cursor-pointer list-none text-xs uppercase leading-[23px] text-oduro-dark/90 marker:hidden hover:text-oduro-dark [&::-webkit-details-marker]:hidden">
        {title}
      </summary>
      <p className="py-2 text-xs normal-case leading-[18px] text-oduro-rich">{children}</p>
    </details>
  );
}

export default function ProductView({
  product,
  related,
  bottles,
  gallery: extraImages,
}: {
  product: Product;
  related: Product[];
  bottles: Record<ProductOption, string>;
  gallery: string[];
}) {
  const { add } = useCart();
  const params = useSearchParams();
  const [format, setFormat] = useState<ProductOption>(
    productOptions.find((o) => o === params.get("format")) ?? "Premium",
  );

  const gallery = Array.from(new Set([bottles[format], ...extraImages]));

  return (
    <>
      <main className="relative pt-6 md:pt-8">
        {/* Gallery: staggered column, like Zara */}
        <div className="flex flex-col gap-4 md:pl-[13%] md:pr-[14%]">
          {gallery.map((src, i) => (
            <div
              key={src}
              className={`relative aspect-[3/4] ${BG} md:max-h-[calc(100svh-30px)] ${
                i % 2 === 0 ? "md:w-[58%]" : "md:ml-auto md:w-[47%]"
              }`}
            >
              <Image
                src={src}
                alt={i === 0 ? product.name : ""}
                fill
                priority={i === 0}
                sizes="(min-width:768px) 45vw, 100vw"
                className={src.includes("/story") ? "object-cover" : "object-contain mix-blend-multiply"}
              />
            </div>
          ))}
        </div>

        {/* Details: top right of the first image, scrolls away with the page */}
        <section className="px-5 pb-12 pt-8 md:absolute md:left-[62%] md:top-[96px] md:w-[24%] md:min-w-[300px] md:p-0">
          <h1 className="text-[13px] font-normal uppercase leading-[23px] tracking-[0.01em]">{product.name}</h1>
          <p className="text-[13px] leading-[23px]">{product.price}.00</p>
          <p className="text-[11px] leading-[18px] text-oduro-rich/80">Taxes included</p>
          <hr className="my-5 border-oduro-dark/70" />

          <p className="text-[11px] uppercase text-oduro-rich/80">{product.variant}</p>

          <div role="radiogroup" aria-label="Format" className="mt-4 flex gap-5">
            {productOptions.map((o) => (
              <button
                key={o}
                type="button"
                role="radio"
                aria-checked={format === o}
                onClick={() => setFormat(o)}
                className={`pb-0.5 text-xs uppercase transition-colors ${
                  format === o ? "border-b border-oduro-dark text-oduro-dark" : "border-b border-transparent text-oduro-rich/60 hover:text-oduro-dark"
                }`}
              >
                {o}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              add({
                name: product.name,
                variant: product.variant,
                format,
                priceLabel: product.price,
                image: bottles[format],
              })
            }
            className="mt-5 h-10 w-full border border-oduro-dark/70 text-[13px] uppercase transition-colors hover:bg-oduro-dark hover:text-white"
          >
            Add
          </button>

          <p className="mt-6 text-xs leading-[18px] text-oduro-dark">{product.description?.trim() || formatDescriptions[format]}</p>

          <div className="mt-6">
            <Row title="Composition, care & origin">Details to be confirmed for this fragrance.</Row>
            <Row title="Shipping, exchanges and returns">
              Complimentary shipping on orders over R1,500. Unopened items can be returned within 30 days.
            </Row>
          </div>
        </section>

        {/* Related */}
        <section className="px-5 pb-20 pt-16 md:pl-[13%] md:pr-[14%]">
          <h2 className="mb-4 text-xs uppercase text-oduro-dark/80">You may be interested in</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <Link key={slugify(p)} href={`/product/${slugify(p)}`} className="group block">
                <div className={`relative aspect-[3/4] ${BG}`}>
                  <Image
                    src={bottles.Premium}
                    alt=""
                    fill
                    sizes="(min-width:768px) 20vw, 50vw"
                    className="object-contain mix-blend-multiply"
                  />
                </div>
                <p className="mt-2 text-xs uppercase leading-[18px]">{p.name}</p>
                <p className="text-xs leading-[18px] text-oduro-rich">{p.price}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
