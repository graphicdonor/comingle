import type { ImageSourcePropType } from "react-native";
import manifest from "@/components/visuals/illustrations.json";

// The guide illustrations from the website (public/illustrations), bundled so
// guides work offline. Labels and animation timings follow the website's
// posture figure (src/components/visuals/posture-figure.tsx).

type L = { en: string; hi: string };

export const IMAGES: Record<string, ImageSourcePropType> = {
  anjali: require("../../assets/illustrations/anjali.webp"),
  bench: require("../../assets/illustrations/bench.webp"),
  "bow-1": require("../../assets/illustrations/bow-1.webp"),
  "bow-2": require("../../assets/illustrations/bow-2.webp"),
  "burmese-inhale": require("../../assets/illustrations/burmese-inhale.webp"),
  burmese: require("../../assets/illustrations/burmese.webp"),
  chair: require("../../assets/illustrations/chair.webp"),
  "full-lotus": require("../../assets/illustrations/full-lotus.webp"),
  "half-lotus": require("../../assets/illustrations/half-lotus.webp"),
  "lap-hands": require("../../assets/illustrations/lap-hands.webp"),
  "scene-dedicate": require("../../assets/illustrations/scene-dedicate.webp"),
  "scene-place": require("../../assets/illustrations/scene-place.webp"),
  "scene-prepare": require("../../assets/illustrations/scene-prepare.webp"),
  "scene-reflect": require("../../assets/illustrations/scene-reflect.webp"),
  "sit-1": require("../../assets/illustrations/sit-1.webp"),
  "sit-2": require("../../assets/illustrations/sit-2.webp"),
  "sit-3": require("../../assets/illustrations/sit-3.webp"),
  "standing-anjali": require("../../assets/illustrations/standing-anjali.webp"),
};

/** Width ÷ height of an image. */
export function ratio(id: string): number {
  const m = (manifest as Record<string, { width: number; height: number }>)[id];
  return m ? m.width / m.height : 656 / 760;
}

export const LABELS: Record<string, L> = {
  chair: { en: "Sitting upright on a chair, feet flat on the floor, hands resting on the thighs", hi: "कुर्सी पर सीधे बैठे हुए, पैर ज़मीन पर सपाट, हाथ जाँघों पर" },
  bench: { en: "Kneeling with a low bench under the sitting bones, shins and tops of the feet on the floor", hi: "बैठने की हड्डियों के नीचे छोटी बेंच रखकर घुटनों के बल, पिंडलियाँ और पैरों का ऊपरी भाग ज़मीन पर" },
  burmese: { en: "Cross-legged on a cushion with both shins resting on the floor, one in front of the other", hi: "गद्दी पर पालथी मारकर, दोनों पिंडलियाँ ज़मीन पर, एक के आगे दूसरी" },
  "half-lotus": { en: "Half-lotus: one foot resting on the opposite thigh, the other foot on the floor", hi: "अर्ध-पद्मासन: एक पैर विपरीत जाँघ पर, दूसरा पैर ज़मीन पर" },
  "full-lotus": { en: "Full-lotus: each foot resting on the opposite thigh", hi: "पद्मासन: दोनों पैर विपरीत जाँघों पर" },
  "lap-hands": { en: "Hands resting in the lap, one on the other, thumbs lightly touching", hi: "हाथ गोद में, एक पर दूसरा, अंगूठे हल्के से मिले हुए" },
  anjali: { en: "Palms joined together at the chest (añjali)", hi: "छाती के सामने जुड़ी हुई हथेलियाँ (अंजलि)" },
  "standing-anjali": { en: "Standing with palms joined at the chest (añjali)", hi: "खड़े होकर छाती के सामने हथेलियाँ जोड़े हुए (अंजलि)" },
  "scene-place": { en: "Carrying a cushion to a quiet corner of a room by a window", hi: "खिड़की के पास कमरे के शांत कोने में गद्दी ले जाते हुए" },
  "scene-prepare": { en: "Kneeling to light a candle on a low table beside a vase of flowers", hi: "फूलदान के पास छोटी मेज़ पर घुटनों के बल बैठकर मोमबत्ती जलाते हुए" },
  "scene-reflect": { en: "Sitting quietly, eyes closed, in reflection", hi: "आँखें बंद किए शांत भाव से चिंतन में बैठे हुए" },
  "scene-dedicate": { en: "Sitting with palms joined, wishing well to all beings", hi: "हथेलियाँ जोड़कर सभी प्राणियों के कल्याण की कामना करते हुए" },
};

export interface Frame {
  image: string;
  hold: number;
  caption?: L;
}

export const ANIMATIONS: Record<string, { label: L; fade: number; frames: Frame[] }> = {
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
