"use client";

import Image from "next/image";
import { Wrestler } from "@/types";

interface Props {
  wrestlers: Wrestler[];
}

export default function WrestlerCarousel({ wrestlers }: Props) {
  if (wrestlers.length === 0) {
    return (
      <div className="border-y border-[var(--land-ink)]/10 py-16 text-center text-[var(--land-muted)]">
        Бөхчүүд хараахан бүртгэгдээгүй байна
      </div>
    );
  }

  // Seamless loop: duplicate the list
  const track = [...wrestlers, ...wrestlers];

  return (
    <div className="relative overflow-hidden border-y border-[var(--land-ink)]/10 py-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--land-paper)] to-transparent md:w-24" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--land-paper)] to-transparent md:w-24" />

      <div className="wrestler-marquee flex w-max gap-5">
        {track.map((w, i) => (
          <div
            key={`${w._id}-${i}`}
            className="flex w-36 shrink-0 flex-col items-center gap-3 md:w-44"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <Image
                src={w.image}
                alt={w.name}
                fill
                className="object-contain object-bottom"
                sizes="176px"
                unoptimized
              />
            </div>
            <div className="w-full text-center">
              <p className="truncate font-[family-name:var(--font-display)] text-base font-semibold text-[var(--land-ink)]">
                {w.name}
              </p>
              <p className="truncate text-xs tracking-wide text-[var(--land-gold)]">
                {w.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
