"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import {
  FREE_SHIPPING_THRESHOLD,
  cartExtras,
  deliveryOptions,
  paymentMethods,
} from "@/lib/data";

const rand = (n: number) =>
  `R${n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

export default function CartDrawer() {
  const { items, count, subtotal, isOpen, close, add, setQty, remove } = useCart();
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [code, setCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  // Escape closes, page scroll is locked while open, focus moves into the drawer.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  const away = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-oduro-dark/40 backdrop-blur-[2px] transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={`absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5">
          <h2 className="font-serif text-[26px] leading-none">
            Your bag{" "}
            <span className="align-middle font-sans text-xs tracking-widest text-oduro-rich">({count})</span>
          </h2>
          <button
            ref={closeBtn}
            type="button"
            onClick={close}
            aria-label="Close bag"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* Free shipping progress */}
          <section className="bg-white px-6 py-5" aria-label="Free shipping progress">
            <p className="text-[13px]">
              {away > 0 ? (
                <>
                  You&apos;re <strong className="font-semibold">{rand(away)}</strong> away from Free Standard Shipping
                </>
              ) : (
                <strong className="font-semibold">You&apos;ve unlocked Free Standard Shipping</strong>
              )}
            </p>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={FREE_SHIPPING_THRESHOLD}
              aria-valuenow={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
              aria-label="Progress towards Free Standard Shipping"
              className="mt-3 h-[3px] w-full bg-oduro-champagne/50"
            >
              <div
                className="h-full bg-oduro-gold transition-[width] duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.14em] text-oduro-rich">
              <span>R0</span>
              <span>{rand(FREE_SHIPPING_THRESHOLD)}</span>
            </div>
          </section>

          {/* Delivery options */}
          <section className="border-b border-oduro-champagne/40 px-6">
            <button
              type="button"
              onClick={() => setDeliveryOpen((v) => !v)}
              aria-expanded={deliveryOpen}
              className="flex w-full items-center justify-between py-4 text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">Delivery Options</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                className={`transition-transform duration-300 ${deliveryOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div
              className={`grid transition-all duration-500 ease-out ${
                deliveryOpen ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="mb-3 text-xs text-oduro-copper">Free 30-day returns</p>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-oduro-rich">
                  Estimated delivery
                </p>
                <ul className="divide-y divide-oduro-champagne/30 border-y border-oduro-champagne/30">
                  {deliveryOptions.map((d) => (
                    <li key={d.name} className="flex items-start justify-between gap-4 py-3">
                      <div>
                        <p className="text-[13px] font-medium">{d.name}</p>
                        <p className="mt-0.5 text-xs text-oduro-rich">{d.eta}</p>
                        {d.note && <p className="mt-0.5 text-[11px] text-oduro-copper">{d.note}</p>}
                      </div>
                      <p className="text-[13px] font-medium">{d.price}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 px-8 py-16 text-center">
              <p className="font-serif text-2xl">Your bag is empty.</p>
              <p className="text-[13px] text-oduro-rich">Choose a format on any elixir to add it here.</p>
              <button
                type="button"
                onClick={close}
                className="mt-1 text-xs font-medium uppercase tracking-[0.18em] underline underline-offset-[6px]"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              <p className="mx-6 mt-5 border-l-2 border-oduro-gold pl-3 text-xs leading-relaxed text-oduro-rich">
                Your items aren&apos;t reserved, checkout quickly to make sure you don&apos;t miss out.
              </p>

              <ul className="divide-y divide-oduro-champagne/30 px-6">
                {items.map((it) => (
                  <li key={it.id} className="flex gap-4 py-5">
                    <div className="relative h-[110px] w-[88px] shrink-0 overflow-hidden bg-white ring-1 ring-oduro-champagne/30">
                      <Image src={it.image} alt={it.name} fill sizes="88px" className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-serif text-base leading-snug">{it.name}</h3>
                        <p className="text-[13px] font-medium">{rand(it.price)}</p>
                      </div>
                      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-oduro-copper">
                        {it.format}
                      </p>
                      <p className="mt-0.5 text-xs text-oduro-rich">{it.variant}</p>

                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="flex items-center border border-oduro-champagne/60">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${it.name}`}
                            onClick={() => setQty(it.id, it.qty - 1)}
                            className="h-8 w-8 text-base transition-colors hover:bg-white"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-[13px]" aria-live="polite">
                            {it.qty}
                          </span>
                          <button
                            type="button"
                            aria-label={`Increase quantity of ${it.name}`}
                            onClick={() => setQty(it.id, it.qty + 1)}
                            className="h-8 w-8 text-base transition-colors hover:bg-white"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(it.id)}
                          className="text-[10px] font-medium uppercase tracking-[0.18em] text-oduro-rich/70 underline underline-offset-4 transition-colors hover:text-oduro-dark"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Add a little extra */}
          <section className="border-t border-oduro-champagne/40 py-6" aria-label="Add a little extra">
            <div className="px-6">
              <h3 className="font-serif text-xl">Add a little extra</h3>
              <p className="mt-1 text-xs text-oduro-rich">
                Add one or more of these items to get free delivery
              </p>
            </div>
            <ul className="no-scrollbar mt-4 flex snap-x scroll-px-6 gap-3 overflow-x-auto px-6">
              {cartExtras.map((x) => (
                <li key={x.name} className="w-[132px] shrink-0 snap-start">
                  <div className="relative aspect-[4/5] overflow-hidden bg-white ring-1 ring-oduro-champagne/30">
                    <Image src={x.image} alt={x.name} fill sizes="132px" className="object-cover" />
                    <span className="absolute left-1.5 top-1.5 bg-white/90 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em]">
                      New
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-medium leading-snug">{x.name}</p>
                  <p className="mt-0.5 text-xs text-oduro-rich">{rand(Number(x.price.replace(/[^0-9.]/g, "")))}</p>
                  <button
                    type="button"
                    onClick={() =>
                      add({
                        name: x.name,
                        variant: "Add-on",
                        format: "Extra",
                        priceLabel: x.price,
                        image: x.image,
                      })
                    }
                    className="mt-2 h-8 w-full border border-oduro-dark text-[10px] font-medium uppercase tracking-[0.16em] transition-colors hover:bg-oduro-dark hover:text-white"
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Discount code */}
          <section className="border-t border-oduro-champagne/40 px-6 py-6">
            <label htmlFor="discount" className="text-xs font-semibold uppercase tracking-[0.18em]">
              Discount code
            </label>
            <form
              className="mt-3 flex"
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim()) setAppliedCode(code.trim().toUpperCase());
              }}
            >
              <input
                id="discount"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter code"
                className="h-11 flex-1 border border-oduro-champagne bg-white px-4 text-[13px] outline-none placeholder:text-oduro-rich/60 focus:border-oduro-dark"
              />
              <button
                type="submit"
                className="h-11 bg-oduro-dark px-6 text-[10px] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-oduro-rich"
              >
                Apply
              </button>
            </form>
            <p className="mt-2 text-[11px] text-oduro-rich">
              {appliedCode
                ? `Code ${appliedCode} saved. It will be checked at checkout.`
                : "Gift Card codes can be applied at checkout."}
            </p>
          </section>
        </div>

        {/* Sticky footer */}
        {items.length > 0 && (
          <footer className="border-t border-oduro-champagne/40 bg-white px-6 pb-5 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-medium uppercase tracking-[0.2em]">Subtotal</span>
              <span className="font-serif text-2xl">{rand(subtotal)}</span>
            </div>
            <button
              type="button"
              className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 bg-oduro-dark text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-oduro-rich"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="5" y="11" width="14" height="9" rx="1" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              Checkout securely
            </button>
            <ul className="mt-3 flex flex-wrap items-center justify-center gap-1.5" aria-label="Accepted payment methods">
              {paymentMethods.map((p) => (
                <li
                  key={p}
                  className="border border-oduro-champagne/60 px-2 py-1 text-[9px] font-medium uppercase tracking-[0.1em] text-oduro-rich"
                >
                  {p}
                </li>
              ))}
            </ul>
          </footer>
        )}
      </aside>
    </div>
  );
}
