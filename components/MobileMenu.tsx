"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { navLinks } from "@/lib/data";

const secondary = ["Search", "Wishlist", "Account", "Contact"];

/** Slide-out menu that comes in from the left on mobile. */
export default function MobileMenu({ open, onClose, always = false }: { open: boolean; onClose: () => void; always?: boolean }) {
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <div className={`fixed inset-0 z-50 ${always ? "" : "md:hidden"} ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-oduro-dark/40 backdrop-blur-[2px] transition-opacity duration-500 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={`absolute left-0 top-0 flex h-full w-[84%] max-w-[360px] flex-col bg-white text-oduro-dark shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between px-5">
          <Image src="/images/logo-black.png" alt="Maison Oduro" width={60} height={40} className="h-10 w-[60px] object-contain" />
          <button
            ref={closeBtn}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/60"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </div>

        <nav aria-label="Mobile" className="flex flex-1 flex-col overflow-y-auto px-5 pt-6">
          <ul className="flex flex-col">
            {navLinks.map((l) => (
              <li key={l} className="border-b border-oduro-champagne/40">
                <Link href="#" onClick={onClose} className="flex items-center justify-between py-4 font-serif text-[28px] leading-none">
                  {l}
                  <span aria-hidden="true" className="font-sans text-base text-oduro-copper">
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <ul className="mt-8 flex flex-col gap-4">
            {secondary.map((l) => (
              <li key={l}>
                <Link
                  href="#"
                  onClick={onClose}
                  className="text-[11px] font-medium uppercase tracking-[0.2em] text-oduro-rich transition-colors hover:text-oduro-dark"
                >
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="px-5 pb-6 text-[11px] text-oduro-rich">Inspired by icons. Made for you.</p>
      </aside>
    </div>
  );
}
