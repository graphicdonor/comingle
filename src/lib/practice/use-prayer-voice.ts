"use client";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { Prayer } from "./prayers";
import type { ReadingPrefs } from "./preferences";
import { paliToDevanagari } from "./pali-devanagari";
import audioManifest from "@/lib/cms/clip-manifest.json";

// "Listen": reads a prayer aloud line by line so the current line can be
// highlighted (PRD §7.6 follow-along). Each line plays from a pre-generated
// AI voice clip (scripts/generate-prayer-audio.ts, Pali from its Devanagari
// form) when one exists, otherwise from the device's own text-to-speech.
// Both are synthetic and labelled as such (PRD §7.5). A rights-cleared
// chanting recording, when added to a prayer, replaces this.

type ClipLang = "pi" | "hi" | "en";
type LineClips = Partial<Record<ClipLang, { src: string }>>;
const CLIPS = audioManifest as Record<string, Record<string, LineClips>>;

/** The AI voice clip for one line of a prayer, if there is one. */
export function clipSrc(slug: string, line: string, lang: ClipLang): string | null {
  return CLIPS[slug]?.[line]?.[lang]?.src ?? null;
}

/** Whether a prayer has AI voice clips. */
export function hasVoiceClips(slug: string): boolean {
  return Boolean(CLIPS[slug] && Object.keys(CLIPS[slug]).length);
}

export interface Segment {
  /** Line key ("section-line"), shared by a line's Pali and its translation. */
  line: string;
  /** One recitation of a line (a line in a repeated section has several). */
  step: string;
  text: string;
  lang: "hi" | "en";
  /** Pali is read a little slower than translations. */
  pali: boolean;
  /** Pre-generated clip; without one the device voice reads `text`. */
  src?: string;
}

export const SPEEDS = [0.75, 1, 1.25, 1.5] as const;
export type Speed = (typeof SPEEDS)[number];

const supported = () =>
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

// ── Voices (they load asynchronously in most browsers) ───────────────────
function subscribeVoices(cb: () => void) {
  if (!supported()) return () => {};
  speechSynthesis.addEventListener("voiceschanged", cb);
  return () => speechSynthesis.removeEventListener("voiceschanged", cb);
}
let voiceCache: SpeechSynthesisVoice[] = [];
let voiceKey = "";
function getVoices(): SpeechSynthesisVoice[] {
  if (!supported()) return voiceCache;
  const list = speechSynthesis.getVoices();
  const key = list.map((v) => v.voiceURI).join("|");
  if (key !== voiceKey) {
    voiceKey = key;
    voiceCache = list;
  }
  return voiceCache;
}

function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: "hi" | "en",
): SpeechSynthesisVoice | null {
  const matches = voices.filter((v) =>
    v.lang.toLowerCase().replace("_", "-").startsWith(lang),
  );
  if (lang === "en")
    return (
      matches.find((v) => /en-in/i.test(v.lang)) ??
      matches.find((v) => v.localService) ??
      matches[0] ??
      null
    );
  return matches.find((v) => v.localService) ?? matches[0] ?? null;
}

/** What to read, following the reader's display mode and translation language. */
export function buildSegments(
  prayer: Prayer,
  prefs: ReadingPrefs,
  hindiVoice: boolean,
  clips: Record<string, LineClips> = CLIPS[prayer.slug] ?? {},
): Segment[] {
  const out: Segment[] = [];
  prayer.sections.forEach((section, si) => {
    const times = section.repeat ?? 1;
    for (let r = 0; r < times; r++) {
      section.lines.forEach((line, li) => {
        const key = `${si}-${li}`;
        const step = `${key}#${r}`;
        const clip = clips[key] ?? {};
        if (prefs.mode !== "translation") {
          out.push(
            clip.pi
              ? { line: key, step, text: paliToDevanagari(line.pi), lang: "hi", pali: true, src: clip.pi.src }
              : hindiVoice
              ? {
                  line: key,
                  step,
                  text: paliToDevanagari(line.pi),
                  lang: "hi",
                  pali: true,
                }
              : { line: key, step, text: line.pi, lang: "en", pali: true },
          );
        }
        if (prefs.mode !== "pali") {
          out.push({
            line: key,
            step,
            text: line[prefs.translation],
            lang: prefs.translation,
            pali: false,
            src: clip[prefs.translation]?.src,
          });
        }
      });
    }
  });
  return out;
}

export type VoiceStatus = "idle" | "playing" | "paused";

// One audio element for every clip: once a tap has started it, the browser
// lets it continue from clip to clip.
let player: HTMLAudioElement | null = null;
function audio(): HTMLAudioElement {
  player ??= new Audio();
  player.preload = "auto";
  return player;
}
function silence() {
  if (player) {
    player.onended = player.onerror = null;
    player.pause();
  }
  if (supported()) speechSynthesis.cancel();
}

