"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import WrestlerCarousel from "@/components/WrestlerCarousel";
import TransitionLink from "@/components/TransitionLink";
import { Bracket, Wrestler } from "@/types";

export default function BokhPage() {
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bracketsRes, wrestlersRes] = await Promise.all([
        fetch("/api/brackets"),
        fetch("/api/wrestlers"),
      ]);
      const bracketsData = await bracketsRes.json();
      const wrestlersData = await wrestlersRes.json();
      setBrackets(Array.isArray(bracketsData) ? bracketsData : []);
      setWrestlers(Array.isArray(wrestlersData) ? wrestlersData : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const latestBracket =
    brackets.find((b) => b.status === "active") ?? brackets[0] ?? null;

  const statusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "Ноорог";
      case "active":
        return "Явагдаж байна";
      case "completed":
        return "Дууссан";
      default:
        return status;
    }
  };

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
            Үндэсний бөхийн барилдаан
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-[var(--land-muted)]">
            Сутай Буянт - 30 жилийн ойн хүчит 64 бөхийн барилдаан .
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {loading ? (
              <span className="px-6 py-3 text-sm text-[var(--land-muted)]">
                Ачаалж байна...
              </span>
            ) : latestBracket ? (
              <TransitionLink
                href="/bokh/bracket"
                className="bg-[var(--land-forest)] px-6 py-3 text-sm font-medium tracking-wide text-[var(--land-paper)] transition hover:bg-[var(--land-ink)]"
              >
                Оноолт харах
              </TransitionLink>
            ) : (
              <p className="border-l-2 border-[var(--land-gold)] pl-4 text-sm text-[var(--land-muted)]">
                Оноолт хараахан үүсээгүй байна.
              </p>
            )}
          </div>

          <p className="mt-6 text-sm text-[var(--land-muted)]">
            {loading
              ? "Ачаалж байна..."
              : latestBracket
                ? `${latestBracket.name} · ${statusLabel(latestBracket.status)} · ${wrestlers.length} бөх`
                : `${wrestlers.length} бөх`}
          </p>
        </div>

        <div className="page-enter-delay-2 relative aspect-[4/5] overflow-hidden md:aspect-[3/4]">
          <Image
            src="https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&w=1200&q=80"
            alt="Монгол бөх"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </div>

      <section className="page-enter-delay-2 pb-16">
        <p className="mb-2 px-6 text-center font-[family-name:var(--font-display)] text-sm tracking-[0.25em] text-[var(--land-gold)] uppercase md:px-12">
          Оролцогч бөхчүүд
        </p>
        <WrestlerCarousel wrestlers={wrestlers} />
      </section>
    </div>
  );
}
