"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import LedMatchDisplay from "@/components/LedMatchDisplay";

function LedPageInner() {
  const params = useSearchParams();
  const sec = Number(params.get("sec"));
  const slideMs =
    Number.isFinite(sec) && sec >= 3 && sec <= 60 ? sec * 1000 : 8000;

  return <LedMatchDisplay slideMs={slideMs} />;
}

export default function BokhLedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[100svh] items-center justify-center bg-white text-2xl text-[var(--land-muted)]">
          Ачаалж байна...
        </div>
      }
    >
      <LedPageInner />
    </Suspense>
  );
}
