"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, BookOpen, ChevronLeft, ChevronRight, Info, Lightbulb, MessageCircleQuestion, ScrollText, Share2, Sparkles } from "lucide-react";
import {
  CHAPTERS,
  COMMENTARY_INTRO,
  COMMENTARY_STORIES,
  DHP_SOURCES,
  VERSES,
  chapterHref,
  commentaryArt,
  commentaryHref,
  getChapter,
  getCommentaryStory,
  getVerse,
  parseVerseRef,
  storyForVerse,
  verseHref,
  versesOf,
  type CommentaryStory,
  type DhpVerse,
} from "@/lib/learn/dhammapada";
import { dhpBookmarks, dhpHistory, markRead, parseItem, storyItem, toggleBookmark, verseItem, type ReadingItem } from "@/lib/learn/dhammapada-reading";
import { readingPrefs } from "@/lib/practice/preferences";
import { paliToDevanagari } from "@/lib/practice/pali-devanagari";
import { STORY_SPEEDS, useStoryVoice } from "@/lib/learn/use-story-voice";
import { useT } from "@/lib/i18n/use-t";
import { Headphones, Pause, Play, SkipBack, SkipForward, Square } from "lucide-react";

const card = "rounded-3xl bg-white border border-[#E7DCC8] hover:border-[#C6A15B] transition-colors";
const eyebrow = "text-xs font-semibold uppercase tracking-[0.14em] text-[#885F19]";

function usePali() {
  const prefs = readingPrefs.use();
  return (line: string) => (prefs.script === "devanagari" ? paliToDevanagari(line) : line);
}

/** The first line of a verse, for lists. */
function firstLine(v: DhpVerse) {
  return v.pi[0].replace(/[;,]\s*$/, "");
}

// ── Library home ──────────────────────────────────────────────────────────

