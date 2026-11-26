import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioStatus,
} from "expo-audio";
import * as Speech from "expo-speech";
import {
  buildSegments,
  SPEEDS,
  type Segment,
  type Speed,
} from "@/lib/practice/use-prayer-voice";
import type { ReadingPrefs } from "@/lib/practice/preferences";
import type { Prayer } from "@/lib/practice/prayers";
import { storyParts, type NarratedStory } from "@/lib/learn/jataka";
import { clipUri, saveClip } from "./clip-cache";
import { useContent } from "./content";

// "Listen" on the phone: each line plays from its AI voice clip (saved on the
// phone after the first play) or, without one, from the phone's own
// text-to-speech. The lines to read come from the website's buildSegments, so
// both apps read exactly the same thing. Playback carries on with the screen
// locked and shows controls on the lock screen.

export { SPEEDS, type Speed };
export type VoiceStatus = "idle" | "playing" | "paused";

let player: AudioPlayer | null = null;
let modeSet = false;
// Lock-screen controls are registered once per listening session: Android
// won't let the media service start again while the screen is locked.
let lockScreenOn = false;
function showOnLockScreen(p: AudioPlayer, title: string) {
  if (lockScreenOn) return p.updateLockScreenMetadata({ title, artist: "WePray" });
  lockScreenOn = true;
  p.setActiveForLockScreen(true, { title, artist: "WePray" }, { showNextTrack: false, showPreviousTrack: false });
}
function hideFromLockScreen() {
  if (!lockScreenOn) return;
  lockScreenOn = false;
  player?.setActiveForLockScreen(false);
}
function getPlayer(): AudioPlayer {
  if (!modeSet) {
    modeSet = true;
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    }).catch(() => {});
  }
  player ??= createAudioPlayer(null, { updateInterval: 250 });
  return player;
}

let hindiVoiceCache: boolean | null = null;
async function hasHindiVoice(): Promise<boolean> {
  if (hindiVoiceCache !== null) return hindiVoiceCache;
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    hindiVoiceCache = voices.some((v) =>
      v.language.toLowerCase().replace("_", "-").startsWith("hi"),
    );
  } catch {
    hindiVoiceCache = false;
  }
  return hindiVoiceCache;
}

