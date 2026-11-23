import { AppShell } from "@/components/companion/app-shell";

// The community navbar (src/components/layout/navbar.tsx) and Terms gate are
// not used while the app ships as a practice companion; see src/lib/features.ts.
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
