"use client";
import { BREATH_CYCLE_MS, renderBell, renderBreath, renderChime, renderEndBell } from "./meditation-sounds";

// Plays the meditation timer's sounds in the browser (see meditation-sounds.ts).
// The sounds are rendered once, on first use, into audio buffers.

type Kind = "bell" | "end" | "chime" | "breath";

let ctx: AudioContext | null = null;
const buffers = new Map<Kind, AudioBuffer>();
let breathSource: AudioBufferSourceNode | null = null;
let breathCycle = -1;

function audio(): AudioContext | null {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return null;
  }
}

function buffer(kind: Kind): AudioBuffer | null {
  const c = audio();
  if (!c) return null;
  let b = buffers.get(kind);
  if (!b) {
    const render = { bell: renderBell, end: renderEndBell, chime: renderChime, breath: renderBreath }[kind];
    const data = render(c.sampleRate);
    b = c.createBuffer(1, data.length, c.sampleRate);
    b.copyToChannel(data as Float32Array<ArrayBuffer>, 0);
    buffers.set(kind, b);
  }
  return b;
}

function play(kind: Kind, offsetSeconds = 0): AudioBufferSourceNode | null {
  const c = audio();
  const b = buffer(kind);
  if (!c || !b) return null;
  const src = c.createBufferSource();
  src.buffer = b;
  src.connect(c.destination);
  src.start(0, Math.min(offsetSeconds, b.duration - 0.01));
  return src;
}

export const meditationAudio = {
  /** Call from the tap that starts a session: browsers only allow sound after a tap. */
  prepare() {
    audio();
    for (const k of ["bell", "end", "chime", "breath"] as const) buffer(k);
  },
  bell: () => void play("bell"),
  end: () => void play("end"),
  chime: () => void play("chime"),
  /**
   * Keeps the breath sound in step with the session: call on every tick with
   * the time elapsed (ms). Each 10-second cycle starts when it should, from
   * the right point if the tick was a little late.
   */
  breathAt(elapsedMs: number) {
    const cycle = Math.floor(elapsedMs / BREATH_CYCLE_MS);
    if (cycle === breathCycle) return;
    breathCycle = cycle;
    breathSource?.stop();
    breathSource = play("breath", (elapsedMs % BREATH_CYCLE_MS) / 1000);
  },
  /** One cycle, to hear what it sounds like. */
  previewBreath() {
    this.stopBreath();
    breathSource = play("breath");
  },
  stopBreath() {
    try {
      breathSource?.stop();
    } catch {
      // Already stopped.
    }
    breathSource = null;
    breathCycle = -1;
  },
};
