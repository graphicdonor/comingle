"use client";
import Image from "next/image";
import { SPLASH_LAYERS } from "@/lib/splash";
import { getPrayer } from "@/lib/practice/prayers";
import { readingPrefs } from "@/lib/practice/preferences";
import { PrayerText } from "@/components/practice/prayer-text";
import { ReadingControls } from "@/components/practice/reading-controls";

/**
 * The splash artwork as a hero card: the same layers, with the sun rising and
 * rays turning (the "sp-*" animations in globals.css, minus the splash's
 * hold-until-loaded gating, which only applies to the "sp-layer" class).
 */
export function HeroArt({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-[2/3] overflow-hidden rounded-[2rem] shadow-[0_30px_80px_-30px_rgba(109,37,44,0.55)] ring-1 ring-black/5 ${className}`}>
      {SPLASH_LAYERS.map((layer, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={layer.src}
          src={layer.src}
          alt={i === SPLASH_LAYERS.length - 1 ? "A practitioner meditating on a hilltop, facing the rising sun" : ""}
          aria-hidden={i === SPLASH_LAYERS.length - 1 ? undefined : true}
          className={`absolute inset-0 h-full w-full ${layer.className}`}
          fetchPriority={i === 0 || i === SPLASH_LAYERS.length - 1 ? "high" : "auto"}
        />
      ))}
    </div>
  );
}

/** A real app screenshot in a simple phone frame. */
export function PhoneShot({ src, alt, priority = false, className = "" }: { src: string; alt: string; priority?: boolean; className?: string }) {
  return (
    <div className={`relative mx-auto w-full max-w-[250px] rounded-[2.2rem] bg-[#2A1A1C] p-[9px] shadow-[0_24px_60px_-24px_rgba(42,26,28,0.6)] ${className}`}>
      <Image src={src} alt={alt} width={540} height={960} priority={priority} className="w-full h-auto rounded-[1.65rem]" />
    </div>
  );
}

const DEMO = getPrayer("tisarana");

/**
 * Try a prayer right on the page: the app's own reading controls and text.
 * Uses the app's stored reading preferences, so choices carry over into it.
 */
export function PrayerDemo() {
  const prefs = readingPrefs.use();
  if (!DEMO) return null;
  return (
    <div className="rounded-[2rem] bg-white border border-[#E7DCC8] p-5 sm:p-6 shadow-[0_20px_50px_-30px_rgba(42,26,28,0.35)]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-pali text-2xl font-semibold text-[#3A1418]">{DEMO.title.pi}</p>
        <p className="text-sm text-[#6E6560]">
          {DEMO.title.en} · <span lang="hi">{DEMO.title.hi}</span>
        </p>
      </div>
      <ReadingControls prefs={prefs} className="mt-4 rounded-2xl bg-[#FFFCF6] border border-[#EFE5D3] p-3" />
      <PrayerText prayer={{ ...DEMO, sections: DEMO.sections.slice(0, 1) }} prefs={prefs} className="mt-5" />
    </div>
  );
}

export function SectionHeading({ eyebrow, title, intro, id, center = false, light = false }: { eyebrow: string; title: string; intro?: string; id?: string; center?: boolean; light?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-xl"}>
      <p className={`text-xs font-bold uppercase tracking-[0.18em] ${light ? "text-[#E9BE73]" : "text-[#885F19]"}`}>{eyebrow}</p>
      <h2 id={id} className={`mt-3 text-3xl sm:text-4xl font-bold tracking-tight leading-tight ${light ? "text-[#F7F2E8]" : "text-[#2A1A1C]"}`}>
        {title}
      </h2>
      {intro && <p className={`mt-4 text-lg leading-relaxed ${light ? "text-[#F7F2E8]/80" : "text-[#5B5350]"}`}>{intro}</p>}
    </div>
  );
}
