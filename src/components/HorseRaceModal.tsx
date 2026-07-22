"use client";

import { useMemo, useState } from "react";
import { Horse } from "@/types";

type Props = {
  horses: Horse[];
  onClose: () => void;
  onSaved: () => void;
};

export default function HorseRaceModal({ horses, onClose, onSaved }: Props) {
  /** horseId → place (1-based) */
  const [places, setPlaces] = useState<Record<string, number | "">>(() => {
    const init: Record<string, number | ""> = {};
    for (const h of horses) {
      init[h._id] = h.place != null ? h.place : "";
    }
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const placeOptions = useMemo(
    () => Array.from({ length: horses.length }, (_, i) => i + 1),
    [horses.length]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return horses;
    return horses.filter(
      (h) =>
        (h.color || h.name).toLowerCase().includes(q) ||
        h.rider.toLowerCase().includes(q) ||
        h.team.toLowerCase().includes(q)
    );
  }, [horses, query]);

  const usedPlaces = useMemo(() => {
    const set = new Set<number>();
    for (const v of Object.values(places)) {
      if (typeof v === "number") set.add(v);
    }
    return set;
  }, [places]);

  const allFilled =
    horses.every((h) => typeof places[h._id] === "number") &&
    usedPlaces.size === horses.length;

  const setHorsePlace = (horseId: string, place: number | "") => {
    setPlaces((prev) => {
      const next = { ...prev };
      // энэ байрыг өөр мориноос авна
      if (typeof place === "number") {
        for (const [id, p] of Object.entries(next)) {
          if (p === place && id !== horseId) next[id] = "";
        }
      }
      next[horseId] = place;
      return next;
    });
  };

  const handleSave = async () => {
    if (!allFilled) {
      alert("Бүх моринд байр (1т, 2т…) өгнө үү. Байр давхардахгүй.");
      return;
    }
    setSaving(true);
    try {
      const placements = horses.map((h) => ({
        horseId: h._id,
        place: places[h._id] as number,
      }));
      const res = await fetch("/api/horses/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placements }),
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
          Уралдах — байр эзлүүлэх
        </h2>
        <p className="mt-1 text-sm text-[var(--land-muted)]">
          Морь бүрт байр сонгоно: 1т, 2т, 3т…
        </p>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Морь, унаач, баг хайх..."
          className="mt-4 w-full border border-[var(--land-ink)]/15 px-3 py-2.5 text-sm outline-none focus:border-[var(--land-gold)]"
        />

        <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
          {filtered.map((h) => {
            const current = places[h._id] ?? "";
            return (
              <div
                key={h._id}
                className="flex items-center gap-3 border border-[var(--land-ink)]/10 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {h.color || h.name}
                  </p>
                  <p className="truncate text-xs text-[var(--land-muted)]">
                    {[h.rider, h.team].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <select
                  value={current === "" ? "" : String(current)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setHorsePlace(h._id, v === "" ? "" : Number(v));
                  }}
                  className="w-24 shrink-0 border border-[var(--land-ink)]/15 bg-white px-2 py-2 text-sm outline-none focus:border-[var(--land-gold)]"
                >
                  <option value="">Байр</option>
                  {placeOptions.map((p) => {
                    const taken =
                      usedPlaces.has(p) && places[h._id] !== p;
                    return (
                      <option key={p} value={p} disabled={taken}>
                        {p}т
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="p-3 text-sm text-[var(--land-muted)]">Олдсонгүй</p>
          )}
        </div>

        <p className="mt-3 text-xs text-[var(--land-muted)]">
          Сонгосон: {usedPlaces.size}/{horses.length}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !allFilled}
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
    </div>
  );
}
