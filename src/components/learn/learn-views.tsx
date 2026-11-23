"use client";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { GUIDES, getGuide } from "@/lib/learn/guides";
import { useT } from "@/lib/i18n/use-t";
import { PostureAnimation, PostureFigure } from "@/components/visuals/posture-figure";
import { GuideSteps } from "./guide-steps";

export function LearnIndex() {
  const { t, lang } = useT();
  const other = lang === "hi" ? "en" : "hi";
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[28px] font-bold tracking-tight text-[#2A1A1C]">{t("learn.title")}</h1>
        <p className="mt-1 text-[15px] text-[#5B5350]">{t("learn.intro")}</p>
      </header>
      <ul className="space-y-3">
        {GUIDES.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/learn/${g.slug}`}
              className="flex items-center gap-4 rounded-3xl bg-white border border-[#E7DCC8] px-4 py-4 hover:border-[#C6A15B] transition-colors"
            >
              <span className="h-28 w-24 rounded-2xl bg-[#F3ECDF] flex items-end justify-center flex-shrink-0 overflow-hidden p-1.5">
                <PostureFigure id={g.cover} decorative still className="h-full max-w-full" />
              </span>
              <div className="min-w-0 flex-1">
                <p lang={lang} className="text-lg font-bold text-[#2A1A1C]">{g.title[lang]}</p>
                <p lang={other} className="text-sm text-[#7A706B]">{g.title[other]}</p>
                <p lang={lang} className="mt-2 text-sm text-[#5B5350] leading-relaxed">{g.summary[lang]}</p>
                <p className="mt-2 text-xs font-medium text-[#56634A]">{t("common.minRead", { n: g.minutes })}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-[#6D252C]/50 flex-shrink-0" />
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-xs text-[#8A7F76] leading-relaxed">{t("learn.more")}</p>
    </div>
  );
}

export function GuideView({ slug }: { slug: string }) {
  const { t, lang } = useT();
  const guide = getGuide(slug);
  if (!guide) return null;
  const other = lang === "hi" ? "en" : "hi";

  return (
    <article className="pb-4">
      <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6D252C] mb-4">
        <ArrowLeft className="h-4 w-4" /> {t("learn.title")}
      </Link>
      <header>
        <div className="flex items-end gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A0701E]">{t("learn.guideMeta", { n: guide.minutes })}</p>
            <h1 lang={lang} className="mt-1 text-[30px] font-bold tracking-tight text-[#2A1A1C] leading-tight">{guide.title[lang]}</h1>
            <p lang={other} className="text-base text-[#7A706B]">{guide.title[other]}</p>
          </div>
          <PostureAnimation id={guide.coverAnimation} decorative className="h-40 w-28 flex-shrink-0" />
        </div>
        {guide.intro.map((p) => (
          <p key={p.en} lang={lang} className="mt-4 text-[16px] text-[#4A4340] leading-relaxed">{p[lang]}</p>
        ))}
      </header>

      <GuideSteps guide={guide} />

      {guide.closing && <p lang={lang} className="mt-6 text-[15px] text-[#4A4340] leading-relaxed">{guide.closing[lang]}</p>}

      {guide.review !== "reviewed" && (
        <p className="mt-6 flex gap-2.5 rounded-2xl bg-[#FBF3E2] border border-[#EBD3A3] px-4 py-3 text-xs text-[#6B4A12] leading-relaxed">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {t("learn.draft")}
        </p>
      )}
    </article>
  );
}
