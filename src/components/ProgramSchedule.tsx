"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getUlaanbaatarNow,
  isProgramLive,
} from "@/lib/program-time";

export type ProgramScheduleItem = {
  time: string;
  title: string;
  location: string;
};

type Props = {
  items: ProgramScheduleItem[];
  eventDate?: string | null;
};

export default function ProgramSchedule({ items, eventDate }: Props) {
  const [now, setNow] = useState(() => getUlaanbaatarNow());

  useEffect(() => {
    const tick = () => setNow(getUlaanbaatarNow());
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const liveIndexes = useMemo(() => {
    const set = new Set<number>();
    items.forEach((item, i) => {
      if (isProgramLive(item.time, eventDate, now)) set.add(i);
    });
    return set;
  }, [items, eventDate, now]);

  const liveItems = items.filter((_, i) => liveIndexes.has(i));

  return (
    <div>
      {liveItems.length > 0 && (
        <div className="mt-6 border-l-2 border-[var(--land-forest)] bg-[var(--land-forest)]/5 px-4 py-3">
          <p className="text-xs tracking-[0.2em] text-[var(--land-forest)] uppercase">
            Одоо явж байна
          </p>
          <ul className="mt-2 space-y-1">
            {liveItems.map((item) => (
              <li
                key={`live-${item.time}-${item.title}`}
                className="font-[family-name:var(--font-display)] text-lg font-semibold"
              >
                {item.title}
                {item.location ? (
                  <span className="ml-2 text-sm font-normal text-[var(--land-muted)]">
                    · {item.location}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ol className="mt-12">
        {items.map((item, i) => {
          const live = liveIndexes.has(i);
          return (
            <li
              key={`${item.time}-${item.title}-${i}`}
              className={`grid grid-cols-[auto_1fr] items-start gap-4 py-5 md:gap-10 ${
                i < items.length - 1
                  ? "border-b border-[var(--land-ink)]/10"
                  : ""
              } ${live ? "bg-[var(--land-forest)]/5 -mx-3 px-3 md:-mx-4 md:px-4" : ""}`}
            >
              <time
                className={`shrink-0 whitespace-nowrap font-[family-name:var(--font-display)] text-base font-semibold tabular-nums md:text-xl ${
                  live
                    ? "text-[var(--land-forest)]"
                    : "text-[var(--land-gold)]"
                }`}
              >
                {item.time}
              </time>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-[family-name:var(--font-display)] text-xl font-semibold md:text-2xl">
                    {item.title}
                  </p>
                  {live && (
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-[var(--land-forest)] px-2 py-0.5 text-[11px] font-medium tracking-wide text-white uppercase">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                      Явж байна
                    </span>
                  )}
                </div>
                {item.location ? (
                  <p className="mt-1 text-sm text-[var(--land-muted)] md:text-base">
                    {item.location}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
