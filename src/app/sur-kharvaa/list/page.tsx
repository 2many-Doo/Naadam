"use client";

import { useEffect, useMemo, useState } from "react";
import TransitionLink from "@/components/TransitionLink";
import { Archer, ArcherScore } from "@/types";

function archerIdOf(score: ArcherScore): string {
  if (typeof score.archer === "string") return score.archer;
  return score.archer._id;
}

export default function SurKharvaaListPage() {
  const [archers, setArchers] = useState<Archer[]>([]);
  const [scores, setScores] = useState<ArcherScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/archers"), fetch("/api/archer-scores")])
      .then(async ([aRes, sRes]) => {
        const aData = await aRes.json();
        const sData = await sRes.json();
        setArchers(Array.isArray(aData) ? aData : []);
        setScores(Array.isArray(sData) ? sData : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scoreByArcher = useMemo(() => {
    const map = new Map<string, ArcherScore>();
    for (const s of scores) {
      map.set(archerIdOf(s), s);
    }
    return map;
  }, [scores]);

  const rows = useMemo(() => {
    return [...archers].sort((a, b) => {
      const sa = scoreByArcher.get(a._id);
      const sb = scoreByArcher.get(b._id);
      const ha = sa?.hits ?? -1;
      const hb = sb?.hits ?? -1;
      if (hb !== ha) return hb - ha;
      return (a.order || 0) - (b.order || 0);
    });
  }, [archers, scoreByArcher]);

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
          href="/sur-kharvaa"
          className="text-sm text-[var(--land-muted)] transition hover:text-[var(--land-ink)]"
        >
          ← Буцах
        </TransitionLink>
      </header>

      <div className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
        <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.25em] text-[var(--land-gold)] uppercase">
          Сур харваа
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
          Оролцогчид
        </h1>
        <p className="mt-2 text-sm text-[var(--land-muted)]">
          {loading
            ? "Ачаалж байна..."
            : `${archers.length} харваач · оноо: 3 суммаас`}
        </p>

        {loading ? (
          <p className="mt-10 text-[var(--land-muted)]">Ачаалж байна...</p>
        ) : archers.length === 0 ? (
          <p className="mt-10 border border-dashed border-[var(--land-ink)]/20 p-6 text-sm text-[var(--land-muted)]">
            Харваачдын жагсаалт хараахан оруулаагүй байна.
          </p>
        ) : (
          <>
            {/* Mobile: card list — оноо үргэлж харагдана */}
            <ul className="mt-8 space-y-2 md:hidden">
              {rows.map((a, i) => {
                const score = scoreByArcher.get(a._id);
                return (
                  <li
                    key={a._id}
                    className="flex items-center gap-3 border border-[var(--land-ink)]/10 px-4 py-3"
                  >
                    <span className="w-6 shrink-0 text-sm text-[var(--land-muted)]">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {a.name} {a.surname}
                      </p>
                      <p className="truncate text-xs text-[var(--land-gold)]">
                        {a.team || "—"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {score ? (
                        <p className="font-semibold tabular-nums text-[var(--land-forest)]">
                          {score.hits}
                          <span className="font-normal text-[var(--land-muted)]">
                            /3
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm text-[var(--land-muted)]">—</p>
                      )}
                      <p className="text-[10px] tracking-wide text-[var(--land-muted)] uppercase">
                        оноо
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Desktop: table */}
            <div className="mt-8 hidden overflow-x-auto border border-[var(--land-ink)]/10 md:block">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-[var(--land-paper)] text-xs text-[var(--land-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">№</th>
                    <th className="px-4 py-3 font-medium">Нэр</th>
                    <th className="px-4 py-3 font-medium">Овог</th>
                    <th className="px-4 py-3 font-medium">Баг</th>
                    <th className="px-4 py-3 font-medium">Оноо</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a, i) => {
                    const score = scoreByArcher.get(a._id);
                    return (
                      <tr
                        key={a._id}
                        className="border-t border-[var(--land-ink)]/5"
                      >
                        <td className="px-4 py-3 text-[var(--land-muted)]">
                          {i + 1}
                        </td>
                        <td className="px-4 py-3 font-medium">{a.name}</td>
                        <td className="px-4 py-3">{a.surname}</td>
                        <td className="px-4 py-3 text-[var(--land-gold)]">
                          {a.team || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {score ? (
                            <span className="font-semibold tabular-nums text-[var(--land-forest)]">
                              {score.hits}
                              <span className="font-normal text-[var(--land-muted)]">
                                /3
                              </span>
                            </span>
                          ) : (
                            <span className="text-[var(--land-muted)]">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
