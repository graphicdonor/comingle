"use client";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/services/matrimonial", label: "All Matches", matches: (p: string) => p === "/services/matrimonial" },
  { href: "/services/matrimonial/invites", label: "My Activities", matches: (p: string) => p.startsWith("/services/matrimonial/invites") || p.startsWith("/services/matrimonial/chat") },
  { href: "/services/matrimonial/profile", label: "My Profile", matches: (p: string) => p.startsWith("/services/matrimonial/profile") },
];

// Plain <a> tags, not next/link — this section has occasional-use, form-heavy
// pages rather than a hot path needing SPA transitions, and soft navigation
// here has shown intermittent failures to commit after certain sequences
// (see profile/edit save flow). A full reload is a safe, reliable trade-off.
export function MatrimonialNavTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 bg-white rounded-full border border-gray-100 p-1 mb-5 overflow-x-auto">
      {TABS.map((tab) => {
        const active = tab.matches(pathname);
        return (
          <a
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex-1 text-center text-xs font-semibold px-3 py-2 rounded-full whitespace-nowrap transition-colors",
              active ? "bg-[#8B1A6B] text-white" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </a>
        );
      })}
    </nav>
  );
}
