"use client";

import { useEffect, useState } from "react";
import TransitionLink from "@/components/TransitionLink";
import BracketCarousel from "@/components/BracketCarousel";
import { Bracket } from "@/types";

export default function BokhBracketPage() {
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/brackets")
      .then((r) => r.json())
      .then((list) => {
        if (!Array.isArray(list) || list.length === 0) {
          setBracket(null);
          return;
        }
        const latest =
          list.find((b: Bracket) => b.status === "active") ?? list[0];
        return fetch(`/api/brackets/${latest._id}`).then((r) => r.json());
      })
      .then((full) => {
        if (full?._id) setBracket(full);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter min-h-[100svh] bg-white text-[var(--land-ink)]">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <TransitionLink
          href="/"
          className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] uppercase"
        >
          Сутай Буянт
        </TransitionLink>
        <TransitionLink
          href="/bokh"
          className="text-sm text-[var(--land-muted)] transition hover:text-[var(--land-ink)]"
        >
          ← Бөх
        </TransitionLink>
      </header>

      <div className="mx-auto max-w-6xl px-6 pb-8 text-center md:px-12">
        <p className="page-enter-delay-1 text-xs tracking-[0.35em] text-[var(--land-gold)] uppercase">
          30 жилийн ой
        </p>
        <h1 className="page-enter-delay-1 mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-wide uppercase md:text-6xl">
          Оноолт
        </h1>
        {bracket && (
          <p className="page-enter-delay-1 mt-2 text-[var(--land-muted)]">
            {bracket.name}
          </p>
        )}
      </div>

      <section className="page-enter-delay-2 pb-20">
        {loading ? (
          <p className="px-6 text-center text-[var(--land-muted)] md:px-12">
            Ачаалж байна...
          </p>
        ) : !bracket ? (
          <p className="mx-6 border border-dashed border-[var(--land-ink)]/20 p-10 text-center text-[var(--land-muted)] md:mx-12">
            Bracket хараахан үүсээгүй байна.
          </p>
        ) : (
          <BracketCarousel bracket={bracket} />
        )}
      </section>
    </div>
  );
}
