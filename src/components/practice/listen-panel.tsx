"use client";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, Repeat, RotateCcw, RotateCw, SkipBack, SkipForward, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/use-t";
import type { Prayer } from "@/lib/practice/prayers";
import { SPEEDS, type Speed, type usePrayerVoice } from "@/lib/practice/use-prayer-voice";

type Voice = ReturnType<typeof usePrayerVoice>;

function SpeedChip({ speed, onChange, label }: { speed: number; onChange: (s: Speed) => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={`${label}: ${speed}×`}
      onClick={() => onChange(SPEEDS[(SPEEDS.indexOf(speed as Speed) + 1) % SPEEDS.length])}
      className="h-10 min-w-[3.25rem] rounded-full border border-[#E7DCC8] px-3 text-sm font-semibold text-[#6D252C] hover:bg-[#F7F2E8]"
    >
      {speed}×
    </button>
  );
}

const iconButton = "h-10 w-10 rounded-full flex items-center justify-center text-[#6D252C] hover:bg-[#F7F2E8] disabled:opacity-30";

/** A real chanting recording: play/pause, ±10 s, speed, repeat (PRD §7.5). */
function RecordingPlayer({ audio }: { audio: NonNullable<Prayer["audio"]> }) {
  const { t } = useT();
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(audio.durationSeconds);
  const [speed, setSpeed] = useState<Speed>(1);
  const [loop, setLoop] = useState(false);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  useEffect(() => {
    if (ref.current) ref.current.playbackRate = speed;
  }, [speed]);

  return (
    <div className="rounded-2xl bg-white border border-[#E7DCC8] px-4 py-3 mb-4">
      <audio
        ref={ref}
        src={audio.url}
        preload="metadata"
        loop={loop}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || audio.durationSeconds)}
      />
      <div className="flex items-center gap-2">
        <button type="button" aria-label={playing ? t("listen.pause") : t("listen.play")} onClick={() => (playing ? ref.current?.pause() : ref.current?.play())} className="h-12 w-12 rounded-full bg-[#6D252C] text-[#F7F2E8] flex items-center justify-center flex-shrink-0">
          {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
        </button>
        <button type="button" aria-label={t("listen.back10")} onClick={() => ref.current && (ref.current.currentTime = Math.max(0, ref.current.currentTime - 10))} className={iconButton}>
          <RotateCcw className="h-4 w-4" />
        </button>
        <button type="button" aria-label={t("listen.forward10")} onClick={() => ref.current && (ref.current.currentTime = Math.min(duration, ref.current.currentTime + 10))} className={iconButton}>
          <RotateCw className="h-4 w-4" />
        </button>
        <span className="ml-auto text-xs tabular-nums text-[#6D645D]">{fmt(time)} / {fmt(duration)}</span>
        <SpeedChip speed={speed} onChange={setSpeed} label={t("listen.speed")} />
        <button type="button" aria-pressed={loop} aria-label={t("listen.repeat")} onClick={() => setLoop((l) => !l)} className={cn(iconButton, loop && "bg-[#6D252C]/10")}>
          <Repeat className="h-4 w-4" />
        </button>
      </div>
      <input
        type="range"
        aria-label={t("listen.recording")}
        min={0}
        max={duration || 1}
        step={0.1}
        value={time}
        onChange={(e) => ref.current && (ref.current.currentTime = Number(e.target.value))}
        className="mt-3 w-full accent-[#6D252C]"
      />
      <p className="mt-1 text-xs text-[#6D645D]">{audio.credit}</p>
    </div>
  );
}

/** Line-by-line reading with the device's voice, highlighting the current line. */
function VoicePlayer({ voice }: { voice: Voice }) {
  const { t } = useT();
  if (!voice.isSupported) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-white border border-[#E7DCC8] px-4 py-3 mb-4">
        <Volume2 className="h-4 w-4 text-[#885F19]" />
        <p className="text-sm text-[#5B5350]">{t("listen.unsupported")}</p>
      </div>
    );
  }
  const active = voice.status !== "idle";
  return (
    // While listening it stays pinned under the header, so pause is always in reach.
    <div className={cn("rounded-2xl bg-white border border-[#E7DCC8] px-4 py-3 mb-4", active && "sticky top-[3.75rem] z-30 shadow-[0_-8px_0_4px_#F7F2E8,0_8px_24px_-12px_rgba(42,26,28,0.25)]")}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={voice.status === "playing" ? t("listen.pause") : voice.status === "paused" ? t("listen.resume") : t("listen.play")}
          onClick={voice.status === "playing" ? voice.pause : voice.play}
          className="h-12 w-12 rounded-full bg-[#6D252C] text-[#F7F2E8] flex items-center justify-center flex-shrink-0"
        >
          {voice.status === "playing" ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
        </button>
        {active ? (
          <>
            <button type="button" aria-label={t("listen.previous")} onClick={voice.previous} className={iconButton}>
              <SkipBack className="h-4 w-4" />
            </button>
            <button type="button" aria-label={t("listen.next")} onClick={voice.next} className={iconButton}>
              <SkipForward className="h-4 w-4" />
            </button>
            <button type="button" aria-label={t("listen.stop")} onClick={voice.stop} className={iconButton}>
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          </>
        ) : (
          <div className="min-w-0">
            <p className="font-semibold text-[#2A1A1C]">{t("listen.title")}</p>
          </div>
        )}
        <div className="ml-auto flex items-center gap-1">
          <SpeedChip speed={voice.speed} onChange={voice.setSpeed} label={t("listen.speed")} />
          <button type="button" aria-pressed={voice.loop} aria-label={t("listen.repeat")} onClick={() => voice.setLoop(!voice.loop)} className={cn(iconButton, voice.loop && "bg-[#6D252C]/10")}>
            <Repeat className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p aria-live="polite" className="mt-2 text-xs text-[#6D645D] leading-relaxed">
        {active ? t("listen.progress", { i: voice.lineNumber, n: voice.lineCount }) : t(voice.aiVoice ? "listen.aiVoiceNote" : "listen.voiceNote")}
      </p>
      {voice.missingHindiVoice && <p className="mt-1 text-xs text-[#885F19] leading-relaxed">{t("listen.noHindiVoice")}</p>}
    </div>
  );
}

/** The prayer's audio: its recording if it has one, otherwise follow-along reading. */
export function ListenPanel({ prayer, voice }: { prayer: Prayer; voice: Voice }) {
  return prayer.audio ? <RecordingPlayer audio={prayer.audio} /> : <VoicePlayer voice={voice} />;
}

/** Keep the line being read in view. */
export function useFollowLine(activeLine: string | null) {
  useEffect(() => {
    if (!activeLine) return;
    const el = document.querySelector(`[data-line="${activeLine}"]`);
    // Centre it below the pinned player.
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeLine]);
}
