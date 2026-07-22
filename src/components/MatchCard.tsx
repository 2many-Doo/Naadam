"use client";

import Image from "next/image";
import { Match, Wrestler } from "@/types";

interface Props {
  match: Match;
  onSetWinner?: (matchId: string, winnerId: string) => void;
  compact?: boolean;
}

function WrestlerSlot({
  wrestler,
  isWinner,
  onSelect,
  canSelect,
}: {
  wrestler: Wrestler | null;
  isWinner: boolean;
  onSelect?: () => void;
  canSelect: boolean;
}) {
  if (!wrestler) {
    return (
      <div className="flex h-10 items-center border border-dashed border-[var(--land-ink)]/20 px-2 text-xs text-[var(--land-muted)]">
        Хүлээгдэж байна...
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={canSelect ? onSelect : undefined}
      disabled={!canSelect}
      className={`flex w-full items-center gap-2 border px-2 py-1.5 text-left transition ${
        isWinner
          ? "border-[var(--land-forest)] bg-[var(--land-forest)]/8"
          : canSelect
            ? "border-[var(--land-ink)]/15 hover:border-[var(--land-gold)] cursor-pointer"
            : "border-[var(--land-ink)]/15"
      }`}
    >
      <Image
        src={wrestler.image}
        alt={wrestler.name}
        width={28}
        height={28}
        className="rounded-full object-cover object-top bg-transparent"
        unoptimized
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-[var(--land-ink)]">
          {wrestler.name}
        </p>
        <p className="truncate text-[10px] text-[var(--land-gold)]">
          {wrestler.title}
        </p>
      </div>
      {isWinner && (
        <span className="text-[var(--land-forest)]">✓</span>
      )}
    </button>
  );
}

export default function MatchCard({ match, onSetWinner, compact }: Props) {
  const canSetWinner =
    match.status === "pending" &&
    match.wrestler1 &&
    match.wrestler2 &&
    onSetWinner;

  return (
    <div
      className={`border bg-white ${
        match.status === "completed"
          ? "border-[var(--land-forest)]/40"
          : "border-[var(--land-ink)]/10"
      } ${compact ? "p-2" : "p-3"}`}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] text-[var(--land-muted)]">
          #{match.position + 1}
        </span>
        {match.status === "completed" && (
          <span className="bg-[var(--land-forest)]/10 px-1.5 py-0.5 text-[10px] text-[var(--land-forest)]">
            Дууссан
          </span>
        )}
      </div>
      <div className="space-y-1">
        <WrestlerSlot
          wrestler={match.wrestler1}
          isWinner={match.winner?._id === match.wrestler1?._id}
          canSelect={!!canSetWinner}
          onSelect={() =>
            onSetWinner?.(match._id, match.wrestler1!._id)
          }
        />
        <div className="text-center text-[10px] text-[var(--land-muted)]">vs</div>
        <WrestlerSlot
          wrestler={match.wrestler2}
          isWinner={match.winner?._id === match.wrestler2?._id}
          canSelect={!!canSetWinner}
          onSelect={() =>
            onSetWinner?.(match._id, match.wrestler2!._id)
          }
        />
      </div>
    </div>
  );
}
