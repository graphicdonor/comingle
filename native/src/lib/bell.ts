import { createAudioPlayer, type AudioPlayer } from "expo-audio";
import { BREATH_CYCLE_MS } from "@/lib/practice/meditation-sounds";

// The meditation timer's sounds, made from the same synthesis as the
// website's (scripts/make-meditation-sounds.ts), so no recording rights are
// involved. Each has its own player, so they never interrupt the prayer voice
// or each other.

const SOURCES = {
  bell: require("../../assets/sounds/bell.m4a"),
  end: require("../../assets/sounds/bell-end.m4a"),
  chime: require("../../assets/sounds/chime.m4a"),
  breath: require("../../assets/sounds/breath.m4a"),
};
type Kind = keyof typeof SOURCES;

const players: Partial<Record<Kind, AudioPlayer>> = {};

function play(kind: Kind, fromSeconds = 0) {
  try {
    const p = (players[kind] ??= createAudioPlayer(SOURCES[kind]));
    void p.seekTo(fromSeconds).then(() => p.play());
  } catch {
    // Sound unavailable; the screen still shows the change.
  }
}

/** A soft bell, to begin. */
export const ringBell = () => play("bell");
/** Three bells, to end. */
export const ringEndBell = () => play("end");
/** A light chime to mark time. */
export const ringChime = () => play("chime");

let breathCycle = -1;

/**
 * Keeps the breath sound in step with the session: call on every tick with
 * the time elapsed (ms). Each 10-second cycle starts on time, from the right
 * point if the tick was a little late.
 */
export function breathAt(elapsedMs: number) {
  const cycle = Math.floor(elapsedMs / BREATH_CYCLE_MS);
  if (cycle === breathCycle) return;
  breathCycle = cycle;
  play("breath", (elapsedMs % BREATH_CYCLE_MS) / 1000);
}

export function previewBreath() {
  breathCycle = -1;
  play("breath");
}

export function stopBreath() {
  breathCycle = -1;
  try {
    players.breath?.pause();
  } catch {
    // Nothing playing.
  }
}
