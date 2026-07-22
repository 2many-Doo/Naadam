"use client";

import WrestlerCard from "./WrestlerCard";
import { Wrestler } from "@/types";
import { ROUND_NAMES } from "@/lib/constants";

interface Props {
  round: number;
  winners: Wrestler[];
}

export default function WinnersList({ round, winners }: Props) {
  return (
    <section className="mb-8 border border-[var(--land-forest)]/25 bg-white p-5">
      <h2 className="mb-1 text-lg font-semibold text-[var(--land-forest)]">
        {ROUND_NAMES[round]} — Давсан бөхүүд ({winners.length})
      </h2>
      <p className="mb-4 text-sm text-[var(--land-muted)]">
        Эдгээр бөхүүдээс дараагийн давааны барилдааныг гараар тааруулна.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {winners.map((w) => (
          <WrestlerCard key={w._id} wrestler={w} compact />
        ))}
      </div>
    </section>
  );
}