export function usePrayerVoice(
  prayer: Prayer,
  prefs: ReadingPrefs,
  title: string,
) {
  const content = useContent();
  const clips = useMemo(
    () => content.clips[prayer.slug] ?? {},
    [content.clips, prayer.slug],
  );
  const aiVoice = Object.keys(clips).length > 0;
  const [hindi, setHindi] = useState(hindiVoiceCache ?? true);
  useEffect(() => {
    let live = true;
    void hasHindiVoice().then((h) => live && setHindi(h));
    return () => {
      live = false;
    };
  }, []);

  const segments = useMemo(
    () => buildSegments(prayer, prefs, hindi, clips),
    [prayer, prefs, hindi, clips],
  );

  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [index, setIndex] = useState(0);
  const [speed, setSpeed] = useState<Speed>(1);
  const [loop, setLoop] = useState(false);

  // Every line carries the token current when it started; a finished or
  // cancelled old line never advances a new sequence.
  const token = useRef(0);
  const state = useRef({
    segments,
    speed,
    loop,
    title,
    index: 0,
    onClip: false,
    startedAt: 0,
  });
  useEffect(() => {
    state.current = { ...state.current, segments, speed, loop, title };
  });

  const silence = useCallback(() => {
    if (player) player.pause();
    Speech.stop().catch(() => {});
  }, []);

  const speakAt = useCallback(
    (start: number) => {
      // `deviceVoice`: the line's clip couldn't play, so the phone's voice reads it.
      const go = (i: number, deviceVoice = false): void => {
        const run = ++token.current;
        silence();
        const { segments: segs, loop: again } = state.current;
        if (i >= segs.length) {
          if (again && segs.length) return go(0);
          hideFromLockScreen();
          state.current.onClip = false;
          setStatus("idle");
          setIndex(0);
          return;
        }
        const seg: Segment = segs[i];
        state.current.index = i;
        state.current.startedAt = Date.now();
        setIndex(i);
        setStatus("playing");

        if (seg.src && !deviceVoice) {
          const p = getPlayer();
          state.current.onClip = true;
          p.replace({ uri: clipUri(seg.src) });
          p.shouldCorrectPitch = true;
          p.setPlaybackRate(state.current.speed);
          showOnLockScreen(p, state.current.title);
          p.play();
          // Keep it, and fetch the next line ahead, for gapless and offline listening.
          void saveClip(seg.src);
          const upcoming = segs[i + 1]?.src;
          if (upcoming) void saveClip(upcoming);
          const sub = p.addListener(
            "playbackStatusUpdate",
            (s: AudioStatus) => {
              if (token.current !== run) return sub.remove();
              if (s.didJustFinish) {
                sub.remove();
                go(i + 1);
              } else if (s.error) {
                sub.remove();
                go(i, true);
              }
            },
          );
          return;
        }

        state.current.onClip = false;
        Speech.speak(seg.text, {
          language: seg.lang === "hi" ? "hi-IN" : "en-IN",
          rate: state.current.speed * (seg.pali ? 0.85 : 0.95),
          onDone: () => {
            if (token.current === run) go(i + 1);
          },
          onError: () => {
            if (token.current === run) go(i + 1);
          },
        });
      };
      go(start);
    },
    [silence],
  );
  const go = speakAt;

  const play = useCallback(() => {
    if (status === "paused" && state.current.onClip && player) {
      setStatus("playing");
      player.play();
      return;
    }
    go(status === "paused" ? index : 0);
  }, [go, status, index]);

  const pause = useCallback(() => {
    if (state.current.onClip && player) {
      player.pause();
    } else {
      // Device speech can't pause reliably on Android: resume restarts the line.
      token.current++;
      Speech.stop().catch(() => {});
    }
    setStatus("paused");
  }, []);

  const stop = useCallback(() => {
    token.current++;
    silence();
    hideFromLockScreen();
    state.current.onClip = false;
    setStatus("idle");
    setIndex(0);
  }, [silence]);

  const firstOfLine = (from: number, dir: 1 | -1) => {
    const segs = state.current.segments;
    const current = segs[from]?.step;
    let i = from;
    if (dir === 1) {
      while (i < segs.length && segs[i].step === current) i++;
      return i;
    }
    while (i > 0 && segs[i - 1].step === current) i--;
    if (i === from && i > 0) {
      const prev = segs[i - 1].step;
      i--;
      while (i > 0 && segs[i - 1].step === prev) i--;
    }
    return i;
  };
  const next = useCallback(() => go(firstOfLine(index, 1)), [go, index]);
  const previous = useCallback(() => go(firstOfLine(index, -1)), [go, index]);
  const playFromLine = useCallback(
    (line: string) => {
      const i = state.current.segments.findIndex((s) => s.line === line);
      if (i >= 0) go(i);
    },
    [go],
  );

  // Pausing from the lock screen or a headset shows as paused here too.
  useEffect(() => {
    if (status !== "playing" || !state.current.onClip || !player) return;
    const p = player;
    const sub = p.addListener("playbackStatusUpdate", (s: AudioStatus) => {
      // Ignore the brief stop while one line hands over to the next.
      if (Date.now() - state.current.startedAt < 800) return;
      if (
        s.isLoaded &&
        !s.playing &&
        !s.didJustFinish &&
        !s.isBuffering &&
        s.currentTime > 0 &&
        s.currentTime < s.duration - 0.05
      )
        setStatus("paused");
    });
    return () => sub.remove();
  }, [status, index]);

  // A new speed applies straight away to a clip that's playing.
  useEffect(() => {
    if (player && state.current.onClip) player.setPlaybackRate(speed);
  }, [speed]);

  // Stop when leaving the prayer, or when what's read changes.
  useEffect(() => {
    const tok = token;
    return () => {
      tok.current++;
      player?.pause();
      hideFromLockScreen();
      Speech.stop().catch(() => {});
    };
  }, [prayer.slug, prefs.mode, prefs.translation]);

  const activeLine = status === "idle" ? null : (segments[index]?.line ?? null);
  const steps = useMemo(
    () => Array.from(new Set(segments.map((s) => s.step))),
    [segments],
  );
  const activeStep = status === "idle" ? null : (segments[index]?.step ?? null);

  return {
    aiVoice,
    missingHindiVoice: !hindi && segments.some((s) => !s.src && s.pali),
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

/** Plays one clip or speaks one text (pronunciation practice). */
export function playOnce(opts: {
  src?: string | null;
  text: string;
  lang: "hi" | "en";
  rate?: number;
  onEnd?: () => void;
}) {
  Speech.stop().catch(() => {});
  if (opts.src) {
    const p = getPlayer();
    p.replace({ uri: clipUri(opts.src) });
    p.shouldCorrectPitch = true;
    p.setPlaybackRate(opts.rate ?? 1);
    p.play();
    void saveClip(opts.src);
    const sub = p.addListener("playbackStatusUpdate", (s: AudioStatus) => {
      if (s.didJustFinish || s.error) {
        sub.remove();
        opts.onEnd?.();
      }
    });
    return () => {
      sub.remove();
      p.pause();
    };
  }
  player?.pause();
  Speech.speak(opts.text, {
    language: opts.lang === "hi" ? "hi-IN" : "en-IN",
    rate: (opts.rate ?? 1) * 0.85,
    onDone: opts.onEnd,
    onStopped: opts.onEnd,
  });
  return () => {
    Speech.stop().catch(() => {});
  };
}

// ── Jātaka tales ────────────────────────────────────────────────────────────
// Narrated part by part (title, paragraphs, lesson) from clips made by the
// website's scripts/generate-story-audio.ts, or by the phone's voice where a
// part has no clip yet. Same player as the prayers: saved on the phone after
// the first play, and it keeps playing with the screen locked.

export const STORY_SPEEDS = [0.85, 1, 1.15, 1.3] as const;

export function useStoryVoice(story: NarratedStory, lang: "hi" | "en") {
  const content = useContent();
  const parts = useMemo(
    () => storyParts(story, lang).map((p) => ({ ...p, src: content.storyClips[story.slug]?.[p.key]?.[lang]?.src })),
    [story, lang, content.storyClips],
  );
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [index, setIndex] = useState(0);
  const [speed, setSpeedState] = useState(1);
  const token = useRef(0);
  const live = useRef({ speed: 1, onClip: false, title: "" });
  useEffect(() => {
    live.current.title = `${story.title[lang]} · ${story.title.pi}`;
  });

  const playFrom = useCallback(
    (start: number) => {
      const go = (i: number, deviceVoice = false): void => {
        const run = ++token.current;
        player?.pause();
        Speech.stop().catch(() => {});
        if (i >= parts.length) {
          hideFromLockScreen();
          live.current.onClip = false;
          setStatus("idle");
          setIndex(0);
          return;
        }
        setIndex(i);
        setStatus("playing");
        const part = parts[i];
        if (part.src && !deviceVoice) {
          const p = getPlayer();
          live.current.onClip = true;
          p.replace({ uri: clipUri(part.src) });
          p.shouldCorrectPitch = true;
          p.setPlaybackRate(live.current.speed);
          showOnLockScreen(p, live.current.title);
          p.play();
          void saveClip(part.src);
          const upcoming = parts[i + 1]?.src;
          if (upcoming) void saveClip(upcoming);
          const sub = p.addListener("playbackStatusUpdate", (s: AudioStatus) => {
            if (token.current !== run) return sub.remove();
            if (s.didJustFinish) {
              sub.remove();
              go(i + 1);
            } else if (s.error) {
              sub.remove();
              go(i, true);
            }
          });
          return;
        }
        live.current.onClip = false;
        Speech.speak(part.text, {
          language: lang === "hi" ? "hi-IN" : "en-IN",
          rate: live.current.speed * 0.95,
          onDone: () => {
            if (token.current === run) go(i + 1);
          },
          onError: () => {
            if (token.current === run) go(i + 1);
          },
        });
      };
      go(start);
    },
    [parts, lang],
  );

  const play = useCallback(() => {
    if (status === "paused" && live.current.onClip && player) {
      setStatus("playing");
      player.play();
      return;
    }
    playFrom(status === "paused" ? index : 0);
  }, [status, index, playFrom]);

  const pause = useCallback(() => {
    if (live.current.onClip && player) player.pause();
    else {
      token.current++;
      Speech.stop().catch(() => {});
    }
    setStatus("paused");
  }, []);

  const stop = useCallback(() => {
    token.current++;
    player?.pause();
    Speech.stop().catch(() => {});
    hideFromLockScreen();
    live.current.onClip = false;
    setStatus("idle");
    setIndex(0);
  }, []);

  const setSpeed = useCallback((s: number) => {
    live.current.speed = s;
    setSpeedState(s);
    if (player && live.current.onClip) player.setPlaybackRate(s);
  }, []);

  // Stop when leaving the story or changing language.
  useEffect(() => {
    const tok = token;
    return () => {
      tok.current++;
      player?.pause();
      hideFromLockScreen();
      Speech.stop().catch(() => {});
    };
  }, [story.slug, lang]);

  return {
    aiVoice: Boolean(content.storyClips[story.slug]),
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
    playParagraph: (p: number) => playFrom(Math.max(0, parts.findIndex((x) => x.paragraph === p))),
  };
}
