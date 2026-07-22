import AppShell from "@/components/AppShell";

export default function BracketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
