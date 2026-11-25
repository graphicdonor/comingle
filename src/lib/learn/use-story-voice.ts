"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import storyClips from "@/lib/cms/story-clips.json";
import { storyParts, type JatakaStory } from "./jataka";

// "Listen" for Jātaka tales: plays the narrated clip for each part (title,
// paragraphs, lesson), made ahead of time by scripts/generate-story-audio.ts,
// or reads a part with the browser's voice when it has no clip yet (a story
// newly edited in the CMS). The clips are AI-generated and labelled as such.

type Lang = "hi" | "en";
const CLIPS = storyClips as Record<string, Record<string, Partial<Record<Lang, { src: string }>>>>;

export function hasStoryAudio(slug: string): boolean {
  return Boolean(CLIPS[slug]);
}

/** Every narrated clip, for the offline download. */
export function storyClipUrls(): string[] {
  return Object.values(CLIPS).flatMap((parts) => Object.values(parts).flatMap((langs) => Object.values(langs).map((c) => c.src)));
}

export const STORY_SPEEDS = [0.85, 1, 1.15, 1.3] as const;
export type StoryVoiceStatus = "idle" | "playing" | "paused";

let player: HTMLAudioElement | null = null;
const audio = () => (player ??= new Audio());

export function useStoryVoice(story: JatakaStory, lang: Lang) {
  const parts = useMemo(() => storyParts(story, lang).map((p) => ({ ...p, src: CLIPS[story.slug]?.[p.key]?.[lang]?.src })), [story, lang]);
  const [status, setStatus] = useState<StoryVoiceStatus>("idle");
  const [index, setIndex] = useState(0);
  const [speed, setSpeedState] = useState<number>(1);
  const token = useRef(0);
  const speedRef = useRef(1);

  const silence = () => {
    if (player) {
      player.onended = player.onerror = null;
      player.pause();
    }
    if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
  };

  const playFrom = useCallback(
    (start: number) => {
      const go = (i: number, deviceVoice = false): void => {
        const run = ++token.current;
        silence();
        if (i >= parts.length) {
          setStatus("idle");
          setIndex(0);
          return;
        }
        setIndex(i);
        setStatus("playing");
        const part = parts[i];
        if (part.src && !deviceVoice) {
          const a = audio();
          a.src = part.src;
          a.playbackRate = speedRef.current;
          a.onended = () => token.current === run && go(i + 1);
          a.onerror = () => token.current === run && go(i, true);
          a.play().catch((e: unknown) => {
            if (token.current !== run) return;
            const name = e instanceof DOMException ? e.name : "";
            if (name === "NotAllowedError") setStatus("paused");
            else if (name !== "AbortError") go(i, true);
          });
          const upcoming = parts[i + 1]?.src;
          if (upcoming) fetch(upcoming).catch(() => {});
          return;
        }
        if (typeof speechSynthesis === "undefined") return go(i + 1);
        const u = new SpeechSynthesisUtterance(part.text);
        u.lang = lang === "hi" ? "hi-IN" : "en-IN";
        u.rate = speedRef.current * 0.95;
        u.onend = () => token.current === run && go(i + 1);
        u.onerror = (e) => token.current === run && e.error !== "interrupted" && e.error !== "canceled" && go(i + 1);
        speechSynthesis.speak(u);
      };
      go(start);
    },
    [parts, lang],
  );

  const play = useCallback(() => {
    // A paused clip carries on where it stopped; anything else starts the part again.
    if (status === "paused" && player && player.src && parts[index]?.src && player.currentTime > 0) {
      setStatus("playing");
      player.play().catch(() => playFrom(index));
      return;
    }
    playFrom(status === "paused" ? index : 0);
  }, [status, index, parts, playFrom]);

  const pause = useCallback(() => {
    if (parts[index]?.src && player) player.pause();
    else {
      token.current++;
      if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
    }
    setStatus("paused");
  }, [index, parts]);

  const stop = useCallback(() => {
    token.current++;
    silence();
    setStatus("idle");
    setIndex(0);
  }, []);

  const setSpeed = useCallback((s: number) => {
    speedRef.current = s;
    setSpeedState(s);
    if (player) player.playbackRate = s;
  }, []);

  /** Start reading from a paragraph. */
  const playParagraph = useCallback((p: number) => playFrom(Math.max(0, parts.findIndex((x) => x.paragraph === p))), [parts, playFrom]);

  // Stop when leaving the story or changing language.
  useEffect(() => {
    const tok = token;
    return () => {
      tok.current++;
      silence();
    };
  }, [story.slug, lang]);

  return {
    aiVoice: hasStoryAudio(story.slug),
    status,
    part: status === "idle" ? null : parts[index],
    partNumber: index + 1,
    partCount: parts.length,
    speed,
    setSpeed,
    play,
    pause,
    stop,
    next: () => playFrom(Math.min(parts.length - 1, index + 1)),
    previous: () => playFrom(Math.max(0, index - 1)),
    playParagraph,
  };
}
