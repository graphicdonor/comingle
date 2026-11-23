"use client";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prayer } from "@/lib/practice/prayers";
import { paliToDevanagari } from "@/lib/practice/pali-devanagari";
import { TEXT_SIZE_MIN, type ReadingPrefs } from "@/lib/practice/preferences";
import { useT } from "@/lib/i18n/use-t";

const PALI_SIZES = [16, 19, 22, 26, 30];
const TRANSLATION_SIZES = [14, 16, 18, 21, 24];

/** Review notices: unreviewed content is always labelled, never passed off as final. */
export function ReviewNotice({ prayer, prefs }: { prayer: Prayer; prefs: ReadingPrefs }) {
  const showPali = prefs.mode !== "translation";
  const showTranslation = prefs.mode !== "pali";
  const lang = prefs.translation;
  const { t } = useT();
  const notes: string[] = [];
  if (showPali && prayer.review.pali.status !== "reviewed") notes.push(t("prayers.notice.pali"));
  if (showPali && prefs.script === "devanagari") notes.push(t("prayers.notice.devanagari"));
  if (showTranslation && prayer.review[lang].status !== "reviewed") {
    notes.push(t("prayers.notice.translation", { lang: t(lang === "hi" ? "common.lang.hi" : "common.lang.en") }));
  }
  if (notes.length === 0) return null;

  return (
    <div className="flex gap-2.5 rounded-2xl bg-[#FBF3E2] border border-[#EBD3A3] px-4 py-3 text-xs text-[#6B4A12] leading-relaxed">
      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <div className="space-y-1">
        {notes.map((n) => (
          <p key={n}>{n}</p>
        ))}
      </div>
    </div>
  );
}

/** The prayer's lines, laid out according to the reader's preferences. */
export function PrayerText({
  prayer,
  prefs,
  className,
  activeLine,
  onLineSelect,
}: {
  prayer: Prayer;
  prefs: ReadingPrefs;
  className?: string;
  /** Key ("section-line") of the line the reader is keeping their place on. */
  activeLine?: string | null;
  /** When given, lines can be tapped to mark the reader's place. */
  onLineSelect?: (key: string) => void;
}) {
  const lang = prefs.translation;
  const showPali = prefs.mode !== "translation";
  const showTranslation = prefs.mode !== "pali";
  const devanagari = prefs.script === "devanagari";
  const sizeIndex = prefs.size - TEXT_SIZE_MIN;
  const { t, lang: ui } = useT();

  return (
    <div className={cn("space-y-7", className)}>
      {prayer.sections.map((section, si) => (
        <section key={si}>
          {(section.heading || section.repeat) && (
            <div className="flex items-center gap-2 mb-3">
              {section.heading && (
                <h2 lang={ui} className="text-xs font-semibold uppercase tracking-wider text-[#A0701E]">
                  {section.heading[ui]}
                </h2>
              )}
              {section.repeat && (
                <span className="text-[11px] font-semibold rounded-full bg-[#EFE7D8] text-[#6D252C] px-2.5 py-0.5">
                  {t("prayers.recite", { n: section.repeat })}
                </span>
              )}
            </div>
          )}
          <div className="space-y-4">
            {section.lines.map((line, li) => {
              const key = `${si}-${li}`;
              const active = activeLine === key;
              return (
              <div
                key={li}
                onClick={onLineSelect ? () => onLineSelect(key) : undefined}
                onKeyDown={onLineSelect ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onLineSelect(key); } } : undefined}
                role={onLineSelect ? "button" : undefined}
                tabIndex={onLineSelect ? 0 : undefined}
                aria-pressed={onLineSelect ? active : undefined}
                className={cn(
                  onLineSelect && "-mx-3 px-3 py-1.5 rounded-2xl border-l-[3px] cursor-pointer transition-colors duration-300",
                  onLineSelect && (active ? "bg-[#FBF0DA] border-[#D99A38]" : "border-transparent"),
                  onLineSelect && activeLine && !active && "opacity-55",
                )}
              >
                {showPali && (
                  <p
                    lang={devanagari ? "pi-Deva" : "pi-Latn"}
                    className={cn(!devanagari && "font-pali", "text-[#2A1A1C] leading-relaxed")}
                    style={{ fontSize: PALI_SIZES[sizeIndex] }}
                  >
                    {devanagari ? paliToDevanagari(line.pi) : line.pi}
                  </p>
                )}
                {showTranslation && (
                  <p
                    lang={lang}
                    className={cn(showPali ? "text-[#5B5350] mt-1" : "text-[#2A1A1C]", "leading-relaxed")}
                    style={{ fontSize: showPali ? TRANSLATION_SIZES[sizeIndex] : PALI_SIZES[sizeIndex] - 2 }}
                  >
                    {line[lang]}
                  </p>
                )}
              </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
