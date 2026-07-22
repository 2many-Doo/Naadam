"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewBracketRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/bokh");
  }, [router]);
  return (
    <p className="text-[var(--muted)]">Admin руу шилжиж байна...</p>
  );
}
