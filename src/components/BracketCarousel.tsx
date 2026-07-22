"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Bracket, Match, Wrestler } from "@/types";
import { ROUND_NAMES, TOTAL_ROUNDS } from "@/lib/constants";
import {
  getMatchesForRound,
  isRoundPaired,
  getBracketPhase,
} from "@/lib/bracket-logic";

interface Props {
  bracket: Bracket;
}

function FighterSide({
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
    <div className="relative flex min-h-[200px] flex-1 flex-col items-center justify-end overflow-hidden md:min-h-[180px] lg:min-h-[200px]">
      {wrestler ? (
        <>
          <div className="absolute inset-0 flex items-end justify-center pb-10 md:pb-12">
            <div className="relative h-[85%] w-[90%] max-w-[180px] md:max-w-[150px]">
              <Image
                src={wrestler.image}
                alt={wrestler.name}
                fill
                className={`object-contain object-bottom drop-shadow-md ${side === "right" ? "scale-x-[-1]" : ""
                  } ${dimmed ? "opacity-45 grayscale" : "opacity-100"}`}
                sizes="(max-width: 768px) 40vw, 15vw"
                unoptimized
              />
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-white/80 via-white/50 to-transparent" />
          <div className="relative z-10 w-full px-2 pb-3 text-center md:px-2 md:pb-3">
            <p className="truncate font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide text-[var(--land-ink)] uppercase md:text-base lg:text-lg">
              {wrestler.name}
            </p>
            <p className="mt-0.5 truncate text-[10px] tracking-[0.12em] text-[var(--land-gold)] uppercase md:text-[11px]">
              {wrestler.title}
            </p>
            {isWinner && (
              <p className="mt-1 text-[9px] tracking-[0.2em] text-emerald-700 uppercase">
                Ялагч
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="relative z-10 flex flex-1 items-center justify-center p-4 text-xs text-[var(--land-muted)]">
          Хүлээгдэж байна...
        </div>
      )}
    </div>
  );
}

function FlagVideoBg() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.muted = true;
      video.playsInline = true;
      void video.play().catch(() => { });
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!video.src) {
            video.src = "/mongolia-flag.mp4";
            video.load();
          }
          tryPlay();
        } else {
          video.pause();
        }
      },
      { rootMargin: "120px", threshold: 0.05 }
    );

    io.observe(video);
    video.addEventListener("loadeddata", tryPlay);
    return () => {
      io.disconnect();
      video.removeEventListener("loadeddata", tryPlay);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover"
      muted
      loop
      playsInline
      preload="none"
      poster="/dalbaa.jpeg"
      aria-hidden
    />
  );
}

function MatchSlide({ match }: { match: Match }) {
  const w1 = match.wrestler1;
  const w2 = match.wrestler2;
  const winnerId = match.winner?._id;
  const isDone = match.status === "completed";

  return (
    <article className="relative w-full shrink-0 snap-start overflow-hidden border border-[var(--land-ink)]/10 bg-white md:w-auto md:shrink md:snap-align-none">
      <div className="absolute inset-0 overflow-hidden">
        <FlagVideoBg />
        <div className="absolute inset-0 bg-white/5" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex flex-col items-center gap-2 md:top-3">
        <p className="text-xs tracking-[0.35em] text-[var(--land-muted)] uppercase md:text-[11px]">
          Барилдаан #{match.position + 1}
        </p>
      </div>

      <div className="relative z-10 flex flex-row">
        <FighterSide
          wrestler={w1}
          isWinner={!!(w1 && winnerId === w1._id)}
          dimmed={!!(isDone && w1 && winnerId !== w1._id)}
          side="left"
        />

        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center">
          <span className="vs-mark text-4xl text-[var(--land-gold-bright)] md:text-3xl lg:text-4xl">
            VS
          </span>
        </div>

        <FighterSide
          wrestler={w2}
          isWinner={!!(w2 && winnerId === w2._id)}
          dimmed={!!(isDone && w2 && winnerId !== w2._id)}
          side="right"
        />
      </div>
    </article>
  );
}

