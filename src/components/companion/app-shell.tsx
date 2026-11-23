"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MotionConfig, motion } from "framer-motion";
import { Home, BookOpen, Flower2, GraduationCap, SlidersHorizontal, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (path: string) => boolean;
}

const NAV: NavItem[] = [
  { href: "/app", label: "Today", icon: Home, match: (p) => p === "/app" },
  { href: "/practice", label: "Prayers", icon: BookOpen, match: (p) => p.startsWith("/practice") },
  { href: "/meditate", label: "Meditate", icon: Flower2, match: (p) => p.startsWith("/meditate") },
  { href: "/learn", label: "Learn", icon: GraduationCap, match: (p) => p.startsWith("/learn") },
  { href: "/preferences", label: "Settings", icon: SlidersHorizontal, match: (p) => p.startsWith("/preferences") },
];

/** App chrome for the practice companion: quiet header, five-tab bottom bar. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // reducedMotion="user": every framer-motion animation in the app respects
  // the device's reduce-motion setting.
  return (
    <MotionConfig reducedMotion="user">
      <header className="fixed top-0 inset-x-0 z-40 bg-[#F7F2E8]/90 backdrop-blur-md">
        <div className="max-w-xl mx-auto h-14 px-4 flex items-center">
          <Link href="/app" className="text-lg font-bold tracking-tight text-[#6D252C]">
            WePray
          </Link>
        </div>
      </header>

      <main className="pt-14 pb-28 min-h-screen">
        <div className="max-w-xl mx-auto px-4 py-5">{children}</div>
      </main>

      <nav aria-label="Main navigation" className="fixed bottom-0 inset-x-0 z-40 bg-[#FFFCF6] border-t border-[#E7DCC8] pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-xl mx-auto flex">
          {NAV.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-3 min-w-0"
              >
                <span className="relative flex items-center justify-center h-8 w-14">
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-[#6D252C]/10"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Icon className={cn("relative h-[22px] w-[22px]", active ? "text-[#6D252C]" : "text-[#9A8F86]")} strokeWidth={active ? 2.2 : 1.8} />
                </span>
                <span className={cn("text-[11px] leading-none", active ? "font-semibold text-[#6D252C]" : "font-medium text-[#8A7F76]")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </MotionConfig>
  );
}
