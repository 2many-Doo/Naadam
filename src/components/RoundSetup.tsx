"use client";

import { useEffect, useState } from "react";
import WrestlerCard from "./WrestlerCard";
import { Wrestler } from "@/types";
import { ROUND_NAMES, ROUND_MATCH_COUNTS } from "@/lib/constants";

interface Pairing {
  position: number;
  wrestler1Id: string | null;
  wrestler2Id: string | null;
}

interface Props {
  round: number;
  wrestlers: Wrestler[];
  onSubmit: (
    pairings: Array<{
      position: number;
      wrestler1Id: string;
      wrestler2Id: string;
    }>
  ) => Promise<void>;
  loading?: boolean;
}

export default function RoundSetup({
  round,
  wrestlers,
  onSubmit,
  loading,
}: Props) {
  const matchCount = ROUND_MATCH_COUNTS[round];

  const [pairings, setPairings] = useState<Pairing[]>(() =>
    Array.from({ length: matchCount }, (_, i) => ({
      position: i,
      wrestler1Id: null,
      wrestler2Id: null,
    }))
  );
  const [activeSlot, setActiveSlot] = useState<{
    position: number;
    slot: 1 | 2;
  } | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setPairings(
      Array.from({ length: matchCount }, (_, i) => ({
        position: i,
        wrestler1Id: null,
        wrestler2Id: null,
      }))
    );
    setActiveSlot(null);
    setError("");
  }, [round, matchCount, wrestlers]);

  const usedIds = new Set(
    pairings.flatMap((p) =>
      [p.wrestler1Id, p.wrestler2Id].filter(Boolean) as string[]
    )
  );

  const availableWrestlers = wrestlers.filter((w) => {
    if (usedIds.has(w._id)) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      w.name.toLowerCase().includes(q) ||
      w.title.toLowerCase().includes(q) ||
      (w.province?.toLowerCase().includes(q) ?? false)
    );
  });

  const selectWrestler = (wrestlerId: string) => {
    if (!activeSlot) return;

    setPairings((prev) =>
      prev.map((p) => {
        if (p.position !== activeSlot.position) return p;
        if (activeSlot.slot === 1) {
          return { ...p, wrestler1Id: wrestlerId };
        }
        return { ...p, wrestler2Id: wrestlerId };
      })
    );
    setActiveSlot(null);
  };

  const removeWrestler = (position: number, slot: 1 | 2) => {
    setPairings((prev) =>
      prev.map((p) => {
        if (p.position !== position) return p;
        if (slot === 1) return { ...p, wrestler1Id: null };
        return { ...p, wrestler2Id: null };
      })
    );

    if (activeSlot?.position === position && activeSlot?.slot === slot) {
      setActiveSlot(null);
    }
  };

  const getWrestler = (id: string | null) =>
    wrestlers.find((w) => w._id === id) ?? null;

  const filledCount = pairings.filter(
    (p) => p.wrestler1Id && p.wrestler2Id
  ).length;

  const handleSubmit = async () => {
    setError("");
    const incomplete = pairings.some((p) => !p.wrestler1Id || !p.wrestler2Id);
    if (incomplete) {
      setError(`Бүх ${matchCount} барилдааныг бөглөнө үү`);
      return;
    }

    await onSubmit(
      pairings.map((p) => ({
        position: p.position,
        wrestler1Id: p.wrestler1Id!,
        wrestler2Id: p.wrestler2Id!,
      }))
    );
  };

  const autoFill = () => {
    if (wrestlers.length < matchCount * 2) return;
    const shuffled = [...wrestlers].sort(() => Math.random() - 0.5);
    const newPairings: Pairing[] = [];
    for (let i = 0; i < matchCount; i++) {
      newPairings.push({
        position: i,
        wrestler1Id: shuffled[i * 2]._id,
        wrestler2Id: shuffled[i * 2 + 1]._id,
      });
    }
    setPairings(newPairings);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {ROUND_NAMES[round]} — Барилдаан тааруулах ({filledCount}/{matchCount})
          </h2>
          <button
            type="button"
            onClick={autoFill}
            className="rounded border border-[var(--land-ink)]/15 px-3 py-1 text-sm text-[var(--land-muted)] transition hover:border-[var(--land-gold)] hover:text-[var(--land-ink)]"
          >
            Санамсаргүй
          </button>
        </div>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-2">
          {pairings.map((pairing) => (
            <div
              key={pairing.position}
              className="border border-[var(--land-ink)]/10 bg-white p-3"
            >
              <p className="mb-2 text-xs text-[var(--land-muted)]">
                Барилдаан #{pairing.position + 1}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((slot) => {
                  const id =
                    slot === 1 ? pairing.wrestler1Id : pairing.wrestler2Id;
                  const wrestler = getWrestler(id);
                  const isActive =
                    activeSlot?.position === pairing.position &&
                    activeSlot?.slot === slot;

                  return wrestler ? (
                    <WrestlerCard
                      key={slot}
                      wrestler={wrestler}
                      selected={isActive}
                      onClick={() =>
                        setActiveSlot({
                          position: pairing.position,
                          slot: slot as 1 | 2,
                        })
                      }
                      onRemove={() =>
                        removeWrestler(pairing.position, slot as 1 | 2)
                      }
                      compact
                    />
                  ) : (
                    <button
                      key={slot}
                      type="button"
                      onClick={() =>
                        setActiveSlot({
                          position: pairing.position,
                          slot: slot as 1 | 2,
                        })
                      }
                      className={`flex h-14 items-center justify-center border border-dashed text-sm transition ${
                        isActive
                          ? "border-[var(--land-gold)] text-[var(--land-gold)]"
                          : "border-[var(--land-ink)]/20 text-[var(--land-muted)] hover:border-[var(--land-gold)]"
                      }`}
                    >
                      + Бөх сонгох
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || filledCount < matchCount}
          className="mt-4 w-full bg-[var(--land-forest)] py-3 font-semibold text-white transition hover:bg-[var(--land-ink)] disabled:opacity-50"
        >
          {loading
            ? "Хадгалж байна..."
            : `${ROUND_NAMES[round]} эхлүүлэх`}
        </button>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          {round === 1
            ? `Боломжит бөхүүд (${availableWrestlers.length})`
            : `Давсан бөхүүд — оноох (${availableWrestlers.length})`}
        </h2>
        {activeSlot ? (
          <p className="mb-3 text-sm text-[var(--land-gold)]">
            Барилдаан #{activeSlot.position + 1} - Бөх {activeSlot.slot} сонгоно уу
          </p>
        ) : (
          <p className="mb-3 text-sm text-[var(--land-muted)]">
            Зүүн талын &quot;+ Бөх сонгох&quot; дээр дарж бөх сонгоно
          </p>
        )}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Нэрээр хайх..."
          className="mb-3 w-full border border-[var(--land-ink)]/15 bg-white px-3 py-2 text-sm outline-none focus:border-[var(--land-gold)]"
        />
        <div className="grid max-h-[70vh] gap-2 overflow-y-auto sm:grid-cols-2">
          {availableWrestlers.length === 0 ? (
            <p className="col-span-full text-sm text-[var(--land-muted)]">
              Тохирох бөх олдсонгүй
            </p>
          ) : (
            availableWrestlers.map((w) => (
              <WrestlerCard
                key={w._id}
                wrestler={w}
                onClick={() => selectWrestler(w._id)}
                compact
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
