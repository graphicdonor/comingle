import type { ReviewStatus } from "./prayers";

// "Today's verse": one Dhammapada verse per day, rotating by day of the year.
// Every verse carries its exact reference (PRD §8.5: no unattributed quotes).
// Translations are drafts until reviewed, and say so on screen.

export interface DailyVerse {
  reference: string;
  pi: string[];
  hi: string;
  en: string;
  review: ReviewStatus;
}

export const DAILY_VERSES: DailyVerse[] = [
  {
    reference: "Dhammapada 5",
    pi: ["Na hi verena verāni, sammantīdha kudācanaṃ;", "Averena ca sammanti, esa dhammo sanantano."],
    en: "Hatred is never appeased by hatred in this world; by non-hatred alone is hatred appeased. This is an eternal law.",
    hi: "इस संसार में वैर से वैर कभी शांत नहीं होता; अवैर से ही वैर शांत होता है — यही सनातन धम्म है।",
    review: "draft",
  },
  {
    reference: "Dhammapada 183",
    pi: ["Sabbapāpassa akaraṇaṃ, kusalassa upasampadā;", "Sacittapariyodapanaṃ, etaṃ buddhāna sāsanaṃ."],
    en: "Not doing any evil, cultivating the good, purifying one's own mind — this is the teaching of the Buddhas.",
    hi: "सभी पापों को न करना, कुशल कर्मों का संचय करना, अपने चित्त को शुद्ध करना — यही बुद्धों की शिक्षा है।",
    review: "draft",
  },
  {
    reference: "Dhammapada 223",
    pi: ["Akkodhena jine kodhaṃ, asādhuṃ sādhunā jine;", "Jine kadariyaṃ dānena, saccenālikavādinaṃ."],
    en: "Conquer anger with non-anger, conquer the bad with good, conquer the miser with giving, and the liar with truth.",
    hi: "अक्रोध से क्रोध को जीतें, बुराई को भलाई से जीतें, कंजूस को दान से जीतें और झूठ बोलने वाले को सत्य से।",
    review: "draft",
  },
  {
    reference: "Dhammapada 1",
    pi: [
      "Manopubbaṅgamā dhammā, manoseṭṭhā manomayā;",
      "Manasā ce paduṭṭhena, bhāsati vā karoti vā;",
      "Tato naṃ dukkhamanveti, cakkaṃva vahato padaṃ.",
    ],
    en: "Mind precedes all things; mind is their chief, they are mind-made. If one speaks or acts with a corrupted mind, suffering follows, as the wheel follows the foot of the ox.",
    hi: "मन सभी अवस्थाओं का अगुआ है, मन ही प्रधान है, सब मनोमय हैं। यदि कोई दूषित मन से बोलता या करता है, तो दुःख उसके पीछे वैसे ही चलता है जैसे गाड़ी का पहिया बैल के पैरों के पीछे।",
    review: "draft",
  },
  {
    reference: "Dhammapada 2",
    pi: [
      "Manopubbaṅgamā dhammā, manoseṭṭhā manomayā;",
      "Manasā ce pasannena, bhāsati vā karoti vā;",
      "Tato naṃ sukhamanveti, chāyāva anapāyinī.",
    ],
    en: "Mind precedes all things; mind is their chief, they are mind-made. If one speaks or acts with a clear mind, happiness follows like a shadow that never leaves.",
    hi: "मन सभी अवस्थाओं का अगुआ है, मन ही प्रधान है, सब मनोमय हैं। यदि कोई निर्मल मन से बोलता या करता है, तो सुख उसके पीछे वैसे ही चलता है जैसे कभी साथ न छोड़ने वाली छाया।",
    review: "draft",
  },
  {
    reference: "Dhammapada 103",
    pi: ["Yo sahassaṃ sahassena, saṅgāme mānuse jine;", "Ekañca jeyyamattānaṃ, sa ve saṅgāmajuttamo."],
    en: "Though one may conquer a thousand times a thousand people in battle, one who conquers oneself is the greatest of victors.",
    hi: "जो युद्ध में हज़ारों-हज़ार मनुष्यों को जीत ले, उससे बढ़कर वह है जो केवल स्वयं को जीत ले — वही सबसे बड़ा विजेता है।",
    review: "draft",
  },
  {
    reference: "Dhammapada 204",
    pi: ["Ārogyaparamā lābhā, santuṭṭhiparamaṃ dhanaṃ;", "Vissāsaparamā ñāti, nibbānaṃ paramaṃ sukhaṃ."],
    en: "Health is the greatest gain, contentment the greatest wealth, trust the best of kin, Nibbāna the highest happiness.",
    hi: "आरोग्य परम लाभ है, संतोष परम धन है, विश्वास परम बंधु है, निब्बान परम सुख है।",
    review: "draft",
  },
];

/** Same verse for everyone on a given local calendar day. */
export function verseForDate(date: Date): DailyVerse {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}
