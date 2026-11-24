// Introductory meditation practices (PRD §7.10: breathing, loving-kindness,
// walking, plus a silent timer; expanded in v1.1 with compassion, body
// awareness and recollection of the Buddha), in English and Hindi.
// Silent timer with written guidance for now; guided voice recordings come
// later with rights-cleared audio. No therapeutic claims.

import type { Localised } from "./prayers";
import published from "@/lib/cms/published-content.json";

export interface MeditationPractice {
  /** Slug; new practices can be added from the CMS. */
  id: string;
  title: Localised;
  pali: string;
  summary: Localised;
  steps: Localised[];
  context: Localised;
}

export const MEDITATION_DURATIONS = [3, 5, 10, 15, 20] as const;

/** The meditations built into the app; the CMS starts from these. */
export const SEED_MEDITATIONS: MeditationPractice[] = [
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
    id: "karuna",
    title: { en: "Compassion", hi: "करुणा भावना" },
    pali: "Karuṇā bhāvanā",
    summary: { en: "Meet suffering, your own and others', with a kind heart.", hi: "अपने और दूसरों के दुःख को कोमल हृदय से देखें।" },
    steps: [
      {
        en: "Settle with a few breaths. Let the body soften and the face relax.",
        hi: "कुछ श्वासों के साथ स्थिर हों। शरीर को ढीला और चेहरे को शांत होने दें।",
      },
      {
        en: "Bring to mind someone who is going through a hard time. Notice the wish for them to be free of it.",
        hi: "किसी ऐसे व्यक्ति को याद करें जो कठिन समय से गुज़र रहा है। उसके दुःख से मुक्त होने की कामना को महसूस करें।",
      },
      {
        en: 'Silently offer: "May you be free from suffering. May you be safe. May you find ease."',
        hi: "मन ही मन कहें: \"आप दुःख से मुक्त हों। आप सुरक्षित रहें। आपको शांति मिले।\"",
      },
      {
        en: "Offer the same wish to yourself, then widen it to all who suffer, near and far.",
        hi: "यही कामना अपने लिए करें, फिर इसे पास और दूर के सभी दुखी प्राणियों तक फैलाएँ।",
      },
      {
        en: "If it feels heavy, return to the breath for a while, or switch to loving-kindness.",
        hi: "यदि यह भारी लगे, तो कुछ देर श्वास पर लौट आएँ, या मैत्री भावना का अभ्यास करें।",
      },
    ],
    context: {
      en: "Karuṇā, compassion, is the second of the four brahmavihāras. It is a wish for suffering to end, not a burden to carry.",
      hi: "करुणा चार ब्रह्मविहारों में दूसरा है। यह दुःख के अंत की कामना है, कोई बोझ उठाना नहीं।",
    },
  },
  {
    id: "body",
    title: { en: "Body awareness", hi: "काया की सजगता" },
    pali: "Kāyagatāsati",
    summary: { en: "Move attention slowly through the body, from head to feet.", hi: "ध्यान को धीरे-धीरे सिर से पैरों तक शरीर में ले जाएँ।" },
    steps: [
      {
        en: "Sit or lie down comfortably. Feel the whole body resting and supported.",
        hi: "आराम से बैठें या लेट जाएँ। पूरे शरीर को टिका हुआ और सहारा पाते हुए महसूस करें।",
      },
      {
        en: "Bring attention to the top of the head, then the face, jaw and neck. Notice what is there, without changing it.",
        hi: "ध्यान को सिर के ऊपरी भाग पर लाएँ, फिर चेहरे, जबड़े और गर्दन पर। जो अनुभव हो रहा है उसे देखें, बदलें नहीं।",
      },
      {
        en: "Move slowly down: shoulders, arms and hands, chest and back, belly, hips, legs and feet.",
        hi: "धीरे-धीरे नीचे आएँ: कंधे, बाँहें और हाथ, छाती और पीठ, पेट, कूल्हे, टाँगें और पैर।",
      },
      {
        en: "Where there is tension, let the breath touch it gently. Where there is nothing to feel, simply notice that.",
        hi: "जहाँ तनाव हो, वहाँ श्वास को कोमलता से छूने दें। जहाँ कुछ महसूस न हो, बस इसे जान लें।",
      },
      {
        en: "Finish by feeling the whole body breathing, as one.",
        hi: "अंत में पूरे शरीर को एक साथ श्वास लेते हुए महसूस करें।",
      },
    ],
    context: {
      en: "Mindfulness of the body is the first foundation of mindfulness (satipaṭṭhāna). This gentle scan is a simple way into it.",
      hi: "काया की सजगता स्मृति के चार आधारों (सतिपट्ठान) में पहला है। यह कोमल अवलोकन उसमें प्रवेश का एक सरल तरीका है।",
    },
  },
  {
    id: "buddhanussati",
    title: { en: "Recollecting the Buddha", hi: "बुद्धानुस्मृति" },
    pali: "Buddhānussati",
    summary: { en: "Calm the mind by reflecting on the Buddha's qualities.", hi: "बुद्ध के गुणों का स्मरण करते हुए मन को शांत करें।" },
    steps: [
      {
        en: "Sit quietly and settle with the breath. You may face a Buddha image if you have one.",
        hi: "शांति से बैठें और श्वास के साथ स्थिर हों। यदि बुद्ध की प्रतिमा हो, तो उसकी ओर मुख कर सकते हैं।",
      },
      {
        en: 'Slowly recite, aloud or silently: "Iti pi so bhagavā arahaṃ sammāsambuddho…"',
        hi: "धीरे-धीरे, ज़ोर से या मन में पाठ करें: \"इति पि सो भगवा अरहं सम्मासम्बुद्धो…\"",
      },
      {
        en: "Rest on one quality at a time, such as arahaṃ, free from greed, hatred and delusion, and let its meaning settle.",
        hi: "एक समय में एक गुण पर ठहरें, जैसे अरहं — लोभ, द्वेष और मोह से मुक्त — और उसके अर्थ को मन में उतरने दें।",
      },
      {
        en: "Notice any calm, confidence or joy that arises, and rest in it.",
        hi: "जो शांति, श्रद्धा या आनंद उत्पन्न हो, उसे पहचानें और उसमें विश्राम करें।",
      },
    ],
    context: {
      en: "Buddhānussati is one of the traditional recollections. The full verse is in Prayers, under Tiratana Anussati.",
      hi: "बुद्धानुस्मृति पारंपरिक अनुस्मृतियों में से एक है। पूरी गाथा वंदना में, त्रिरत्न अनुस्मृति के अंतर्गत है।",
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

/** Published in the CMS, or the built-in set before the CMS has any. */
export const MEDITATIONS: MeditationPractice[] = (published.meditations as unknown as MeditationPractice[]).length
  ? (published.meditations as unknown as MeditationPractice[])
  : SEED_MEDITATIONS;

export function getMeditation(id: string): MeditationPractice | undefined {
  return MEDITATIONS.find((m) => m.id === id);
}
