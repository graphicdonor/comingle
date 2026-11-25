"use client";
/* eslint-disable @next/next/no-img-element -- layered scenery, sized and moved by the scroll */
import { memo, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { CAMERA, CHAPTER_COUNT, DIYAS, LAYERS, LIGHT, MOON, STARS, SUN, ASPECT, at, colorAt, ramp, type Layer } from "./scene";
import { useJourneySound } from "./sound";

// One day under the Bodhi tree: the opening of the landing page. A sticky,
// full-screen painted scene that the reader moves through by scrolling. The
// chapter text (real, indexable HTML) changes in place, and at the end the
// rest of the page slides up over the scene.
//
// Kept light so it stays smooth: each layer is one cropped image moved by a
// compositor transform, and one multiplied colour sets the time of day.

const SRC = "/landing/journey/";
const N = CHAPTER_COUNT;

interface Dims {
  w: number;
  h: number;
  boxW: number;
  boxH: number;
  top: number;
}

/** The painting's frame: covers the screen with a little room to move. */
function frame(w: number, h: number): Dims {
  const boxW = Math.max(w, h * ASPECT) * 1.06;
  const boxH = boxW / ASPECT;
  return { w, h, boxW, boxH, top: -(boxH - h) * 0.6 };
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function cameraTransform(depth: number, p: number, d: Dims, still: boolean) {
  const zoom = still ? 1 : at(CAMERA.zoom, p);
  const fx = still ? 0.5 : at(CAMERA.focus, p);
  const fy = still ? 0.5 : at(CAMERA.focusY, p);
  const s = 1 + (zoom - 1) * depth * 1.6;
  const pan = 0.5 + 0.5 * depth;
  const room = Math.max(0, (d.boxW * s - d.w) / 2);
  const tx = clamp(s * (0.5 - fx) * d.boxW * pan, -room, room);
  // Keep the painting covering the screen top and bottom.
  const minY = d.h / 2 - s * (d.top + d.boxH - d.h / 2);
  const maxY = -d.h / 2 - s * (d.top - d.h / 2);
  const ty = clamp(s * (0.5 - fy) * d.boxH * pan + (zoom - 1) * depth * d.h * 0.25, minY, Math.max(minY, maxY));
  return `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
}

function layerTransform(layer: Layer, p: number, d: Dims, still: boolean) {
  if (!layer.exit) return cameraTransform(layer.depth, p, d, still);
  if (still) return "none";
  const { x, y, scale } = layer.exit;
  return `translate3d(${(at(x, p) * d.w).toFixed(1)}px, ${(at(y, p) * d.h).toFixed(1)}px, 0) scale(${at(scale, p).toFixed(4)})`;
}

const box = (d: Dims): CSSProperties => ({ position: "absolute", left: (d.w - d.boxW) / 2, top: d.top, width: d.boxW, height: d.boxH });
const origin = (d: Dims) => `50% ${(((d.h / 2 - d.top) / d.boxH) * 100).toFixed(2)}%`;
const EXIT_ORIGIN: Record<string, string> = { left: "0% 100%", right: "100% 100%", steps: "50% 100%" };
const pct = (v: number) => `${(v * 100).toFixed(3)}%`;

interface PartProps {
  q: MotionValue<number>;
  d: Dims;
  still: boolean;
}

const SceneLayer = memo(function SceneLayer({ layer, index, q, d, still }: PartProps & { layer: Layer; index: number }) {
  const transform = useTransform(q, (v) => layerTransform(layer, v, d, still));
  const [x, y, w, h] = layer.rect;
  return (
    <motion.div style={{ ...box(d), transform, transformOrigin: EXIT_ORIGIN[layer.id] ?? origin(d) }}>
      <img
        src={`${SRC}${layer.id}.webp`}
        alt=""
        draggable={false}
        decoding="async"
        className="j-enter absolute select-none"
        style={{ left: pct(x), top: pct(y), width: pct(w), height: pct(h), ["--d" as string]: `${0.1 + index * 0.12}s`, ["--rise" as string]: `${4 + layer.depth * 10}%` }}
      />
    </motion.div>
  );
});

/** Something that moves with the camera at a given depth. */
const Follow = memo(function Follow({ depth, q, d, still, children, style }: PartProps & { depth: number; children: ReactNode; style?: CSSProperties }) {
  const transform = useTransform(q, (v) => cameraTransform(depth, v, d, still));
  return <motion.div style={{ ...box(d), transform, transformOrigin: origin(d), ...style }}>{children}</motion.div>;
});

function Sun({ q }: { q: MotionValue<number> }) {
  const top = useTransform(q, (v) => pct(SUN.from + (SUN.to - SUN.from) * ramp(v, 0.08, 0.3) - (SUN.size * ASPECT) / 2));
  const opacity = useTransform(q, (v) => ramp(v, 0.06, 0.14) * (1 - ramp(v, 0.42, 0.56)));
  return <motion.img src="/illustrations/practice/sun.webp" alt="" className="absolute mix-blend-screen" style={{ left: pct(SUN.x - SUN.size / 2), top, width: pct(SUN.size), opacity }} />;
}

function Moon({ q }: { q: MotionValue<number> }) {
  const opacity = useTransform(q, (v) => ramp(v, 0.8, 0.95));
  return <motion.img src="/illustrations/practice/moon.webp" alt="" className="j-float absolute mix-blend-screen" style={{ left: pct(MOON.x - MOON.w / 2), top: pct(MOON.y), width: pct(MOON.w), opacity }} />;
}

function Mist({ q }: { q: MotionValue<number> }) {
  const opacity = useTransform(q, (v) => at(LIGHT.mist, v));
  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      <img src="/illustrations/practice/mist.webp" alt="" className="j-mist absolute" style={{ left: "-6%", top: "40%", width: "62%" }} />
      <img src="/illustrations/practice/mist.webp" alt="" className="j-mist j-mist-2 absolute" style={{ left: "42%", top: "45%", width: "62%" }} />
    </motion.div>
  );
}

function Diya({ x, y, i, q }: { x: number; y: number; i: number; q: MotionValue<number> }) {
  const opacity = useTransform(q, (v) => ramp(v, 0.6 + i * 0.022, 0.625 + i * 0.022));
  return (
    <motion.span className="absolute inset-0" style={{ opacity }}>
      <span className="j-diya-glow absolute block rounded-full" style={{ left: pct(x - 0.026), top: pct(y - 0.052), width: "5.2%", aspectRatio: "1" }} />
      <svg viewBox="0 0 10 18" className="j-flame absolute" style={{ left: pct(x - 0.0035), top: pct(y - 0.03), width: "0.7%" }}>
        <defs>
          <radialGradient id={`flame-${i}`} cx="50%" cy="70%" r="60%">
            <stop offset="0" stopColor="#FFF8E1" />
            <stop offset="0.45" stopColor="#FFD166" />
            <stop offset="1" stopColor="#F08A24" />
          </radialGradient>
        </defs>
        <path d="M5 0 C 8 6, 10 10, 10 13 A 5 5 0 0 1 0 13 C 0 10, 2 6, 5 0 Z" fill={`url(#flame-${i})`} />
      </svg>
    </motion.span>
  );
}

function Stars({ q }: { q: MotionValue<number> }) {
  const opacity = useTransform(q, (v) => at(LIGHT.stars, v));
  return (
    <motion.div className="absolute inset-0 hidden md:block" style={{ opacity }}>
      {STARS.map(([x, y, s], i) => (
        <span
          key={i}
          className="j-twinkle absolute rounded-full bg-[#FFF4D6] shadow-[0_0_6px_rgba(255,244,214,0.8)]"
          style={{ left: pct(x), top: pct(y), width: s, height: s, animationDelay: `${(i % 7) * 0.45}s`, animationDuration: `${2.4 + (i % 5) * 0.6}s` }}
        />
      ))}
    </motion.div>
  );
}

function Birds({ q }: { q: MotionValue<number> }) {
  const opacity = useTransform(q, (v) => ramp(v, 0.16, 0.22) * (1 - ramp(v, 0.42, 0.5)));
  return (
    <motion.div className="absolute inset-x-0 top-[14%] h-[20%]" style={{ opacity }}>
      {[0, 1, 2, 3].map((i) => (
        <svg key={i} viewBox="0 0 20 10" className="j-bird absolute" style={{ width: 14 + (i % 2) * 6, top: `${20 + i * 14}%`, animationDelay: `${i * 0.9}s` }}>
          <path d="M1 6 Q5 1 10 6 Q15 1 19 6" stroke="#3E2A2A" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </svg>
      ))}
    </motion.div>
  );
}

function Fireflies({ q }: { q: MotionValue<number> }) {
  const opacity = useTransform(q, (v) => ramp(v, 0.84, 0.96));
  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      {Array.from({ length: 16 }, (_, i) => (
        <span
          key={i}
          className="j-firefly absolute rounded-full"
          style={{ left: `${8 + ((i * 61) % 84)}%`, top: `${48 + ((i * 37) % 44)}%`, animationDelay: `${(i % 6) * 0.7}s`, animationDuration: `${5 + (i % 4)}s` }}
        />
      ))}
    </motion.div>
  );
}

/** The painted scene, behind the words. Memoised: it only follows `q`. */
const Scene = memo(function Scene({ q, d, still }: PartProps) {
  const sky = useTransform(q, (v) => `linear-gradient(180deg, ${colorAt(LIGHT.skyTop, v)} 0%, ${colorAt(LIGHT.skyBottom, v)} 60%)`);
  const light = useTransform(q, (v) => colorAt(LIGHT.light, v));
  const part = { q, d, still };
  return (
    <div className="absolute inset-0" aria-hidden>
      <motion.div className="absolute inset-0" style={{ backgroundImage: sky }} />
      <Follow depth={0.1} {...part}>
        <Sun q={q} />
      </Follow>
      <SceneLayer layer={LAYERS[0]} index={0} {...part} />
      <Follow depth={0.22} {...part}>
        <Mist q={q} />
      </Follow>
      {LAYERS.slice(1).map((l, i) => (
        <SceneLayer key={l.id} layer={l} index={i + 1} {...part} />
      ))}
      <Birds q={q} />
      {/* The time of day, over the whole painting. */}
      <motion.div className="absolute inset-0 mix-blend-multiply" style={{ backgroundColor: light }} />
      <Stars q={q} />
      <Follow depth={0.1} {...part}>
        <Moon q={q} />
      </Follow>
      <Follow depth={0.7} {...part}>
        {DIYAS.map(([x, y], i) => (
          <Diya key={i} x={x} y={y} i={i} q={q} />
        ))}
      </Follow>
      <Fireflies q={q} />
      {/* Shade so the words stay readable over the painting. */}
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(14,10,24,0.82)_0%,rgba(14,10,24,0.45)_34%,transparent_58%)] md:bg-[radial-gradient(ellipse_62%_58%_at_22%_56%,rgba(14,10,24,0.6)_0%,rgba(14,10,24,0.3)_50%,transparent_100%)]" />
    </div>
  );
});

