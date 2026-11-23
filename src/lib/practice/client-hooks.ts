"use client";
import { useEffect, useSyncExternalStore } from "react";

// ── Local time ────────────────────────────────────────────────────────────
// Pages are rendered on the server, which doesn't know the reader's time
// zone. This returns null during server render and hydration, then the local
// time (to the minute), so time-of-day content never mismatches.

function subscribeMinute(cb: () => void) {
  const id = setInterval(cb, 30_000);
  return () => clearInterval(id);
}
const minuteSnapshot = () => Math.floor(Date.now() / 60_000);
const serverMinute = () => null;

export function useLocalNow(): Date | null {
  const minute = useSyncExternalStore(subscribeMinute, minuteSnapshot, serverMinute);
  return minute === null ? null : new Date(minute * 60_000);
}

// ── Screen wake lock ──────────────────────────────────────────────────────
// Keeps the screen on while `active` (guided sessions, meditation). Silently
// does nothing where the Wake Lock API isn't available. Re-acquired when the
// page becomes visible again, since browsers release it on tab switch.

export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const s = await navigator.wakeLock.request("screen");
        if (cancelled) s.release().catch(() => {});
        else sentinel = s;
      } catch {
        // Denied (e.g. battery saver); the session still works without it.
      }
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") acquire();
    };

    acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      sentinel?.release().catch(() => {});
    };
  }, [active]);
}

// ── Bell ──────────────────────────────────────────────────────────────────
// A soft synthesised bowl-like tone, so no recording rights are involved.
// Must first be called from a user gesture (browsers block audio otherwise).

let audioCtx: AudioContext | null = null;

export function ringBell() {
  try {
    audioCtx ??= new AudioContext();
    const ctx = audioCtx;
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 6);
    master.connect(ctx.destination);
    // Slightly inharmonic partials give a bowl-like timbre.
    for (const [freq, level] of [[432, 1], [1080, 0.35], [1990, 0.15]] as const) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.value = level;
      osc.connect(gain).connect(master);
      osc.start(now);
      osc.stop(now + 6.2);
    }
  } catch {
    // Audio unavailable; the visual cue still shows.
  }
}
