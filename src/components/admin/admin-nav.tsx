"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/communities", label: "Communities" },
  { href: "/admin/surveys", label: "Surveys" },
];

export function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1A1D27]/90 backdrop-blur-md border-b border-white/8 h-14 flex items-center px-6">
      <div className="flex items-center gap-2.5 flex-1">
        <div className="w-7 h-7 rounded-lg bg-[#8B1A6B]/20 border border-[#8B1A6B]/30 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4 text-[#8B1A6B]" />
        </div>
        <span className="font-bold text-sm text-white">Admin Panel</span>
        <span className="text-[10px] bg-[#8B1A6B]/20 text-[#8B1A6B] border border-[#8B1A6B]/30 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide">
          Staff Only
        </span>
        <div className="flex items-center gap-1 ml-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-xs font-medium px-3 py-1.5 rounded-full transition-colors",
                pathname === link.href ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors"
      >
        <LogOut className="w-3.5 h-3.5" />
        Logout
      </button>
    </nav>
  );
}
