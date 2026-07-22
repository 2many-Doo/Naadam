"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RoundSetup from "@/components/RoundSetup";
import RoundMatches from "@/components/RoundMatches";
import WinnersList from "@/components/WinnersList";
import { Bracket, Wrestler } from "@/types";
import {
  getBracketPhase,
  getMatchesForRound,
  getRoundWinners,
} from "@/lib/bracket-logic";
import { ROUND_NAMES } from "@/lib/constants";

interface Props {
  /** Хэрэв өгөгдсөн бол шууд энэ оноолтыг ачаална */
  initialBracketId?: string | null;
  /** Засахаа болиод жагсаалт руу буцах */
  onClose?: () => void;
  /** Шинэ үүсгэх горимоор эхлэх */
  startInCreate?: boolean;
}

export default function BracketEditor({
  initialBracketId,
  onClose,
  startInCreate = false,
}: Props) {
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("Сутай Буянт — 30 жилийн ой");
  const [showCreate, setShowCreate] = useState(startInCreate);
  const [nextRoundStarted, setNextRoundStarted] = useState(false);

  const loadList = useCallback(async () => {
    const [bracketsRes, wrestlersRes] = await Promise.all([
      fetch("/api/brackets"),
      fetch("/api/wrestlers"),
    ]);
    const bracketsData = await bracketsRes.json();
    const wrestlersData = await wrestlersRes.json();
    const list = Array.isArray(bracketsData) ? bracketsData : [];
    setBrackets(list);
    setWrestlers(Array.isArray(wrestlersData) ? wrestlersData : []);
    return list as Bracket[];
  }, []);

  const loadBracket = useCallback(async (id: string) => {
    const res = await fetch(`/api/brackets/${id}`);
    const data = await res.json();
    if (data?._id) {
      setBracket(data);
      setShowCreate(false);
    }
  }, []);

  useEffect(() => {
    loadList()
      .then(async (list) => {
        if (startInCreate) {
          setShowCreate(true);
          return;
        }
        const targetId =
          initialBracketId ??
          list.find((b) => b.status === "draft")?._id ??
          list.find((b) => b.status === "active")?._id ??
          list[0]?._id;
        if (targetId) {
          await loadBracket(targetId);
        } else {
          setShowCreate(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [loadList, loadBracket, initialBracketId, startInCreate]);

  const phase = useMemo(
    () => (bracket?._id ? getBracketPhase(bracket) : null),
    [bracket]
  );

  useEffect(() => {
    setNextRoundStarted(false);
  }, [
    bracket?._id,
    phase?.mode,
    phase && "round" in phase ? phase.round : null,
  ]);

  const setupWrestlers = useMemo((): Wrestler[] => {
    if (!bracket || !phase || phase.mode !== "setup") return [];
    if (phase.round === 1) return wrestlers;
    const prevMatches = getMatchesForRound(bracket, phase.round - 1);
    return getRoundWinners(prevMatches);
  }, [bracket, phase, wrestlers]);

  const awaitingNextRound =
    phase?.mode === "setup" && phase.round > 1 && !nextRoundStarted;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/brackets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error);
        return;
      }
      const created = await res.json();
      await loadList();
      await loadBracket(created._id);
      setShowCreate(false);
    } catch {
      alert("Оноолт үүсгэхэд алдаа гарлаа");
    } finally {
      setCreating(false);
    }
  };

  const handleSetRound = async (
    pairings: Array<{
      position: number;
      wrestler1Id: string;
      wrestler2Id: string;
    }>
  ) => {
    if (!bracket || !phase || phase.mode !== "setup") return;
    setSaving(true);
    try {
      const res = await fetch(`/api/brackets/${bracket._id}`, {
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
    if (!bracket) return;
    try {
      const res = await fetch(`/api/brackets/${bracket._id}`, {
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

  const statusLabel =
    bracket?.status === "draft"
      ? "Ноорог"
      : bracket?.status === "active"
        ? "Явагдаж байна"
        : bracket?.status === "completed"
          ? "Дууссан"
          : "";

  if (loading) {
    return <p className="text-[var(--land-muted)]">Ачаалж байна...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            {showCreate || !bracket ? "Оноолт үүсгэх" : "Оноолт засах"}
          </h2>
          {bracket && !showCreate && (
            <p className="mt-1 text-sm text-[var(--land-muted)]">
              {bracket.name}
              {statusLabel ? ` · ${statusLabel}` : ""}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="border border-[var(--land-ink)]/15 px-4 py-2 text-sm text-[var(--land-muted)] transition hover:border-[var(--land-gold)] hover:text-[var(--land-ink)]"
            >
              ← Буцах
            </button>
          )}
          {!showCreate && (
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="border border-[var(--land-forest)] px-4 py-2 text-sm text-[var(--land-forest)] transition hover:bg-[var(--land-forest)] hover:text-white"
            >
              + Шинэ оноолт
            </button>
          )}
          {showCreate && bracket && (
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="border border-[var(--land-ink)]/15 px-4 py-2 text-sm text-[var(--land-muted)]"
            >
              Буцах
            </button>
          )}
        </div>
      </div>

      {showCreate || !bracket ? (
        <form
          onSubmit={handleCreate}
          className="max-w-lg border border-[var(--land-ink)]/10 bg-white p-6"
        >
          <label className="mb-2 block text-sm text-[var(--land-muted)]">
            Оноолтын нэр
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Жишээ: Сутай Буянт 30 жилийн ой"
            className="mb-4 w-full border border-[var(--land-ink)]/15 bg-white px-4 py-3 outline-none focus:border-[var(--land-gold)]"
          />
          {wrestlers.length < 64 && (
            <p className="mb-4 text-sm text-amber-700">
              Анхаар: одоо {wrestlers.length} бөх байна. 64 бөх байх шаардлагатай.
            </p>
          )}
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="w-full bg-[var(--land-forest)] py-3 text-sm font-medium tracking-wide text-white transition hover:bg-[var(--land-ink)] disabled:opacity-50"
          >
            {creating ? "Үүсгэж байна..." : "Оноолт үүсгээд эхлүүлэх"}
          </button>
        </form>
      ) : (
        <>
          {brackets.length > 1 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {brackets.map((b) => (
                <button
                  key={b._id}
                  type="button"
                  onClick={() => loadBracket(b._id)}
                  className={`border px-3 py-1.5 text-xs transition ${bracket._id === b._id
                    ? "border-[var(--land-gold)] bg-[var(--land-gold)]/10 text-[var(--land-ink)]"
                    : "border-[var(--land-ink)]/15 text-[var(--land-muted)] hover:border-[var(--land-gold)]"
                    }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}

          {awaitingNextRound && phase.mode === "setup" && (
            <div className="space-y-8">
              <div className="border border-[var(--land-ink)]/10 bg-white p-8 text-center">
                <p className="text-xs tracking-[0.2em] text-[var(--land-gold)] uppercase">
                  Даваа дууссан
                </p>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold">
                  {ROUND_NAMES[phase.round - 1]} дууслаа
                </h3>
                <p className="mt-2 text-sm text-[var(--land-muted)]">
                  Давсан {setupWrestlers.length} бөхтэй{" "}
                  {ROUND_NAMES[phase.round]}-г эхлүүлнэ.
                </p>
                <button
                  type="button"
                  onClick={() => setNextRoundStarted(true)}
                  className="mt-6 bg-[var(--land-forest)] px-8 py-3 text-sm font-medium tracking-wide text-white transition hover:bg-[var(--land-ink)]"
                >
                  {ROUND_NAMES[phase.round]}-г эхлүүлэх
                </button>
              </div>
              <RoundMatches
                round={phase.round - 1}
                matches={getMatchesForRound(bracket, phase.round - 1)}
              />
            </div>
          )}

          {phase?.mode === "setup" &&
            (phase.round === 1 || nextRoundStarted) && (
              <>
                {phase.round === 1 && wrestlers.length < 64 && (
                  <div className="mb-6 border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-800">
                    64 бөх шаардлагатай. Одоо {wrestlers.length} бөх байна.
                  </div>
                )}
                {phase.round > 1 && (
                  <WinnersList
                    round={phase.round - 1}
                    winners={setupWrestlers}
                  />
                )}
                <RoundSetup
                  round={phase.round}
                  wrestlers={setupWrestlers}
                  onSubmit={handleSetRound}
                  loading={saving}
                />
              </>
            )}

          {phase?.mode === "play" && (
            <RoundMatches
              round={phase.round}
              matches={getMatchesForRound(bracket, phase.round)}
              onSetWinner={handleSetWinner}
            />
          )}

          {phase?.mode === "completed" && bracket.champion && (
            <div className="flex flex-col items-start gap-6">
              <div className="border-2 border-[var(--land-gold)] bg-white p-8 text-center">
                <p className="mb-2 text-sm tracking-[0.2em] text-[var(--land-gold)] uppercase">
                  Аварга
                </p>
                <p className="font-[family-name:var(--font-display)] text-3xl font-semibold">
                  {bracket.champion.name}
                </p>
                <p className="text-lg text-[var(--land-muted)]">
                  {bracket.champion.title}
                </p>
              </div>
              <Link
                href="/bokh/bracket"
                className="bg-[var(--land-forest)] px-6 py-3 text-sm font-medium text-white"
              >
                Оноолт харах →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
