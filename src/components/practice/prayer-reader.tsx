"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Share2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prayer } from "@/lib/practice/prayers";
import { readingPrefs, favourites, toggleFavourite, markPrayerOpened } from "@/lib/practice/preferences";
import { PrayerText, ReviewNotice } from "./prayer-text";
import { ReadingControls } from "./reading-controls";
import { useT } from "@/lib/i18n/use-t";
import { usePrayerVoice } from "@/lib/practice/use-prayer-voice";
import { useWakeLock } from "@/lib/practice/client-hooks";
import { ListenPanel, useFollowLine } from "./listen-panel";

export function PrayerReader({ prayer }: { prayer: Prayer }) {
  const prefs = readingPrefs.use();
  const favs = favourites.use();
  const [shared, setShared] = useState(false);
  const isFav = favs.includes(prayer.slug);
  const lang = prefs.translation;
  const { t, lang: ui } = useT();
  const other = ui === "hi" ? "en" : "hi";
  const voice = usePrayerVoice(prayer, prefs);
  const listening = !prayer.audio && voice.status !== "idle";
  useFollowLine(voice.status === "playing" ? voice.activeLine : null);
  useWakeLock(prefs.keepAwake && voice.status === "playing");

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
        <p className="text-xs font-semibold uppercase tracking-wider text-[#885F19] mb-1">
          {prayer.category[ui]} · {t("common.min", { n: prayer.durationMinutes })}
        </p>
        <h1 className="font-pali text-3xl font-semibold text-[#3A1418] leading-tight">{prayer.title.pi}</h1>
        <p className="text-base text-[#4A4340] mt-1">
          <span lang={ui}>{prayer.title[ui]}</span> · <span lang={other}>{prayer.title[other]}</span>
        </p>
        <p lang={ui} className="text-sm text-[#5B5350] mt-3 leading-relaxed">{prayer.summary[ui]}</p>

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
            {isFav ? t("prayers.saved") : t("prayers.save")}
          </button>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold border bg-white text-[#6D252C] border-[#6D252C]/30 hover:border-[#6D252C] transition-colors"
          >
            {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {shared ? t("prayers.linkCopied") : t("prayers.share")}
          </button>
        </div>
      </header>

      <ListenPanel prayer={prayer} voice={voice} />

      <ReadingControls prefs={prefs} className="rounded-2xl bg-white border border-[#E7DCC8] p-3 mb-4" />

      <ReviewNotice prayer={prayer} prefs={prefs} />

      <PrayerText
        prayer={prayer}
        prefs={prefs}
        activeLine={listening ? voice.activeLine : null}
        onLineSelect={!prayer.audio && voice.isSupported ? voice.playFromLine : undefined}
        className="mt-5 rounded-3xl bg-[#FFFCF6] border border-[#E7DCC8] px-5 py-6" />

      <footer className="mt-6 space-y-3 text-sm">
        {prayer.notes && (
          <p lang={ui} className="text-[#5B5350] leading-relaxed">
            {prayer.notes[ui]}
          </p>
        )}
        <dl className="rounded-2xl bg-white border border-[#E7DCC8] px-4 py-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
          <dt className="text-[#6E6560]">{t("prayers.source")}</dt>
          <dd className="font-pali text-[#2A1A1C]">
            {prayer.source.title} — {prayer.source.reference}
          </dd>
          <dt className="text-[#6E6560]">{t("prayers.tradition")}</dt>
          <dd className="text-[#2A1A1C]">{prayer.tradition}</dd>
          <dt className="text-[#6E6560]">{t("prayers.review")}</dt>
          <dd className="text-[#2A1A1C]">
            {(["pali", "hi", "en"] as const)
              .map((k) => `${t(k === "pali" ? "common.lang.pi" : k === "hi" ? "common.lang.hi" : "common.lang.en")}: ${t(`common.status.${prayer.review[k].status}`)}`)
              .join(" · ")}
          </dd>
        </dl>
      </footer>
    </article>
  );
}
