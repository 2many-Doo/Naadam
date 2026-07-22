"use client";

import { Match } from "@/types";
import MatchCard from "./MatchCard";
import { ROUND_NAMES } from "@/lib/constants";

interface Props {
  round: number;
  matches: Match[];
  onSetWinner?: (matchId: string, winnerId: string) => void;
}

export default function RoundMatches({ round, matches, onSetWinner }: Props) {
  const completed = matches.filter((m) => m.status === "completed").length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--land-forest)]">
          {ROUND_NAMES[round]}
        </h2>
        <span className="text-sm text-[var(--land-muted)]">
          Дууссан: {completed}/{matches.length}
        </span>
      </div>
      {onSetWinner && (
        <p className="mb-4 text-sm text-[var(--land-muted)]">
          Ялагч бөх дээр дарж тэмдэглэнэ. Бүх барилдаан дууссаны дараа давсан бөхүүдийн
          жагсаалт гарна.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {matches.map((match) => (
          <MatchCard
            key={match._id}
            match={match}
            onSetWinner={onSetWinner}
          />
        ))}
      </div>
    </div>
  );
}
