"use client";
import { useSyncExternalStore } from "react";
import Link from "next/link";

// The landing page header: see-through with light text over the opening
// journey, then the usual cream bar once the reader has scrolled past it.

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
}

const overJourney = () => (document.getElementById("journey")?.getBoundingClientRect().bottom ?? 0) > 64;

const NAV = [
  ["#inside", "What's inside"],
  ["#library", "Prayers"],
  ["#learn", "Learn"],
  ["#private", "Private & offline"],
  ["#faq", "FAQ"],
] as const;

export function LandingHeader() {
  const over = useSyncExternalStore(subscribe, overJourney, () => true);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${
        over ? "bg-gradient-to-b from-black/35 to-transparent text-[#F7F2E8]" : "border-b border-[#E7DCC8]/70 bg-[#F7F2E8]/90 text-[#2A1A1C] backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" aria-label="WePray home" className={`text-xl font-bold tracking-tight ${over ? "text-[#F7F2E8]" : "text-[#6D252C]"}`}>
          WePray
        </Link>
        <nav aria-label="Sections" className={`hidden items-center gap-6 text-sm font-medium md:flex ${over ? "text-[#F7F2E8]/80" : "text-[#5B5350]"}`}>
          {NAV.map(([href, label]) => (
            <a key={href} href={href} className={over ? "hover:text-[#F7F2E8]" : "hover:text-[#6D252C]"}>
              {label}
            </a>
          ))}
        </nav>
        <Link
          href="/app"
          className={`ml-auto rounded-full px-5 py-2.5 text-sm font-bold transition-colors ${
            over ? "bg-[#F7F2E8] text-[#6D252C] hover:bg-white" : "bg-[#6D252C] text-[#F7F2E8] hover:bg-[#5E1F25]"
          }`}
        >
          Open app
        </Link>
      </div>
    </header>
  );
}
