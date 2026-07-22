"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ADMIN_MENUS, ADMIN_GENERAL_MENUS } from "@/lib/admin-menus";

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-[100svh] bg-[var(--land-paper)] text-[var(--land-ink)]">
      <div className="flex min-h-[100svh]">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-[var(--land-ink)]/10 bg-white md:flex md:flex-col">
          <div className="border-b border-[var(--land-ink)]/10 px-5 py-6">
            <Link href="/admin" className="block">
              <p className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-wide">
                Сутай Буянт
              </p>
              <p className="mt-0.5 text-xs tracking-[0.2em] text-[var(--land-gold)] uppercase">
                Admin
              </p>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-3">
            <Link
              href="/admin"
              className={`px-3 py-2.5 text-sm transition ${
                pathname === "/admin"
                  ? "bg-[var(--land-forest)] text-white"
                  : "text-[var(--land-muted)] hover:bg-[var(--land-paper)] hover:text-[var(--land-ink)]"
              }`}
            >
              Хянах самбар
            </Link>
            <p className="mt-4 mb-1 px-3 text-[10px] tracking-[0.2em] text-[var(--land-muted)] uppercase">
              Төрлүүд
            </p>
            {ADMIN_MENUS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2.5 text-sm transition ${
                  isActive(item.href)
                    ? "bg-[var(--land-forest)] text-white"
                    : "text-[var(--land-muted)] hover:bg-[var(--land-paper)] hover:text-[var(--land-ink)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <p className="mt-4 mb-1 px-3 text-[10px] tracking-[0.2em] text-[var(--land-muted)] uppercase">
              Ерөнхий
            </p>
            {ADMIN_GENERAL_MENUS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2.5 text-sm transition ${
                  isActive(item.href)
                    ? "bg-[var(--land-forest)] text-white"
                    : "text-[var(--land-muted)] hover:bg-[var(--land-paper)] hover:text-[var(--land-ink)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-[var(--land-ink)]/10 p-4">
            <Link
              href="/"
              className="text-sm text-[var(--land-muted)] transition hover:text-[var(--land-ink)]"
            >
              ← Нүүр хуудас
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-[var(--land-ink)]/10 bg-white px-4 py-3 md:px-8">
            <button
              type="button"
              className="border border-[var(--land-ink)]/15 px-3 py-1.5 text-sm md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Цэс"
            >
              {open ? "Хаах" : "Цэс"}
            </button>
            <p className="hidden text-sm text-[var(--land-muted)] md:block">
              30 жилийн ойн удирдлага
            </p>
            <Link
              href="/"
              className="text-sm text-[var(--land-muted)] transition hover:text-[var(--land-ink)] md:hidden"
            >
              Нүүр
            </Link>
          </header>

          {open && (
            <nav className="border-b border-[var(--land-ink)]/10 bg-white p-3 md:hidden">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className={`mb-1 block px-3 py-2.5 text-sm ${
                  pathname === "/admin"
                    ? "bg-[var(--land-forest)] text-white"
                    : "text-[var(--land-muted)]"
                }`}
              >
                Хянах самбар
              </Link>
              {ADMIN_MENUS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`mb-1 block px-3 py-2.5 text-sm ${
                    isActive(item.href)
                      ? "bg-[var(--land-forest)] text-white"
                      : "text-[var(--land-muted)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {ADMIN_GENERAL_MENUS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`mb-1 block px-3 py-2.5 text-sm ${
                    isActive(item.href)
                      ? "bg-[var(--land-forest)] text-white"
                      : "text-[var(--land-muted)]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          <main className="flex-1 px-4 py-8 md:px-8 md:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
