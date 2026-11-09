"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import MobileMenu from "@/components/MobileMenu";
import { useCart } from "@/lib/cart";
import type { Product, ProductOption } from "@/lib/data";
import { formatDescriptions, optionImages, productOptions, slugify } from "@/lib/data";

const BG = "bg-[#ebeae6]";

/** Minimal fixed chrome, like Zara: menu lines top-left, search / bag / log in / help top-right. */
function Chrome({ onMenu }: { onMenu: () => void }) {
  const { count, open } = useCart();
  return (
    <>
      <button
        type="button"
        aria-label="Menu"
        onClick={onMenu}
        className="fixed left-5 top-6 z-40 flex h-6 w-16 flex-col justify-between py-2 md:left-[30px]"
      >
        <span className="h-px w-full bg-oduro-dark" />
        <span className="h-px w-full bg-oduro-dark" />
      </button>

      <Link href="/" aria-label="Maison Oduro home" className="fixed left-1/2 top-4 z-40 -translate-x-1/2 md:hidden">
        <Image src="/images/logo-black.png" alt="Maison Oduro" width={48} height={32} className="h-8 w-12 object-contain" />
      </Link>

      <div className="fixed right-5 top-6 z-40 flex flex-col items-end gap-4 text-right text-[13px] font-normal uppercase tracking-[0.02em] text-oduro-dark md:right-[30px]">
        <span className="hidden w-[130px] border-b border-oduro-dark pb-1.5 text-oduro-rich/70 md:block">Search</span>
        <div className="flex flex-col items-end gap-4 md:mt-[34px]">
          <button type="button" onClick={open} className="flex items-center gap-2 uppercase">
            Bag
            <span className="inline-flex h-[14px] min-w-[18px] items-center justify-center border-x border-b border-oduro-dark px-1 text-[10px] leading-none">
              {count}
            </span>
          </button>
          <span className="hidden md:block">Log in</span>
          <span className="hidden md:block">Help</span>
        </div>
      </div>
    </>
  );
}

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
  initialFormat,
  related,
}: {
  product: Product;
  initialFormat: ProductOption;
  related: Product[];
}) {
  const { add } = useCart();
  const [format, setFormat] = useState<ProductOption>(initialFormat);
  const [menu, setMenu] = useState(false);

  const gallery = Array.from(new Set([optionImages[format], ...Object.values(optionImages), "/images/story.jpg"]));

  return (
    <>
      <Chrome onMenu={() => setMenu(true)} />
      <MobileMenu open={menu} onClose={() => setMenu(false)} always />

      <main className="relative pt-[88px] md:pt-[30px]">
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
                className={src.includes("story") ? "object-cover" : "object-contain mix-blend-multiply"}
              />
            </div>
          ))}
        </div>

        {/* Details: top right of the first image, scrolls away with the page */}
        <section className="px-5 pb-12 pt-8 md:absolute md:left-[62%] md:top-[160px] md:w-[24%] md:min-w-[300px] md:p-0">
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
                image: optionImages[format],
              })
            }
            className="mt-5 h-10 w-full border border-oduro-dark/70 text-[13px] uppercase transition-colors hover:bg-oduro-dark hover:text-white"
          >
            Add
          </button>

          <p className="mt-6 text-xs leading-[18px] text-oduro-dark">{formatDescriptions[format]}</p>

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
                    src={optionImages.Premium}
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