export interface Chapter {
  id: string;
  label: string;
  labelHi: string;
  content: ReactNode;
}

function ChapterText({ chapter, i, q, still }: { chapter: Chapter; i: number; q: MotionValue<number>; still: boolean }) {
  const c = i / (N - 1);
  const opacity = useTransform(q, (v) => 1 - ramp(Math.abs(v - c) * (N - 1), 0.2, 0.42));
  const y = useTransform(q, (v) => (still ? 0 : (c - v) * (N - 1) * 70));
  const visibility = useTransform(opacity, (o) => (o < 0.02 ? "hidden" : "visible"));
  return (
    <motion.div id={chapter.id} className="absolute inset-0 flex items-end md:items-center" style={{ opacity, y, visibility }}>
      <div className={`mx-auto w-full max-w-6xl px-5 pb-24 pr-14 sm:px-8 md:pb-0 md:pr-40 ${i === 0 ? "j-enter" : ""}`} style={{ ["--d" as string]: "0.7s", ["--rise" as string]: "24px" }}>
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E9BE73]">
          <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
          <span aria-hidden className="h-px w-8 bg-[#E9BE73]/70" />
          {chapter.label}
          <span lang="hi" className="normal-case tracking-normal text-[#F7F2E8]/70">
            {chapter.labelHi}
          </span>
        </p>
        <div className="mt-4 max-w-xl text-[#F7F2E8]">{chapter.content}</div>
      </div>
    </motion.div>
  );
}

