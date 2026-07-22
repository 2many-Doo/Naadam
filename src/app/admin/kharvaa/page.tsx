"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ArcherScoreModal from "@/components/ArcherScoreModal";
import { Archer, ArcherScore } from "@/types";

function archerIdOf(score: ArcherScore): string {
  if (typeof score.archer === "string") return score.archer;
  return score.archer._id;
}

export default function AdminKharvaaPage() {
  const [archers, setArchers] = useState<Archer[]>([]);
  const [scores, setScores] = useState<ArcherScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [scoringOpen, setScoringOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const [aRes, sRes] = await Promise.all([
      fetch("/api/archers"),
      fetch("/api/archer-scores"),
    ]);
    const aData = await aRes.json();
    const sData = await sRes.json();
    setArchers(Array.isArray(aData) ? aData : []);
    setScores(Array.isArray(sData) ? sData : []);
  }, []);

  useEffect(() => {
    load()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [load]);

  const scoreByArcher = useMemo(() => {
    const map = new Map<string, ArcherScore>();
    for (const s of scores) {
      map.set(archerIdOf(s), s);
    }
    return map;
  }, [scores]);

  const scoredCount = scoreByArcher.size;

  const handleExcelImport = async (file: File) => {
    const replace =
      archers.length === 0 ||
      confirm(
        `Одоо ${archers.length} харваач байна. Excel-ээр шинэ жагсаалт оруулбал ХУУЧНЫГ УСТГАНА. Үргэлжлүүлэх үү?`
      );
    if (archers.length > 0 && !replace) return;

    setImporting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("replace", "true");
      const res = await fetch("/api/archers/import", {
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

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.25em] text-[var(--land-gold)] uppercase">
            Төрөл
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
            Харваа
          </h1>
          <p className="mt-2 text-[var(--land-muted)]">
            Сур харваа — оролцогчид, 3 сумны оноо
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={loading || archers.length === 0 || scoredCount >= archers.length}
            onClick={() => setScoringOpen(true)}
            className="bg-[var(--land-forest)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--land-ink)] disabled:opacity-50"
          >
            Эхлүүлэх
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
            title="A=№ · B=Нэр · C=Овог · D=Баг"
            className="hidden border border-[var(--land-forest)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--land-forest)] transition hover:bg-[var(--land-forest)] hover:text-white disabled:opacity-50 md:inline-flex"
          >
            {importing ? "Импортолж байна..." : "Excel оруулах"}
          </button>
        </div>
      </div>

      <div className="mt-8 hidden gap-4 sm:grid-cols-3 md:grid">
        <div className="border border-[var(--land-ink)]/10 bg-white p-4">
          <p className="text-xs text-[var(--land-muted)]">Харваачид</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold">
            {loading ? "—" : archers.length}
          </p>
        </div>
        <div className="border border-[var(--land-ink)]/10 bg-white p-4">
          <p className="text-xs text-[var(--land-muted)]">Оноо тэмдэглэсэн</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold">
            {loading ? "—" : scoredCount}
          </p>
        </div>
        <div className="border border-[var(--land-ink)]/10 bg-white p-4">
          <p className="text-xs text-[var(--land-muted)]">Харвалт</p>
          <p className="mt-2 text-sm text-[var(--land-muted)]">
            Хүн бүрт 3 сум
          </p>
        </div>
      </div>

      {!loading && archers.length === 0 && (
        <p className="mt-10 border border-dashed border-[var(--land-ink)]/20 p-6 text-sm text-[var(--land-muted)]">
          Харваач байхгүй. Баруун дээрх &quot;Excel оруулах&quot; дарж нэрс
          импортлоно уу.
        </p>
      )}

      {!loading && archers.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">
            Харваачид ({archers.length})
          </h2>
          <div className="max-h-[28rem] overflow-y-auto border border-[var(--land-ink)]/10 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[var(--land-paper)] text-xs text-[var(--land-muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">№</th>
                  <th className="px-3 py-2 font-medium">Нэр</th>
                  <th className="px-3 py-2 font-medium">Овог</th>
                  <th className="px-3 py-2 font-medium">Баг</th>
                  <th className="px-3 py-2 font-medium">Оносон</th>
                  <th className="px-3 py-2 font-medium">Оноогүй</th>
                </tr>
              </thead>
              <tbody>
                {archers.map((a, i) => {
                  const score = scoreByArcher.get(a._id);
                  return (
                    <tr
                      key={a._id}
                      className="border-t border-[var(--land-ink)]/5"
                    >
                      <td className="px-3 py-2 text-[var(--land-muted)]">
                        {a.order || i + 1}
                      </td>
                      <td className="px-3 py-2 font-medium">{a.name}</td>
                      <td className="px-3 py-2">{a.surname}</td>
                      <td className="px-3 py-2 text-[var(--land-gold)]">
                        {a.team || "—"}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-[var(--land-forest)]">
                        {score ? score.hits : "—"}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-red-700">
                        {score ? score.misses : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {scoringOpen && (
        <ArcherScoreModal
          archers={archers.filter((a) => !scoreByArcher.has(a._id))}
          onClose={() => setScoringOpen(false)}
          onSaved={() => {
            load().catch(console.error);
          }}
        />
      )}
    </div>
  );
}
