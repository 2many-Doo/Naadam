"use client";

import { useEffect, useMemo, useState } from "react";
import TransitionLink from "@/components/TransitionLink";
import { Horse } from "@/types";

export default function KhurdanListPage() {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/horses")
      .then((res) => res.json())
      .then((data) => setHorses(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    return [...horses].sort((a, b) => {
      const pa = a.place ?? 9999;
      const pb = b.place ?? 9999;
      if (pa !== pb) return pa - pb;
      return (a.order || 0) - (b.order || 0);
    });
  }, [horses]);

  return (
    <div className="page-enter min-h-[100svh] bg-white text-[var(--land-ink)]">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <TransitionLink
          href="/"
          className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] uppercase"
        >
          Сутай Буянт
        </TransitionLink>
        <TransitionLink
          href="/khurdan"
          className="text-sm text-[var(--land-muted)] transition hover:text-[var(--land-ink)]"
        >
          ← Буцах
        </TransitionLink>
      </header>

      <div className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
        <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.25em] text-[var(--land-gold)] uppercase">
          Хурдан
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
          Морьд
        </h1>
        <p className="mt-2 text-sm text-[var(--land-muted)]">
          {loading ? "Ачаалж байна..." : `${horses.length} морь`}
        </p>

        {loading ? (
          <p className="mt-10 text-[var(--land-muted)]">Ачаалж байна...</p>
        ) : horses.length === 0 ? (
          <p className="mt-10 border border-dashed border-[var(--land-ink)]/20 p-6 text-sm text-[var(--land-muted)]">
            Морины жагсаалт хараахан оруулаагүй байна.
          </p>
        ) : (
          <>
            <ul className="mt-8 space-y-2 md:hidden">
              {rows.map((h) => (
                <li
                  key={h._id}
                  className="flex items-center gap-3 border border-[var(--land-ink)]/10 px-4 py-3"
                >
                  <span className="w-10 shrink-0 font-semibold tabular-nums text-[var(--land-forest)]">
                    {h.place != null ? `${h.place}т` : "—"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {h.color || h.name}
                    </p>
                    <p className="truncate text-xs text-[var(--land-muted)]">
                      {[h.rider, h.team].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 hidden overflow-x-auto border border-[var(--land-ink)]/10 md:block">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="bg-[var(--land-paper)] text-xs text-[var(--land-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Байр</th>
                    <th className="px-4 py-3 font-medium">Зүс</th>
                    <th className="px-4 py-3 font-medium">Баг</th>
                    <th className="px-4 py-3 font-medium">Унаач</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((h) => (
                    <tr
                      key={h._id}
                      className="border-t border-[var(--land-ink)]/5"
                    >
                      <td className="px-4 py-3 font-semibold tabular-nums text-[var(--land-forest)]">
                        {h.place != null ? `${h.place}т` : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {h.color || h.name}
                      </td>
                      <td className="px-4 py-3 text-[var(--land-gold)]">
                        {h.team || "—"}
                      </td>
                      <td className="px-4 py-3">{h.rider || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
