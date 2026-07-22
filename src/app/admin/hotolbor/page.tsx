"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ProgramMeta = {
  eventDate: string;
};

type ProgramRow = {
  _id?: string;
  time: string;
  title: string;
  category: string;
  location: string;
  owner: string;
  detail: string;
  status: string;
  order?: number;
};

function formatDateMn(iso: string) {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export default function AdminHotolborPage() {
  const [meta, setMeta] = useState<ProgramMeta | null>(null);
  const [items, setItems] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [editingMeta, setEditingMeta] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/program");
    const data = await res.json();
    if (data.meta) {
      const m = { eventDate: data.meta.eventDate };
      setMeta(m);
      setEventDate(m.eventDate);
    } else {
      setMeta(null);
    }
    setItems(
      Array.isArray(data.items)
        ? data.items.map((d: ProgramRow & { _id: string }) => ({
            _id: d._id,
            time: d.time,
            title: d.title,
            category: d.category ?? "",
            location: d.location ?? "",
            owner: d.owner ?? "",
            detail: d.detail ?? "",
            status: d.status ?? "Төлөвлөсөн",
            order: d.order,
          }))
        : []
    );
  }, []);

  useEffect(() => {
    load()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [load]);

  const saveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate.trim()) {
      alert("Өдөр оруулна уу");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_meta",
          eventDate: eventDate.trim(),
          endDate: eventDate.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Алдаа");
        return;
      }
      setMeta({ eventDate: data.meta.eventDate });
      setEditingMeta(false);
      await load();
    } catch {
      alert("Хадгалахад алдаа гарлаа");
    } finally {
      setSaving(false);
    }
  };

  const handleExcelImport = async (file: File) => {
    const replace =
      items.length === 0 ||
      confirm(
        `Одоо ${items.length} мөр байна. Excel-ээр шинэ жагсаалт оруулбал ХУУЧНЫГ УСТГАНА. Үргэлжлүүлэх үү?`
      );
    if (items.length > 0 && !replace) return;

    setImporting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/program/import", {
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

  if (loading) {
    return <p className="text-[var(--land-muted)]">Ачаалж байна...</p>;
  }

  if (!meta || editingMeta) {
    return (
      <div>
        <p className="text-xs tracking-[0.25em] text-[var(--land-gold)] uppercase">
          Ерөнхий · Алхам 1
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
          Хөтөлбөр үүсгэх
        </h1>
        <p className="mt-2 max-w-lg text-[var(--land-muted)]">
          Эхлээд баярын <strong>өдөр</strong>-ийг сонгоно. Дараа нь Excel-ээр
          хөтөлбөр оруулна.
        </p>

        <form
          onSubmit={saveMeta}
          className="mt-8 max-w-md space-y-4 border border-[var(--land-ink)]/10 bg-white p-6"
        >
          <div>
            <label className="mb-1.5 block text-sm text-[var(--land-muted)]">
              Өдөр
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="w-full border border-[var(--land-ink)]/15 px-3 py-2.5 text-sm outline-none focus:border-[var(--land-gold)]"
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[var(--land-forest)] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--land-ink)] disabled:opacity-50"
            >
              {saving
                ? "Хадгалж байна..."
                : meta
                  ? "Хадгалах"
                  : "Үргэлжлүүлэх →"}
            </button>
            {editingMeta && meta && (
              <button
                type="button"
                onClick={() => {
                  setEditingMeta(false);
                  setEventDate(meta.eventDate);
                }}
                className="border border-[var(--land-ink)]/15 px-5 py-2.5 text-sm text-[var(--land-muted)]"
              >
                Болих
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.25em] text-[var(--land-gold)] uppercase">
            Ерөнхий · Алхам 2
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
            Хөтөлбөр
          </h1>
          <p className="mt-2 text-[var(--land-muted)]">
            {formatDateMn(meta.eventDate)}
          </p>
          <button
            type="button"
            onClick={() => setEditingMeta(true)}
            className="mt-2 text-sm text-[var(--land-forest)] hover:underline"
          >
            Өдөр засах
          </button>
        </div>
        <div>
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
            title="№ · Цаг · Арга хэмжээ · Төрөл · Байршил · Хариуцах · Тайлбар · Төлөв"
            className="border border-[var(--land-forest)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--land-forest)] transition hover:bg-[var(--land-forest)] hover:text-white disabled:opacity-50"
          >
            {importing ? "Импортолж байна..." : "Excel оруулах"}
          </button>
        </div>
      </div>

      <div className="mt-6 border border-[var(--land-ink)]/10 bg-white p-4 text-sm text-[var(--land-muted)]">
        Excel:{" "}
        <span className="text-[var(--land-ink)]">
          A=№ · B=Цаг · C=Арга хэмжээ · D=Төрөл · E=Байршил · F=Хариуцах ·
          G=Тайлбар · H=Төлөв
        </span>
      </div>

      {items.length === 0 ? (
        <p className="mt-8 border border-dashed border-[var(--land-ink)]/20 p-6 text-sm text-[var(--land-muted)]">
          Хөтөлбөр байхгүй. &quot;Excel оруулах&quot; дарж оруулна уу.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-[var(--land-ink)]/10 bg-white">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-[var(--land-paper)] text-xs text-[var(--land-muted)]">
              <tr>
                <th className="px-3 py-2 font-medium">№</th>
                <th className="px-3 py-2 font-medium">Цаг</th>
                <th className="px-3 py-2 font-medium">Арга хэмжээ</th>
                <th className="px-3 py-2 font-medium">Төрөл</th>
                <th className="px-3 py-2 font-medium">Байршил</th>
                <th className="px-3 py-2 font-medium">Хариуцах</th>
                <th className="px-3 py-2 font-medium">Тайлбар</th>
                <th className="px-3 py-2 font-medium">Төлөв</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => (
                <tr
                  key={row._id ?? `row-${i}`}
                  className="border-t border-[var(--land-ink)]/5 align-top"
                >
                  <td className="px-3 py-2 text-[var(--land-muted)]">
                    {row.order ?? i + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap font-medium tabular-nums text-[var(--land-forest)]">
                    {row.time}
                  </td>
                  <td className="px-3 py-2 font-medium">{row.title}</td>
                  <td className="px-3 py-2">{row.category || "—"}</td>
                  <td className="px-3 py-2">{row.location || "—"}</td>
                  <td className="px-3 py-2 text-[var(--land-forest)]">
                    {row.owner || "—"}
                  </td>
                  <td className="max-w-[14rem] px-3 py-2 text-[var(--land-muted)]">
                    {row.detail || "—"}
                  </td>
                  <td className="px-3 py-2 text-[var(--land-forest)]">
                    {row.status || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
