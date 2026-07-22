"use client";

import { useMemo, useState } from "react";
import { Archer } from "@/types";

type ArrowState = boolean | null; // null = сонгоогүй

type Props = {
  archers: Archer[];
  onClose: () => void;
  onSaved: () => void;
};

function emptyArrows(): ArrowState[] {
  return [null, null, null];
}

export default function ArcherScoreModal({
  archers,
  onClose,
  onSaved,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [arrows, setArrows] = useState<ArrowState[]>(emptyArrows);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => archers.find((a) => a._id === selectedId) ?? null,
    [archers, selectedId]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return archers;
    return archers.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.surname.toLowerCase().includes(q) ||
        a.team.toLowerCase().includes(q)
    );
  }, [archers, query]);

  const hits = arrows.filter((a) => a === true).length;
  const misses = arrows.filter((a) => a === false).length;
  const allSet = arrows.every((a) => a !== null);

  const setArrow = (index: number, value: boolean) => {
    setArrows((prev) => prev.map((a, i) => (i === index ? value : a)));
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setArrows(emptyArrows());
  };

  const handleSave = async () => {
    if (!selectedId || !allSet) {
      alert("Бүх сумын оносон/оноогүйг тэмдэглэнэ үү");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/archer-scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archerId: selectedId,
          arrows: arrows as boolean[],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Хадгалахад алдаа");
        return;
      }
      onSaved();
      onClose();
    } catch {
      alert("Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--land-ink)]/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-[var(--land-ink)]/10 bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Харваа эхлүүлэх
        </h2>
        <p className="mt-1 text-sm text-[var(--land-muted)]">
          Харваагүй оролцогч сонгоод 3 сумны оносон/оноогүйг тэмдэглэнэ.
        </p>

        {!selected ? (
          <div className="mt-5">
            {archers.length === 0 ? (
              <p className="border border-dashed border-[var(--land-ink)]/20 p-4 text-sm text-[var(--land-muted)]">
                Бүх оролцогч харвасан байна. Шинэ нэр үлдээгүй.
              </p>
            ) : (
              <>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Нэр, овог, баг хайх..."
                  className="w-full border border-[var(--land-ink)]/15 px-3 py-2.5 text-sm outline-none focus:border-[var(--land-gold)]"
                />
                <div className="mt-3 max-h-72 overflow-y-auto border border-[var(--land-ink)]/10">
                  {filtered.length === 0 ? (
                    <p className="p-4 text-sm text-[var(--land-muted)]">
                      Олдсонгүй
                    </p>
                  ) : (
                    filtered.map((a) => (
                      <button
                        key={a._id}
                        type="button"
                        onClick={() => handleSelect(a._id)}
                        className="flex w-full items-center justify-between gap-3 border-b border-[var(--land-ink)]/5 px-4 py-3 text-left text-sm transition hover:bg-[var(--land-paper)]"
                      >
                        <span>
                          <span className="font-medium">
                            {a.name} {a.surname}
                          </span>
                          <span className="mt-0.5 block text-xs text-[var(--land-muted)]">
                            {a.team || "Баггүй"}
                          </span>
                        </span>
                        <span className="text-xs text-[var(--land-gold)]">
                          Сонгох →
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-4 border border-[var(--land-ink)]/15 px-5 py-2.5 text-sm text-[var(--land-muted)]"
            >
              Болих
            </button>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex flex-wrap items-start justify-between gap-2 border border-[var(--land-ink)]/10 bg-[var(--land-paper)] px-4 py-3">
              <div>
                <p className="font-medium">
                  {selected.name} {selected.surname}
                </p>
                <p className="text-xs text-[var(--land-muted)]">
                  {selected.team || "Баггүй"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setArrows(emptyArrows());
                }}
                className="text-xs text-[var(--land-forest)] hover:underline"
              >
                Өөр оролцогч
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {arrows.map((arrow, index) => (
                <div
                  key={index}
                  className="border border-[var(--land-ink)]/10 p-3"
                >
                  <p className="mb-2 text-center text-sm font-medium">
                    Сум {index + 1}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setArrow(index, true)}
                      className={`px-2 py-2 text-xs font-medium transition ${
                        arrow === true
                          ? "bg-[var(--land-forest)] text-white"
                          : "border border-[var(--land-ink)]/15 text-[var(--land-muted)] hover:border-[var(--land-forest)]"
                      }`}
                    >
                      Оносон
                    </button>
                    <button
                      type="button"
                      onClick={() => setArrow(index, false)}
                      className={`px-2 py-2 text-xs font-medium transition ${
                        arrow === false
                          ? "bg-red-700 text-white"
                          : "border border-[var(--land-ink)]/15 text-[var(--land-muted)] hover:border-red-400"
                      }`}
                    >
                      Оноогүй
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-4 text-sm text-[var(--land-muted)]">
              Оносон:{" "}
              <strong className="text-[var(--land-forest)]">{hits}</strong>
              {" · "}
              Оноогүй: <strong className="text-red-700">{misses}</strong>
              {" / 3"}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !allSet}
                className="bg-[var(--land-forest)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--land-ink)] disabled:opacity-50"
              >
                {saving ? "Хадгалж байна..." : "Хадгалах"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="border border-[var(--land-ink)]/15 px-5 py-2.5 text-sm text-[var(--land-muted)]"
              >
                Болих
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
