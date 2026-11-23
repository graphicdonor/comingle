// Introductory meditation practices (PRD §7.10). Silent timer with written
// guidance for now; guided voice recordings come later with rights-cleared
// audio. No therapeutic claims.

export interface MeditationPractice {
  id: "breathing" | "metta" | "open";
  title: string;
  pali: string;
  summary: string;
  steps: string[];
  context: string;
}

export const MEDITATION_DURATIONS = [3, 5, 10, 15, 20] as const;

export const MEDITATIONS: MeditationPractice[] = [
  {
    id: "breathing",
    title: "Mindful breathing",
    pali: "Ānāpānasati",
    summary: "Rest attention on the natural breath.",
    steps: [
      "Sit comfortably and let your eyes close or rest softly on the floor.",
      "Notice the breath where it is easiest to feel: the nostrils, chest or belly.",
      "Let the breath be as it is. There's no need to control it.",
      "When the mind wanders, notice where it went, then gently return to the breath.",
    ],
    context: "Mindfulness of breathing is taught across Buddhist traditions; this is a simple introduction to it.",
  },
  {
    id: "metta",
    title: "Loving-kindness",
    pali: "Mettā bhāvanā",
    summary: "Gently wish well to yourself and others.",
    steps: [
      "Settle with a few breaths and bring to mind a sense of warmth or goodwill.",
      "Silently offer yourself a wish such as: \"May I be well. May I be happy. May I be at peace.\"",
      "Extend the same wish to someone you love, then to someone neutral, then to someone difficult if you are able.",
      "Finally, wish well to all beings, everywhere, without exception.",
    ],
    context: "Mettā is one of the four 'divine abodes' (brahmavihāra). Phrases differ between teachers; use words that feel natural to you.",
  },
  {
    id: "open",
    title: "Silent sitting",
    pali: "Unguided",
    summary: "Just a timer and a gentle bell.",
    steps: ["Sit in whatever way suits your own practice. A soft bell marks the beginning and the end."],
    context: "For those who already have a practice and want a quiet timer.",
  },
];

export function getMeditation(id: string): MeditationPractice | undefined {
  return MEDITATIONS.find((m) => m.id === id);
}
