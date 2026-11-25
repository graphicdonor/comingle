"use client";
import { useCallback, useEffect, useRef, useState } from "react";

// Optional sound for the landing journey, off until the reader turns it on:
// a soft wind made in the browser, the temple bell as each chapter begins,
// and crickets from dusk.

interface Nodes {
  ac: AudioContext;
  master: GainNode;
  crickets: GainNode;
  bell: AudioBuffer | null;
}

function build(ac: AudioContext): Nodes {
  const master = ac.createGain();
  master.gain.value = 0;
  master.connect(ac.destination);

  // Wind: brown noise through a low-pass filter, slowly swelling.
  const buf = ac.createBuffer(1, ac.sampleRate * 6, ac.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.2;
  }
  const noise = ac.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const lowpass = ac.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 520;
  const wind = ac.createGain();
  wind.gain.value = 0.32;
  const swell = ac.createOscillator();
  swell.frequency.value = 0.06;
  const swellDepth = ac.createGain();
  swellDepth.gain.value = 0.18;
  swell.connect(swellDepth).connect(wind.gain);
  noise.connect(lowpass).connect(wind).connect(master);
  noise.start();
  swell.start();

  // Crickets: a high tone pulsed quickly, in bursts.
  const crickets = ac.createGain();
  crickets.gain.value = 0;
  crickets.connect(master);
  const tone = ac.createOscillator();
  tone.frequency.value = 4400;
  const pulse = ac.createGain();
  pulse.gain.value = 0.5;
  const pulser = ac.createOscillator();
  pulser.type = "square";
  pulser.frequency.value = 14;
  const pulseDepth = ac.createGain();
  pulseDepth.gain.value = 0.5;
  pulser.connect(pulseDepth).connect(pulse.gain);
  const burst = ac.createGain();
  burst.gain.value = 0.5;
  const burster = ac.createOscillator();
  burster.type = "square";
  burster.frequency.value = 0.7;
  const burstDepth = ac.createGain();
  burstDepth.gain.value = 0.5;
  burster.connect(burstDepth).connect(burst.gain);
  tone.connect(pulse).connect(burst).connect(crickets);
  [tone, pulser, burster].forEach((o) => o.start());

  return { ac, master, crickets, bell: null };
}

export function useJourneySound(chapter: number) {
  const [on, setOn] = useState(false);
  const nodes = useRef<Nodes | null>(null);

  const ring = useCallback(() => {
    const n = nodes.current;
    if (!n?.bell) return;
    const src = n.ac.createBufferSource();
    src.buffer = n.bell;
    const g = n.ac.createGain();
    g.gain.value = 0.32;
    src.connect(g).connect(n.master);
    src.start();
  }, []);

  const toggle = useCallback(() => {
    if (on) {
      const n = nodes.current;
      if (n) {
        n.master.gain.setTargetAtTime(0, n.ac.currentTime, 0.3);
        setTimeout(() => void n.ac.suspend(), 1200);
      }
      setOn(false);
      return;
    }
    const n = (nodes.current ??= build(new AudioContext()));
    void n.ac.resume();
    n.master.gain.setTargetAtTime(0.7, n.ac.currentTime, 0.6);
    if (!n.bell)
      void fetch("/sounds/bell.m4a")
        .then((r) => r.arrayBuffer())
        .then((b) => n.ac.decodeAudioData(b))
        .then((b) => {
          n.bell = b;
          ring();
        })
        .catch(() => {});
    setOn(true);
  }, [on, ring]);

  // A bell as each chapter begins; crickets from dusk.
  useEffect(() => {
    const n = nodes.current;
    if (!on || !n) return;
    ring();
    n.crickets.gain.setTargetAtTime(chapter >= 3 ? 0.018 : 0, n.ac.currentTime, 1.2);
  }, [chapter, on, ring]);

  useEffect(() => () => void nodes.current?.ac.close(), []);

  return { on, toggle };
}
