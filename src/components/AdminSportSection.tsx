import Link from "next/link";

interface Props {
  title: string;
  subtitle: string;
  description: string;
  publicHref: string;
  publicLabel: string;
}

export default function AdminSportSection({
  title,
  subtitle,
  description,
  publicHref,
  publicLabel,
}: Props) {
  return (
    <div>
      <p className="text-xs tracking-[0.25em] text-[var(--land-gold)] uppercase">
        Төрөл
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
        {title}
      </h1>
      <p className="mt-1 text-sm text-[var(--land-muted)]">{subtitle}</p>
      <p className="mt-4 max-w-xl text-[var(--land-muted)]">{description}</p>

      <div className="mt-8 border border-dashed border-[var(--land-ink)]/20 bg-white p-8">
        <p className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Удирдлага бэлтгэгдэж байна
        </p>
        <p className="mt-2 text-sm text-[var(--land-muted)]">
          Энэ төрлийн оноолт, оролцогчид, үр дүнгийн систем удахгүй нэмэгдэнэ.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={publicHref}
            className="border border-[var(--land-forest)] px-5 py-2.5 text-sm font-medium text-[var(--land-forest)] transition hover:bg-[var(--land-forest)] hover:text-white"
          >
            {publicLabel}
          </Link>
          <Link
            href="/admin"
            className="border border-[var(--land-ink)]/15 px-5 py-2.5 text-sm text-[var(--land-muted)] transition hover:border-[var(--land-gold)] hover:text-[var(--land-ink)]"
          >
            ← Самбар
          </Link>
        </div>
      </div>
    </div>
  );
}
