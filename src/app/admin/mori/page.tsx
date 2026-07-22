"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import HorseRaceModal from "@/components/HorseRaceModal";
import { Horse } from "@/types";

export default function AdminMoriPage() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [raceOpen, setRaceOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/horses");
    const data = await res.json();
    setHorses(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    load()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [load]);

  const handleExcelImport = async (file: File) => {
    const replace =
      horses.length === 0 ||
      confirm(
        `Одоо ${horses.length} морь байна. Excel-ээр шинэ жагсаалт оруулбал ХУУЧНЫГ УСТГАНА. Үргэлжлүүлэх үү?`
      );
    if (horses.length > 0 && !replace) return;

    setImporting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("replace", "true");
      const res = await fetch("/api/horses/import", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Импорт амжилтгүй");
        return;
      }
      alert(data.message);
      await load();
    } catch {
      alert("Excel импорт хийхэд алдаа гарлаа");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const placedCount = horses.filter((h) => h.place != null).length;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.25em] text-[var(--land-gold)] uppercase">
            Төрөл
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
            Морь
          </h1>
          <p className="mt-2 text-[var(--land-muted)]">
            Хурдан морь — жагсаалт, уралдаан, байр
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || horses.length === 0}
            onClick={() => setRaceOpen(true)}
            className="bg-[var(--land-forest)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--land-ink)] disabled:opacity-50"
          >
            Уралдах
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleExcelImport(file);
            }}
          />
          <button
            type="button"
            disabled={importing}
            onClick={() => fileRef.current?.click()}
            title="A=№ · B=Зүс · C=Баг · D=Унаач"
            className="border border-[var(--land-forest)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--land-forest)] transition hover:bg-[var(--land-forest)] hover:text-white disabled:opacity-50"
          >
            {importing ? "Импортолж байна..." : "Excel оруулах"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="border border-[var(--land-ink)]/10 bg-white p-4">
          <p className="text-xs text-[var(--land-muted)]">Морьд</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold">
            {loading ? "—" : horses.length}
          </p>
        </div>
        <div className="border border-[var(--land-ink)]/10 bg-white p-4">
          <p className="text-xs text-[var(--land-muted)]">Байр эзэлсэн</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold">
            {loading ? "—" : placedCount}
          </p>
        </div>
      </div>

      {!loading && horses.length === 0 && (
        <p className="mt-10 border border-dashed border-[var(--land-ink)]/20 p-6 text-sm text-[var(--land-muted)]">
          Морь байхгүй. &quot;Excel оруулах&quot; дарж жагсаалт импортлоно уу.
        </p>
      )}

      {!loading && horses.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">
            Морьд ({horses.length})
          </h2>
          <div className="max-h-[32rem] overflow-auto border border-[var(--land-ink)]/10 bg-white">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="sticky top-0 bg-[var(--land-paper)] text-xs text-[var(--land-muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Байр</th>
                  <th className="px-3 py-2 font-medium">Зүс</th>
                  <th className="px-3 py-2 font-medium">Баг</th>
                  <th className="px-3 py-2 font-medium">Унаач</th>
                </tr>
              </thead>
              <tbody>
                {horses.map((h) => (
                  <tr
                    key={h._id}
                    className="border-t border-[var(--land-ink)]/5"
                  >
                    <td className="px-3 py-2 font-semibold tabular-nums text-[var(--land-forest)]">
                      {h.place != null ? `${h.place}т` : "—"}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {h.color || h.name || "—"}
                    </td>
                    <td className="px-3 py-2 text-[var(--land-gold)]">
                      {h.team || "—"}
                    </td>
                    <td className="px-3 py-2">{h.rider || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {raceOpen && (
        <HorseRaceModal
          horses={horses}
          onClose={() => setRaceOpen(false)}
          onSaved={() => {
            load().catch(console.error);
          }}
        />
      )}
    </div>
  );
}
