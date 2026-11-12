"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getBrowserClient } from "@/lib/supabase/browser";

type Mode = "signin" | "signup";

const labelCls = "text-[11px] uppercase tracking-[0.08em] text-neutral-500";
const inputCls =
  "h-10 w-full border-0 border-b border-neutral-300 bg-transparent px-0 text-[13px] text-black outline-none transition-colors placeholder:text-neutral-300 focus:border-black";
const buttonCls =
  "flex h-12 w-full items-center justify-center bg-black px-4 text-[12px] uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-80 disabled:opacity-50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className={labelCls}>{label}</span>
      {children}
    </label>
  );
}

/** Password input with a show/hide (eye) button. */
function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  minLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Field label={label}>
      <div className="relative">
        <input
          className={`${inputCls} pr-9`}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-neutral-500 hover:text-black"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {!visible && <path d="M3 3l18 18" />}
          </svg>
        </button>
      </div>
    </Field>
  );
}

/** Log in / register screen, styled after a minimal fashion-retail account page. */
export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "error" | "info"; text: string } | null>(null);

  const go = (next: Mode) => {
    setMode(next);
    setMessage(null);
    setConfirm("");
    setPassword("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup" && password !== confirm) {
      setMessage({ kind: "error", text: "The passwords don't match." });
      return;
    }
    setBusy(true);
    setMessage(null);
    const auth = getBrowserClient().auth;

    if (mode === "signin") {
      const { error } = await auth.signInWithPassword({ email, password });
      if (error) {
        const unconfirmed = error.code === "email_not_confirmed" || /not confirmed/i.test(error.message);
        setMessage({
          kind: "error",
          text: unconfirmed
            ? "Your email isn't confirmed yet. Open the confirmation email we sent (check spam), click the link, then log in."
            : error.status === 400 || error.code === "invalid_credentials"
              ? "The email or password is incorrect."
              : `Couldn't log in: ${error.message}`,
        });
      }
    } else {
      const { data, error } = await auth.signUp({
        email,
        password,
        options: { data: { full_name: `${firstName} ${lastName}`.trim() } },
      });
      if (error) {
        setMessage({ kind: "error", text: error.message });
      } else if (data.user && data.user.identities?.length === 0) {
        // Supabase hides whether an address is taken; an empty identities list means it is.
        go("signin");
        setMessage({ kind: "error", text: "That email is already registered. Log in instead, or use a different email." });
      } else if (!data.session) {
        go("signin");
        setMessage({ kind: "info", text: "Account created. Check your email to confirm it, then log in." });
      } else {
        setMessage({ kind: "info", text: "Account created. It must be approved before it can edit the site." });
      }
    }
    setBusy(false);
  };

  const feedback = message && (
    <p role={message.kind === "error" ? "alert" : "status"} className={`text-[12px] ${message.kind === "error" ? "text-red-700" : "text-neutral-700"}`}>
      {message.text}
    </p>
  );

  return (
    <div className="min-h-svh bg-white text-black">
      <header className="relative flex h-[72px] items-center justify-center border-b border-neutral-200 px-5">
        <Link href="/" className="absolute left-5 text-[11px] uppercase tracking-[0.1em] hover:opacity-60 md:left-10">
          ← Back to site
        </Link>
        <Link href="/" aria-label="Maison Oduro home">
          <Image src="/images/logo-black.png" alt="Maison Oduro" width={60} height={40} className="h-10 w-[60px] object-contain" priority />
        </Link>
      </header>

      <main className="mx-auto w-full max-w-[1000px] px-5 py-12 md:py-20">
        {mode === "signin" ? (
          <div className="grid gap-14 md:grid-cols-2 md:gap-0">
            <section aria-labelledby="login-title" className="md:pr-20">
              <h1 id="login-title" className="mb-10 text-[13px] uppercase tracking-[0.1em]">Log in</h1>
              <form onSubmit={submit} className="flex flex-col gap-7">
                <Field label="Email">
                  <input className={inputCls} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <PasswordField label="Password" autoComplete="current-password" value={password} onChange={setPassword} />
                {feedback}
                <button disabled={busy} className={buttonCls}>{busy ? "Please wait…" : "Log in"}</button>
              </form>
            </section>

            <section aria-labelledby="register-title" className="border-t border-neutral-200 pt-14 md:border-l md:border-t-0 md:pl-20 md:pt-0">
              <h2 id="register-title" className="mb-10 text-[13px] uppercase tracking-[0.1em]">Register</h2>
              <p className="mb-8 max-w-[26rem] text-[13px] leading-relaxed text-neutral-600">
                If you still don&apos;t have a Maison Oduro account, use this option to access the registration form.
                Give us your details and we&apos;ll set your account up.
              </p>
              <button type="button" onClick={() => go("signup")} className={buttonCls}>Create account</button>
            </section>
          </div>
        ) : (
          <section aria-labelledby="register-title" className="mx-auto max-w-[420px]">
            <h1 id="register-title" className="mb-10 text-[13px] uppercase tracking-[0.1em]">Personal details</h1>
            <form onSubmit={submit} className="flex flex-col gap-7">
              <Field label="Email">
                <input className={inputCls} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <PasswordField label="Password" autoComplete="new-password" minLength={8} value={password} onChange={setPassword} />
              <PasswordField label="Confirm password" autoComplete="new-password" minLength={8} value={confirm} onChange={setConfirm} />
              <Field label="First name">
                <input className={inputCls} autoComplete="given-name" required maxLength={40} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </Field>
              <Field label="Last name">
                <input className={inputCls} autoComplete="family-name" required maxLength={40} value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </Field>
              <label className="flex items-start gap-3 text-[12px] leading-snug text-neutral-600">
                <input type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 accent-black" />
                I have read and accept the privacy policy and terms of use.
              </label>
              {feedback}
              <button disabled={busy || !agreed} className={buttonCls}>{busy ? "Please wait…" : "Create account"}</button>
              <button type="button" onClick={() => go("signin")} className="text-center text-[11px] uppercase tracking-[0.1em] underline underline-offset-4 hover:opacity-60">
                Already have an account? Log in
              </button>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
