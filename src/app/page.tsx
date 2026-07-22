import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import ProgramSchedule from "@/components/ProgramSchedule";
import { connectDB } from "@/lib/mongodb";
import { ProgramItem, ProgramMeta } from "@/models";

const SPORTS = [
  {
    href: "/bokh",
    title: "Бөх",
    desc: "Үндэсний бөхийн барилдаан",
    image: "/sports/bokh.jpeg",
    tone: "from-[#1b4d3e]/60 to-[#0f2e26]/55",
  },
  {
    href: "/sur-kharvaa",
    title: "Сур харваа",
    desc: "Уламжлалт сур харвааны тэмцээн",
    image: "/sports/sur-kharvaa.jpeg",
    tone: "from-[#3a4a5c]/60 to-[#1e2834]/55",
  },
  {
    href: "/khurdan",
    title: "Хурдан",
    desc: "Хурдан морины уралдаан",
    image: "/sports/khurdan.jpeg",
    tone: "from-[#5c3a2a]/60 to-[#2e1c14]/55",
  },
] as const;

function formatDateMn(iso: string) {
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

async function getProgram() {
  type ProgramMetaLean = { eventDate: string; endDate?: string };
  type ProgramItemLean = { time: string; title: string; location?: string };

  try {
    await connectDB();
    const metaDoc = await ProgramMeta.findOne()
      .sort({ createdAt: -1 })
      .lean<ProgramMetaLean | null>();
    if (!metaDoc) {
      return {
        meta: null as null | { eventDate: string; endDate: string },
        items: [] as Array<{ time: string; title: string; location: string }>,
      };
    }
    const items = await ProgramItem.find()
      .sort({ order: 1, time: 1 })
      .lean<ProgramItemLean[]>();
    return {
      meta: {
        eventDate: metaDoc.eventDate,
        endDate: metaDoc.endDate || metaDoc.eventDate,
      },
      items: items.map((i) => ({
        time: i.time,
        title: i.title,
        location: i.location ?? "",
      })),
    };
  } catch {
    return {
      meta: null as null | { eventDate: string; endDate: string },
      items: [] as Array<{ time: string; title: string; location: string }>,
    };
  }
}

export default async function LandingPage() {
  const { meta, items: program } = await getProgram();

  return (
    <div className="bg-[var(--land-paper)] text-[var(--land-ink)]">
      {/* Hero — one composition, brand first, full-bleed image */}
      <section className="relative min-h-[100svh] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=80"
            alt="Уулын хээр тал"
            fill
            priority
            className="land-kenburns object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--land-ink)] via-[var(--land-ink)]/55 to-[var(--land-ink)]/25" />
          <div className="land-fade absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(20,37,31,0.35)_100%)]" />
        </div>

        <div className="relative z-10 flex min-h-[100svh] flex-col">
          <header className="flex items-center justify-between px-6 py-6 md:px-12">
            <p className="land-rise font-[family-name:var(--font-display)] text-sm tracking-[0.2em] text-white/80 uppercase">
              Сутай Буянт
            </p>
            <nav className="land-rise land-rise-delay-1 flex gap-6 text-sm text-white/75">
              <a href="#events" className="transition hover:text-white">
                Тэмцээн
              </a>
              <a href="#program" className="transition hover:text-white">
                Хөтөлбөр
              </a>
              <a href="#about" className="transition hover:text-white">
                Тухай
              </a>
            </nav>
          </header>

          <div className="flex flex-1 flex-col justify-end px-6 pb-16 md:px-12 md:pb-24">
            <p className="land-rise mb-3 font-[family-name:var(--font-display)] text-5xl leading-none font-semibold tracking-wide text-white md:text-7xl lg:text-8xl">
              Сутай Буянт
            </p>
            <h1 className="land-rise land-rise-delay-1 max-w-xl font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--land-gold-bright)] md:text-5xl">
              30 жилийн ой
            </h1>
            <p className="land-rise land-rise-delay-2 mt-5 max-w-md text-base leading-relaxed text-white/85 md:text-lg">
              Баярын наадам — бөх, сур харваа, хурдан мориор нэгдэнэ.
            </p>

            <div className="land-rise land-rise-delay-3 mt-10 flex flex-wrap gap-3">
              {SPORTS.map((sport) => (
                <TransitionLink
                  key={sport.href}
                  href={sport.href}
                  className="border border-white/35 bg-white/10 px-6 py-3 text-sm font-medium tracking-wide text-white backdrop-blur-sm transition hover:border-[var(--land-gold-bright)] hover:bg-white/20"
                >
                  {sport.title}
                </TransitionLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events — one job: choose sport */}
      <section id="events" className="px-6 py-20 md:px-12 md:py-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold md:text-5xl">
            Гурван төрөл
          </h2>
          <p className="mt-3 max-w-lg text-[var(--land-muted)]">
            Баярын хөтөлбөрөөс сонгоод орно уу.
          </p>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {SPORTS.map((sport) => (
              <TransitionLink
                key={sport.href}
                href={sport.href}
                className="group relative min-h-[320px] overflow-hidden text-white transition duration-500 hover:scale-[1.01]"
              >
                <Image
                  src={sport.image}
                  alt={sport.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${sport.tone}`}
                />
                <div className="relative z-10 flex h-full flex-col justify-end p-8">
                  <p className="font-[family-name:var(--font-display)] text-4xl font-semibold">
                    {sport.title}
                  </p>
                  <p className="mt-2 text-sm text-white/75">{sport.desc}</p>
                  <span className="mt-6 inline-block text-sm tracking-wide text-[var(--land-gold-bright)] transition group-hover:translate-x-1">
                    Нээх →
                  </span>
                </div>
              </TransitionLink>
            ))}
          </div>
        </div>
      </section>

      {/* Program — one job: show schedule */}
      <section
        id="program"
        className="border-t border-[var(--land-ink)]/10 px-6 py-20 md:px-12 md:py-28"
      >
        <div className="mx-auto max-w-3xl">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold md:text-5xl">
            Хөтөлбөр
          </h2>
          {meta ? (
            <p className="mt-3 text-[var(--land-muted)]">
              {formatDateMn(meta.eventDate)}
            </p>
          ) : (
            <p className="mt-3 text-[var(--land-muted)]">
              Баярын өдрийн цагийн хуваарь удахгүй зарлагдана
            </p>
          )}

          {program.length === 0 ? (
            <p className="mt-12 border border-dashed border-[var(--land-ink)]/15 p-8 text-center text-sm text-[var(--land-muted)]">
              Дэлгэрэнгүй хөтөлбөр бэлтгэгдэж байна.
            </p>
          ) : (
            <ProgramSchedule
              items={program}
              eventDate={meta?.eventDate ?? null}
            />
          )}
        </div>
      </section>

      {/* About — one job */}
      <section
        id="about"
        className="border-t border-[var(--land-ink)]/10 bg-[var(--land-forest)] px-6 py-20 text-[var(--land-paper)] md:px-12 md:py-28"
      >
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.25em] text-[var(--land-gold-bright)] uppercase">
            1996 — 2026
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold md:text-5xl">
            Гучин жилийн замнал
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/80">
            Сутай Буянт групп байгуулагдсаны 30 жилийн ойг үндэсний гурван
            наадмын төрлөөр тэмдэглэж байна. Та бүхнийг баярт урьж байна.
          </p>
        </div>
      </section>

      <footer className="border-t border-[var(--land-ink)]/10 px-6 py-8 text-center text-sm text-[var(--land-muted)] md:px-12">
        <p>© {new Date().getFullYear()} Сутай Буянт групп · 30 жилийн ой</p>
        <a
          href="/admin"
          className="mt-3 inline-block text-xs tracking-wide text-[var(--land-muted)]/70 transition hover:text-[var(--land-forest)]"
        >
          Admin
        </a>
      </footer>
    </div>
  );
}
