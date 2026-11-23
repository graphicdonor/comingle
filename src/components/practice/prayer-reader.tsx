"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Share2, Volume2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prayer } from "@/lib/practice/prayers";
import { readingPrefs, favourites, toggleFavourite, markPrayerOpened } from "@/lib/practice/preferences";
import { PrayerText, ReviewNotice } from "./prayer-text";
import { ReadingControls } from "./reading-controls";

export function PrayerReader({ prayer }: { prayer: Prayer }) {
  const prefs = readingPrefs.use();
  const favs = favourites.use();
  const [shared, setShared] = useState(false);
  const isFav = favs.includes(prayer.slug);
  const lang = prefs.translation;

  useEffect(() => {
    markPrayerOpened(prayer.slug);
  }, [prayer.slug]);

  async function share() {
    const url = window.location.href;
    const title = `${prayer.title.pi} — ${prayer.title[lang]}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // User dismissed the share sheet or clipboard is blocked; nothing to do.
    }
  }

  return (
    <article className="pb-6">
      <header className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#A0701E] mb-1">
          {prayer.category.en} · {prayer.durationMinutes} min
        </p>
        <h1 className="font-pali text-3xl font-semibold text-[#3A1418] leading-tight">{prayer.title.pi}</h1>
        <p className="text-base text-[#4A4340] mt-1">
          {prayer.title.en} · <span lang="hi">{prayer.title.hi}</span>
        </p>
        <p className="text-sm text-[#5B5350] mt-3 leading-relaxed">{prayer.summary.en}</p>

        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            onClick={() => toggleFavourite(prayer.slug)}
            aria-pressed={isFav}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold border transition-colors",
              isFav ? "bg-[#6D252C] text-white border-[#6D252C]" : "bg-white text-[#6D252C] border-[#6D252C]/30 hover:border-[#6D252C]",
            )}
          >
            <motion.span
              initial={false}
              animate={{ scale: isFav ? [1, 1.45, 1] : 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="inline-flex"
            >
              <Heart className={cn("h-4 w-4", isFav && "fill-current")} />
            </motion.span>
            {isFav ? "Saved" : "Save"}
          </button>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold border bg-white text-[#6D252C] border-[#6D252C]/30 hover:border-[#6D252C] transition-colors"
          >
            {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {shared ? "Link copied" : "Share"}
          </button>
        </div>
      </header>

      <div className="flex items-center gap-3 rounded-2xl bg-white border border-[#E7DCC8] px-4 py-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-[#F7F2E8] flex items-center justify-center flex-shrink-0">
          <Volume2 className="h-4 w-4 text-[#A0701E]" />
        </div>
        <p className="text-sm text-[#5B5350]">
          {prayer.audio ? prayer.audio.credit : "Chanting audio for this prayer isn't available yet."}
        </p>
      </div>

      <ReadingControls prefs={prefs} className="rounded-2xl bg-white border border-[#E7DCC8] p-3 mb-4" />

      <ReviewNotice prayer={prayer} prefs={prefs} />

      <PrayerText prayer={prayer} prefs={prefs} className="mt-5 rounded-3xl bg-[#FFFCF6] border border-[#E7DCC8] px-5 py-6" />

      <footer className="mt-6 space-y-3 text-sm">
        {prayer.notes && (
          <p lang={lang} className="text-[#5B5350] leading-relaxed">
            {prayer.notes[lang]}
          </p>
        )}
        <dl className="rounded-2xl bg-white border border-[#E7DCC8] px-4 py-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
          <dt className="text-[#7A706B]">Source</dt>
          <dd className="font-pali text-[#2A1A1C]">
            {prayer.source.title} — {prayer.source.reference}
          </dd>
          <dt className="text-[#7A706B]">Tradition</dt>
          <dd className="text-[#2A1A1C]">{prayer.tradition}</dd>
          <dt className="text-[#7A706B]">Review</dt>
          <dd className="text-[#2A1A1C]">
            Pali: {prayer.review.pali.status} · Hindi: {prayer.review.hi.status} · English: {prayer.review.en.status}
          </dd>
        </dl>
      </footer>
    </article>
  );
}
