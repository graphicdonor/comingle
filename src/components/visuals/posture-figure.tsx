"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n/use-t";
import manifest from "./illustrations.json";

// Illustrations of postures, hand positions and prayer scenes, generated as
// flat-vector artwork and processed by scripts/process-illustrations.mjs.
// Frames that animate together share one crop, so cross-fading between them
// reads as movement (breathing, bowing, sitting down).

export type ImageId = keyof typeof manifest;
export type FigureId = "chair" | "bench" | "burmese" | "half-lotus" | "full-lotus" | "lap-hands" | "anjali" | "standing-anjali";
export type SceneId = "scene-place" | "scene-prepare" | "scene-reflect" | "scene-dedicate";
export type AnimationId = "breathe" | "bow" | "sit-down";
export type FigurePoint = "spine" | "seat" | "feet" | "foot" | "hands" | "knees" | "cushion";

/** Position on the image, in percent of its width and height. */
type Pt = { x: number; y: number };

type L = { en: string; hi: string };

interface FigureDef {
  label: L;
  image: ImageId;
  /** Slow breathing loop shown when motion is allowed. */
  breathe?: boolean;
  spine: [Pt, Pt];
  points: Partial<Record<FigurePoint, Pt[]>>;
}

const FIGURES: Record<FigureId, FigureDef> = {
  chair: {
    label: { en: "Sitting upright on a chair, feet flat on the floor, hands resting on the thighs", hi: "कुर्सी पर सीधे बैठे हुए, पैर ज़मीन पर सपाट, हाथ जाँघों पर" },
    image: "chair",
    spine: [{ x: 41, y: 4 }, { x: 36, y: 64 }],
    points: { seat: [{ x: 40, y: 67 }], feet: [{ x: 72, y: 93 }], hands: [{ x: 66, y: 53 }] },
  },
  bench: {
    label: { en: "Kneeling with a low bench under the sitting bones, shins and tops of the feet on the floor", hi: "बैठने की हड्डियों के नीचे छोटी बेंच रखकर घुटनों के बल, पिंडलियाँ और पैरों का ऊपरी भाग ज़मीन पर" },
    image: "bench",
    spine: [{ x: 45, y: 5 }, { x: 41, y: 76 }],
    points: { seat: [{ x: 43, y: 81 }], knees: [{ x: 83, y: 85 }], feet: [{ x: 22, y: 90 }] },
  },
  burmese: {
    label: { en: "Cross-legged on a cushion with both shins resting on the floor, one in front of the other", hi: "गद्दी पर पालथी मारकर, दोनों पिंडलियाँ ज़मीन पर, एक के आगे दूसरी" },
    image: "burmese",
    breathe: true,
    spine: [{ x: 50, y: 3 }, { x: 50, y: 82 }],
    points: { cushion: [{ x: 50, y: 94 }], knees: [{ x: 15, y: 85 }, { x: 85, y: 85 }] },
  },
  "half-lotus": {
    label: { en: "Half-lotus: one foot resting on the opposite thigh, the other foot on the floor", hi: "अर्ध-पद्मासन: एक पैर विपरीत जाँघ पर, दूसरा पैर ज़मीन पर" },
    image: "half-lotus",
    spine: [{ x: 50, y: 3 }, { x: 50, y: 82 }],
    points: { cushion: [{ x: 50, y: 94 }], foot: [{ x: 63, y: 81 }], knees: [{ x: 11, y: 85 }, { x: 89, y: 85 }] },
  },
  "full-lotus": {
    label: { en: "Full-lotus: each foot resting on the opposite thigh", hi: "पद्मासन: दोनों पैर विपरीत जाँघों पर" },
    image: "full-lotus",
    spine: [{ x: 50, y: 3 }, { x: 50, y: 82 }],
    points: { feet: [{ x: 27, y: 79 }, { x: 73, y: 79 }], knees: [{ x: 9, y: 85 }, { x: 91, y: 85 }] },
  },
  "lap-hands": {
    label: { en: "Hands resting in the lap, one on the other, thumbs lightly touching", hi: "हाथ गोद में, एक पर दूसरा, अंगूठे हल्के से मिले हुए" },
    image: "lap-hands",
    spine: [{ x: 50, y: 3 }, { x: 50, y: 82 }],
    points: { hands: [{ x: 50, y: 74 }] },
  },
  anjali: {
    label: { en: "Palms joined together at the chest (añjali)", hi: "छाती के सामने जुड़ी हुई हथेलियाँ (अंजलि)" },
    image: "anjali",
    spine: [{ x: 50, y: 3 }, { x: 50, y: 82 }],
    points: { hands: [{ x: 50, y: 44 }] },
  },
  "standing-anjali": {
    label: { en: "Standing with palms joined at the chest (añjali)", hi: "खड़े होकर छाती के सामने हथेलियाँ जोड़े हुए (अंजलि)" },
    image: "standing-anjali",
    spine: [{ x: 42, y: 4 }, { x: 40, y: 58 }],
    points: { hands: [{ x: 60, y: 24 }], feet: [{ x: 52, y: 95 }] },
  },
};