export function Journey({ chapters }: { chapters: Chapter[] }) {
  const container = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion() ?? false;
  const [dims, setDims] = useState<Dims | null>(null);
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const total = LAYERS.length;
  const ready = loaded >= total;
  const sound = useJourneySound(active);

  // The section is one screen per chapter plus one more, over which the
  // rest of the page slides up; the chapters use all but that last screen.
  const { scrollYProgress } = useScroll({ target: container, offset: ["start start", "end end"] });
  const q = useTransform(scrollYProgress, (v) => Math.min(1, (v * N) / (N - 1)));
  useMotionValueEvent(q, "change", (v) => setActive(Math.round(v * (N - 1))));

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      // Ignore the small height changes from mobile browser bars.
      setDims((prev) => (prev && prev.w === width && Math.abs(prev.h - height) < 80 ? prev : frame(width, height)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Load the scenery before lifting the curtain (never wait more than 6 s).
  useEffect(() => {
    let done = false;
    LAYERS.forEach((l) => {
      const img = new Image();
      img.onload = img.onerror = () => !done && setLoaded((n) => n + 1);
      img.src = `${SRC}${l.id}.webp`;
    });
    const t = setTimeout(() => !done && setLoaded(total), 6000);
    return () => {
      done = true;
      clearTimeout(t);
    };
  }, [total]);

  const goTo = (i: number) => {
    const el = container.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + i * window.innerHeight, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section ref={container} id="journey" aria-label="One day of practice" className="relative bg-[#141A33]" style={{ height: `${(N + 1) * 100}svh` }}>
      <div ref={stage} className={`sticky top-0 h-svh overflow-hidden ${ready ? "j-ready" : ""}`}>
        {dims && <Scene q={q} d={dims} still={reduce} />}

        {chapters.map((c, i) => (
          <ChapterText key={c.id} chapter={c} i={i} q={q} still={reduce} />
        ))}

        <nav aria-label="Chapters" className="absolute right-4 top-1/2 -translate-y-1/2 md:right-8">
          <ol className="flex flex-col gap-4">
            {chapters.map((c, i) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === active ? "step" : undefined}
                  className="group flex items-center justify-end gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F7F2E8]/70 hover:text-[#F7F2E8]"
                >
                  <span className={`hidden md:inline transition-opacity duration-500 ${i === active ? "text-[#F7F2E8] opacity-100" : "opacity-0 group-hover:opacity-100"}`}>{c.label}</span>
                  <span className={`block rounded-full border transition-all duration-500 ${i === active ? "h-3 w-3 border-[#E9BE73] bg-[#E9BE73]" : "h-2.5 w-2.5 border-[#F7F2E8]/60"}`} />
                  <span className="sr-only md:hidden">{c.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <button
          type="button"
          onClick={sound.toggle}
          aria-pressed={sound.on}
          className="absolute bottom-5 right-4 inline-flex items-center gap-2 rounded-full border border-[#F7F2E8]/25 bg-black/20 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F7F2E8]/85 backdrop-blur-sm hover:text-[#F7F2E8] md:right-8"
        >
          <span className={`flex h-3 items-end gap-[2px] ${sound.on ? "j-eq" : ""}`} aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="block w-[2px] rounded-full bg-current" style={{ height: sound.on ? undefined : 3 + i * 2, animationDelay: `${i * 0.15}s` }} />
            ))}
          </span>
          {sound.on ? "Sound on" : "Sound off"}
        </button>
      </div>

      {/* Curtain while the scenery loads */}
      <div
        aria-hidden
        className={`j-curtain fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#141A33] transition-opacity duration-700 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        <svg viewBox="0 0 120 60" className="w-28" fill="none">
          <path d="M8 46 L34 22 L46 32 L62 12 L80 34 L92 26 L112 46" stroke="#F7F2E8" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx="78" cy="16" r="7" fill="#D99A38" />
          <path d="M26 54 Q60 48 94 54" stroke="#87977A" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#F7F2E8]/70">
          Arriving <span className="ml-2 tabular-nums text-[#F7F2E8]/50">{Math.round((loaded / total) * 100)}%</span>
        </p>
      </div>
    </section>
  );
}