export function DhpHome() {
  const { t, lang } = useT();
  return (
    <div className="space-y-8 pb-4">
      <div>
        <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6D252C] mb-4">
          <ArrowLeft className="h-4 w-4" /> {t("learn.title")}
        </Link>
        <header className="rounded-3xl bg-[#3A1418] px-5 py-6 text-[#F7F2E8]">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E9BE73]">{t("dhp.tagline")}</p>
          <h1 className="mt-1 text-[34px] font-bold tracking-tight">{t("dhp.title")}</h1>
          <p lang={lang} className="mt-2 text-[15px] leading-relaxed text-[#F7F2E8]/85">{t("dhp.intro")}</p>
          <FindVerse dark />
        </header>
      </div>

      <ContinueAndSaved />

      <section aria-labelledby="dhp-chapters">
        <h2 id="dhp-chapters" className="text-xl font-bold text-[#2A1A1C]">{t("dhp.chapters")}</h2>
        <ol className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {CHAPTERS.map((c) => (
            <li key={c.number}>
              <Link href={chapterHref(c.number)} className={`${card} flex items-center gap-3 px-4 py-3.5`}>
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[#F6E7C8] text-lg font-bold tabular-nums text-[#6D252C]">{c.number}</span>
                <span className="min-w-0 flex-1">
                  <span lang={lang} className="block font-bold text-[#2A1A1C] leading-snug">{c.title[lang]}</span>
                  <span className="block text-sm text-[#6E6560]">
                    <span className="font-pali italic">{c.pi}</span> · {t("dhp.verses", { n: c.to - c.from + 1 })}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#6D252C]/50" />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <CommentarySection />
      <SourcesNote />
    </div>
  );
}

function FindVerse({ dark = false }: { dark?: boolean }) {
  const { t } = useT();
  const router = useRouter();
  const [value, setValue] = useState("");
  const n = parseVerseRef(value);
  const go = (e: FormEvent) => {
    e.preventDefault();
    if (n) router.push(verseHref(n));
  };
  return (
    <form onSubmit={go} className="mt-4 flex gap-2" role="search" aria-label={t("dhp.find")}>
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("dhp.findPlaceholder")}
        aria-label={t("dhp.find")}
        className={`min-w-0 flex-1 rounded-full px-4 py-2.5 text-[15px] outline-none ${dark ? "bg-[#F7F2E8]/10 text-[#F7F2E8] placeholder:text-[#F7F2E8]/50 ring-1 ring-[#F7F2E8]/20 focus:ring-[#E9BE73]" : "bg-white ring-1 ring-[#E7DCC8] focus:ring-[#C6A15B]"}`}
      />
      <button
        type="submit"
        disabled={!n}
        className={`rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-50 ${dark ? "bg-[#E9BE73] text-[#3A1418]" : "bg-[#6D252C] text-[#F7F2E8]"}`}
      >
        {t("dhp.go")}
      </button>
    </form>
  );
}

function itemLink(item: ReadingItem, lang: "en" | "hi") {
  const p = parseItem(item);
  if (p.kind === "verse") {
    const v = getVerse(p.n);
    if (!v) return null;
    return { href: verseHref(v.n), label: `${lang === "hi" ? "धम्मपद" : "Dhammapada"} ${v.n}`, text: v.pi[0] };
  }
  const s = getCommentaryStory(p.slug);
  return s ? { href: commentaryHref(s.slug), label: s.title[lang], text: s.summary[lang] } : null;
}

function ContinueAndSaved() {
  const { t, lang } = useT();
  const history = dhpHistory.use();
  const saved = dhpBookmarks.use();
  const pali = usePali();
  const last = history[0] ? itemLink(history[0], lang) : null;
  const savedLinks = saved.map((i) => [i, itemLink(i, lang)] as const).filter(([, l]) => l);
  if (!last && !savedLinks.length) return null;
  return (
    <section className="space-y-3">
      {last && (
        <Link href={last.href} className={`${card} flex items-center gap-3 px-4 py-4`}>
          <BookOpen className="h-5 w-5 flex-shrink-0 text-[#885F19]" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-[#885F19]">{t("dhp.continue")}</span>
            <span className="block font-bold text-[#2A1A1C]">{last.label}</span>
            <span className="block truncate text-sm text-[#6E6560] font-pali italic">{pali(last.text)}</span>
          </span>
          <ArrowRight className="h-5 w-5 flex-shrink-0 text-[#6D252C]" />
        </Link>
      )}
      {savedLinks.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-[#2A1A1C]">{t("dhp.saved")}</h2>
          <ul className="mt-2 flex gap-2.5 overflow-x-auto pb-1">
            {savedLinks.map(([item, l]) => (
              <li key={item} className="w-56 flex-shrink-0">
                <Link href={l!.href} className={`${card} block h-full px-4 py-3`}>
                  <span className="block text-sm font-bold text-[#2A1A1C]">{l!.label}</span>
                  <span className="mt-0.5 line-clamp-2 block text-sm text-[#6E6560]">{item.startsWith("v:") ? pali(l!.text) : l!.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function SourcesNote() {
  const { t } = useT();
  return (
    <div className="rounded-2xl bg-[#F3ECDF] px-4 py-3 text-xs leading-relaxed text-[#5B5350]">
      <p className="font-semibold text-[#2A1A1C]">{t("dhp.sources")}</p>
      <p className="mt-1">{t("dhp.sourcePali", { title: DHP_SOURCES.pi.title, by: DHP_SOURCES.pi.by, licence: DHP_SOURCES.pi.licence })}</p>
      <p>{t("dhp.sourceEnglish", { by: DHP_SOURCES.en.by, licence: DHP_SOURCES.en.licence })}</p>
      <p className="mt-1">{t("dhp.draftHi")}</p>
    </div>
  );
}

// ── A chapter ─────────────────────────────────────────────────────────────

export function DhpChapterView({ n }: { n: number }) {
  const { t, lang } = useT();
  const pali = usePali();
  const chapter = getChapter(n);
  if (!chapter) return null;
  const prev = getChapter(n - 1);
  const next = getChapter(n + 1);
  const translation = (v: DhpVerse) => (lang === "hi" ? (v.hi ?? v.en) : v.en);
  return (
    <div className="pb-4">
      <Link href="/learn/dhammapada" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6D252C] mb-4">
        <ArrowLeft className="h-4 w-4" /> {t("dhp.title")}
      </Link>
      <header>
        <p className={eyebrow}>
          {t("dhp.chapter", { n: chapter.number })} · {t("dhp.versesRange", { a: chapter.from, b: chapter.to })}
        </p>
        <h1 lang={lang} className="mt-1 text-[30px] font-bold tracking-tight text-[#2A1A1C] leading-tight">{chapter.title[lang]}</h1>
        <p className="text-base text-[#6E6560] font-pali italic">{pali(chapter.pi)}</p>
        {chapter.intro && (
          <p lang={lang} className="mt-3 text-[16px] leading-relaxed text-[#4A4340]">
            {chapter.intro[lang]}
          </p>
        )}
      </header>

      <ol className="mt-6 space-y-2.5">
        {versesOf(chapter).map((v) => (
          <li key={v.n}>
            <Link href={verseHref(v.n)} className={`${card} flex gap-3 px-4 py-3.5`}>
              <span className="w-9 flex-shrink-0 pt-0.5 text-right text-sm font-bold tabular-nums text-[#885F19]">{v.n}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-pali italic text-[#2A1A1C]">{pali(firstLine(v))}…</span>
                <span lang={lang === "hi" && v.hi ? "hi" : "en"} className="mt-1 line-clamp-2 block text-sm leading-relaxed text-[#5B5350]">
                  {translation(v)}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      <nav className="mt-6 flex gap-3" aria-label={t("dhp.chapters")}>
        {prev ? (
          <Link href={chapterHref(prev.number)} className={`${card} flex flex-1 items-center gap-2 px-4 py-3`}>
            <ChevronLeft className="h-5 w-5 text-[#6D252C]" />
            <span className="min-w-0">
              <span className="block text-xs text-[#885F19]">{t("dhp.prevChapter")}</span>
              <span lang={lang} className="block truncate font-bold text-[#2A1A1C]">{prev.title[lang]}</span>
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next && (
          <Link href={chapterHref(next.number)} className={`${card} flex flex-1 items-center justify-end gap-2 px-4 py-3 text-right`}>
            <span className="min-w-0">
              <span className="block text-xs text-[#885F19]">{t("dhp.nextChapter")}</span>
              <span lang={lang} className="block truncate font-bold text-[#2A1A1C]">{next.title[lang]}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-[#6D252C]" />
          </Link>
        )}
      </nav>
    </div>
  );
}

// ── A verse ───────────────────────────────────────────────────────────────

function BookmarkButton({ item }: { item: ReadingItem }) {
  const { t } = useT();
  const saved = dhpBookmarks.use().includes(item);
  const Icon = saved ? BookmarkCheck : Bookmark;
  return (
    <button
      type="button"
      onClick={() => toggleBookmark(item)}
      aria-pressed={saved}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold ${saved ? "bg-[#6D252C] text-[#F7F2E8]" : "bg-[#F3ECDF] text-[#6D252C] hover:bg-[#EADFCB]"}`}
    >
      <Icon className="h-4 w-4" /> {saved ? t("dhp.unsave") : t("dhp.save")}
    </button>
  );
}

function ShareButton({ title, text, url }: { title: string; text: string; url: string }) {
  const { t } = useT();
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const full = `${text}\n\n${title}\n${location.origin}${url}`;
    try {
      if (navigator.share) await navigator.share({ title, text: `${text}\n\n${title}`, url });
      else {
        await navigator.clipboard.writeText(full);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // Cancelled.
    }
  };
  return (
    <button type="button" onClick={share} className="inline-flex items-center gap-1.5 rounded-full bg-[#F3ECDF] px-3.5 py-2 text-sm font-semibold text-[#6D252C] hover:bg-[#EADFCB]">
      <Share2 className="h-4 w-4" /> {copied ? t("dhp.copied") : t("dhp.share")}
    </button>
  );
}

export function DhpVerseView({ n }: { n: number }) {
  const { t, lang } = useT();
  const pali = usePali();
  const prefs = readingPrefs.use();
  const verse = getVerse(n);
  useEffect(() => {
    if (verse) markRead(verseItem(verse.n));
  }, [verse]);
  if (!verse) return null;
  const chapter = getChapter(verse.chapter)!;
  const prev = getVerse(n - 1);
  const next = getVerse(n + 1);
  const story = storyForVerse(n);
  const scale = 1 + prefs.size * 0.1;
  const ref = t("dhp.verseRef", { n });
  const shareText = lang === "hi" && verse.hi ? verse.hi : verse.en;
  const enCredit = verse.enWith ? `${t("dhp.englishBy")} · ${t("dhp.withVerse", { n: verse.enWith.find((x) => x !== n)! })}` : t("dhp.englishBy");

  // The reader's language first, then the other.
  const translations = [
    { key: "hi", label: t("dhp.hindi"), text: verse.hi, credit: null as string | null, draft: true },
    { key: "en", label: t("dhp.english"), text: verse.en, credit: enCredit, draft: false },
  ].sort((a, b) => Number(b.key === lang) - Number(a.key === lang));

  return (
    <article className="pb-4" style={{ fontSize: `${scale}rem` }}>
      <Link href={chapterHref(chapter.number)} className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6D252C] mb-4">
        <ArrowLeft className="h-4 w-4" /> {t("dhp.chapter", { n: chapter.number })} · <span lang={lang}>{chapter.title[lang]}</span>
      </Link>

      <header className="flex items-end justify-between gap-3">
        <div>
          <p className={eyebrow}>
            {t("dhp.title")} · <span className="font-pali normal-case tracking-normal italic">{chapter.pi}</span>
          </p>
          <h1 className="mt-1 text-[32px] font-bold tracking-tight text-[#2A1A1C]">{t("dhp.verse", { n })}</h1>
        </div>
        <div className="flex gap-2">
          <BookmarkButton item={verseItem(n)} />
          <ShareButton title={ref} text={shareText} url={verseHref(n)} />
        </div>
      </header>

      {/* 1. The Pali verse, the source text. */}
      <section aria-label={t("dhp.pali")} className="mt-5 rounded-3xl bg-[#3A1418] px-5 py-6 text-[#F7F2E8]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#E9BE73]">{t("dhp.pali")}</p>
        <div lang="pi" className="mt-3 space-y-1.5 font-pali text-[1.25em] leading-relaxed">
          {verse.pi.map((line) => (
            <p key={line}>{pali(line)}</p>
          ))}
        </div>
      </section>

      {/* 2–3. Translations, each credited. */}
      <div className="mt-4 space-y-3">
        {translations.map((tr) => (
          <section key={tr.key} aria-label={tr.label} className="rounded-3xl border border-[#E7DCC8] bg-white px-5 py-4">
            <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#885F19]">
              {tr.label}
              {tr.text && tr.draft && <span className="rounded-full bg-[#FBF3E2] px-2 py-0.5 normal-case tracking-normal text-[#6B4A12]">{t("dhp.draft")}</span>}
            </p>
            {tr.text ? (
              <p lang={tr.key} className="mt-2 text-[1.1em] leading-relaxed text-[#2A1A1C]">
                {tr.text}
              </p>
            ) : (
              <p className="mt-2 text-sm text-[#6E6560]">{t("dhp.notYet")}</p>
            )}
            {tr.credit && <p className="mt-2 text-xs text-[#6D645D]">{tr.credit}</p>}
          </section>
        ))}
      </div>

      {/* 4–5. Editorial: meaning and reflection, set apart from the text. */}
      {verse.explanation && (
        <section className="mt-6 rounded-3xl bg-[#F3ECDF] px-5 py-5">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#56634A]">
            <Lightbulb className="h-4 w-4" /> {t("dhp.meaning")}
          </p>
          <p lang={lang} className="mt-2 text-[1.02em] leading-relaxed text-[#2A1A1C]">
            {verse.explanation[lang]}
          </p>
          {verse.reflection && (
            <div className="mt-4 border-t border-[#E2D5BE] pt-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#56634A]">
                <MessageCircleQuestion className="h-4 w-4" /> {t("dhp.reflect")}
              </p>
              <p lang={lang} className="mt-2 text-[1.05em] italic leading-relaxed text-[#2A1A1C]">
                {verse.reflection[lang]}
              </p>
            </div>
          )}
          <p className="mt-4 text-[11px] text-[#6D645D]">{t("dhp.editorial")}</p>
        </section>
      )}

      {story && (
        <Link href={commentaryHref(story.slug)} className={`${card} mt-4 flex items-center gap-3 px-4 py-4`}>
          <ScrollText className="h-5 w-5 flex-shrink-0 text-[#885F19]" />
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-[#885F19]">{t("dhp.story")}</span>
            <span lang={lang} className="block font-bold text-[#2A1A1C]">{story.title[lang]}</span>
          </span>
          <ArrowRight className="h-5 w-5 flex-shrink-0 text-[#6D252C]" />
        </Link>
      )}

      <div className="mt-6 space-y-1 text-xs leading-relaxed text-[#6D645D]">
        <p>{t("dhp.sourcePali", { title: DHP_SOURCES.pi.title, by: DHP_SOURCES.pi.by, licence: DHP_SOURCES.pi.licence })}</p>
        <p>{t("dhp.sourceEnglish", { by: DHP_SOURCES.en.by, licence: DHP_SOURCES.en.licence })}</p>
      </div>
      {verse.hi && (
        <p className="mt-3 flex gap-2.5 rounded-2xl border border-[#EBD3A3] bg-[#FBF3E2] px-4 py-3 text-xs leading-relaxed text-[#6B4A12]">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {t("dhp.draftHi")}
        </p>
      )}

      <nav className="mt-6 flex gap-3" aria-label={t("dhp.title")}>
        {prev ? (
          <Link href={verseHref(prev.n)} className={`${card} flex flex-1 items-center gap-2 px-4 py-3`}>
            <ChevronLeft className="h-5 w-5 text-[#6D252C]" />
            <span>
              <span className="block text-xs text-[#885F19]">{t("dhp.prev")}</span>
              <span className="block font-bold text-[#2A1A1C]">{t("dhp.verse", { n: prev.n })}</span>
            </span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
        {next && (
          <Link href={verseHref(next.n)} className={`${card} flex flex-1 items-center justify-end gap-2 px-4 py-3 text-right`}>
            <span>
              <span className="block text-xs text-[#885F19]">{t("dhp.next")}</span>
              <span className="block font-bold text-[#2A1A1C]">{t("dhp.verse", { n: next.n })}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-[#6D252C]" />
          </Link>
        )}
      </nav>
    </article>
  );
}

// ── Commentary stories ────────────────────────────────────────────────────

function StorySeal({ story, large = false }: { story: CommentaryStory; large?: boolean }) {
  return (
    <span aria-hidden className={`flex flex-shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#E8E2F1] to-[#D8CDEA] text-[#45305F] ${large ? "h-24 w-24" : "h-20 w-16"}`}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B5490]">Dhp</span>
      <span className={`font-bold tabular-nums ${large ? "text-3xl" : "text-2xl"}`}>{story.verses[0]}</span>
    </span>
  );
}

function StoryThumb({ story }: { story: CommentaryStory }) {
  const art = commentaryArt(story.slug);
  if (!art) return <StorySeal story={story} />;
  return <Image src={art} alt="" width={88} height={88} sizes="88px" className="h-[88px] w-[88px] flex-shrink-0 rounded-2xl object-cover" />;
}

function CommentaryCard({ story }: { story: CommentaryStory }) {
  const { t, lang } = useT();
  const other = lang === "hi" ? "en" : "hi";
  return (
    <Link href={commentaryHref(story.slug)} className={`${card} flex items-center gap-4 px-4 py-4`}>
      <StoryThumb story={story} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[#885F19]">{story.theme[lang]}</p>
        <p lang={lang} className="text-lg font-bold leading-snug text-[#2A1A1C]">{story.title[lang]}</p>
        <p lang={other} className="text-sm text-[#6E6560]">
          {story.title[other]} · <span className="font-pali italic">{story.title.pi}</span>
        </p>
        <p lang={lang} className="mt-1.5 text-sm leading-relaxed text-[#5B5350]">{story.summary[lang]}</p>
        <p className="mt-1.5 text-xs font-medium text-[#56634A]">{t("dhp.storyMeta", { v: story.verses.join(", "), m: story.minutes })}</p>
      </div>
      <ArrowRight className="h-5 w-5 flex-shrink-0 text-[#6D252C]/50" />
    </Link>
  );
}

function CommentarySection() {
  const { t } = useT();
  return (
    <section aria-labelledby="dhp-stories">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="dhp-stories" className="text-xl font-bold text-[#2A1A1C]">{t("dhp.stories")}</h2>
        <Link href="/learn/dhammapada/stories" className="text-sm font-semibold text-[#6D252C]">
          {t("jataka.all")} ({COMMENTARY_STORIES.length})
        </Link>
      </div>
      <p className="mt-1 text-[15px] text-[#5B5350]">{t("dhp.storiesIntro")}</p>
      <ul className="mt-3 space-y-3">
        {COMMENTARY_STORIES.slice(0, 3).map((s) => (
          <li key={s.slug}>
            <CommentaryCard story={s} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CommentaryIndex() {
  const { t, lang } = useT();
  return (
    <div className="pb-4">
      <Link href="/learn/dhammapada" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6D252C] mb-4">
        <ArrowLeft className="h-4 w-4" /> {t("dhp.title")}
      </Link>
      <header>
        <p className={eyebrow}>{t("jataka.count", { n: COMMENTARY_STORIES.length })}</p>
        <h1 className="mt-1 text-[28px] font-bold tracking-tight text-[#2A1A1C]">{t("dhp.stories")}</h1>
        <p lang={lang} className="mt-2 text-[15px] leading-relaxed text-[#5B5350]">{COMMENTARY_INTRO[lang]}</p>
      </header>
      <ul className="mt-5 space-y-3">
        {COMMENTARY_STORIES.map((s) => (
          <li key={s.slug}>
            <CommentaryCard story={s} />
          </li>
        ))}
      </ul>
    </div>
  );
}

type Voice = ReturnType<typeof useStoryVoice>;

function Listen({ voice, minutes }: { voice: Voice; minutes: number }) {
  const { t } = useT();
  const active = voice.status !== "idle";
  const playing = voice.status === "playing";
  return (
    <div className={`mt-5 rounded-3xl border border-[#E7DCC8] bg-[#FFFCF6]/95 px-4 py-3 backdrop-blur ${active ? "sticky top-[3.75rem] z-20 shadow-sm" : ""}`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={playing ? voice.pause : voice.play}
          aria-label={playing ? t("listen.pause") : voice.status === "paused" ? t("listen.resume") : t("listen.play")}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#6D252C] text-[#F7F2E8] hover:bg-[#5E1F25]"
        >
          {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-bold text-[#2A1A1C]">
            <Headphones className="h-4 w-4 text-[#885F19]" /> {t("listen.title")}
          </p>
          <p aria-live="polite" className="text-xs text-[#6D645D]">
            {active ? t("jataka.progress", { i: voice.partNumber, n: voice.partCount }) : t("common.min", { n: minutes })}
          </p>
        </div>
        {active && (
          <div className="flex items-center">
            <button type="button" aria-label={t("listen.previous")} onClick={voice.previous} className="rounded-full p-2.5 text-[#2A1A1C] hover:bg-[#F3ECDF]">
              <SkipBack className="h-5 w-5" />
            </button>
            <button type="button" aria-label={t("listen.next")} onClick={voice.next} className="rounded-full p-2.5 text-[#2A1A1C] hover:bg-[#F3ECDF]">
              <SkipForward className="h-5 w-5" />
            </button>
            <button type="button" aria-label={t("listen.stop")} onClick={voice.stop} className="rounded-full p-2.5 text-[#2A1A1C] hover:bg-[#F3ECDF]">
              <Square className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {active && (
        <div className="mt-2 flex items-center gap-1.5" role="radiogroup" aria-label={t("listen.speed")}>
          <span className="mr-1 text-xs text-[#6D645D]">{t("listen.speed")}</span>
          {STORY_SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={voice.speed === s}
              onClick={() => voice.setSpeed(s)}
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${voice.speed === s ? "bg-[#6D252C] text-[#F7F2E8]" : "bg-[#F3ECDF] text-[#5B5350]"}`}
            >
              {s}×
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 text-[11px] text-[#6D645D]">{voice.aiVoice ? t("jataka.aiVoice") : t("jataka.deviceVoice")}</p>
    </div>
  );
}

export function CommentaryStoryView({ slug }: { slug: string }) {
  const story = getCommentaryStory(slug);
  if (!story) return null;
  return <CommentaryStoryBody key={story.slug} story={story} />;
}

function CommentaryStoryBody({ story }: { story: CommentaryStory }) {
  const { t, lang } = useT();
  const pali = usePali();
  const voice = useStoryVoice(story, lang);
  const reading = voice.part?.paragraph ?? null;
  useEffect(() => markRead(storyItem(story.slug)), [story.slug]);
  const other = lang === "hi" ? "en" : "hi";
  const art = commentaryArt(story.slug);
  const next = COMMENTARY_STORIES[(COMMENTARY_STORIES.indexOf(story) + 1) % COMMENTARY_STORIES.length];
  const spoken = useMemo(() => story.verses.map((n) => VERSES[n - 1]), [story]);

  return (
    <article className="pb-4">
      <Link href="/learn/dhammapada/stories" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#6D252C]">
        <ArrowLeft className="h-4 w-4" /> {t("dhp.stories")}
      </Link>
      {art && (
        <Image src={art} alt={t("jataka.artAlt", { title: story.title[lang] })} width={960} height={960} priority sizes="(min-width: 768px) 720px, 100vw" className="mb-5 aspect-[4/3] w-full rounded-3xl object-cover" />
      )}
      <header className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className={eyebrow}>{t("dhp.storyMeta", { v: story.verses.join(", "), m: story.minutes })}</p>
          <h1 lang={lang} className="mt-1 text-[30px] font-bold leading-tight tracking-tight text-[#2A1A1C]">{story.title[lang]}</h1>
          <p className="text-base text-[#6E6560]">
            <span lang={other}>{story.title[other]}</span> · <span className="font-pali italic">{story.title.pi}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-[#E8E2F1] px-3 py-1 text-xs font-semibold text-[#45305F]">{t("dhp.storyBadge")}</span>
            <span className="inline-flex rounded-full bg-[#E3E9DC] px-3 py-1 text-xs font-semibold text-[#4F5E44]">{story.theme[lang]}</span>
          </div>
        </div>
        {!art && <StorySeal story={story} large />}
      </header>
      <div className="mt-4 flex gap-2">
        <BookmarkButton item={storyItem(story.slug)} />
        <ShareButton title={story.title[lang]} text={story.summary[lang]} url={commentaryHref(story.slug)} />
      </div>

      <Listen voice={voice} minutes={story.minutes} />

      <div className="mt-6 space-y-4">
        {story.paragraphs.map((p, i) => (
          <p
            key={i}
            lang={lang}
            onClick={voice.status !== "idle" ? () => voice.playParagraph(i) : undefined}
            className={`-mx-3 rounded-2xl px-3 py-1 text-[17px] leading-[1.75] text-[#2A1A1C] transition-colors ${reading === i ? "bg-[#F6E7C8]" : ""} ${voice.status !== "idle" ? "cursor-pointer" : ""}`}
          >
            {p[lang]}
          </p>
        ))}
      </div>

      {/* The verse the Buddha spoke, as the scripture gives it. */}
      {spoken.map((v) => (
        <Link key={v.n} href={verseHref(v.n)} className="mt-8 block rounded-3xl border border-[#E7DCC8] bg-white px-5 py-5 hover:border-[#C6A15B]">
          <p className={eyebrow}>
            {t("dhp.spoke")} · {t("dhp.verseRef", { n: v.n })}
          </p>
          <div lang="pi" className="mt-2 space-y-0.5 font-pali italic text-[#2A1A1C]">
            {v.pi.map((l) => (
              <p key={l}>{pali(l)}</p>
            ))}
          </div>
          <p lang={lang === "hi" && v.hi ? "hi" : "en"} className="mt-2 text-[15px] leading-relaxed text-[#4A4340]">
            {lang === "hi" && v.hi ? v.hi : v.en}
          </p>
          <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#6D252C]">
            {t("dhp.readVerse", { n: v.n })} <ArrowRight className="h-4 w-4" />
          </p>
        </Link>
      ))}

      <aside className={`mt-6 rounded-3xl bg-[#3A1418] px-5 py-5 text-[#F7F2E8] ${voice.part?.key === "lesson" ? "ring-4 ring-[#E9BE73]/50" : ""}`}>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#E9BE73]">
          <Sparkles className="h-4 w-4" /> {t("jataka.lesson")}
        </p>
        <p lang={lang} className="mt-2 text-[17px] leading-relaxed">{story.lesson[lang]}</p>
        <p className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#E9BE73]">
          <MessageCircleQuestion className="h-4 w-4" /> {t("dhp.reflect")}
        </p>
        <p lang={lang} className="mt-1.5 text-[16px] italic leading-relaxed">{story.reflection[lang]}</p>
      </aside>

      <p className="mt-6 text-xs text-[#6D645D]">{t("dhp.storyLabel")}</p>
      <p className="mt-1 text-xs text-[#6D645D]">
        {t("prayers.source")}: {story.source.title}. {story.source.reference}.
      </p>
      {story.review[lang].status !== "reviewed" && (
        <p className="mt-3 flex gap-2.5 rounded-2xl border border-[#EBD3A3] bg-[#FBF3E2] px-4 py-3 text-xs leading-relaxed text-[#6B4A12]">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          {t("dhp.storyDraft")}
        </p>
      )}

      {next && next.slug !== story.slug && (
        <Link href={commentaryHref(next.slug)} className={`${card} mt-6 flex items-center gap-3 px-4 py-4`}>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#885F19]">{t("dhp.nextStory")}</p>
            <p lang={lang} className="font-bold text-[#2A1A1C]">{next.title[lang]}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-[#6D252C]" />
        </Link>
      )}
    </article>
  );
}
