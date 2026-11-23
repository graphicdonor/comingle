"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, Flower2, BookOpen, Lock } from "lucide-react";
import { SkyScene } from "@/components/visuals/sky-scene";
import { PostureFigure } from "@/components/visuals/posture-figure";
import { cn } from "@/lib/utils";
import { useLocalNow } from "@/lib/practice/client-hooks";
import { SESSIONS, sessionForHour, sessionMinutes, sessionPrayers, type PracticeSession } from "@/lib/practice/sessions";
import { verseForDate } from "@/lib/practice/verses";
import { getPrayer } from "@/lib/practice/prayers";
import { readingPrefs, recentPrayers } from "@/lib/practice/preferences";
import { GUIDES } from "@/lib/learn/guides";
import { useT } from "@/lib/i18n/use-t";
import type { MessageKey } from "@/lib/i18n/dictionary";

function greetingKey(hour: number): MessageKey {
  if (hour >= 3 && hour < 12) return "today.greeting.morning";
  if (hour >= 12 && hour < 17) return "today.greeting.afternoon";
  if (hour >= 17 && hour < 22) return "today.greeting.evening";
  return "today.greeting.night";
}

const EASE = [0.16, 1, 0.3, 1] as const;
const fadeUp = (i: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay: 0.07 * i, ease: EASE },
});
const MotionLink = motion.create(Link);

