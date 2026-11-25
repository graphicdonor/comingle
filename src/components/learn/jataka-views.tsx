"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Headphones, Info, Pause, Play, SkipBack, SkipForward, Sparkles, Square } from "lucide-react";
import { JATAKA_INTRO, STORIES, getStory, storyArt, type JatakaStory } from "@/lib/learn/jataka";
import { useT } from "@/lib/i18n/use-t";
import { STORY_SPEEDS, useStoryVoice } from "@/lib/learn/use-story-voice";

/** The story's painting, or its Jātaka number in a small seal when it has none. */
function Thumb({ story }: { story: JatakaStory }) {
  const art = storyArt(story.slug);
  if (!art) return <Seal story={story} />;
  return <Image src={art} alt="" width={88} height={88} sizes="88px" className="h-[88px] w-[88px] flex-shrink-0 rounded-2xl object-cover" />;
}

function Seal({ story, large = false }: { story: JatakaStory; large?: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-[#F6E7C8] to-[#EFD9AE] text-[#6D252C] flex-shrink-0 ${large ? "h-24 w-24" : "h-20 w-16"}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#885F19]">Jātaka</span>
      <span className={`font-bold tabular-nums ${large ? "text-3xl" : "text-2xl"}`}>{story.number}</span>
    </span>
  );
}

function StoryCard({ story }: { story: JatakaStory }) {
  const { t, lang } = useT();
  const other = lang === "hi" ? "en" : "hi";
  return (
    <Link href={`/learn/jataka/${story.slug}`} className="flex items-center gap-4 rounded-3xl bg-white border border-[#E7DCC8] px-4 py-4 hover:border-[#C6A15B] transition-colors">
      <Thumb story={story} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-[#885F19]">{story.theme[lang]}</p>
        <p lang={lang} className="text-lg font-bold text-[#2A1A1C] leading-snug">{story.title[lang]}</p>
        <p lang={other} className="text-sm text-[#6E6560]">
          {story.title[other]} · <span className="font-pali italic">{story.title.pi}</span>
        </p>
        <p lang={lang} className="mt-1.5 text-sm text-[#5B5350] leading-relaxed">{story.summary[lang]}</p>
        <p className="mt-1.5 text-xs font-medium text-[#56634A]">{t("common.minRead", { n: story.minutes })}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-[#6D252C]/50 flex-shrink-0" />
    </Link>
  );
}

/** A few stories on the Learn page, with a link to all of them. */
export function JatakaSection() {
  const { t } = useT();
  return (
    <section aria-labelledby="jataka-heading" className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="jataka-heading" className="text-xl font-bold text-[#2A1A1C]">{t("jataka.title")}</h2>
        <Link href="/learn/jataka" className="text-sm font-semibold text-[#6D252C]">
          {t("jataka.all")} ({STORIES.length})
        </Link>
      </div>
      <p className="text-[15px] text-[#5B5350]">{t("jataka.intro")}</p>
      <ul className="space-y-3">
        {STORIES.slice(0, 3).map((s) => (
          <li key={s.slug}>
            <StoryCard story={s} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function JatakaIndex() {
  const { t, lang } = useT();
  return (
    <div className="space-y-6">
      <Link href="/learn" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6D252C]">
        <ArrowLeft className="h-4 w-4" /> {t("learn.title")}
      </Link>
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#885F19]">{t("jataka.count", { n: STORIES.length })}</p>
        <h1 className="mt-1 text-[28px] font-bold tracking-tight text-[#2A1A1C]">{t("jataka.title")}</h1>
        {JATAKA_INTRO.map((p) => (
          <p key={p.en} lang={lang} className="mt-3 text-[15px] text-[#4A4340] leading-relaxed">
            {p[lang]}
          </p>
        ))}
      </header>
      <ul className="space-y-3">
        {STORIES.map((s) => (
          <li key={s.slug}>
            <StoryCard story={s} />
          </li>
        ))}
      </ul>
    </div>
  );
}

type Voice = ReturnType<typeof useStoryVoice>;

/** Listening controls; pinned below the header while a story is being read. */
function StoryListen({ voice, minutes }: { voice: Voice; minutes: number }) {
  const { t } = useT();
  const active = voice.status !== "idle";
  const playing = voice.status === "playing";
  return (
    <div className={`mt-5 rounded-3xl border border-[#E7DCC8] bg-[#FFFCF6]/95 backdrop-blur px-4 py-3 ${active ? "sticky top-[3.75rem] z-20 shadow-sm" : ""}`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={playing ? voice.pause : voice.play}
          aria-label={playing ? t("listen.pause") : voice.status === "paused" ? t("listen.resume") : t("listen.play")}
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#6D252C] text-[#F7F2E8] hover:bg-[#5E1F25]"
        >
          {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
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
          <span className="text-xs text-[#6D645D] mr-1">{t("listen.speed")}</span>
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

export function StoryView({ slug }: { slug: string }) {
  const story = getStory(slug);
  if (!story) return null;
  return <Story key={story.slug} slug={story.slug} />;
}

function Story({ slug }: { slug: string }) {
  const { t, lang } = useT();
  const story = getStory(slug)!;
  const voice = useStoryVoice(story, lang);
  const reading = voice.part?.paragraph ?? null;

  // Follow the paragraph being read.
  const refs = useRef<(HTMLParagraphElement | null)[]>([]);
  useEffect(() => {
    if (reading === null) return;
    refs.current[reading]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [reading]);

  const other = lang === "hi" ? "en" : "hi";
  const next = STORIES[(STORIES.indexOf(story) + 1) % STORIES.length];
  const draft = story.review[lang].status !== "reviewed";
  const art = storyArt(story.slug);

  return (
    <article className="pb-4">
      <Link href="/learn/jataka" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6D252C] mb-4">
        <ArrowLeft className="h-4 w-4" /> {t("jataka.title")}
      </Link>
      {art && (
        <Image
          src={art}
          alt={t("jataka.artAlt", { title: story.title[lang] })}
          width={960}
          height={960}
          priority
          sizes="(min-width: 768px) 720px, 100vw"
          className="mb-5 aspect-[4/3] w-full rounded-3xl object-cover"
        />
      )}
      <header className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#885F19]">{t("jataka.meta", { n: story.number, m: story.minutes })}</p>
          <h1 lang={lang} className="mt-1 text-[30px] font-bold tracking-tight text-[#2A1A1C] leading-tight">{story.title[lang]}</h1>
          <p className="text-base text-[#6E6560]">
            <span lang={other}>{story.title[other]}</span> · <span className="font-pali italic">{story.title.pi}</span>
          </p>
          <p className="mt-2 inline-flex rounded-full bg-[#E3E9DC] px-3 py-1 text-xs font-semibold text-[#4F5E44]">{story.theme[lang]}</p>
        </div>
        {!art && <Seal story={story} large />}
      </header>

      <StoryListen voice={voice} minutes={story.minutes} />

      <div className="mt-6 space-y-4">
        {story.paragraphs.map((p, i) => (
          <p
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            lang={lang}
            onClick={voice.status !== "idle" ? () => voice.playParagraph(i) : undefined}
            className={`rounded-2xl -mx-3 px-3 py-1 text-[17px] leading-[1.75] text-[#2A1A1C] transition-colors ${reading === i ? "bg-[#F6E7C8]" : ""} ${voice.status !== "idle" ? "cursor-pointer" : ""} ${i === 0 && lang === "en" ? "first-letter:text-4xl first-letter:font-bold first-letter:text-[#6D252C] first-letter:mr-0.5" : ""}`}
          >
            {p[lang]}
          </p>
        ))}
      </div>

      <aside className={`mt-8 rounded-3xl bg-[#3A1418] px-5 py-5 text-[#F7F2E8] ${voice.part?.key === "lesson" ? "ring-4 ring-[#E9BE73]/50" : ""}`}>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#E9BE73]">
          <Sparkles className="h-4 w-4" /> {t("jataka.lesson")}
        </p>
        <p lang={lang} className="mt-2 text-[17px] leading-relaxed">{story.lesson[lang]}</p>
      </aside>

      <p className="mt-6 text-xs text-[#6D645D]">
        {t("prayers.source")}: {story.source.title}, {story.source.reference}
      </p>
      {draft && (
        <p className="mt-3 flex gap-2.5 rounded-2xl bg-[#FBF3E2] border border-[#EBD3A3] px-4 py-3 text-xs text-[#6B4A12] leading-relaxed">
          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {t("jataka.draft")}
        </p>
      )}

      {next && next.slug !== story.slug && (
        <Link href={`/learn/jataka/${next.slug}`} className="mt-6 flex items-center gap-3 rounded-3xl border border-[#E7DCC8] bg-white px-4 py-4 hover:border-[#C6A15B]">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#885F19]">{t("jataka.next")}</p>
            <p lang={lang} className="font-bold text-[#2A1A1C]">{next.title[lang]}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-[#6D252C]" />
        </Link>
      )}
    </article>
  );
}
