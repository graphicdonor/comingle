/* eslint-disable @next/next/no-img-element -- small decorative layers placed by percentage */
import type { CSSProperties } from "react";
import { SCENE, type SceneVariant } from "@/lib/practice/practice-scene";

// The animated picture at the top of Today's practice card (the app has the
// same scene in native/src/components/practice-scene.tsx). Motion is pure
// CSS (globals.css, "Practice scene"), only when reduced motion isn't asked
// for; resting styles are the finished picture.

const SRC = "/illustrations/practice/";
const W = SCENE.width;
const H = SCENE.height;

/** Position from painting pixels, as percentages of the scene. */
const at = (x: number, y: number, w: number, h: number): CSSProperties => ({
  position: "absolute",
  left: `${(x / W) * 100}%`,
  top: `${(y / H) * 100}%`,
  width: `${(w / W) * 100}%`,
  height: `${(h / H) * 100}%`,
});

const vars = (v: Record<string, string>) => v as CSSProperties;

function Bird({ width }: { width: string }) {
  return (
    <svg viewBox="0 0 20 10" style={{ width }} fill="none">
      <path d="M1 6 Q5 1 10 6 Q15 1 19 6" stroke="#5B3A2E" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

export function PracticeScene({ variant, className = "" }: { variant: SceneVariant; className?: string }) {
  const morning = variant === "morning";
  const { sun, rays, hills, mist, birds, moon, glow, incense } = SCENE;
  return (
    <div aria-hidden className={`pointer-events-none overflow-hidden [container-type:inline-size] ${className}`}>
      <div className="ps-zoom absolute inset-0">
        {/* Morning */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${morning ? "opacity-100" : "ps-off opacity-0"}`}>
          <img src={`${SRC}morning.webp`} alt="" className="absolute inset-0 h-full w-full" decoding="async" />
          <img
            key={morning ? "rise" : "still"}
            src={`${SRC}rays.webp`}
            alt=""
            className={`ps-rays ${morning ? "ps-rays-in" : ""}`}
            style={at(sun.x - rays.size / 2, sun.to - rays.size / 2, rays.size, rays.size)}
          />
          <img
            key={morning ? "rise-sun" : "still-sun"}
            src={`${SRC}sun.webp`}
            alt=""
            className={morning ? "ps-rise" : ""}
            style={{ ...at(sun.x - sun.size / 2, sun.to - sun.size / 2, sun.size, sun.size), ...vars({ "--rise": `${((sun.from - sun.to) / sun.size) * 100}%` }) }}
          />
          <img src={`${SRC}hills.webp`} alt="" style={at(hills.x, hills.y, hills.w, hills.h)} />
          <img src={`${SRC}mist.webp`} alt="" className="ps-mist" style={at(mist.x, mist.y, mist.w, mist.h)} />
          <div className="ps-birds absolute inset-0" style={vars({ "--fly": `${((birds.to - birds.x) / W) * 100}%`, "--up": `${(-birds.rise / H) * 100}%` })}>
            <div className="absolute flex items-end" style={{ left: `${(birds.x / W) * 100}%`, top: `${(birds.y / H) * 100}%`, gap: "0.6%" }}>
              <Bird width="2.9cqw" />
              <span style={{ marginBottom: "1.4cqw" }}>
                <Bird width="2.2cqw" />
              </span>
              <Bird width="1.8cqw" />
            </div>
          </div>
        </div>

        {/* Evening */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${morning ? "ps-off opacity-0" : "opacity-100"}`}>
          <img src={`${SRC}evening.webp`} alt="" className="absolute inset-0 h-full w-full" decoding="async" loading="lazy" />
          {SCENE.stars.map(([x, y, s], i) => (
            <span
              key={i}
              className="ps-star rounded-full bg-[#FFF4D6]"
              style={{ ...at(x - s / 2, y - s / 2, s, s), ...vars({ "--d": `${1.6 + ((i * 377) % 1600) / 1000}s`, "--delay": `${((i * 431) % 2000) / 1000}s` }) }}
            />
          ))}
          <img
            key={morning ? "moon-still" : "moon-in"}
            src={`${SRC}moon.webp`}
            alt=""
            className={morning ? "" : "ps-moon"}
            style={at(moon.x - moon.w / 2, moon.y - moon.h / 2, moon.w, moon.h)}
            loading="lazy"
          />
          {SCENE.flames.map(([x, y], i) => (
            <img
              key={i}
              src={`${SRC}glow.webp`}
              alt=""
              className="ps-flame"
              style={{ ...at(x - glow / 2, y - glow / 2, glow, glow), ...vars({ "--d": `${1.2 + i * 0.23}s` }) }}
              loading="lazy"
            />
          ))}
          {[0, 1].map((i) => (
            <img
              key={i}
              src={`${SRC}smoke.webp`}
              alt=""
              className="ps-smoke"
              style={{ ...at(incense.x - incense.w / 2, incense.y - incense.h, incense.w, incense.h), ...vars({ "--delay": `${i * 2.6}s` }) }}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
