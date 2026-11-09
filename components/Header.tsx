"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import MobileMenu from "@/components/MobileMenu";
import { useCart } from "@/lib/cart";
import { navLinks } from "@/lib/data";

function Icon({
  d,
  label,
  onClick,
  badge,
}: {
  d: string;
  label: string;
  onClick?: () => void;
  badge?: number;
}) {
  return (
    <button
      type="button"
      aria-label={badge ? `${label}, ${badge} items` : label}
      onClick={onClick}
      className="relative flex h-9 w-9 items-center justify-center rounded-full transition-opacity hover:opacity-60"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={d} />
      </svg>
      {!!badge && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-oduro-gold px-1 text-[9px] font-semibold leading-none text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

const icons = [
  { label: "Search", d: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 3-4.5-4.5" },
  {
    label: "Wishlist",
    d: "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
  },
  { label: "Account", d: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" },
  { label: "Bag", d: "M6 8h12l1 12H5L6 8Zm3 0V6a3 3 0 0 1 6 0v2" },
];

/**
 * Transparent over the hero with a white logo and white text.
 * On hover an Ivory layer fades in behind the nav, the text turns dark brown
 * and the logo switches to black. On mobile the menu slides in from the left.
 */
export default function Header({ solid = false }: { solid?: boolean }) {
  const [open, setOpen] = useState(false);
  const { count, open: openCart } = useCart();

  return (
    <header
      className={`group inset-x-0 z-30 transition-colors duration-300 ease-out hover:bg-white hover:text-oduro-dark focus-within:bg-white focus-within:text-oduro-dark ${
        solid ? "relative border-b border-oduro-champagne/40 bg-white text-oduro-dark" : "absolute top-9 bg-transparent text-white"
      }`}
    >
      <div className="relative mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 md:px-10">
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <Link key={l} href="#" className="text-[13px] tracking-wide transition-opacity hover:opacity-60">
              {l}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 flex-col items-start justify-center gap-[5px] md:hidden"
        >
          <span className="h-px w-5 bg-current" />
          <span className="h-px w-5 bg-current" />
        </button>

        <Link
          href="/"
          aria-label="Maison Oduro home"
          className="absolute left-1/2 top-1/2 h-10 w-[60px] -translate-x-1/2 -translate-y-1/2"
        >
          <Image
            src="/images/logo-white.png"
            alt=""
            fill
            sizes="60px"
            priority
            className={`object-contain transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0 ${solid ? "opacity-0" : "opacity-100"}`}
          />
          <Image
            src="/images/logo-black.png"
            alt="Maison Oduro"
            fill
            sizes="60px"
            priority
            className={`object-contain transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 ${solid ? "opacity-100" : "opacity-0"}`}
          />
        </Link>

        <div className="flex items-center gap-1">
          {icons.map((i) =>
            i.label === "Bag" ? (
              <Icon key={i.label} {...i} onClick={openCart} badge={count} />
            ) : (
              <Icon key={i.label} {...i} />
            ),
          )}
        </div>
      </div>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
