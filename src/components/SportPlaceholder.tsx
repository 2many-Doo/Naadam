import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";

interface Props {
  title: string;
  subtitle: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export default function SportPlaceholder({
  title,
  subtitle,
  description,
  imageSrc,
  imageAlt,
}: Props) {
  return (
    <div className="page-enter min-h-[100svh] bg-[var(--land-paper)] text-[var(--land-ink)]">
      <header className="flex items-center justify-between px-6 py-6 md:px-12">
        <TransitionLink
          href="/"
          className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] uppercase"
        >
          Сутай Буянт
        </TransitionLink>
        <TransitionLink
          href="/#events"
          className="text-sm text-[var(--land-muted)] transition hover:text-[var(--land-ink)]"
        >
          ← Буцах
        </TransitionLink>
      </header>

      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-20 md:grid-cols-2 md:items-center md:px-12 md:pb-28">
        <div className="page-enter-delay-1">
          <p className="font-[family-name:var(--font-display)] text-sm tracking-[0.2em] text-[var(--land-gold)] uppercase">
            {subtitle}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl font-semibold md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-[var(--land-muted)]">
            {description}
          </p>
          <p className="mt-8 border-l-2 border-[var(--land-gold)] pl-4 text-sm text-[var(--land-muted)]">
            Энэ төрлийн систем удахгүй нээгдэнэ.
          </p>
        </div>

        <div className="page-enter-delay-2 relative aspect-[4/5] overflow-hidden md:aspect-[3/4]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
    </div>
  );
}