const SCENE_LABELS: Record<SceneId, L> = {
  "scene-place": { en: "Carrying a cushion to a quiet corner of a room by a window", hi: "खिड़की के पास कमरे के शांत कोने में गद्दी ले जाते हुए" },
  "scene-prepare": { en: "Kneeling to light a candle on a low table beside a vase of flowers", hi: "फूलदान के पास छोटी मेज़ पर घुटनों के बल बैठकर मोमबत्ती जलाते हुए" },
  "scene-reflect": { en: "Sitting quietly, eyes closed, in reflection", hi: "आँखें बंद किए शांत भाव से चिंतन में बैठे हुए" },
  "scene-dedicate": { en: "Sitting with palms joined, wishing well to all beings", hi: "हथेलियाँ जोड़कर सभी प्राणियों के कल्याण की कामना करते हुए" },
};

interface Frame {
  image: ImageId;
  /** How long the frame is held before fading to the next, in ms. */
  hold: number;
  caption?: { en: string; hi: string };
}

export const ANIMATIONS: Record<AnimationId, { label: L; fade: number; frames: Frame[] }> = {
  breathe: {
    label: { en: "Seated cross-legged, breathing slowly", hi: "पालथी मारकर बैठे हुए, धीरे-धीरे श्वास लेते हुए" },
    fade: 2200,
    frames: [
      { image: "burmese", hold: 3800 },
      { image: "burmese-inhale", hold: 2600 },
    ],
  },
  bow: {
    label: { en: "Bowing with palms joined, then rising", hi: "हथेलियाँ जोड़कर प्रणाम करते हुए, फिर सीधे होते हुए" },
    fade: 650,
    frames: [
      { image: "standing-anjali", hold: 2400 },
      { image: "bow-1", hold: 650 },
      { image: "bow-2", hold: 1700 },
      { image: "bow-1", hold: 650 },
    ],
  },
  "sit-down": {
    label: { en: "Sitting down onto a meditation cushion", hi: "ध्यान की गद्दी पर बैठते हुए" },
    fade: 700,
    frames: [
      { image: "sit-1", hold: 2200, caption: { en: "Stand behind the cushion", hi: "गद्दी के पीछे खड़े हों" } },
      { image: "sit-2", hold: 2200, caption: { en: "Lower down onto one knee", hi: "एक घुटने पर नीचे आएँ" } },
      { image: "sit-3", hold: 2800, caption: { en: "Sit, then draw in the legs", hi: "बैठें, फिर पैरों को अंदर लाएँ" } },
    ],
  },
};

/** One stacked image layer. */
function Layer({ image, visible, fade, eager }: { image: ImageId; visible: boolean; fade: number; eager?: boolean }) {
  const m = manifest[image];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={m.src}
      width={m.width}
      height={m.height}
      alt=""
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className="absolute inset-0 h-full w-full object-contain select-none"
      style={{ opacity: visible ? 1 : 0, transition: `opacity ${fade}ms ease-in-out` }}
    />
  );
}

