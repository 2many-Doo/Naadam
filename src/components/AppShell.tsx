import Link from "next/link";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--card-border)] bg-[var(--card)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--accent)]">
                Сутай Буянт
              </p>
              <p className="text-xs text-[var(--muted)]">Admin</p>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link
              href="/admin"
              className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              Самбар
            </Link>
            <Link
              href="/admin/bokh"
              className="text-[var(--muted)] transition hover:text-[var(--foreground)]"
            >
              Бөх
            </Link>
            <Link
              href="/admin/bokh"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 font-medium text-black transition hover:bg-[var(--accent-hover)]"
            >
              + Оноолт
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
