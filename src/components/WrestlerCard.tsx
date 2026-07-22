"use client";

import Image from "next/image";
import { Wrestler } from "@/types";

interface Props {
  wrestler: Wrestler;
  selected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  compact?: boolean;
}

export default function WrestlerCard({
  wrestler,
  selected,
  onClick,
  onRemove,
  compact,
}: Props) {
  return (
    <div
      className={`relative flex items-center gap-2 border p-2 text-left transition ${
        onClick ? "cursor-pointer hover:border-[var(--land-gold)]" : ""
      } ${
        selected
          ? "border-[var(--land-gold)] bg-[var(--land-gold)]/10"
          : "border-[var(--land-ink)]/10 bg-white"
      } ${compact ? "text-xs" : "text-sm"}`}
    >
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={`flex min-w-0 flex-1 items-center gap-2 text-left ${
          onClick ? "cursor-pointer" : "cursor-default"
        }`}
      >
        <Image
          src={wrestler.image}
          alt={wrestler.name}
          width={compact ? 32 : 40}
          height={compact ? 32 : 40}
          className="rounded-full bg-transparent object-cover object-top"
          unoptimized
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-[var(--land-ink)]">
            {wrestler.name}
          </p>
          <p className="truncate text-[var(--land-gold)]">{wrestler.title}</p>
          {!compact && wrestler.province && (
            <p className="truncate text-[var(--land-muted)]">
              {wrestler.province}
            </p>
          )}
        </div>
      </button>

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="Буцаах"
          aria-label={`${wrestler.name} буцаах`}
          className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--land-ink)]/15 text-[var(--land-muted)] transition hover:border-red-400 hover:bg-red-50 hover:text-red-500"
        >
          ×
        </button>
      )}
    </div>
  );
}