/**
 * Cross-fades through a sequence of aligned frames. Pauses while off-screen
 * and shows only the first frame when the reader prefers reduced motion.
 */
export function FrameSequence({
  frames,
  fade,
  label,
  className,
  playing = true,
  onFrameChange,
  children,
}: {
  frames: Frame[];
  fade: number;
  label?: string;
  className?: string;
  playing?: boolean;
  onFrameChange?: (index: number) => void;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "100px" });
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const animate = playing && inView && !reduce && frames.length > 1;
  const first = manifest[frames[0].image];

  useEffect(() => {
    if (!animate) return;
    const id = setTimeout(() => {
      const next = (index + 1) % frames.length;
      setIndex(next);
      onFrameChange?.(next);
    }, frames[index].hold + fade);
    return () => clearTimeout(id);
  }, [animate, index, frames, fade, onFrameChange]);

  const unique = Array.from(new Set(frames.map((f) => f.image)));
  const current = frames[Math.min(index, frames.length - 1)].image;

  return (
    <div
      ref={ref}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn("relative", className)}
      style={{ aspectRatio: `${first.width} / ${first.height}` }}
    >
      {unique.map((img, i) => (
        <Layer key={img} image={img} visible={img === current} fade={fade} eager={i === 0} />
      ))}
      {children}
    </div>
  );
}

/** Highlight markers and the spine guide, positioned in percent. */
function Markers({ fig, highlight }: { fig: FigureDef; highlight?: FigurePoint | null }) {
  if (!highlight) return null;
  if (highlight === "spine") {
    return (
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full anim-fade-in" aria-hidden>
        <line
          x1={fig.spine[0].x}
          y1={fig.spine[0].y}
          x2={fig.spine[1].x}
          y2={fig.spine[1].y}
          stroke="#4F6B45"
          strokeWidth={3}
          strokeDasharray="7 7"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  }
  return (
    <>
      {(fig.points[highlight] ?? []).map((p, i) => (
        <span
          key={`${highlight}-${i}`}
          aria-hidden
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <span className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D99A38]/40 anim-marker" />
          <span className="relative block h-3.5 w-3.5 rounded-full bg-[#D99A38] ring-[3px] ring-white" />
        </span>
      ))}
    </>
  );
}

export function PostureFigure({
  id,
  highlight,
  className,
  decorative = false,
  still = false,
}: {
  id: FigureId;
  highlight?: FigurePoint | null;
  className?: string;
  decorative?: boolean;
  /** Never animate (e.g. small thumbnails). */
  still?: boolean;
}) {
  const fig = FIGURES[id];
  const { lang } = useT();
  const frames: Frame[] = fig.breathe && !still ? ANIMATIONS.breathe.frames : [{ image: fig.image, hold: 0 }];
  return (
    <FrameSequence frames={frames} fade={ANIMATIONS.breathe.fade} label={decorative ? undefined : fig.label[lang]} className={className}>
      <Markers fig={fig} highlight={highlight} />
    </FrameSequence>
  );
}

export function SceneIllustration({ id, className }: { id: SceneId; className?: string }) {
  const { lang } = useT();
  return <FrameSequence frames={[{ image: id, hold: 0 }]} fade={0} label={SCENE_LABELS[id][lang]} className={className} />;
}

export function PostureAnimation({ id, className, decorative = false }: { id: AnimationId; className?: string; decorative?: boolean }) {
  const anim = ANIMATIONS[id];
  const { lang } = useT();
  return <FrameSequence frames={anim.frames} fade={anim.fade} label={decorative ? undefined : anim.label[lang]} className={className} />;
}

/** Which highlightable points a figure supports (for the guide's cue buttons). */
export function figureHasPoint(id: FigureId, point: FigurePoint): boolean {
  return point === "spine" || Boolean(FIGURES[id].points[point]);
}
