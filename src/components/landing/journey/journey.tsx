"use client";
/* eslint-disable @next/next/no-img-element -- layered scenery, sized and moved by the scroll */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { CAMERA, CHAPTER_COUNT, DIYAS, LAYERS, LIGHT, MOON, STARS, SUN, ASPECT, at, colorAt, ramp, type Layer } from "./scene";
import { useJourneySound } from "./sound";

// One day under the Bodhi tree: the opening of the landing page. A sticky,
// full-screen painted scene that the reader moves through by scrolling,
// with the chapter text (real, indexable HTML) scrolling over it.

const SRC = "/landing/journey/";

interface Dims {
  w: number;
  h: number;
  boxW: number;
  boxH: number;
  top: number;
}

/** The painting's frame: covers the screen with a little room to move. */
function frame(w: number, h: number): Dims {
  const boxW = Math.max(w, h * ASPECT) * 1.12;
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

const mix = (a: string, b: string, t: number) => {
  const pa = a.match(/\d+/g)!.map(Number);
  const pb = b.match(/\d+/g)!.map(Number);
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * t)).join(",")})`;
};

const box = (d: Dims) => ({ left: (d.w - d.boxW) / 2, top: d.top, width: d.boxW, height: d.boxH });
const origin = (d: Dims) => `50% ${(((d.h / 2 - d.top) / d.boxH) * 100).toFixed(2)}%`;
const EXIT_ORIGIN: Record<string, string> = { left: "0% 100%", right: "100% 100%", steps: "50% 100%" };

function SceneLayer({ layer, p, d, still, children }: { layer: Layer; p: MotionValue<number>; d: Dims; still: boolean; children?: ReactNode }) {
  const transform = useTransform(p, (v) => layerTransform(layer, v, d, still));
  const tint = useTransform(p, (v) => mix(colorAt(LIGHT.tint, v), colorAt(LIGHT.skyBottom, v), layer.haze));
  const tintOpacity = useTransform(p, (v) => Math.max(at(LIGHT.tintOpacity, v), at(LIGHT.hazeOpacity, v) * layer.haze));
  const src = `${SRC}${layer.id}.webp`;
  return (
    <motion.div className="absolute will-change-transform" style={{ ...box(d), transform, transformOrigin: EXIT_ORIGIN[layer.id] ?? origin(d) }}>
      <img src={src} alt="" className="absolute inset-0 h-full w-full select-none" draggable={false} decoding="async" />
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: tint, opacity: tintOpacity, maskImage: `url(${src})`, WebkitMaskImage: `url(${src})`, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" }}
      />
      {children}
    </motion.div>
  );
}

/** Sun and moon, behind the far mountains and moving with them. */
function SkyObjects({ p, d, still }: { p: MotionValue<number>; d: Dims; still: boolean }) {
  const transform = useTransform(p, (v) => cameraTransform(0.1, v, d, still));
  const sunTop = useTransform(p, (v) => `${((SUN.from + (SUN.to - SUN.from) * ramp(v, 0.05, 0.32)) - (SUN.size * ASPECT) / 2) * 100}%`);
  const sunOpacity = useTransform(p, (v) => ramp(v, 0.04, 0.12) * (1 - ramp(v, 0.42, 0.56)));
  const moonOpacity = useTransform(p, (v) => ramp(v, 0.8, 0.95));
  const moonY = useTransform(p, (v) => `${(1 - ramp(v, 0.8, 1)) * 30}%`);
  return (
    <motion.div className="absolute" style={{ ...box(d), transform, transformOrigin: origin(d) }}>
      <motion.img
        src="/illustrations/practice/sun.webp"
        alt=""
        className="absolute"
        style={{ left: `${(SUN.x - SUN.size / 2) * 100}%`, top: sunTop, width: `${SUN.size * 100}%`, opacity: sunOpacity }}
      />
      <motion.img
        src="/illustrations/practice/moon.webp"
        alt=""
        className="absolute j-float"
        style={{ left: `${(MOON.x - MOON.w / 2) * 100}%`, top: `${MOON.y * 100}%`, width: `${MOON.w * 100}%`, opacity: moonOpacity, translateY: moonY }}
      />
    </motion.div>
  );
}

/** Mist in the valley, strongest before dawn. */
function Mist({ p, d, still }: { p: MotionValue<number>; d: Dims; still: boolean }) {
  const transform = useTransform(p, (v) => cameraTransform(0.22, v, d, still));
  const opacity = useTransform(p, (v) => at(LIGHT.mist, v));
  return (
    <motion.div className="absolute" style={{ ...box(d), transform, transformOrigin: origin(d), opacity }}>
      <img src="/illustrations/practice/mist.webp" alt="" className="j-mist absolute" style={{ left: "-6%", top: "40%", width: "62%" }} />
      <img src="/illustrations/practice/mist.webp" alt="" className="j-mist j-mist-2 absolute" style={{ left: "42%", top: "45%", width: "62%" }} />
    </motion.div>
  );
}

function Diya({ x, y, i, p }: { x: number; y: number; i: number; p: MotionValue<number> }) {
  const opacity = useTransform(p, (v) => ramp(v, 0.6 + i * 0.022, 0.625 + i * 0.022));
  return (
    <motion.span className="absolute inset-0" style={{ opacity }} aria-hidden>
      <span className="j-diya-glow absolute block rounded-full" style={{ left: `${(x - 0.026) * 100}%`, top: `${(y - 0.052) * 100}%`, width: "5.2%", aspectRatio: "1" }} />
      <svg viewBox="0 0 10 18" className="j-flame absolute" style={{ left: `${(x - 0.0035) * 100}%`, top: `${(y - 0.03) * 100}%`, width: "0.7%" }}>
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

function Stars({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, (v) => at(LIGHT.stars, v));
  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      {STARS.map(([x, y, s], i) => (
        <span
          key={i}
          className="j-twinkle absolute rounded-full bg-[#FFF4D6]"
          style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: s, height: s, animationDelay: `${(i % 7) * 0.45}s`, animationDuration: `${2.4 + (i % 5) * 0.6}s` }}
        />
      ))}
    </motion.div>
  );
}

function Birds({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, (v) => ramp(v, 0.16, 0.22) * (1 - ramp(v, 0.42, 0.5)));
  return (
    <motion.div className="absolute inset-x-0 top-[16%] h-[20%]" style={{ opacity }} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <svg key={i} viewBox="0 0 20 10" className="j-bird absolute" style={{ width: 14 + (i % 2) * 6, top: `${20 + i * 14}%`, animationDelay: `${i * 0.9}s` }}>
          <path d="M1 6 Q5 1 10 6 Q15 1 19 6" stroke="#3E2A2A" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        </svg>
      ))}
    </motion.div>
  );
}

function Fireflies({ p }: { p: MotionValue<number> }) {
  const opacity = useTransform(p, (v) => ramp(v, 0.84, 0.96));
  return (
    <motion.div className="absolute inset-0" style={{ opacity }} aria-hidden>
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

export interface Chapter {
  id: string;
  label: string;
  labelHi: string;
  content: ReactNode;
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

  const { scrollYProgress: p } = useScroll({ target: container, offset: ["start start", "end end"] });
  useMotionValueEvent(p, "change", (v) => setActive(Math.min(CHAPTER_COUNT - 1, Math.round(v * (CHAPTER_COUNT - 1)))));

  const sky = useTransform(p, (v) => `linear-gradient(180deg, ${colorAt(LIGHT.skyTop, v)} 0%, ${colorAt(LIGHT.skyBottom, v)} 62%)`);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setDims(frame(e.contentRect.width, e.contentRect.height)));
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
    <section ref={container} id="journey" aria-label="One day of practice" className="relative bg-[#070B1F]" style={{ height: `${CHAPTER_COUNT * 100}svh` }}>
      <div ref={stage} className="sticky top-0 h-svh overflow-hidden" aria-hidden>
        <motion.div className="absolute inset-0" style={{ backgroundImage: sky }} />
        <Stars p={p} />
        {dims && (
          <>
            <SkyObjects p={p} d={dims} still={reduce} />
            <SceneLayer layer={LAYERS[0]} p={p} d={dims} still={reduce} />
            <Mist p={p} d={dims} still={reduce} />
            {LAYERS.slice(1).map((l) => (
              <SceneLayer key={l.id} layer={l} p={p} d={dims} still={reduce}>
                {l.id === "bodhi" && DIYAS.map(([x, y], i) => <Diya key={i} x={x} y={y} i={i} p={p} />)}
              </SceneLayer>
            ))}
          </>
        )}
        <Birds p={p} />
        <Fireflies p={p} />
        {/* Shade so the words stay readable over the painting. */}
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(10,8,20,0.78)_0%,rgba(10,8,20,0.35)_38%,transparent_62%)] md:bg-[linear-gradient(90deg,rgba(10,8,20,0.7)_0%,rgba(10,8,20,0.3)_42%,transparent_65%)]" />
      </div>

      {/* Chapter rail */}
      <nav aria-label="Chapters" className="pointer-events-none absolute inset-0 z-10">
        <div className="sticky top-0 h-svh">
          <ol className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 md:right-8">
            {chapters.map((c, i) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === active ? "step" : undefined}
                  className="group flex items-center justify-end gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F7F2E8]/70 hover:text-[#F7F2E8]"
                >
                  <span className={`hidden md:inline transition-opacity ${i === active ? "opacity-100 text-[#F7F2E8]" : "opacity-0 group-hover:opacity-100"}`}>{c.label}</span>
                  <span className={`block rounded-full border transition-all ${i === active ? "h-3 w-3 border-[#E9BE73] bg-[#E9BE73]" : "h-2.5 w-2.5 border-[#F7F2E8]/60"}`} />
                  <span className="sr-only">{c.label}</span>
                </button>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={sound.toggle}
            aria-pressed={sound.on}
            className="pointer-events-auto absolute bottom-5 right-4 md:right-8 inline-flex items-center gap-2 rounded-full border border-[#F7F2E8]/25 bg-black/20 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F7F2E8]/85 backdrop-blur-sm hover:text-[#F7F2E8]"
          >
            <span className={`flex h-3 items-end gap-[2px] ${sound.on ? "j-eq" : ""}`} aria-hidden>
              {[0, 1, 2].map((i) => (
                <span key={i} className="block w-[2px] rounded-full bg-current" style={{ height: sound.on ? undefined : 3 + i * 2, animationDelay: `${i * 0.15}s` }} />
              ))}
            </span>
            {sound.on ? "Sound on" : "Sound off"}
          </button>
        </div>
      </nav>

      {/* Chapters */}
      <div className="pointer-events-none absolute inset-0">
        {chapters.map((c, i) => (
          <div key={c.id} id={c.id} className="relative flex h-svh items-end md:items-center" style={{ position: "absolute", top: `${i * 100}svh`, left: 0, right: 0 }}>
            <motion.div
              className="pointer-events-auto mx-auto w-full max-w-6xl px-5 pb-20 pr-12 sm:px-8 md:pb-0 md:pr-40"
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ amount: 0.5 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E9BE73]">
                <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span aria-hidden className="h-px w-8 bg-[#E9BE73]/70" />
                {c.label}
                <span lang="hi" className="normal-case tracking-normal text-[#F7F2E8]/70">
                  {c.labelHi}
                </span>
              </p>
              <div className="mt-4 max-w-xl text-[#F7F2E8]">{c.content}</div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Curtain while the scenery loads */}
      <div
        aria-hidden
        className={`j-curtain fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0E1222] transition-opacity duration-700 ${ready ? "pointer-events-none opacity-0" : "opacity-100"}`}
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
