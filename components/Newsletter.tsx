"use client";

import { useState } from "react";

export default function Newsletter() {
  const [done, setDone] = useState(false);

  return (
    <section className="flex flex-col items-center gap-5 px-5 py-20 text-center md:py-24">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-oduro-copper">Join the house</p>
      <h2 className="max-w-xl font-serif text-3xl font-normal leading-tight md:text-[40px]">
        Receive first access to new elixirs.
      </h2>

      {done ? (
        <p className="pt-2 text-sm text-oduro-rich">Thank you. Welcome to the house.</p>
      ) : (
        <form
          className="flex w-full max-w-[540px] flex-col gap-3 pt-2 sm:flex-row sm:gap-0"
          onSubmit={(e) => {
            e.preventDefault();
            setDone(true);
          }}
        >
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="Your email address"
            className="h-[52px] flex-1 border border-oduro-champagne bg-white px-5 text-[13px] text-oduro-dark outline-none placeholder:text-oduro-rich/70 focus:border-oduro-dark"
          />
          <button
            type="submit"
            className="h-[52px] bg-oduro-dark px-10 text-xs font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-oduro-rich"
          >
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
}
