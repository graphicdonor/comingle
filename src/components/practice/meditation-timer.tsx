"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Pause, Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { MEDITATIONS, MEDITATION_DURATIONS, type MeditationPractice } from "@/lib/practice/meditations";
import { readingPrefs } from "@/lib/practice/preferences";
import { ringBell, useWakeLock } from "@/lib/practice/client-hooks";
import { PostureFigure } from "@/components/visuals/posture-figure";

type Phase = "setup" | "running" | "paused" | "ended";

function formatTime(ms: number) {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MeditationTimer({ initialPractice, initialMinutes }: { initialPractice: MeditationPractice["id"]; initialMinutes: number }) {
  const prefs = readingPrefs.use();
  const [practiceId, setPracticeId] = useState(initialPractice);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [phase, setPhase] = useState<Phase>("setup");
  const [endAt, setEndAt] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [breathGuide, setBreathGuide] = useState(false);
  const practice = MEDITATIONS.find((m) => m.id === practiceId) ?? MEDITATIONS[0];

  useWakeLock(prefs.keepAwake && (phase === "running" || phase === "paused"));

  // Time is measured against a fixed end moment, so it stays accurate even
  // if the browser throttles timers while the screen is dimmed.
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      const left = endAt - Date.now();
      if (left <= 0) {
        setRemaining(0);
        setPhase("ended");
        ringBell();
      } else {
        setRemaining(left);
      }
    }, 250);
    return () => clearInterval(id);
  }, [phase, endAt]);

  function start() {
    ringBell();
    const ms = minutes * 60_000;
    setRemaining(ms);
    setEndAt(Date.now() + ms);
    setPhase("running");
  }
  function pause() {
    setRemaining(Math.max(0, endAt - Date.now()));
    setPhase("paused");
  }
  function resume() {
    setEndAt(Date.now() + remaining);
    setPhase("running");
  }

  if (phase === "setup") {
    return (
      <div className="space-y-7">
        <header className="flex items-end gap-3">
          <div className="flex-1">
            <h1 className="text-[28px] font-bold tracking-tight text-[#2A1A1C]">Meditate</h1>
            <p className="mt-1 text-[15px] text-[#5B5350]">Choose a practice and how long you&apos;d like to sit.</p>
          </div>
          <PostureFigure id="burmese" decorative className="h-32 w-28 flex-shrink-0" />
        </header>

        <div role="radiogroup" aria-label="Practice" className="space-y-3">
          {MEDITATIONS.map((m) => {
            const selected = m.id === practice.id;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setPracticeId(m.id)}
                className={cn(
                  "w-full text-left rounded-3xl border px-5 py-4 transition-colors",
                  selected ? "bg-white border-[#6D252C] ring-1 ring-[#6D252C]" : "bg-white/60 border-[#E7DCC8] hover:border-[#C6A15B]",
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-bold text-[#2A1A1C]">{m.title}</span>
                  <span className="font-pali text-sm text-[#A0701E]">{m.pali}</span>
                </div>
                <p className="text-sm text-[#5B5350] mt-0.5">{m.summary}</p>
              </button>
            );
          })}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A0701E] mb-3">Duration</p>
          <div role="radiogroup" aria-label="Duration in minutes" className="grid grid-cols-5 gap-2">
            {MEDITATION_DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                role="radio"
                aria-checked={d === minutes}
                onClick={() => setMinutes(d)}
                className={cn(
                  "rounded-2xl py-3 text-center border transition-colors",
                  d === minutes ? "bg-[#6D252C] border-[#6D252C] text-[#F7F2E8]" : "bg-white border-[#E7DCC8] text-[#2A1A1C]",
                )}
              >
                <span className="block text-lg font-bold leading-none">{d}</span>
                <span className="block text-[10px] mt-1 opacity-75">min</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-[#FFFCF6] border border-[#E7DCC8] px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#A0701E] mb-3">How to practise</p>
          <ol className="space-y-2.5">
            {practice.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm text-[#4A4340] leading-relaxed">
                <span className="text-[#A0701E] font-semibold">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-[#7A706B] leading-relaxed">{practice.context}</p>
        </div>

        <label className="flex items-center justify-between gap-4 rounded-3xl bg-white border border-[#E7DCC8] px-5 py-4 cursor-pointer">
          <span>
            <span className="block font-semibold text-[#2A1A1C]">Breathing guide</span>
            <span className="block text-sm text-[#5B5350]">Optional: a slow circle to breathe with (in 4s, out 6s) if it helps you settle.</span>
          </span>
          <input type="checkbox" role="switch" checked={breathGuide} onChange={(e) => setBreathGuide(e.target.checked)} className="sr-only peer" />
          <span
            aria-hidden
            className={cn(
              "relative h-7 w-12 rounded-full transition-colors flex-shrink-0 peer-focus-visible:ring-2 peer-focus-visible:ring-[#6D252C]/40",
              breathGuide ? "bg-[#6D252C]" : "bg-[#D8CFC1]",
            )}
          >
            <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all", breathGuide ? "left-6" : "left-1")} />
          </span>
        </label>

        <button type="button" onClick={start} className="w-full flex items-center justify-center gap-2 rounded-full bg-[#6D252C] text-[#F7F2E8] py-4 text-[15px] font-bold">
          <Play className="h-4 w-4 fill-current" /> Begin · {minutes} min
        </button>
        <p className="text-center text-xs text-[#8A7F76]">
          A soft bell marks the start and end. This is a contemplative practice, not a medical or therapeutic treatment.
        </p>
      </div>
    );
  }

  const totalMs = minutes * 60_000;
  const elapsed = totalMs - remaining;
  const progress = totalMs ? Math.min(1, Math.max(0, elapsed / totalMs)) : 0;
  const inhale = elapsed % 10_000 < 4_000;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#3A1418] text-[#F7F2E8] px-6">
      {phase === "ended" ? (
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E9BE73]">{practice.title}</p>
          <h1 className="mt-3 text-3xl font-bold">Session complete</h1>
          <p className="mt-3 text-[15px] text-[#F7F2E8]/75 max-w-xs mx-auto leading-relaxed">
            Take a moment before you move on. Notice how you feel, without judging it.
          </p>
          <div className="mt-10 flex flex-col gap-3 w-64 mx-auto">
            <button type="button" onClick={() => setPhase("setup")} className="rounded-full bg-[#F7F2E8] text-[#6D252C] py-3 text-sm font-bold">
              Sit again
            </button>
            <Link href="/app" className="rounded-full border border-[#F7F2E8]/30 py-3 text-sm font-semibold text-center">
              Back to today
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#E9BE73]">{practice.title}</p>
          <div className="relative my-10 h-72 w-72 flex items-center justify-center">
            {/* Progress ring: fills as the session elapses. */}
            <svg viewBox="0 0 256 256" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx={128} cy={128} r={122} fill="none" stroke="#F7F2E8" strokeOpacity={0.12} strokeWidth={3} />
              <circle
                cx={128}
                cy={128}
                r={122}
                fill="none"
                stroke="#D99A38"
                strokeWidth={4}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - progress}
                style={{ transition: "stroke-dashoffset 0.3s linear" }}
              />
            </svg>
            {breathGuide ? (
              <span
                aria-hidden
                className="absolute inset-6 rounded-full bg-[#D99A38]/[0.14] border border-[#D99A38]/35"
                style={{
                  transform: `scale(${phase === "running" && inhale ? 1 : 0.62})`,
                  transition: `transform ${inhale ? 4 : 6}s ease-in-out`,
                }}
              />
            ) : (
              <span
                aria-hidden
                className={cn(
                  "absolute inset-6 rounded-full bg-[#F7F2E8]/[0.07] border border-[#F7F2E8]/15",
                  phase === "running" && "motion-safe:animate-[breathe_10s_ease-in-out_infinite]",
                )}
              />
            )}
            <span aria-hidden className="absolute inset-16 rounded-full border border-[#D99A38]/20" />
            <span className="relative flex flex-col items-center">
              <span role="timer" aria-live="off" className="text-5xl font-semibold tabular-nums tracking-tight">
                {formatTime(remaining)}
              </span>
              {breathGuide && phase === "running" && (
                <span className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#E9BE73]">
                  {inhale ? "Breathe in" : "Breathe out"}
                </span>
              )}
            </span>
          </div>
          <p className="text-sm text-[#F7F2E8]/70 max-w-xs text-center leading-relaxed min-h-[3rem]">
            {phase === "paused" ? "Paused" : practice.steps[1] ?? practice.steps[0]}
          </p>
          <div className="mt-10 flex items-center gap-4">
            <button
              type="button"
              onClick={() => setPhase("ended")}
              aria-label="End session"
              className="h-14 w-14 rounded-full border border-[#F7F2E8]/25 flex items-center justify-center"
            >
              <Square className="h-4 w-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={phase === "running" ? pause : resume}
              aria-label={phase === "running" ? "Pause" : "Resume"}
              className="h-[72px] w-[72px] rounded-full bg-[#F7F2E8] text-[#6D252C] flex items-center justify-center"
            >
              {phase === "running" ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
            </button>
            <span className="h-14 w-14" aria-hidden />
          </div>
        </>
      )}
    </div>
  );
}
