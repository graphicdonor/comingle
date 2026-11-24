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

// "Listen" for prayers without a chanting recording yet: reads the prayer
// aloud line by line with the device's own text-to-speech, so the current
// line can be highlighted (PRD §7.6 follow-along). Pali is read from its
// Devanagari form with a Hindi voice, which is the closest available match
// to Pali sounds; it is an approximation and is labelled as such (PRD §7.5:
// synthetic voice only when clearly disclosed). A rights-cleared recording,
// when added to a prayer, replaces this.

export interface Segment {
  /** Line key ("section-line"), shared by a line's Pali and its translation. */
  line: string;
  /** One recitation of a line (a line in a repeated section has several). */
  step: string;
  text: string;
  lang: "hi" | "en";
  /** Pali is read a little slower than translations. */
  pali: boolean;
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
): Segment[] {
  const out: Segment[] = [];
  prayer.sections.forEach((section, si) => {
    const times = section.repeat ?? 1;
    for (let r = 0; r < times; r++) {
      section.lines.forEach((line, li) => {
        const key = `${si}-${li}`;
        const step = `${key}#${r}`;
        if (prefs.mode !== "translation") {
          out.push(
            hindiVoice
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
          });
        }
      });
    }
  });
  return out;
}

export type VoiceStatus = "idle" | "playing" | "paused";

export function usePrayerVoice(prayer: Prayer, prefs: ReadingPrefs) {
  const isSupported = useSyncExternalStore(
    () => () => {},
    supported,
    () => false,
  );
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
    const go = (i: number): void => {
      if (!supported()) return;
      const run = ++token.current;
      speechSynthesis.cancel();
      const { segments: segs, loop: again } = state.current;
      if (i >= segs.length) {
        if (again && segs.length) return go(0);
        setStatus("idle");
        setIndex(0);
        return;
      }
      const seg = segs[i];
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
      setIndex(i);
      setStatus("playing");
      speechSynthesis.speak(u);
    };
    go(start);
  }, []);

  const stopSpeaking = useCallback(() => {
    token.current++;
    if (supported()) speechSynthesis.cancel();
  }, []);

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
      if (supported()) speechSynthesis.cancel();
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
    /** No Hindi voice installed: Pali falls back to Roman script in an English voice. */
    missingHindiVoice: isSupported && voices.length > 0 && !hindi,
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
