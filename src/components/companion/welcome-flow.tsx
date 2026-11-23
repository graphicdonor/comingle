"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Flower2, GraduationCap, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { uiLang, useT } from "@/lib/i18n/use-t";
import type { UiLang } from "@/lib/i18n/dictionary";
import { readingPrefs, welcomeDone } from "@/lib/practice/preferences";
import { getPrayer } from "@/lib/practice/prayers";
import { PostureAnimation } from "@/components/visuals/posture-figure";
import { PrayerText } from "@/components/practice/prayer-text";
import { ReadingControls } from "@/components/practice/reading-controls";

// First-launch welcome (PRD §7.1): pick the interface language, a short
// introduction, then reading preferences. Skippable at every step, needs no
// account, and everything chosen stays on the device.

const APP_ROUTES = ["/app", "/practice", "/meditate", "/learn", "/preferences"];
const PREVIEW = getPrayer("buddha-vandana");
const EASE = [0.16, 1, 0.3, 1] as const;

function chooseLanguage(lang: UiLang) {
  uiLang.set(lang);
  // Start translations in the same language; it can be changed separately.
  readingPrefs.set({ ...readingPrefs.get(), translation: lang });
}

export function WelcomeFlow() {
  const pathname = usePathname();
  const done = welcomeDone.use();
  const { t } = useT();
  const prefs = readingPrefs.use();
  const [step, setStep] = useState(0);

  // Policy pages (privacy, terms…) are linked from outside the app and must
  // open directly, so the welcome only appears on the app's own screens.
  const onAppRoute = APP_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  if (done || !onAppRoute) return null;

  const finish = () => welcomeDone.set(true);
  const browserHindi = typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("hi");

  return (
    <div role="dialog" aria-modal="true" aria-label={t("aria.welcome")} className="fixed inset-0 z-[60] flex flex-col bg-[#F7F2E8]">
      <div className="flex-shrink-0 pt-[env(safe-area-inset-top)]">
        <div className="max-w-md mx-auto h-14 px-5 flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className={cn("h-1.5 rounded-full transition-all duration-500", i === step ? "w-6 bg-[#6D252C]" : "w-1.5 bg-[#D8CFC1]")} />
            ))}
          </div>
          <button type="button" onClick={finish} className="text-sm font-semibold text-[#7A706B] px-2 py-1">
            {t("welcome.skip")}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-6 pb-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {step === 0 && (
                <div className="pt-6 text-center">
                  <p className="text-3xl font-bold tracking-tight text-[#6D252C]">WePray</p>
                  <h1 className="mt-6 text-2xl font-bold text-[#2A1A1C] leading-snug">
                    <span lang="hi" className="block">अपनी भाषा चुनें</span>
                    <span lang="en" className="block text-lg font-semibold text-[#7A706B] mt-1">Choose your language</span>
                  </h1>
                  <div className="mt-8 space-y-3">
                    {(browserHindi ? (["hi", "en"] as const) : (["en", "hi"] as const)).map((l) => (
                      <button
                        key={l}
                        type="button"
                        lang={l}
                        onClick={() => {
                          chooseLanguage(l);
                          setStep(1);
                        }}
                        className="w-full rounded-3xl border px-6 py-5 text-left transition-colors bg-white border-[#E7DCC8] text-[#2A1A1C] hover:border-[#6D252C] active:bg-[#6D252C] active:text-[#F7F2E8]"
                      >
                        <span className="block text-xl font-bold">{l === "hi" ? "हिन्दी" : "English"}</span>
                        <span className="block text-sm mt-0.5 text-[#7A706B]">
                          {l === "hi" ? "Hindi" : "अंग्रेज़ी"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="pt-2">
                  <PostureAnimation id="bow" decorative className="mx-auto h-56 w-40" />
                  <h1 className="mt-4 text-[26px] font-bold leading-tight text-[#2A1A1C] text-center">{t("welcome.introTitle")}</h1>
                  <p className="mt-3 text-[15px] text-[#5B5350] leading-relaxed text-center">{t("welcome.introBody")}</p>
                  <ul className="mt-7 space-y-3">
                    {(
                      [
                        [BookOpen, "welcome.point.prayers"],
                        [Flower2, "welcome.point.practice"],
                        [GraduationCap, "welcome.point.learn"],
                        [Lock, "welcome.point.private"],
                      ] as const
                    ).map(([Icon, key]) => (
                      <li key={key} className="flex items-start gap-3 rounded-2xl bg-white border border-[#E7DCC8] px-4 py-3">
                        <Icon className="h-5 w-5 text-[#6D252C] flex-shrink-0 mt-0.5" strokeWidth={1.8} />
                        <span className="text-[15px] text-[#2A1A1C] leading-snug">{t(key)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {step === 2 && (
                <div className="pt-4">
                  <h1 className="text-[26px] font-bold leading-tight text-[#2A1A1C]">{t("welcome.readingTitle")}</h1>
                  <p className="mt-2 text-[15px] text-[#5B5350] leading-relaxed">{t("welcome.readingBody")}</p>
                  <ReadingControls prefs={prefs} className="mt-6 rounded-3xl bg-white border border-[#E7DCC8] p-4" />
                  {PREVIEW && (
                    <div className="mt-4 rounded-3xl bg-[#FFFCF6] border border-[#E7DCC8] px-5 py-5">
                      <p className="font-pali text-lg font-semibold text-[#3A1418] mb-3">{PREVIEW.title.pi}</p>
                      <PrayerText prayer={PREVIEW} prefs={prefs} />
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {step > 0 && (
        <div className="flex-shrink-0 border-t border-[#E7DCC8] bg-[#FFFCF6] pb-[env(safe-area-inset-bottom)]">
          <div className="max-w-md mx-auto px-6 py-3">
            <button
              type="button"
              onClick={() => (step === 2 ? finish() : setStep(step + 1))}
              className="w-full rounded-full bg-[#6D252C] text-[#F7F2E8] py-3.5 text-[15px] font-bold"
            >
              {step === 2 ? t("welcome.start") : t("welcome.next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
