"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeftRight, ChevronLeft, ChevronRight, Mic, MicOff, Play, Snail, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/use-t";
import type { Prayer } from "@/lib/practice/prayers";
import { readingPrefs } from "@/lib/practice/preferences";
import { paliToDevanagari } from "@/lib/practice/pali-devanagari";
import { syllabify, tipsFor, TIPS } from "@/lib/practice/pronunciation";
import { clipSrc } from "@/lib/practice/use-prayer-voice";

type RecState = "idle" | "recording" | "recorded" | "denied" | "unsupported";

/** One practice line: a distinct Pali line of the prayer (repeats are practised once). */
function practiceLines(prayer: Prayer) {
  const seen = new Set<string>();
  return prayer.sections.flatMap((section, si) =>
    section.lines.flatMap((line, li) => {
      if (seen.has(line.pi)) return [];
      seen.add(line.pi);
      return [{ key: `${si}-${li}`, line }];
    }),
  );
}

export function PronunciationTrainer({ prayer }: { prayer: Prayer }) {
  const { t, lang: ui } = useT();
  const prefs = readingPrefs.use();
  const lines = useMemo(() => practiceLines(prayer), [prayer]);
  const [index, setIndex] = useState(0);
  const { key, line } = lines[index];
  const syllables = useMemo(() => syllabify(line.pi), [line.pi]);
  const tips = useMemo(() => tipsFor(line.pi), [line.pi]);

  const model = useRef<HTMLAudioElement | null>(null);
  const mine = useRef<HTMLAudioElement | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [playing, setPlaying] = useState<"model" | "slow" | "mine" | "compare" | null>(null);
  const [rec, setRec] = useState<RecState>("idle");
  const [recording, setRecording] = useState<string | null>(null);

  const silenceAll = () => {
    model.current?.pause();
    mine.current?.pause();
    if (typeof window !== "undefined" && "speechSynthesis" in window) speechSynthesis.cancel();
    setPlaying(null);
  };

  // A new line starts fresh; the previous recording is discarded.
  useEffect(() => {
    return () => {
      model.current?.pause();
      mine.current?.pause();
      if (recorder.current?.state === "recording") recorder.current.stop();
      if (stopTimer.current) clearTimeout(stopTimer.current);
      setPlaying(null);
      setRec((r) => (r === "recorded" || r === "recording" ? "idle" : r));
      setRecording((url) => {
        if (url) URL.revokeObjectURL(url);
        return null;
      });
    };
  }, [key]);

  /** Plays the model line; resolves when it ends. */
  function playModel(slow: boolean): Promise<void> {
    return new Promise((resolve) => {
      const src = clipSrc(prayer.slug, key, "pi");
      if (src) {
        model.current ??= new Audio();
        const a = model.current;
        a.src = src;
        a.playbackRate = slow ? 0.7 : 1;
        a.onended = a.onerror = () => resolve();
        a.play().catch(() => resolve());
        return;
      }
      // No clip: the device voice, reading the Devanagari form.
      if (!("speechSynthesis" in window)) return resolve();
      const u = new SpeechSynthesisUtterance(paliToDevanagari(line.pi));
      u.lang = "hi-IN";
      u.rate = slow ? 0.6 : 0.85;
      u.onend = u.onerror = () => resolve();
      speechSynthesis.speak(u);
    });
  }

  function playMine(): Promise<void> {
    return new Promise((resolve) => {
      if (!recording) return resolve();
      mine.current ??= new Audio();
      const a = mine.current;
      a.src = recording;
      a.onended = a.onerror = () => resolve();
      a.play().catch(() => resolve());
    });
  }

  async function run(kind: "model" | "slow" | "mine" | "compare") {
    if (playing === kind) return silenceAll();
    silenceAll();
    setPlaying(kind);
    if (kind === "model" || kind === "slow") await playModel(kind === "slow");
    else if (kind === "mine") await playMine();
    else {
      await playModel(false);
      await new Promise((r) => setTimeout(r, 400));
      await playMine();
    }
    setPlaying((p) => (p === kind ? null : p));
  }

  async function startRecording() {
    silenceAll();
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setRec("unsupported");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      setRec("denied");
      return;
    }
    const chunks: Blob[] = [];
    const r = new MediaRecorder(stream);
    recorder.current = r;
    r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    r.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      if (stopTimer.current) clearTimeout(stopTimer.current);
      const url = URL.createObjectURL(new Blob(chunks, { type: r.mimeType || "audio/webm" }));
      setRecording((old) => {
        if (old) URL.revokeObjectURL(old);
        return url;
      });
      setRec("recorded");
    };
    r.start();
    setRec("recording");
    // Stop on its own: room for the line at an unhurried pace, at most 20 s.
    const modelSeconds = model.current?.duration && Number.isFinite(model.current.duration) ? model.current.duration : 7;
    stopTimer.current = setTimeout(() => r.state === "recording" && r.stop(), Math.min(20000, modelSeconds * 1800 + 2000));
  }

  function stopRecording() {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }

  const devanagari = paliToDevanagari(line.pi);
  const meaning = line[prefs.translation];
  const actionButton = "flex flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-3 text-xs font-semibold transition-colors disabled:opacity-40";

  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-[#6D645D] mb-2">
        <span aria-live="polite">{t("pron.lineOf", { i: index + 1, n: lines.length })}</span>
      </div>

      <div className="rounded-3xl bg-[#FFFCF6] border border-[#E7DCC8] px-5 py-6">
        <p className="sr-only" lang="pi">{line.pi}</p>
        <p aria-hidden className="font-pali text-[26px] leading-relaxed text-[#2A1A1C] break-words">
          {syllables.map((word, w) => (
            <span key={w} className="inline-block mr-3">
              {word.map((s, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-[#B8AFA6] mx-px">·</span>}
                  <span className={s.heavy ? "font-semibold text-[#6D252C]" : "text-[#4A4340]"}>{s.text}</span>
                </span>
              ))}
            </span>
          ))}
        </p>
        <p lang="pi" className="mt-3 text-xl leading-relaxed text-[#3A1418]">{devanagari}</p>
        <p lang={prefs.translation} className="mt-3 text-sm text-[#5B5350] leading-relaxed">{meaning}</p>
        <p className="mt-4 text-xs text-[#6D645D] leading-relaxed">{t("pron.heavyHint")}</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button type="button" onClick={() => void run("model")} aria-pressed={playing === "model"} className={cn(actionButton, playing === "model" ? "bg-[#6D252C] text-[#F7F2E8] border-[#6D252C]" : "bg-white text-[#6D252C] border-[#E7DCC8]")}>
          {playing === "model" ? <Square className="h-5 w-5 fill-current" /> : <Volume2 className="h-5 w-5" />}
          {t("pron.listen")}
        </button>
        <button type="button" onClick={() => void run("slow")} aria-pressed={playing === "slow"} className={cn(actionButton, playing === "slow" ? "bg-[#6D252C] text-[#F7F2E8] border-[#6D252C]" : "bg-white text-[#6D252C] border-[#E7DCC8]")}>
          {playing === "slow" ? <Square className="h-5 w-5 fill-current" /> : <Snail className="h-5 w-5" />}
          {t("pron.slow")}
        </button>
        {rec === "recording" ? (
          <button type="button" onClick={stopRecording} className={cn(actionButton, "bg-[#7A2A24] text-white border-[#7A2A24]")}>
            <span className="relative flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-white/40 motion-safe:animate-ping" />
              <Square className="relative h-4 w-4 fill-current" />
            </span>
            {t("pron.stop")}
          </button>
        ) : (
          <button type="button" onClick={() => void startRecording()} className={cn(actionButton, "bg-white text-[#6D252C] border-[#E7DCC8]")}>
            <Mic className="h-5 w-5" />
            {recording ? t("pron.again") : t("pron.record")}
          </button>
        )}
      </div>

      {rec === "recording" && (
        <p role="status" className="mt-3 text-sm text-center text-[#7A2A24]">{t("pron.recording")}</p>
      )}
      {(rec === "denied" || rec === "unsupported") && (
        <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-[#7A2A24]">
          <MicOff className="h-4 w-4 flex-shrink-0 mt-0.5" /> {rec === "denied" ? t("pron.micDenied") : t("pron.micUnsupported")}
        </p>
      )}

      {recording && rec !== "recording" && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => void run("mine")} aria-pressed={playing === "mine"} className={cn(actionButton, "flex-row", playing === "mine" ? "bg-[#56634A] text-white border-[#56634A]" : "bg-white text-[#56634A] border-[#E7DCC8]")}>
            {playing === "mine" ? <Square className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4" />}
            {t("pron.yours")}
          </button>
          <button type="button" onClick={() => void run("compare")} aria-pressed={playing === "compare"} className={cn(actionButton, "flex-row", playing === "compare" ? "bg-[#56634A] text-white border-[#56634A]" : "bg-white text-[#56634A] border-[#E7DCC8]")}>
            {playing === "compare" ? <Square className="h-4 w-4 fill-current" /> : <ArrowLeftRight className="h-4 w-4" />}
            {t("pron.compare")}
          </button>
        </div>
      )}

      {tips.length > 0 && (
        <section aria-labelledby="pron-tips" className="mt-6">
          <h2 id="pron-tips" className="text-sm font-bold text-[#2A1A1C] mb-2">{t("pron.tips")}</h2>
          <ul className="space-y-2">
            {tips.map((id) => (
              <li key={id} className="flex gap-3 rounded-2xl bg-white border border-[#E7DCC8] px-4 py-3">
                <span className="font-pali flex-shrink-0 min-w-[4.5rem] text-sm font-semibold text-[#6D252C]">{TIPS[id].sample}</span>
                <span lang={ui} className="text-sm text-[#2A1A1C] leading-relaxed">{TIPS[id][ui]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-6 flex gap-2">
        <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)} className="flex-1 flex items-center justify-center gap-1 rounded-full border border-[#6D252C]/25 py-3 text-sm font-semibold text-[#6D252C] disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" /> {t("pron.previous")}
        </button>
        <button type="button" disabled={index === lines.length - 1} onClick={() => setIndex(index + 1)} className="flex-1 flex items-center justify-center gap-1 rounded-full bg-[#6D252C] py-3 text-sm font-bold text-[#F7F2E8] disabled:opacity-40">
          {t("pron.next")} <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-5 text-xs text-[#6D645D] leading-relaxed">{t("pron.privacy")}</p>
    </div>
  );
}
