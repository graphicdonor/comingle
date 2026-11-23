"use client";
import { useId } from "react";

// Quiet animated scenery for the home practice card: a rising sun in the
// morning, a crescent moon with twinkling stars in the evening. Purely
// decorative, so hidden from assistive technology.

const CREAM = "#F7F2E8";
const SAFFRON = "#D99A38";

const STARS = [
  { x: 52, y: 30, r: 2.2, d: 0 },
  { x: 92, y: 14, r: 1.6, d: 0.8 },
  { x: 118, y: 52, r: 1.8, d: 1.6 },
  { x: 178, y: 24, r: 2, d: 0.4 },
  { x: 74, y: 62, r: 1.4, d: 2.2 },
  { x: 188, y: 78, r: 1.5, d: 1.2 },
];

function Hills() {
  return (
    <>
      <path d="M0 150 Q55 98 120 126 T220 104 V150 Z" fill={CREAM} opacity={0.07} />
      <path d="M30 150 Q100 112 160 136 T240 124 V150 Z" fill={CREAM} opacity={0.06} />
    </>
  );
}

export function SkyScene({ variant, className }: { variant: "morning" | "evening"; className?: string }) {
  // Keep the generated id to characters that are always safe in url(#…).
  const maskId = `moon-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <svg viewBox="0 0 220 150" className={className} aria-hidden>
      {variant === "morning" ? (
        <g key="morning" className="anim-rise">
          <g className="anim-spin-slow" style={{ transformOrigin: "150px 78px" }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <line
                key={i}
                x1={150}
                y1={44}
                x2={150}
                y2={30}
                stroke={SAFFRON}
                strokeWidth={2.5}
                strokeLinecap="round"
                opacity={0.45}
                transform={`rotate(${i * 30} 150 78)`}
              />
            ))}
          </g>
          {/* The glow animation sets opacity itself, so the faintness lives on a wrapper. */}
          <g opacity={0.18}>
            <circle cx={150} cy={78} r={26} fill={SAFFRON} className="anim-glow" />
          </g>
          <circle cx={150} cy={78} r={20} fill={SAFFRON} opacity={0.85} />
        </g>
      ) : (
        <g key="evening" className="anim-fade-in">
          <defs>
            <mask id={maskId}>
              <rect width="220" height="150" fill="white" />
              <circle cx={162} cy={42} r={19} fill="black" />
            </mask>
          </defs>
          <g opacity={0.12}>
            <circle cx={150} cy={50} r={22} fill={CREAM} className="anim-glow" />
          </g>
          <circle cx={150} cy={50} r={19} fill={CREAM} opacity={0.9} mask={`url(#${maskId})`} />
          {STARS.map((s) => (
            <circle key={`${s.x}-${s.y}`} cx={s.x} cy={s.y} r={s.r} fill={CREAM} className="anim-twinkle" style={{ animationDelay: `${s.d}s` }} />
          ))}
        </g>
      )}
      <Hills />
    </svg>
  );
}
