"use client";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { readingPrefs, favourites, recentPrayers } from "@/lib/practice/preferences";
import { getPrayer } from "@/lib/practice/prayers";
import { ReadingControls } from "@/components/practice/reading-controls";
import { PrayerText } from "@/components/practice/prayer-text";

const PREVIEW = getPrayer("buddha-vandana");

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A0701E] mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function PreferencesView() {
  const prefs = readingPrefs.use();
  const favs = favourites.use();
  const recent = recentPrayers.use();
  const [cleared, setCleared] = useState<string | null>(null);

  function clear(what: "history" | "saved") {
    if (what === "history") recentPrayers.set([]);
    else favourites.set([]);
    setCleared(what);
    setTimeout(() => setCleared(null), 2000);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-[#2A1A1C]">Settings</h1>
        <p className="mt-1 text-[15px] text-[#5B5350]">Saved on this device. No account needed.</p>
      </header>

      <Section title="Reading">
        <div className="rounded-3xl bg-white border border-[#E7DCC8] p-4">
          <ReadingControls prefs={prefs} />
          {PREVIEW && (
            <div className="mt-4 rounded-2xl bg-[#FFFCF6] border border-[#EFE5D3] px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7F76] mb-2">Preview</p>
              <PrayerText prayer={PREVIEW} prefs={prefs} />
            </div>
          )}
        </div>
      </Section>

      <Section title="Practice">
        <label className="flex items-center justify-between gap-4 rounded-3xl bg-white border border-[#E7DCC8] px-5 py-4 cursor-pointer">
          <span>
            <span className="block font-semibold text-[#2A1A1C]">Keep screen on</span>
            <span className="block text-sm text-[#5B5350]">During guided sessions and meditation</span>
          </span>
          <input
            type="checkbox"
            role="switch"
            checked={prefs.keepAwake}
            onChange={(e) => readingPrefs.set({ ...prefs, keepAwake: e.target.checked })}
            className="sr-only peer"
          />
          <span
            aria-hidden
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors flex-shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-[#6D252C]/40",
              prefs.keepAwake ? "bg-[#6D252C]" : "bg-[#D8CFC1]",
            )}
          >
            <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all", prefs.keepAwake ? "left-6" : "left-1")} />
          </span>
        </label>
      </Section>

      <Section title="Your data">
        <div className="rounded-3xl bg-white border border-[#E7DCC8] divide-y divide-[#EFE5D3]">
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <span>
              <span className="block font-semibold text-[#2A1A1C]">Recently opened</span>
              <span className="block text-sm text-[#5B5350]">{recent.length} {recent.length === 1 ? "prayer" : "prayers"}</span>
            </span>
            <button
              type="button"
              disabled={recent.length === 0}
              onClick={() => clear("history")}
              className="rounded-full border border-[#6D252C]/25 px-4 py-2 text-sm font-semibold text-[#6D252C] disabled:opacity-40"
            >
              {cleared === "history" ? "Cleared" : "Clear"}
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 px-5 py-4">
            <span>
              <span className="block font-semibold text-[#2A1A1C]">Saved prayers</span>
              <span className="block text-sm text-[#5B5350]">{favs.length} saved</span>
            </span>
            <button
              type="button"
              disabled={favs.length === 0}
              onClick={() => clear("saved")}
              className="rounded-full border border-[#6D252C]/25 px-4 py-2 text-sm font-semibold text-[#6D252C] disabled:opacity-40"
            >
              {cleared === "saved" ? "Removed" : "Remove all"}
            </button>
          </div>
        </div>
        <p className="mt-3 flex gap-2 text-xs text-[#7A706B] leading-relaxed">
          <ShieldCheck className="h-4 w-4 flex-shrink-0 text-[#87977A]" />
          Your prayer history, saved prayers and settings are stored only on this device. They are never sent to us or shared.
        </p>
      </Section>

      <Section title="About">
        <div className="rounded-3xl bg-white border border-[#E7DCC8] divide-y divide-[#EFE5D3]">
          {[
            { href: "/privacy", label: "Privacy policy" },
            { href: "/terms", label: "Terms of use" },
            { href: "/contact", label: "Contact us" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="flex items-center justify-between px-5 py-4 text-[15px] font-medium text-[#2A1A1C]">
              {l.label}
              <ChevronRight className="h-4 w-4 text-[#B5AA9F]" />
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
