// Introductory meditation practices (PRD §7.10: breathing, loving-kindness,
// walking, plus a silent timer), in English and Hindi.
// Silent timer with written guidance for now; guided voice recordings come
// later with rights-cleared audio. No therapeutic claims.

import type { Localised } from "./prayers";

export interface MeditationPractice {
  id: "breathing" | "metta" | "walking" | "open";
  title: Localised;
  pali: string;
  summary: Localised;
  steps: Localised[];
  context: Localised;
}

export const MEDITATION_DURATIONS = [3, 5, 10, 15, 20] as const;

export const MEDITATIONS: MeditationPractice[] = [
  {
    id: "breathing",
    title: { en: "Mindful breathing", hi: "सजग श्वास" },
    pali: "Ānāpānasati",
    summary: { en: "Rest attention on the natural breath.", hi: "सहज श्वास पर ध्यान टिकाएँ।" },
    steps: [
      {
        en: "Sit comfortably and let your eyes close or rest softly on the floor.",
        hi: "आराम से बैठें और आँखें बंद कर लें या धीरे से ज़मीन पर टिका दें।",
      },
      {
        en: "Notice the breath where it is easiest to feel: the nostrils, chest or belly.",
        hi: "श्वास को वहाँ अनुभव करें जहाँ वह सबसे आसानी से महसूस हो: नासिका, छाती या पेट।",
      },
      {
        en: "Let the breath be as it is. There's no need to control it.",
        hi: "श्वास को जैसी है वैसी रहने दें। उसे नियंत्रित करने की ज़रूरत नहीं।",
      },
      {
        en: "When the mind wanders, notice where it went, then gently return to the breath.",
        hi: "जब मन भटके, तो देखें कि वह कहाँ गया, फिर धीरे से श्वास पर लौट आएँ।",
      },
    ],
    context: {
      en: "Mindfulness of breathing is taught across Buddhist traditions; this is a simple introduction to it.",
      hi: "श्वास की सजगता सभी बौद्ध परंपराओं में सिखाई जाती है; यह उसका एक सरल परिचय है।",
    },
  },
  {
    id: "metta",
    title: { en: "Loving-kindness", hi: "मैत्री भावना" },
    pali: "Mettā bhāvanā",
    summary: { en: "Gently wish well to yourself and others.", hi: "अपने और दूसरों के लिए कोमलता से शुभकामना करें।" },
    steps: [
      {
        en: "Settle with a few breaths and bring to mind a sense of warmth or goodwill.",
        hi: "कुछ श्वासों के साथ स्थिर हों और मन में आत्मीयता या सद्भावना का भाव लाएँ।",
      },
      {
        en: 'Silently offer yourself a wish such as: "May I be well. May I be happy. May I be at peace."',
        hi: "मन ही मन अपने लिए कामना करें, जैसे: \"मैं स्वस्थ रहूँ। मैं सुखी रहूँ। मैं शांत रहूँ।\"",
      },
      {
        en: "Extend the same wish to someone you love, then to someone neutral, then to someone difficult if you are able.",
        hi: "यही कामना किसी प्रिय व्यक्ति के लिए करें, फिर किसी तटस्थ व्यक्ति के लिए, और यदि संभव हो तो किसी कठिन व्यक्ति के लिए भी।",
      },
      {
        en: "Finally, wish well to all beings, everywhere, without exception.",
        hi: "अंत में, बिना किसी अपवाद के, हर जगह के सभी प्राणियों के कल्याण की कामना करें।",
      },
    ],
    context: {
      en: "Mettā is one of the four 'divine abodes' (brahmavihāra). Phrases differ between teachers; use words that feel natural to you.",
      hi: "मैत्री चार 'ब्रह्मविहारों' में से एक है। अलग-अलग शिक्षक अलग शब्द उपयोग करते हैं; वे शब्द चुनें जो आपको सहज लगें।",
    },
  },
  {
    id: "walking",
    title: { en: "Walking meditation", hi: "चंक्रमण (चलते हुए ध्यान)" },
    pali: "Caṅkamana",
    summary: { en: "Slow, mindful walking back and forth.", hi: "धीरे-धीरे, सजगता से आगे-पीछे चलना।" },
    steps: [
      {
        en: "Choose a short, quiet path of 10 to 20 steps, indoors or outside.",
        hi: "घर के अंदर या बाहर, 10 से 20 कदम का एक छोटा, शांत रास्ता चुनें।",
      },
      {
        en: "Walk slowly, noticing each step: lifting, moving, placing the foot.",
        hi: "धीरे-धीरे चलें और हर कदम पर ध्यान दें: पैर उठाना, आगे बढ़ाना, रखना।",
      },
      {
        en: "At the end of the path, pause, turn mindfully and walk back.",
        hi: "रास्ते के अंत में रुकें, सजगता से मुड़ें और वापस चलें।",
      },
      {
        en: "When the mind wanders, stand still for a moment and return to the feeling of your feet.",
        hi: "जब मन भटके, तो एक क्षण स्थिर खड़े रहें और पैरों की अनुभूति पर लौट आएँ।",
      },
    ],
    context: {
      en: "Walking meditation is practised in many traditions, often between periods of sitting. Keep your eyes open and walk where it is safe.",
      hi: "चलते हुए ध्यान का अभ्यास अनेक परंपराओं में होता है, प्रायः बैठकर किए गए ध्यान के बीच में। आँखें खुली रखें और सुरक्षित स्थान पर ही चलें।",
    },
  },
  {
    id: "open",
    title: { en: "Silent sitting", hi: "मौन बैठना" },
    pali: "Unguided",
    summary: { en: "Just a timer and a gentle bell.", hi: "बस एक टाइमर और कोमल घंटी।" },
    steps: [
      {
        en: "Sit in whatever way suits your own practice. A soft bell marks the beginning and the end.",
        hi: "अपने अभ्यास के अनुसार किसी भी तरह बैठें। आरंभ और अंत में एक कोमल घंटी बजती है।",
      },
    ],
    context: {
      en: "For those who already have a practice and want a quiet timer.",
      hi: "उनके लिए जिनका अपना अभ्यास है और जिन्हें बस एक शांत टाइमर चाहिए।",
    },
  },
];

export function getMeditation(id: string): MeditationPractice | undefined {
  return MEDITATIONS.find((m) => m.id === id);
}
