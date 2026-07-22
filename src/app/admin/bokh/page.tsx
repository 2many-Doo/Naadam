"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import BracketEditor from "@/components/BracketEditor";
import { Bracket, Wrestler } from "@/types";

type Mode =
  | { type: "list" }
  | { type: "edit"; bracketId: string }
  | { type: "create" };

export default function AdminBokhPage() {
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [mode, setMode] = useState<Mode>({ type: "list" });
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const [bRes, wRes] = await Promise.all([
      fetch("/api/brackets"),
      fetch("/api/wrestlers"),
    ]);
    const bData = await bRes.json();
    const wData = await wRes.json();
    setBrackets(Array.isArray(bData) ? bData : []);
    setWrestlers(Array.isArray(wData) ? wData : []);
  }, []);

  useEffect(() => {
    load()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [load]);

  const handleExcelImport = async (file: File) => {
    const replace =
      wrestlers.length === 0 ||
      confirm(
        `Одоо ${wrestlers.length} бөх байна. Excel-ээр шинэ жагсаалт оруулбал ХУУЧНЫГ УСТГАНА. Үргэлжлүүлэх үү?`
      );
    if (wrestlers.length > 0 && !replace) return;

    setImporting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("replace", "true");
      const res = await fetch("/api/wrestlers/import", {
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

  const closeEditor = () => {
    setMode({ type: "list" });
    load().catch(console.error);
  };

  const active =
    brackets.find((b) => b.status === "active") ??
    brackets.find((b) => b.status === "draft") ??
    brackets[0];

  if (mode.type === "edit" || mode.type === "create") {
    return (
      <div>
        <p className="text-xs tracking-[0.25em] text-[var(--land-gold)] uppercase">
          Бөх · Оноолт
        </p>
        <div className="mt-6">
          <BracketEditor
            key={mode.type === "edit" ? mode.bracketId : "create"}
            initialBracketId={mode.type === "edit" ? mode.bracketId : null}
            startInCreate={mode.type === "create"}
            onClose={closeEditor}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.25em] text-[var(--land-gold)] uppercase">
            Төрөл
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
            Бөх
          </h1>
          <p className="mt-2 text-[var(--land-muted)]">
            Үндэсний бөхийн барилдаан — оноолт, бөхүүд, даваа
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
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
            title="A=№ · B=Овог · C=Нэр · D=Цол · E=Зураг"
            className="border border-[var(--land-forest)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--land-forest)] transition hover:bg-[var(--land-forest)] hover:text-white disabled:opacity-50"
          >
            {importing ? "Импортолж байна..." : "Excel оруулах"}
          </button>
          <button
            type="button"
            onClick={() => setMode({ type: "create" })}
            className="bg-[var(--land-forest)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--land-ink)]"
          >
            Барилдаан үүсгэх
          </button>
          <a
            href="/bokh/led"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[var(--land-gold)] px-5 py-2.5 text-sm font-medium text-[var(--land-ink)] transition hover:bg-[var(--land-gold)]/15"
          >
            LED дэлгэц
          </a>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="border border-[var(--land-ink)]/10 bg-white p-4">
          <p className="text-xs text-[var(--land-muted)]">Бөхүүд</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold">
            {loading ? "—" : wrestlers.length}
          </p>
        </div>
        <div className="border border-[var(--land-ink)]/10 bg-white p-4">
          <p className="text-xs text-[var(--land-muted)]">Оноолт</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold">
            {loading ? "—" : brackets.length}
          </p>
        </div>
        <div className="border border-[var(--land-ink)]/10 bg-white p-4">
          <p className="text-xs text-[var(--land-muted)]">Одоогийн төлөв</p>
          <p className="mt-1 text-lg font-medium">
            {loading
              ? "—"
              : active
                ? active.status === "draft"
                  ? "Ноорог"
                  : active.status === "active"
                    ? "Явагдаж байна"
                    : "Дууссан"
                : "Байхгүй"}
          </p>
        </div>
      </div>

      {!loading && brackets.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Оноолтууд</h2>
          <div className="space-y-2">
            {brackets.map((b) => (
              <div
                key={b._id}
                className="flex flex-wrap items-center justify-between gap-3 border border-[var(--land-ink)]/10 bg-white px-4 py-3"
              >
                <div>
                  <p className="font-medium">{b.name}</p>
                  <p className="text-xs text-[var(--land-muted)]">
                    {b.status === "draft"
                      ? "Ноорог"
                      : b.status === "active"
                        ? "Явагдаж байна"
                        : "Дууссан"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMode({ type: "edit", bracketId: b._id })}
                  className="text-sm text-[var(--land-forest)] hover:underline"
                >
                  Засах →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && wrestlers.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">
            Бөхүүд ({wrestlers.length})
          </h2>
          <div className="max-h-72 overflow-y-auto border border-[var(--land-ink)]/10 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[var(--land-paper)] text-xs text-[var(--land-muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">№</th>
                  <th className="px-3 py-2 font-medium">Зураг</th>
                  <th className="px-3 py-2 font-medium">Нэр</th>
                  <th className="px-3 py-2 font-medium">Цол</th>
                </tr>
              </thead>
              <tbody>
                {wrestlers.map((w, i) => (
                  <tr
                    key={w._id}
                    className="border-t border-[var(--land-ink)]/5"
                  >
                    <td className="px-3 py-2 text-[var(--land-muted)]">
                      {i + 1}
                    </td>
                    <td className="px-3 py-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={w.image}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover object-top"
                      />
                    </td>
                    <td className="px-3 py-2 font-medium">{w.name}</td>
                    <td className="px-3 py-2 text-[var(--land-gold)]">
                      {w.title}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
