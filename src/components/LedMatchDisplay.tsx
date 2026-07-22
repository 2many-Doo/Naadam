"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bracket, Match, Wrestler } from "@/types";
import { ROUND_NAMES, TOTAL_ROUNDS } from "@/lib/constants";
import {
  getBracketPhase,
  getMatchesForRound,
  isRoundPaired,
} from "@/lib/bracket-logic";

const DEFAULT_SLIDE_MS = 8000;
const POLL_MS = 15000;

interface Props {
  slideMs?: number;
}

function useActiveBracket(pollMs: number) {
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const listRes = await fetch("/api/brackets", { cache: "no-store" });
      const list = await listRes.json();
      if (!Array.isArray(list) || list.length === 0) {
        setBracket(null);
        return;
      }
      const latest =
        list.find((b: Bracket) => b.status === "active") ?? list[0];
      const fullRes = await fetch(`/api/brackets/${latest._id}`, {
        cache: "no-store",
      });
      const full = await fullRes.json();
      if (full?._id) setBracket(full);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), pollMs);
    return () => window.clearInterval(id);
  }, [load, pollMs]);

  return { bracket, loading };
}

function LedFighter({
  wrestler,
  isWinner,
  dimmed,
  side,
}: {
  wrestler: Wrestler | null;
  isWinner: boolean;
  dimmed: boolean;
  side: "left" | "right";
}) {
  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col items-center justify-end overflow-hidden">
      {wrestler ? (
        <>
          <div className="absolute inset-0 flex items-end justify-center pb-[18%]">
            <div className="relative h-[88%] w-[92%] max-w-[42vw]">
              <Image
                src={wrestler.image}
                alt={wrestler.name}
                fill
                className={`object-contain object-bottom drop-shadow-2xl ${
                  side === "right" ? "scale-x-[-1]" : ""
                } ${dimmed ? "opacity-40 grayscale" : "opacity-100"}`}
                sizes="42vw"
                unoptimized
                priority
              />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-white/80 via-white/45 to-transparent" />
          <div className="relative z-10 w-full px-4 pb-6 text-center sm:pb-8 lg:pb-10">
            <p className="font-[family-name:var(--font-display)] text-[clamp(1.5rem,4.2vw,4.5rem)] leading-tight font-semibold tracking-wide text-[var(--land-ink)] uppercase">
              {wrestler.name}
            </p>
            <p className="mt-2 text-[clamp(0.75rem,1.6vw,1.5rem)] tracking-[0.18em] text-[var(--land-gold)] uppercase">
              {wrestler.title}
            </p>
            {isWinner && (
              <p className="mt-3 text-[clamp(0.7rem,1.2vw,1.1rem)] tracking-[0.28em] text-emerald-700 uppercase">
                Ялагч
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="relative z-10 flex flex-1 items-center justify-center text-[clamp(1rem,2vw,1.5rem)] text-[var(--land-muted)]">
          Хүлээгдэж байна...
        </div>
      )}
    </div>
  );
}

function LedMatchCard({ match }: { match: Match }) {
  const w1 = match.wrestler1;
  const w2 = match.wrestler2;
  const winnerId = match.winner?._id;
  const isDone = match.status === "completed";
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.playsInline = true;
    if (!video.src) {
      video.src = "/mongolia-flag.mp4";
      video.load();
    }
    void video.play().catch(() => {});
  }, [match._id]);

  return (
    <article className="relative flex h-full w-full overflow-hidden bg-white">
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="auto"
          poster="/dalbaa.jpeg"
          aria-hidden
        />
        <div className="absolute inset-0 bg-white/5" />
      </div>

      <div className="relative z-10 flex w-full flex-row">
        <LedFighter
          wrestler={w1}
          isWinner={!!(w1 && winnerId === w1._id)}
          dimmed={!!(isDone && w1 && winnerId !== w1._id)}
          side="left"
        />

        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center">
          <span className="vs-mark text-[clamp(3rem,9vw,8rem)] text-[var(--land-gold-bright)]">
            VS
          </span>
        </div>

        <LedFighter
          wrestler={w2}
          isWinner={!!(w2 && winnerId === w2._id)}
          dimmed={!!(isDone && w2 && winnerId !== w2._id)}
          side="right"
        />
      </div>
    </article>
  );
}

function ChampionSlide({ wrestler }: { wrestler: Wrestler }) {
  return (
    <article className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[var(--land-paper)]" />
      <div className="relative z-10 flex max-w-4xl flex-col items-center px-8 text-center">
        <p className="text-[clamp(0.85rem,1.8vw,1.4rem)] tracking-[0.4em] text-[var(--land-gold)] uppercase">
          Аварга
        </p>
        <div className="relative mt-6 h-[min(48vh,420px)] w-[min(48vh,420px)]">
          <Image
            src={wrestler.image}
            alt={wrestler.name}
            fill
            className="object-contain object-bottom drop-shadow-2xl"
            sizes="40vw"
            unoptimized
            priority
          />
        </div>
        <p className="mt-6 font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,5rem)] font-semibold tracking-wide text-[var(--land-ink)] uppercase">
          {wrestler.name}
        </p>
        <p className="mt-2 text-[clamp(1rem,2vw,1.75rem)] tracking-[0.2em] text-[var(--land-gold)] uppercase">
          {wrestler.title}
        </p>
      </div>
    </article>
  );
}