export function TodayView() {
  const now = useLocalNow();
  const prefs = readingPrefs.use();
  const recent = recentPrayers.use();
  const [chosen, setChosen] = useState<PracticeSession["id"] | null>(null);

  const lang = prefs.translation;
  const { t, lang: ui } = useT();
  const other = ui === "hi" ? "en" : "hi";
  const sessionId = chosen ?? (now ? sessionForHour(now.getHours()) : null);
  const session = SESSIONS.find((s) => s.id === sessionId);
  const verse = now ? verseForDate(now) : null;
  const lastPrayer = recent[0] ? getPrayer(recent[0]) : undefined;

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <motion.section {...fadeUp(0)} aria-label={t("today.aria.greeting")} className="pt-1">
        {now ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A0701E]">
              {now.toLocaleDateString(ui === "hi" ? "hi-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="mt-1.5 text-[32px] leading-[1.1] font-bold tracking-tight text-[#2A1A1C]">{t(greetingKey(now.getHours()))}</h1>
          </>
        ) : (
          <div className="space-y-2.5" aria-hidden>
            <div className="h-3 w-36 rounded-full bg-[#EFE7D8]" />
            <div className="h-8 w-56 rounded-full bg-[#EFE7D8]" />
          </div>
        )}
        <p className="mt-2 text-[15px] text-[#5B5350] leading-relaxed">
          {t("today.tagline")}
        </p>
      </motion.section>

      {/* Today's practice */}
      <motion.section {...fadeUp(1)} aria-label={t("today.aria.practice")}>
        {session ? (
          <div className="relative overflow-hidden rounded-[28px] bg-[#6D252C] text-[#F7F2E8] px-6 pt-5 pb-6 shadow-[0_18px_40px_-20px_rgba(109,37,44,0.7)]">
            <SkyScene key={session.id} variant={session.id} className="pointer-events-none absolute -right-6 -top-2 w-60" />

            <div role="tablist" aria-label={t("today.practiceTime")} className="relative inline-flex rounded-full bg-white/10 p-0.5 mb-5">
              {SESSIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={s.id === session.id}
                  onClick={() => setChosen(s.id)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors",
                    s.id === session.id ? "bg-[#F7F2E8] text-[#6D252C]" : "text-[#F7F2E8]/75 hover:text-[#F7F2E8]",
                  )}
                >
                  {s.id === "morning" ? t("today.morning") : t("today.evening")}
                </button>
              ))}
            </div>

            <motion.div key={`${session.id}-text`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
            <h2 lang={ui} className="relative text-2xl font-bold leading-tight">{session.title[ui]}</h2>
            <p lang={other} className="relative text-sm text-[#F7F2E8]/75">{session.title[other]}</p>
            <p lang={ui} className="relative mt-3 text-sm text-[#F7F2E8]/85 leading-relaxed">{session.description[ui]}</p>

            <ol className="relative mt-5 space-y-2.5">
              {sessionPrayers(session).map((p, i) => (
                <motion.li
                  key={p.slug}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease: EASE }}
                  className="flex items-center gap-3"
                >
                  <span className="h-6 w-6 rounded-full border border-[#D99A38]/70 text-[#E9BE73] text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-pali text-[17px]">{p.title.pi}</span>
                  <span className="ml-auto text-xs text-[#F7F2E8]/60">{t("common.min", { n: p.durationMinutes })}</span>
                </motion.li>
              ))}
            </ol>
            </motion.div>

            <MotionLink
              whileTap={{ scale: 0.97 }}
              href={`/practice/session/${session.id}`}
              className="relative mt-6 flex items-center justify-center gap-2 rounded-full bg-[#F7F2E8] text-[#6D252C] py-3.5 text-[15px] font-bold hover:bg-white transition-colors"
            >
              <Play className="h-4 w-4 fill-current" />
              {t("common.begin", { n: sessionMinutes(session) })}
            </MotionLink>
          </div>
        ) : (
          <div className="h-[396px] rounded-[28px] bg-[#EFE7D8] animate-pulse" aria-hidden />
        )}
      </motion.section>

      {/* Today's verse */}
      <motion.section {...fadeUp(2)} aria-labelledby="verse-heading">
        <h2 id="verse-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A0701E] mb-3">
          {t("today.verse")}
        </h2>
        {verse ? (
          <figure className="rounded-[28px] bg-[#FFFCF6] border border-[#E7DCC8] px-6 py-6">
            <blockquote>
              <p lang="pi-Latn" className="font-pali text-[19px] leading-[1.65] text-[#2A1A1C]">
                {verse.pi.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </p>
              <p lang={lang} className="mt-4 text-[15px] leading-relaxed text-[#4A4340]">{verse[lang]}</p>
            </blockquote>
            <figcaption className="mt-4 flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-[#6D252C]">{verse.reference}</span>
              {verse.review !== "reviewed" && <span className="text-[#8A7F76]">{t("today.draftTranslation")}</span>}
            </figcaption>
          </figure>
        ) : (
          <div className="h-48 rounded-[28px] bg-[#EFE7D8] animate-pulse" aria-hidden />
        )}
      </motion.section>

      {/* Meditate */}
      <motion.section {...fadeUp(3)} aria-labelledby="sit-heading">
        <div className="flex items-baseline justify-between mb-3">
          <h2 id="sit-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A0701E]">
            {t("today.sit")}
          </h2>
          <Link href="/meditate" className="text-xs font-semibold text-[#6D252C]">{t("today.allPractices")}</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[3, 5, 10].map((m) => (
            <MotionLink
              whileTap={{ scale: 0.95 }}
              key={m}
              href={`/meditate?practice=breathing&minutes=${m}`}
              className="rounded-3xl bg-white border border-[#E7DCC8] px-3 py-4 text-center hover:border-[#C6A15B] transition-colors"
            >
              <Flower2 className="mx-auto h-5 w-5 text-[#87977A]" strokeWidth={1.8} />
              <span className="mt-2 block text-2xl font-bold text-[#2A1A1C] leading-none">{m}</span>
              <span className="mt-1 block text-[11px] font-medium text-[#7A706B]">{t("today.minBreathing")}</span>
            </MotionLink>
          ))}
        </div>
      </motion.section>

      {/* Continue */}
      {lastPrayer && (
        <motion.section {...fadeUp(4)} aria-labelledby="continue-heading">
          <h2 id="continue-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A0701E] mb-3">
            {t("today.continue")}
          </h2>
          <Link
            href={`/practice/${lastPrayer.slug}`}
            className="flex items-center gap-4 rounded-3xl bg-white border border-[#E7DCC8] px-5 py-4 hover:border-[#C6A15B] transition-colors"
          >
            <BookOpen className="h-5 w-5 text-[#6D252C] flex-shrink-0" strokeWidth={1.8} />
            <div className="min-w-0 flex-1">
              <p className="font-pali text-lg font-semibold text-[#2A1A1C] truncate">{lastPrayer.title.pi}</p>
              <p lang={lang} className="text-sm text-[#5B5350] truncate">{lastPrayer.title[lang]}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-[#6D252C]/50 flex-shrink-0" />
          </Link>
        </motion.section>
      )}

      {/* New to practice */}
      <motion.section {...fadeUp(5)} aria-labelledby="learn-heading">
        <h2 id="learn-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A0701E] mb-3">
          {t("today.newToPractice")}
        </h2>
        <div className="-mx-4 px-4 flex gap-3 overflow-x-auto pb-1 snap-x scroll-px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {GUIDES.map((g) => {
            return (
              <MotionLink
                whileTap={{ scale: 0.97 }}
                key={g.slug}
                href={`/learn/${g.slug}`}
                className="snap-start flex-shrink-0 w-[44%] rounded-3xl bg-[#EEF0E8] border border-[#D9DECF] px-4 pt-2 pb-4 hover:border-[#87977A] transition-colors"
              >
                <PostureFigure id={g.cover} decorative still className="h-28 mx-auto" />
                <p lang={ui} className="mt-1 font-bold text-[#2A1A1C] leading-tight">{g.title[ui]}</p>
                <p lang={other} className="text-xs text-[#5B5350]">{g.title[other]}</p>
                <p className="mt-2 text-[11px] font-medium text-[#56634A]">{t("common.minRead", { n: g.minutes })}</p>
              </MotionLink>
            );
          })}
        </div>
      </motion.section>

      <p className="flex items-center justify-center gap-1.5 text-xs text-[#8A7F76] pb-2">
        <Lock className="h-3.5 w-3.5" />
        {t("today.private")}
      </p>
    </div>
  );
}
