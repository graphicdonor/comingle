"use client";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BottomNavItem {
  id: string;
  href: string;
  icon: LucideIcon;
  label: string;
}

/** Fixed, flat bottom tab bar (LinkedIn-style): icon + label per tab, active
 * tab marked by a bar flush with the top edge plus bolded icon/label — no
 * color accent, so it reads as navigation chrome rather than a decoration. */
export function BottomNav({ items, activeId }: { items: BottomNavItem[]; activeId?: string }) {
  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200">
      <div className="max-w-xl mx-auto flex">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-w-0"
            >
              {isActive && <span aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-gray-900" />}
              <Icon className={cn("h-6 w-6", isActive ? "text-gray-900" : "text-gray-400")} strokeWidth={isActive ? 2.4 : 2} />
              <span className={cn("text-[11px] leading-none truncate max-w-full", isActive ? "font-semibold text-gray-900" : "font-medium text-gray-400")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