export default function LedMatchDisplay({
  slideMs = DEFAULT_SLIDE_MS,
}: Props) {
  const { bracket, loading } = useActiveBracket(POLL_MS);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hideCursor, setHideCursor] = useState(false);

  type Slide =
    | { key: string; kind: "match"; match: Match }
    | { key: string; kind: "champion"; champion: Wrestler };

  const { items, activeRound } = useMemo(() => {
    if (!bracket) return { items: [] as Slide[], activeRound: 1 };

    const phase = getBracketPhase(bracket);
    let round =
      phase.mode === "play" || phase.mode === "setup"
        ? phase.round
        : TOTAL_ROUNDS;

    const pairedRounds = Array.from(
      { length: TOTAL_ROUNDS },
      (_, i) => i + 1
    ).filter((r) => isRoundPaired(getMatchesForRound(bracket, r)));

    if (pairedRounds.length > 0 && !pairedRounds.includes(round)) {
      round = pairedRounds[pairedRounds.length - 1];
    }

    const items: Slide[] = getMatchesForRound(bracket, round).map((match) => ({
      key: match._id,
      kind: "match" as const,
      match,
    }));

    if (bracket.champion) {
      items.push({
        key: `champion-${bracket.champion._id}`,
        kind: "champion",
        champion: bracket.champion,
      });
    }

    return { items, activeRound: round };
  }, [bracket]);

  const safeIndex = items.length > 0 ? index % items.length : 0;
  const current = items[safeIndex];

  useEffect(() => {
    setIndex(0);
    setProgress(0);
  }, [bracket?._id, activeRound, items.length]);

  useEffect(() => {
    if (items.length === 0) return;

    const started = performance.now();
    let raf = 0;
    let slideTimer = 0;

    const tick = (now: number) => {
      const elapsed = now - started;
      setProgress(Math.min(1, elapsed / slideMs));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    slideTimer = window.setTimeout(() => {
      setIndex((i) => (i + 1) % items.length);
      setProgress(0);
    }, slideMs);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(slideTimer);
    };
  }, [items.length, safeIndex, slideMs]);

  useEffect(() => {
    let idle: number;
    const onMove = () => {
      setHideCursor(false);
      window.clearTimeout(idle);
      idle = window.setTimeout(() => setHideCursor(true), 2500);
    };
    onMove();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchstart", onMove);
    return () => {
      window.clearTimeout(idle);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onMove);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[100svh] items-center justify-center bg-white text-2xl text-[var(--land-muted)]">
        Ачаалж байна...
      </div>
    );
  }

  if (!bracket || items.length === 0 || !current) {
    return (
      <div className="flex h-[100svh] flex-col items-center justify-center gap-4 bg-white px-8 text-center">
        <p className="font-[family-name:var(--font-display)] text-4xl text-[var(--land-ink)]">
          Сутай Буянт
        </p>
        <p className="text-xl text-[var(--land-muted)]">
          Барилдаан хараахан оноогдоогүй байна.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-[100svh] w-[100vw] flex-col overflow-hidden bg-white text-[var(--land-ink)] ${
        hideCursor ? "cursor-none" : ""
      }`}
    >
      <header className="absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-4 px-6 pt-5 sm:px-10 sm:pt-7">
        <div>
          <p className="text-[clamp(0.7rem,1.2vw,1rem)] tracking-[0.35em] text-[var(--land-gold)] uppercase">
            Сутай Буянт · 30 жилийн ой
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-[clamp(1.25rem,3vw,2.75rem)] font-semibold tracking-wide uppercase">
            {ROUND_NAMES[activeRound]}
          </p>
        </div>
        <div className="text-right">
          {current.kind === "match" && (
            <p className="text-[clamp(0.85rem,1.8vw,1.5rem)] tracking-[0.2em] text-[var(--land-muted)] uppercase">
              Барилдаан #{current.match.position + 1}
            </p>
          )}
          <p className="mt-1 text-[clamp(0.75rem,1.3vw,1.1rem)] text-[var(--land-muted)]">
            {safeIndex + 1} / {items.length}
          </p>
        </div>
      </header>

      <div
        key={current.key}
        className="led-slide relative min-h-0 flex-1 pt-20 sm:pt-24"
      >
        {current.kind === "champion" ? (
          <ChampionSlide wrestler={current.champion} />
        ) : (
          <LedMatchCard match={current.match} />
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 h-1.5 bg-[var(--land-ink)]/10">
        <div
          className="h-full bg-[var(--land-gold)] transition-[width] duration-100 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
