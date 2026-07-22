/** Улаанбаатарын одоогийн огноо/цаг (минутаар) */

export function getUlaanbaatarNow(): {
  date: string; // YYYY-MM-DD
  minutes: number; // 0–1439
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ulaanbaatar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  return { date, minutes: hour * 60 + minute };
}

/** "09:40–11:00" / "09:40-11:00" → минут */
export function parseTimeRange(
  time: string
): { start: number; end: number } | null {
  const m = time
    .trim()
    .match(
      /(\d{1,2})\s*:\s*(\d{2})\s*[–—−\-]\s*(\d{1,2})\s*:\s*(\d{2})/
    );
  if (m) {
    const start = Number(m[1]) * 60 + Number(m[2]);
    const end = Number(m[3]) * 60 + Number(m[4]);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
    return { start, end };
  }

  const single = time.trim().match(/^(\d{1,2})\s*:\s*(\d{2})$/);
  if (single) {
    const start = Number(single[1]) * 60 + Number(single[2]);
    return { start, end: start + 30 };
  }

  return null;
}

export function isProgramLive(
  time: string,
  eventDate: string | null | undefined,
  now = getUlaanbaatarNow()
): boolean {
  if (!eventDate || eventDate !== now.date) return false;
  const range = parseTimeRange(time);
  if (!range) return false;
  // end хүртэл хамааруулна
  return now.minutes >= range.start && now.minutes <= range.end;
}
