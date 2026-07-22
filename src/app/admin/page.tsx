import Link from "next/link";
import { ADMIN_MENUS, ADMIN_GENERAL_MENUS } from "@/lib/admin-menus";

export default function AdminDashboardPage() {
  const cards = [...ADMIN_GENERAL_MENUS, ...ADMIN_MENUS];

  return (
    <div>
      <p className="text-xs tracking-[0.25em] text-[var(--land-gold)] uppercase">
        Admin
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold md:text-4xl">
        Хянах самбар
      </h1>
      <p className="mt-2 max-w-xl text-[var(--land-muted)]">
        Сутай Буянт — 30 жилийн ойн тэмцээнүүдийг эндээс удирдана.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group border border-[var(--land-ink)]/10 bg-white p-5 transition hover:border-[var(--land-gold)]"
          >
            <p className="font-[family-name:var(--font-display)] text-xl font-semibold">
              {item.label}
            </p>
            <p className="mt-2 text-sm text-[var(--land-muted)]">{item.desc}</p>
            <p className="mt-4 text-sm text-[var(--land-forest)] transition group-hover:translate-x-0.5">
              Нээх →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