export default function BracketCarousel({ bracket }: Props) {
  const phase = getBracketPhase(bracket);
  const defaultRound =
    phase.mode === "play" || phase.mode === "setup"
      ? phase.round
      : TOTAL_ROUNDS;

  const [activeRound, setActiveRound] = useState(defaultRound);
  const [search, setSearch] = useState("");
  const matchTrackRef = useRef<HTMLDivElement>(null);

  const rounds = Array.from({ length: TOTAL_ROUNDS }, (_, i) => i + 1).filter(
    (round) => isRoundPaired(getMatchesForRound(bracket, round))
  );

  const query = search.trim().toLowerCase();

  const matchHasName = (match: Match) => {
    if (!query) return true;
    const names = [
      match.wrestler1?.name,
      match.wrestler2?.name,
      match.wrestler1?.title,
      match.wrestler2?.title,
    ]
      .filter(Boolean)
      .map((s) => s!.toLowerCase());
    return names.some((n) => n.includes(query));
  };

  useEffect(() => {
    if (rounds.length === 0) return;
    if (!rounds.includes(activeRound)) {
      setActiveRound(rounds[rounds.length - 1]);
    }
  }, [rounds, activeRound]);

  useEffect(() => {
    if (!query || rounds.length === 0) return;
    const hit = rounds.find((round) =>
      getMatchesForRound(bracket, round).some(matchHasName)
    );
    if (hit && hit !== activeRound) {
      setActiveRound(hit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    const el = matchTrackRef.current;
    if (!el) return;
    el.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [activeRound, query]);

  if (rounds.length === 0) {
    return (
      <p className="border border-dashed border-[var(--land-ink)]/20 p-10 text-center text-[var(--land-muted)]">
        Барилдаан хараахан оноогдоогүй байна.
      </p>
    );
  }

  const matches = getMatchesForRound(bracket, activeRound).filter(matchHasName);

  return (
    <div className="w-full">
      <div className="sticky top-0 z-30 border-b border-[var(--land-ink)]/10 bg-white/95 px-4 py-3 backdrop-blur-sm md:static md:mb-6 md:border-0 md:bg-transparent md:px-8 md:py-0 md:backdrop-blur-none">
        <div className="mx-auto max-w-md">
          <label className="sr-only" htmlFor="wrestler-search">
            Бөх хайх
          </label>
          <input
            id="wrestler-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Бөхийн нэрээр хайх..."
            className="w-full border border-[var(--land-ink)]/15 bg-white px-4 py-3 text-sm outline-none placeholder:text-[var(--land-muted)] focus:border-[var(--land-gold)]"
          />
          {query && (
            <p className="mt-2 text-center text-xs text-[var(--land-muted)]">
              {matches.length > 0
                ? `${matches.length} барилдаан олдлоо`
                : "Тохирох бөх олдсонгүй"}
            </p>
          )}
        </div>
      </div>

      <div className="mb-8 px-2 pt-6 text-center md:pt-0">
        <p className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-wide text-[var(--land-ink)] uppercase md:text-3xl">
          {ROUND_NAMES[activeRound]}
        </p>
        <p className="mt-1 text-sm text-[var(--land-muted)]">
          {getMatchesForRound(bracket, activeRound).filter(
            (m) => m.status === "completed"
          ).length}
          /{getMatchesForRound(bracket, activeRound).length} барилдаан дууссан
          {query ? ` · хайлт: ${matches.length}` : ""}
        </p>
      </div>

      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {rounds.map((round) => (
          <button
            key={round}
            type="button"
            onClick={() => setActiveRound(round)}
            className={`min-w-8 border px-2.5 py-1 text-sm font-medium transition ${round === activeRound
                ? "border-[var(--land-gold)] bg-[var(--land-gold)]/15 text-[var(--land-ink)]"
                : "border-[var(--land-ink)]/15 text-[var(--land-muted)] hover:border-[var(--land-gold)] hover:text-[var(--land-ink)]"
              }`}
            aria-label={ROUND_NAMES[round]}
          >
            {round}
          </button>
        ))}
      </div>

      <div
        ref={matchTrackRef}
        className="flex flex-col gap-4 px-4 pb-4 snap-y snap-mandatory scrollbar-thin md:grid md:max-h-none md:grid-cols-2 md:gap-4 md:overflow-visible md:snap-none lg:grid-cols-3 xl:grid-cols-4 md:px-8"
        style={{ scrollBehavior: "smooth" }}
      >
        {matches.length === 0 ? (
          <p className="w-full py-10 text-center text-[var(--land-muted)]">
            Хайлтад тохирох барилдаан байхгүй
          </p>
        ) : (
          matches.map((match) => (
            <MatchSlide key={match._id} match={match} />
          ))
        )}
      </div>

      {bracket.champion && activeRound === TOTAL_ROUNDS && !query && (
        <div className="mx-auto mt-10 max-w-md border-2 border-[var(--land-gold)] bg-white p-8 text-center">
          <p className="text-sm tracking-[0.25em] text-[var(--land-gold)] uppercase">
            Аварга
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--land-ink)] uppercase">
            {bracket.champion.name}
          </p>
          <p className="text-[var(--land-muted)]">{bracket.champion.title}</p>
        </div>
      )}
    </div>
  );
}
