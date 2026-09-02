import { motion } from "framer-motion";
import { useMemo } from "react";
import { SectionLabel } from "@/components/shared/SectionLabel";
import { useCountUp } from "@/hooks/useCountUp";
import { useInView } from "@/hooks/useInView";
import { LIVE_METRICS } from "@/data/content";

const EASE = [0.16, 1, 0.3, 1] as const;

const ZONES = [
  { cx: "22%", cy: "30%", r: 190, hue: "142, 240, 176" },
  { cx: "68%", cy: "58%", r: 220, hue: "111, 227, 255" },
  { cx: "45%", cy: "78%", r: 160, hue: "201, 255, 77" },
];

function seededRand(seed: number) {
  let h = seed;
  return () => {
    h = (h * 1664525 + 1013904223) >>> 0;
    return h / 4294967296;
  };
}

function generatePins(count: number) {
  const rand = seededRand(2024);
  return Array.from({ length: count }, (_, i) => ({
    x: 6 + rand() * 88,
    y: 8 + rand() * 84,
    pulse: i % 5 === 0,
    delay: rand() * 4,
  }));
}

function MapField() {
  const pins = useMemo(() => generatePins(34), []);
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] border border-line bg-charcoal sm:aspect-[16/10]">
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          {ZONES.map((z, i) => (
            <radialGradient key={i} id={`zone-${i}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={`rgba(${z.hue}, 0.22)`} />
              <stop offset="100%" stopColor={`rgba(${z.hue}, 0)`} />
            </radialGradient>
          ))}
        </defs>
        {ZONES.map((z, i) => (
          <circle key={i} cx={z.cx} cy={z.cy} r={z.r} fill={`url(#zone-${i})`} />
        ))}
        {/* faint organic "streets" */}
        <path d="M -10 40 Q 300 20 620 120" stroke="#f4f1ea" strokeOpacity={0.06} strokeWidth={1} fill="none" />
        <path d="M 40 -10 Q 220 260 480 420" stroke="#f4f1ea" strokeOpacity={0.06} strokeWidth={1} fill="none" />
      </svg>

      {pins.map((pin, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-bone/70"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          animate={pin.pulse ? { scale: [1, 1.8, 1], opacity: [0.7, 0.15, 0.7] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: pin.delay }}
        />
      ))}
    </div>
  );
}

function MetricRow({ value, label, delay, inView }: { value: number; label: string; delay: number; inView: boolean }) {
  const display = useCountUp(value, inView, 1.4);
  return (
    <motion.div
      className="flex items-baseline justify-between gap-4 border-t border-line py-3 first:border-t-0"
      initial={{ opacity: 0, x: 12 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-mist">{label}</span>
      <span className="font-display text-2xl font-semibold text-bone">{display}</span>
    </motion.div>
  );
}

export function LiveCommunity() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section id="live" className="relative bg-ink py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <SectionLabel>Live community</SectionLabel>
        <h2 className="mt-4 max-w-2xl text-balance font-display text-[clamp(2.4rem,5.5vw,4.5rem)] font-semibold leading-[1.02] tracking-tight text-bone">
          See your community in motion.
        </h2>

        <div ref={ref} className="relative mt-14">
          <MapField />

          <motion.div
            className="relative mt-6 w-full max-w-xs rounded-2xl border border-line bg-ink/70 p-5 backdrop-blur-md sm:absolute sm:right-6 sm:top-6 sm:mt-0"
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-lime">Near you</span>
            <div className="mt-2">
              {LIVE_METRICS.map((m, i) => (
                <MetricRow key={m.label} value={m.value} label={m.label} delay={0.1 * i} inView={inView} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