export function usePrayerVoice(prayer: Prayer, prefs: ReadingPrefs) {
  const clipsReady = hasVoiceClips(prayer.slug);
  const speechReady = useSyncExternalStore(
    () => () => {},
    supported,
    () => false,
  );
  const isSupported = clipsReady || speechReady;
  const voices = useSyncExternalStore(
    subscribeVoices,
    getVoices,
    () => voiceCache,
  );
  const hindi = useMemo(() => pickVoice(voices, "hi"), [voices]);
  const english = useMemo(() => pickVoice(voices, "en"), [voices]);
  const segments = useMemo(
    () => buildSegments(prayer, prefs, Boolean(hindi)),
    [prayer, prefs, hindi],
  );

  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [index, setIndex] = useState(0);
  const [speed, setSpeed] = useState<Speed>(1);
  const [loop, setLoop] = useState(false);

  // Every utterance carries the token current when it started; ending or
  // cancelling an old one must never advance the new sequence.
  const token = useRef(0);
  const state = useRef({ segments, speed, loop, hindi, english });
  useLayoutEffect(() => {
    state.current = { segments, speed, loop, hindi, english };
  });

  const speakAt = useCallback((start: number) => {
    // `deviceVoice`: the line's clip couldn't play, so read it aloud instead.
    const go = (i: number, deviceVoice = false): void => {
      const run = ++token.current;
      silence();
      const { segments: segs, loop: again } = state.current;
      if (i >= segs.length) {
        if (again && segs.length) return go(0);
        setStatus("idle");
        setIndex(0);
        return;
      }
      const seg = segs[i];
      setIndex(i);
      setStatus("playing");

      if (seg.src && !deviceVoice) {
        const a = audio();
        a.src = seg.src;
        a.playbackRate = state.current.speed;
        a.onended = () => {
          if (token.current === run) go(i + 1);
        };
        a.onerror = () => {
          if (token.current === run) go(i, true);
        };
        a.play().catch((e: unknown) => {
          if (token.current !== run) return;
          const name = e instanceof DOMException ? e.name : "";
          // Not allowed to start without a tap: wait for the play button.
          if (name === "NotAllowedError") setStatus("paused");
          // The clip can't be played here (format, network): use the device voice.
          else if (name !== "AbortError") go(i, true);
        });
        // Warm the next clip so lines follow each other without a gap.
        const upcoming = segs[i + 1]?.src;
        if (upcoming) fetch(upcoming).catch(() => {});
        return;
      }

      if (!supported()) return go(i + 1);
      const u = new SpeechSynthesisUtterance(seg.text);
      const voice =
        seg.lang === "hi" ? state.current.hindi : state.current.english;
      if (voice) u.voice = voice;
      u.lang = voice?.lang ?? (seg.lang === "hi" ? "hi-IN" : "en-IN");
      u.rate = state.current.speed * (seg.pali ? 0.85 : 0.95);
      u.onend = () => {
        if (token.current === run) go(i + 1);
      };
      u.onerror = (e) => {
        // "interrupted"/"canceled" come from our own cancel(); anything else, move on.
        if (
          token.current === run &&
          e.error !== "interrupted" &&
          e.error !== "canceled"
        )
          go(i + 1);
      };
      speechSynthesis.speak(u);
    };
    go(start);
  }, []);

  const stopSpeaking = useCallback(() => {
    token.current++;
    silence();
  }, []);

  // A new speed applies straight away to a clip that's playing.
  useEffect(() => {
    if (player && status === "playing") player.playbackRate = speed;
  }, [speed, status]);

  const play = useCallback(
    () => speakAt(status === "paused" ? index : 0),
    [speakAt, status, index],
  );
  const pause = useCallback(() => {
    // Pausing restarts the current line on resume (speechSynthesis.pause is
    // unreliable on Android), which also suits recitation.
    stopSpeaking();
    setStatus("paused");
  }, [stopSpeaking]);
  const stop = useCallback(() => {
    stopSpeaking();
    setStatus("idle");
    setIndex(0);
  }, [stopSpeaking]);

  const firstOfLine = (from: number, dir: 1 | -1) => {
    const segs = state.current.segments;
    const current = segs[from]?.step;
    let i = from;
    if (dir === 1) {
      while (i < segs.length && segs[i].step === current) i++;
      return i;
    }
    // back to the start of this line, or of the previous one if already there
    while (i > 0 && segs[i - 1].step === current) i--;
    if (i === from && i > 0) {
      const prev = segs[i - 1].step;
      i--;
      while (i > 0 && segs[i - 1].step === prev) i--;
    }
    return i;
  };
  const next = useCallback(
    () => speakAt(firstOfLine(index, 1)),
    [speakAt, index],
  );
  const previous = useCallback(
    () => speakAt(firstOfLine(index, -1)),
    [speakAt, index],
  );
  const playFromLine = useCallback(
    (line: string) => {
      const i = state.current.segments.findIndex((s) => s.line === line);
      if (i >= 0) speakAt(i);
    },
    [speakAt],
  );

  // Stop when leaving the prayer, or when what's read changes (mode/language).
  useEffect(() => {
    const tok = token;
    return () => {
      tok.current++;
      silence();
      setStatus("idle");
      setIndex(0);
    };
  }, [prayer.slug, prefs.mode, prefs.translation]);

  const activeLine = status === "idle" ? null : (segments[index]?.line ?? null);
  // Progress counts recitations, so a line chanted three times is three steps.
  const steps = useMemo(
    () => Array.from(new Set(segments.map((s) => s.step))),
    [segments],
  );
  const activeStep = status === "idle" ? null : (segments[index]?.step ?? null);

  return {
    isSupported,
    /** Lines play from AI voice clips rather than the device voice. */
    aiVoice: clipsReady,
    /** No Hindi voice installed: Pali falls back to Roman script in an English voice. */
    missingHindiVoice:
      speechReady && voices.length > 0 && !hindi && segments.some((s) => !s.src && s.pali),
    status,
    activeLine,
    lineNumber: activeStep ? steps.indexOf(activeStep) + 1 : 0,
    lineCount: steps.length,
    speed,
    setSpeed,
    loop,
    setLoop,
    play,
    pause,
    stop,
    next,
    previous,
    playFromLine,
  };
}
