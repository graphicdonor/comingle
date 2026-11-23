"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prayer } from "@/lib/practice/prayers";
import type { PracticeSession } from "@/lib/practice/sessions";
import { readingPrefs } from "@/lib/practice/preferences";
import { useWakeLock } from "@/lib/practice/client-hooks";
import { PostureAnimation } from "@/components/visuals/posture-figure";
import { PrayerText, ReviewNotice } from "./prayer-text";
import { ReadingControls } from "./reading-controls";
import { useT } from "@/lib/i18n/use-t";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Distraction-free, one-prayer-at-a-time guided session (PRD §7.6). */
export function SessionPlayer({ session, prayers }: { session: PracticeSession; prayers: Prayer[] }) {
  const prefs = readingPrefs.use();
  const { t, lang: ui } = useT();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [activeLine, setActiveLine] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const done = step >= prayers.length;
  const prayer = prayers[Math.min(step, prayers.length - 1)];

  useWakeLock(prefs.keepAwake && !done);

  function go(to: number) {
    setDirection(to > step ? 1 : -1);
    setStep(to);
    setActiveLine(null);
    scroller.current?.scrollTo({ top: 0 });
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed inset-0 z-50 flex flex-col bg-[#F7F2E8]">
        {/* Top bar */}
        <div className="flex-shrink-0 pt-[env(safe-area-inset-top)]">
          <div className="max-w-xl mx-auto px-4 h-14 flex items-center gap-3">
            <Link href="/app" aria-label={t("common.endSession")} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-[#6D252C] hover:bg-[#EFE7D8]">
              <X className="h-5 w-5" />
            </Link>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#2A1A1C] truncate">{session.title[ui]}</p>
              {!done && (
                <p className="text-xs text-[#6E6560]">
                  {t("session.progress", { i: step + 1, n: prayers.length })}
                </p>
              )}
            </div>
            {!done && (
              <button
                type="button"
                aria-label={t("session.options")}
                aria-expanded={showControls}
                onClick={() => setShowControls((v) => !v)}
                className={cn("w-10 h-10 rounded-full flex items-center justify-center text-[#6D252C]", showControls ? "bg-[#EFE7D8]" : "hover:bg-[#EFE7D8]")}
              >
                <Type className="h-5 w-5" />
              </button>
            )}
          </div>
          <div className="max-w-xl mx-auto px-4">
            <div className="flex gap-1.5" aria-hidden>
              {prayers.map((p, i) => (
                <span key={p.slug} className="relative h-1 flex-1 rounded-full bg-[#E2D7C3] overflow-hidden">
                  <motion.span
                    className={cn("absolute inset-y-0 left-0 rounded-full", i === step && !done ? "bg-[#D99A38]" : "bg-[#6D252C]")}
                    initial={false}
                    animate={{ width: i < step || done ? "100%" : i === step ? "35%" : "0%" }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div ref={scroller} className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="max-w-xl mx-auto px-5 py-6">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              {done ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="min-h-[62vh] flex flex-col items-center justify-center text-center"
                >
                  <PostureAnimation id="bow" decorative className="h-56 w-40" />
                  <p className="mt-6 font-pali text-3xl text-[#6D252C]">Sādhu · sādhu · sādhu</p>
                  <p className="mt-4 text-[15px] text-[#5B5350] max-w-xs leading-relaxed">
                    {t("session.complete")}
                  </p>
                  <Link href="/app" className="mt-8 rounded-full bg-[#6D252C] text-[#F7F2E8] px-8 py-3 text-sm font-bold">
                    {t("common.backToToday")}
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key={prayer.slug + step}
                  custom={direction}
                  variants={{
                    enter: (d: number) => ({ opacity: 0, x: 40 * d }),
                    center: { opacity: 1, x: 0 },
                    exit: (d: number) => ({ opacity: 0, x: -40 * d }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  {showControls && <ReadingControls prefs={prefs} className="rounded-2xl bg-white border border-[#E7DCC8] p-3 mb-5" />}
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#885F19]">{prayer.category[ui]}</p>
                  <h1 className="font-pali text-[28px] font-semibold text-[#3A1418] leading-tight mt-1">{prayer.title.pi}</h1>
                  <p lang={prefs.translation} className="text-sm text-[#5B5350]">{prayer.title[prefs.translation]}</p>
                  <p className="mt-4 text-xs text-[#6D645D]">{t("session.tapLine")}</p>
                  <PrayerText
                    prayer={prayer}
                    prefs={prefs}
                    className="mt-5"
                    activeLine={activeLine}
                    onLineSelect={(key) => setActiveLine((cur) => (cur === key ? null : key))}
                  />
                  <div className="mt-8">
                    <ReviewNotice prayer={prayer} prefs={prefs} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Step controls */}
        {!done && (
          <div className="flex-shrink-0 border-t border-[#E7DCC8] bg-[#FFFCF6] pb-[env(safe-area-inset-bottom)]">
            <div className="max-w-xl mx-auto px-4 py-3 flex gap-3">
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => go(step - 1)}
                disabled={step === 0}
                className="flex items-center justify-center gap-1 rounded-full border border-[#6D252C]/25 text-[#6D252C] px-5 py-3 text-sm font-semibold disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" /> {t("session.back")}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => go(step + 1)}
                className="flex-1 flex items-center justify-center gap-1 rounded-full bg-[#6D252C] text-[#F7F2E8] py-3 text-sm font-bold"
              >
                {step === prayers.length - 1 ? t("session.finish") : (
                  <>
                    {t("session.next")} <span className="font-pali font-semibold">{prayers[step + 1].title.pi}</span> <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
