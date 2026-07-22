"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";

export default function SurKharvaaPage() {
  const [count, setCount] = useState(0);
  const [scoredCount, setScoredCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/archers"), fetch("/api/archer-scores")])
      .then(async ([aRes, sRes]) => {
        const aData = await aRes.json();
        const sData = await sRes.json();
        const archers = Array.isArray(aData) ? aData : [];
        const scores = Array.isArray(sData) ? sData : [];
        setCount(archers.length);
        setScoredCount(scores.length);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter min-h-[100svh] bg-[var(--land-paper)] text-[var(--land-ink)]">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <TransitionLink
          href="/"
          className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] uppercase"
        >
          Сутай Буянт
        </TransitionLink>
        <TransitionLink
          href="/#events"
          className="text-sm text-[var(--land-muted)] transition hover:text-[var(--land-ink)]"
        >
          ← Буцах
        </TransitionLink>
      </header>

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-12 md:grid-cols-2 md:items-center md:px-12">
        <div className="page-enter-delay-1">
          <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] text-[var(--land-gold)] uppercase">
            30 жилийн ой
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl font-semibold md:text-6xl">
            Сур харваа
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-[var(--land-muted)]">
            Уламжлалт сур харвааны тэмцээний оролцогчдын жагсаалт, оноо.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {loading ? (
              <span className="px-6 py-3 text-sm text-[var(--land-muted)]">
                Ачаалж байна...
              </span>
            ) : count > 0 ? (
              <TransitionLink
                href="/sur-kharvaa/list"
                className="bg-[var(--land-forest)] px-6 py-3 text-sm font-medium tracking-wide text-[var(--land-paper)] transition hover:bg-[var(--land-ink)]"
              >
                Үзэх
              </TransitionLink>
            ) : (
              <p className="border-l-2 border-[var(--land-gold)] pl-4 text-sm text-[var(--land-muted)]">
                Харваачдын жагсаалт хараахан оруулаагүй байна.
              </p>
            )}
          </div>

          <p className="mt-6 text-sm text-[var(--land-muted)]">
            {loading
              ? "Ачаалж байна..."
              : `${count} харваач · ${scoredCount} харваач харвасан`}
          </p>
        </div>

        <div className="page-enter-delay-2 relative aspect-[4/5] overflow-hidden md:aspect-[3/4]">
          <Image
            src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
            alt="Сур харваа"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </div>
    </div>
  );
}
