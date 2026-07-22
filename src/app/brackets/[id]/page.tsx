"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import RoundSetup from "@/components/RoundSetup";
import RoundMatches from "@/components/RoundMatches";
import WinnersList from "@/components/WinnersList";
import { Bracket, Wrestler } from "@/types";
import {
  getBracketPhase,
  getMatchesForRound,
  getRoundWinners,
} from "@/lib/bracket-logic";

export default function BracketDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadBracket = useCallback(async () => {
    const res = await fetch(`/api/brackets/${id}`);
    const data = await res.json();
    setBracket(data);
  }, [id]);

  useEffect(() => {
    Promise.all([
      fetch(`/api/brackets/${id}`).then((r) => r.json()),
      fetch("/api/wrestlers").then((r) => r.json()),
    ])
      .then(([bracketData, wrestlersData]) => {
        setBracket(bracketData);
        setWrestlers(wrestlersData);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const phase = useMemo(
    () => (bracket?._id ? getBracketPhase(bracket) : null),
    [bracket]
  );

  const setupWrestlers = useMemo((): Wrestler[] => {
    if (!bracket || !phase || phase.mode !== "setup") return [];
    if (phase.round === 1) return wrestlers;
    const prevMatches = getMatchesForRound(bracket, phase.round - 1);
    return getRoundWinners(prevMatches);
  }, [bracket, phase, wrestlers]);

  const handleSetRound = async (
    pairings: Array<{
      position: number;
      wrestler1Id: string;
      wrestler2Id: string;
    }>
  ) => {
    if (!phase || phase.mode !== "setup") return;

    setSaving(true);
    try {
      const res = await fetch(`/api/brackets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_round",
          round: phase.round,
          pairings,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error);
        return;
      }

      const data = await res.json();
      setBracket(data);
    } catch {
      alert("Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  const handleSetWinner = async (matchId: string, winnerId: string) => {
    try {
      const res = await fetch(`/api/brackets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_winner",
          matchId,
          winnerId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error);
        return;
      }

      const data = await res.json();
      setBracket(data);
    } catch {
      alert("Ялагч тэмдэглэхэд алдаа гарлаа");
    }
  };

  if (loading) {
    return <p className="text-[var(--muted)]">Ачаалж байна...</p>;
  }

  if (!bracket || !bracket._id || !phase) {
    return <p className="text-red-400">Bracket олдсонгүй</p>;
  }

  const statusLabel =
    bracket.status === "draft"
      ? "Ноорог"
      : bracket.status === "active"
        ? "Явагдаж байна"
        : "Дууссан";

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{bracket.name}</h2>
          <span
            className={`mt-1 inline-block rounded px-2 py-0.5 text-xs ${
              bracket.status === "completed"
                ? "bg-[var(--success)]/20 text-[var(--success)]"
                : bracket.status === "active"
                  ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                  : "bg-gray-500/20 text-[var(--muted)]"
            }`}
          >
            {statusLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={loadBracket}
          className="rounded border border-[var(--card-border)] px-3 py-1 text-sm hover:border-[var(--accent)]"
        >
          Шинэчлэх
        </button>
      </div>

      {phase.mode === "setup" && (
        <>
          {phase.round === 1 && wrestlers.length < 64 && (
            <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm">
              64 бөх шаардлагатай. Одоо {wrestlers.length} бөх байна. Нүүр
              хуудас дээр &quot;64 тест бөх үүсгэх&quot; дарна уу.
            </div>
          )}

          {phase.round > 1 && (
            <WinnersList round={phase.round - 1} winners={setupWrestlers} />
          )}

          <RoundSetup
            round={phase.round}
            wrestlers={setupWrestlers}
            onSubmit={handleSetRound}
            loading={saving}
          />
        </>
      )}

      {phase.mode === "play" && (
        <RoundMatches
          round={phase.round}
          matches={getMatchesForRound(bracket, phase.round)}
          onSetWinner={handleSetWinner}
        />
      )}

      {phase.mode === "completed" && bracket.champion && (
        <div className="flex flex-col items-center gap-6">
          <div className="rounded-xl border-2 border-[var(--accent)] bg-[var(--card)] p-8 text-center">
            <p className="mb-2 text-sm text-[var(--muted)]">🏆 АВАРГА</p>
            <p className="text-3xl font-bold text-[var(--accent)]">
              {bracket.champion.name}
            </p>
            <p className="text-xl">{bracket.champion.title}</p>
            {bracket.champion.province && (
              <p className="mt-1 text-[var(--muted)]">
                {bracket.champion.province}
              </p>
            )}
          </div>

          {[6, 5, 4, 3, 2, 1].map((round) => {
            const winners = getRoundWinners(getMatchesForRound(bracket, round));
            if (winners.length === 0) return null;
            return <WinnersList key={round} round={round} winners={winners} />;
          })}
        </div>
      )}
    </div>
  );
}
