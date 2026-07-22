"use client";

import TransitionLink from "@/components/TransitionLink";
import BracketEditor from "@/components/BracketEditor";

/** Нийтийн хуучин route — admin руу чиглүүлнэ, эсвэл standalone editor */
export default function OnooldtPage() {
  return (
    <div className="page-enter min-h-[100svh] bg-[var(--land-paper)] text-[var(--land-ink)]">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <TransitionLink
          href="/"
          className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] uppercase"
        >
          Сутай Буянт
        </TransitionLink>
        <div className="flex items-center gap-4 text-sm">
          <TransitionLink
            href="/admin/bokh"
            className="text-[var(--land-muted)] transition hover:text-[var(--land-ink)]"
          >
            Admin
          </TransitionLink>
          <TransitionLink
            href="/bokh"
            className="text-[var(--land-muted)] transition hover:text-[var(--land-ink)]"
          >
            ← Бөх
          </TransitionLink>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 pb-20 md:px-12">
        <p className="mb-6 text-sm text-[var(--land-muted)]">
          Оноолт засахыг{" "}
          <TransitionLink
            href="/admin/bokh"
            className="text-[var(--land-forest)] underline"
          >
            Admin → Бөх
          </TransitionLink>{" "}
          дээр хийнэ үү.
        </p>
        <BracketEditor />
      </div>
    </div>
  );
}
