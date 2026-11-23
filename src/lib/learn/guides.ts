// Beginner guides (PRD §7.7, §7.8). English only for now; drafts until an
// editorial reviewer signs them off, and labelled as such on screen.
// No posture is presented as mandatory, and practice differs between
// traditions — the guides say both.

import type { ReviewStatus } from "@/lib/practice/prayers";
import type { AnimationId, FigureId, FigurePoint, SceneId } from "@/components/visuals/posture-figure";

export interface GuideCue {
  text: string;
  /** Part of the illustration this cue refers to; tapping the cue highlights it. */
  point?: FigurePoint;
}

export interface GuideStep {
  title: string;
  body: string[];
  /** Posture illustration(s) shown with the step. */
  figures?: FigureId[];
  /** Illustrated scene shown with the step. */
  scene?: SceneId;
  /** Animated illustration shown with the step. */
  animation?: AnimationId;
  /** Short bullet cues, e.g. alignment points. */
  cues?: GuideCue[];
  /** Optional caution shown with emphasis. */
  caution?: string;
}

export interface Guide {
  slug: string;
  title: string;
  titleHi: string;
  summary: string;
  minutes: number;
  intro: string[];
  /** Still illustration for cards. */
  cover: FigureId;
  /** Animated illustration for the guide's header. */
  coverAnimation: AnimationId;
  steps: GuideStep[];
  closing?: string;
  review: ReviewStatus;
}

export const GUIDES: Guide[] = [
  {
    slug: "how-to-pray",
    title: "How to pray",
    titleHi: "वंदना कैसे करें",
    summary: "A simple, step-by-step way to recite a prayer at home, for complete beginners.",
    minutes: 4,
    cover: "standing-anjali",
    coverAnimation: "bow",
    intro: [
      "There is no single correct way to pray in Buddhism. Traditions, monasteries and families each have their own customs. What follows is a simple pattern many people find helpful; adapt it to your own community's practice.",
    ],
    steps: [
      {
        title: "Choose a quiet, comfortable place",
        scene: "scene-place",
        body: ["Any calm corner works: a room, a balcony, a bench in a park. What matters is that you can sit undisturbed for a few minutes."],
      },
      {
        title: "Prepare the space, if you wish",
        scene: "scene-prepare",
        body: [
          "Some people keep a small shrine with an image of the Buddha, and offer a candle, incense, flowers or water. These are optional and their meaning varies between traditions. A clean, simple space is enough.",
        ],
      },
      {
        title: "Choose a comfortable posture",
        animation: "sit-down",
        body: [
          "Sit on a chair, a cushion or a bench, or stand if that suits you better. The guide on how to sit covers the options. Comfort and an upright, relaxed back matter more than any particular position.",
        ],
      },
      {
        title: "Settle with a few natural breaths",
        animation: "breathe",
        body: ["Let your hands rest, soften your shoulders and notice a few breaths without changing them. This helps the mind arrive before you begin."],
      },
      {
        title: "Begin with an opening recitation",
        animation: "bow",
        body: [
          "Many people open with the homage to the Buddha (Namo tassa…), recited three times, with palms joined at the chest. Some bow before or after. Follow your community's custom where you have one.",
        ],
      },
      {
        title: "Read or recite the prayer",
        figures: ["anjali"],
        body: [
          "Recite at a steady, unhurried pace. If you are new to Pali, it is fine to read slowly from the text or to read the translation. Understanding grows with repetition.",
        ],
      },
      {
        title: "Reflect on its meaning",
        scene: "scene-reflect",
        body: ["Take a moment with the translation. Which quality or intention does this prayer point to, and how might it show up in your day?"],
      },
      {
        title: "Close with a wish for others' well-being",
        scene: "scene-dedicate",
        body: [
          "Many people end by wishing well to all beings or by dedicating the merit of their practice. A simple wish such as \"May all beings be happy\" is enough.",
        ],
      },
    ],
    closing: "A few minutes of regular, unhurried practice is worth more than a long session done out of pressure. Be gentle with yourself.",
    review: "draft",
  },
  {
    slug: "how-to-sit",
    title: "How to sit",
    titleHi: "कैसे बैठें",
    summary: "Comfortable postures for prayer and meditation, from a chair to the lotus position.",
    minutes: 5,
    cover: "burmese",
    coverAnimation: "breathe",
    intro: [
      "You can pray and meditate in any posture that is safe and comfortable for your body: on a chair, kneeling, cross-legged, standing, or lying down when appropriate. No posture is required.",
      "Whichever you choose, aim for a back that is upright but not stiff, relaxed shoulders, and a position you can hold without strain.",
    ],
    steps: [
      {
        title: "Chair sitting",
        figures: ["chair"],
        body: ["The most accessible option, and a good choice for anyone with knee, hip or back discomfort."],
        cues: [
          { text: "Sit towards the front of the seat so your back holds itself up, or use the backrest if you need support.", point: "seat" },
          { text: "Feet flat on the floor, about hip-width apart; knees roughly level with your hips.", point: "feet" },
          { text: "Rest your hands on your thighs or in your lap.", point: "hands" },
          { text: "A folded blanket under your feet helps if they don't reach the floor.", point: "feet" },
        ],
      },
      {
        title: "Kneeling, or sitting on a bench",
        figures: ["bench"],
        body: ["Common in some traditions and comfortable for many people's backs."],
        cues: [
          { text: "Kneel with a cushion or a low meditation bench under your sitting bones, taking weight off your ankles.", point: "seat" },
          { text: "Knees about hip-width apart; tops of the feet resting on the floor or a soft mat.", point: "feet" },
          { text: "Add padding under the knees and ankles if you feel pressure.", point: "knees" },
        ],
      },
      {
        title: "Burmese (easy cross-legged) position",
        figures: ["burmese"],
        body: ["Both legs rest on the floor, one in front of the other, with neither foot on top of the other leg."],
        cues: [
          { text: "Sit on the front third of a firm cushion so your hips are higher than your knees.", point: "cushion" },
          { text: "Let both knees rest on the floor, or on cushions if they don't reach.", point: "knees" },
          { text: "Lengthen through the spine and let the chin tuck slightly.", point: "spine" },
        ],
      },
      {
        title: "Half-lotus",
        figures: ["half-lotus"],
        body: ["One foot rests on the opposite thigh and the other foot on the floor. It needs open hips; only try it if Burmese position is easy for you."],
        cues: [
          { text: "Use a cushion so your hips are above your knees.", point: "cushion" },
          { text: "Alternate which leg is on top in different sessions to keep things balanced.", point: "foot" },
        ],
        caution: "If you feel any pain in the knee, stop and return to an easier posture. Knees are vulnerable to twisting.",
      },
      {
        title: "Full-lotus (optional)",
        figures: ["full-lotus"],
        body: [
          "Each foot rests on the opposite thigh. It is a traditional posture but it is not suitable for everyone and is never necessary. Many experienced practitioners never use it.",
        ],
        caution: "Never force your legs into position. Pain in the knees or hips is a signal to stop.",
      },
      {
        title: "Hands",
        figures: ["lap-hands", "anjali"],
        body: [
          "For meditation, many people rest the hands in the lap, right hand on the left with the thumbs lightly touching, or simply place them on the knees.",
          "For homage and recitation, palms are often joined at the chest (añjali). Customs vary between traditions and places.",
        ],
      },
    ],
    closing: "Don't stay in a position that hurts. Moving mindfully to ease discomfort is part of practice, not a failure of it. This guide is general information, not medical advice.",
    review: "draft",
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
