// Prayer catalogue for the Practice section.
//
// Content lives in code (like src/lib/blog.ts) until there is enough of it to
// justify a CMS. Each line carries the Pali source alongside Hindi and English
// renderings so the reader can show them in parallel.
//
// Review status is tracked per language and shown to readers: nothing here is
// presented as reviewed until a qualified reviewer has signed it off. To mark
// a language reviewed, set its status to "reviewed" and fill in `reviewedBy`.

export type ReviewStatus = "draft" | "reviewed";
export type TranslationLang = "hi" | "en";

export interface Localised {
  hi: string;
  en: string;
}

export interface PrayerLine {
  /** Pali in Roman script with standard diacritics. Devanagari is derived from this. */
  pi: string;
  hi: string;
  en: string;
}

export interface PrayerSection {
  heading?: Localised;
  /** How many times this section is traditionally recited, when more than once. */
  repeat?: number;
  lines: PrayerLine[];
}

export interface PrayerReview {
  status: ReviewStatus;
  reviewedBy?: string;
}

export interface Prayer {
  slug: string;
  title: { pi: string } & Localised;
  category: Localised;
  summary: Localised;
  tradition: string;
  durationMinutes: number;
  sections: PrayerSection[];
  source: {
    title: string;
    reference: string;
  };
  notes?: Localised;
  review: {
    pali: PrayerReview;
    hi: PrayerReview;
    en: PrayerReview;
  };
  /** Chanting audio. Null until a rights-cleared recording exists. */
  audio: null | { url: string; credit: string; language: string; durationSeconds: number };
}

const DRAFT = { status: "draft" } as const;
const ALL_DRAFT = { pali: DRAFT, hi: DRAFT, en: DRAFT };

export const PRAYERS: Prayer[] = [
  {
    slug: "buddha-vandana",
    title: { pi: "Buddha Vandanā", hi: "बुद्ध वंदना", en: "Homage to the Buddha" },
    category: { hi: "वंदना", en: "Homage" },
    summary: {
      en: "The traditional words of homage that open most Pali recitations, chanted three times.",
      hi: "पारंपरिक वंदना जिससे अधिकांश पालि पाठ आरंभ होते हैं; इसे तीन बार दोहराया जाता है।",
    },
    tradition: "Theravāda / Pali",
    durationMinutes: 1,
    sections: [
      {
        repeat: 3,
        lines: [
          {
            pi: "Namo tassa bhagavato arahato sammāsambuddhassa.",
            hi: "उन भगवान, अर्हत, सम्यक् सम्बुद्ध को नमस्कार है।",
            en: "Homage to the Blessed One, the Worthy One, the Perfectly Self-Awakened One.",
          },
        ],
      },
    ],
    source: {
      title: "Traditional Pali homage",
      reference: "The phrase occurs in the Pali Canon, e.g. Majjhima Nikāya 100 (Saṅgārava Sutta)",
    },
    notes: {
      en: "Usually recited with palms joined (añjali) before the Refuges and Precepts.",
      hi: "प्रायः हाथ जोड़कर (अंजलि), त्रिशरण और पंचशील से पहले इसका पाठ किया जाता है।",
    },
    review: ALL_DRAFT,
    audio: null,
  },
  {
    slug: "tisarana",
    title: { pi: "Tisaraṇa", hi: "त्रिशरण", en: "The Three Refuges" },
    category: { hi: "शरण", en: "Refuge" },
    summary: {
      en: "Going for refuge to the Buddha, the Dhamma and the Saṅgha, recited three times.",
      hi: "बुद्ध, धम्म और संघ की शरण ग्रहण करना; तीन बार पाठ किया जाता है।",
    },
    tradition: "Theravāda / Pali",
    durationMinutes: 1,
    sections: [
      {
        lines: [
          { pi: "Buddhaṃ saraṇaṃ gacchāmi.", hi: "मैं बुद्ध की शरण में जाता हूँ।", en: "I go to the Buddha for refuge." },
          { pi: "Dhammaṃ saraṇaṃ gacchāmi.", hi: "मैं धम्म की शरण में जाता हूँ।", en: "I go to the Dhamma for refuge." },
          { pi: "Saṅghaṃ saraṇaṃ gacchāmi.", hi: "मैं संघ की शरण में जाता हूँ।", en: "I go to the Saṅgha for refuge." },
        ],
      },
      {
        heading: { hi: "दूसरी बार", en: "For the second time" },
        lines: [
          { pi: "Dutiyampi buddhaṃ saraṇaṃ gacchāmi.", hi: "दूसरी बार भी मैं बुद्ध की शरण में जाता हूँ।", en: "For the second time, I go to the Buddha for refuge." },
          { pi: "Dutiyampi dhammaṃ saraṇaṃ gacchāmi.", hi: "दूसरी बार भी मैं धम्म की शरण में जाता हूँ।", en: "For the second time, I go to the Dhamma for refuge." },
          { pi: "Dutiyampi saṅghaṃ saraṇaṃ gacchāmi.", hi: "दूसरी बार भी मैं संघ की शरण में जाता हूँ।", en: "For the second time, I go to the Saṅgha for refuge." },
        ],
      },
      {
        heading: { hi: "तीसरी बार", en: "For the third time" },
        lines: [
          { pi: "Tatiyampi buddhaṃ saraṇaṃ gacchāmi.", hi: "तीसरी बार भी मैं बुद्ध की शरण में जाता हूँ।", en: "For the third time, I go to the Buddha for refuge." },
          { pi: "Tatiyampi dhammaṃ saraṇaṃ gacchāmi.", hi: "तीसरी बार भी मैं धम्म की शरण में जाता हूँ।", en: "For the third time, I go to the Dhamma for refuge." },
          { pi: "Tatiyampi saṅghaṃ saraṇaṃ gacchāmi.", hi: "तीसरी बार भी मैं संघ की शरण में जाता हूँ।", en: "For the third time, I go to the Saṅgha for refuge." },
        ],
      },
    ],
    source: { title: "Saraṇattaya", reference: "Khuddakapāṭha 1" },
    notes: {
      en: "The Hindi verb is shown in the masculine form (जाता हूँ); women commonly recite जाती हूँ.",
      hi: "हिन्दी क्रिया पुल्लिंग रूप (जाता हूँ) में दी गई है; महिलाएँ प्रायः 'जाती हूँ' कहती हैं।",
    },
    review: ALL_DRAFT,
    audio: null,
  },
  {
    slug: "pancasila",
    title: { pi: "Pañcasīla", hi: "पंचशील", en: "The Five Precepts" },
    category: { hi: "शील", en: "Precepts" },
    summary: {
      en: "Five training rules undertaken by lay Buddhists: not harming, not stealing, no sexual misconduct, no false speech, no intoxicants.",
      hi: "उपासकों द्वारा ग्रहण किए जाने वाले पाँच शिक्षापद: अहिंसा, चोरी न करना, कामभोग में मिथ्याचार न करना, झूठ न बोलना, नशे से दूर रहना।",
    },
    tradition: "Theravāda / Pali",
    durationMinutes: 2,
    sections: [
      {
        lines: [
          {
            pi: "Pāṇātipātā veramaṇī sikkhāpadaṃ samādiyāmi.",
            hi: "मैं प्राणी-हिंसा से विरत रहने का शिक्षापद ग्रहण करता हूँ।",
            en: "I undertake the training rule to refrain from killing living beings.",
          },
          {
            pi: "Adinnādānā veramaṇī sikkhāpadaṃ samādiyāmi.",
            hi: "मैं बिना दी गई वस्तु लेने (चोरी) से विरत रहने का शिक्षापद ग्रहण करता हूँ।",
            en: "I undertake the training rule to refrain from taking what is not given.",
          },
          {
            pi: "Kāmesu micchācārā veramaṇī sikkhāpadaṃ samādiyāmi.",
            hi: "मैं कामभोग संबंधी मिथ्याचार से विरत रहने का शिक्षापद ग्रहण करता हूँ।",
            en: "I undertake the training rule to refrain from sexual misconduct.",
          },
          {
            pi: "Musāvādā veramaṇī sikkhāpadaṃ samādiyāmi.",
            hi: "मैं झूठ बोलने से विरत रहने का शिक्षापद ग्रहण करता हूँ।",
            en: "I undertake the training rule to refrain from false speech.",
          },
          {
            pi: "Surāmerayamajjapamādaṭṭhānā veramaṇī sikkhāpadaṃ samādiyāmi.",
            hi: "मैं सुरा, मेरय, मद्य आदि प्रमाद के कारण बनने वाले नशीले पदार्थों से विरत रहने का शिक्षापद ग्रहण करता हूँ।",
            en: "I undertake the training rule to refrain from intoxicating drinks and drugs that lead to carelessness.",
          },
        ],
      },
    ],
    source: {
      title: "Traditional lay precepts formula",
      reference: "Compare the training rules in Khuddakapāṭha 2",
    },
    notes: {
      en: "In many communities the precepts are recited after a monastic or leader, following the Homage and the Three Refuges. Openings and wording vary between communities.",
      hi: "अनेक समुदायों में वंदना और त्रिशरण के बाद भिक्षु या मार्गदर्शक के पीछे-पीछे शील का पाठ होता है। आरंभिक शब्द और पाठ समुदायों के अनुसार भिन्न हो सकते हैं।",
    },
    review: ALL_DRAFT,
    audio: null,
  },
  {
    slug: "tiratana-anussati",
    title: { pi: "Tiratana Anussati", hi: "त्रिरत्न अनुस्मृति", en: "Recollection of the Triple Gem" },
    category: { hi: "अनुस्मृति", en: "Recollection" },
    summary: {
      en: "Recollecting the qualities of the Buddha, the Dhamma and the Saṅgha.",
      hi: "बुद्ध, धम्म और संघ के गुणों का स्मरण।",
    },
    tradition: "Theravāda / Pali",
    durationMinutes: 4,
    sections: [
      {
        heading: { hi: "बुद्ध के गुण", en: "Qualities of the Buddha" },
        lines: [
          {
            pi: "Iti pi so bhagavā arahaṃ sammāsambuddho,",
            hi: "ऐसे हैं वे भगवान — अर्हत, सम्यक् सम्बुद्ध,",
            en: "Thus indeed is the Blessed One: worthy, perfectly self-awakened,",
          },
          {
            pi: "vijjācaraṇasampanno sugato lokavidū,",
            hi: "विद्या और आचरण से सम्पन्न, सुगत, लोकों के ज्ञाता,",
            en: "accomplished in knowledge and conduct, well-gone, knower of the worlds,",
          },
          {
            pi: "anuttaro purisadammasārathi",
            hi: "दमन योग्य पुरुषों के अनुपम सारथी,",
            en: "unsurpassed guide of those to be tamed,",
          },
          {
            pi: "satthā devamanussānaṃ buddho bhagavā ti.",
            hi: "देवों और मनुष्यों के शास्ता, बुद्ध, भगवान।",
            en: "teacher of gods and humans, awakened, blessed.",
          },
        ],
      },
      {
        heading: { hi: "धम्म के गुण", en: "Qualities of the Dhamma" },
        lines: [
          {
            pi: "Svākkhāto bhagavatā dhammo,",
            hi: "भगवान द्वारा धम्म भली-भाँति उपदिष्ट है,",
            en: "The Dhamma is well proclaimed by the Blessed One,",
          },
          {
            pi: "sandiṭṭhiko akāliko ehipassiko,",
            hi: "इसी जीवन में दिखाई देने वाला, अकालिक, 'आओ और देखो' कहने योग्य,",
            en: "visible here and now, timeless, inviting one to come and see,",
          },
          {
            pi: "opanayiko paccattaṃ veditabbo viññūhī ti.",
            hi: "आगे ले जाने वाला, विज्ञ जनों द्वारा स्वयं अनुभव करने योग्य।",
            en: "leading onward, to be experienced by the wise for themselves.",
          },
        ],
      },
      {
        heading: { hi: "संघ के गुण", en: "Qualities of the Saṅgha" },
        lines: [
          {
            pi: "Supaṭipanno bhagavato sāvakasaṅgho,",
            hi: "भगवान का श्रावक संघ सुमार्ग पर चलने वाला है,",
            en: "The Blessed One's community of disciples practises well,",
          },
          {
            pi: "ujupaṭipanno bhagavato sāvakasaṅgho,",
            hi: "भगवान का श्रावक संघ सीधे मार्ग पर चलने वाला है,",
            en: "the Blessed One's community of disciples practises straightforwardly,",
          },
          {
            pi: "ñāyapaṭipanno bhagavato sāvakasaṅgho,",
            hi: "भगवान का श्रावक संघ सत्य के मार्ग पर चलने वाला है,",
            en: "the Blessed One's community of disciples practises the true way,",
          },
          {
            pi: "sāmīcipaṭipanno bhagavato sāvakasaṅgho,",
            hi: "भगवान का श्रावक संघ उचित मार्ग पर चलने वाला है,",
            en: "the Blessed One's community of disciples practises properly,",
          },
          {
            pi: "yadidaṃ cattāri purisayugāni aṭṭha purisapuggalā,",
            hi: "अर्थात् पुरुषों के चार युगल, आठ प्रकार के व्यक्ति —",
            en: "that is, the four pairs of persons, the eight kinds of individuals:",
          },
          {
            pi: "esa bhagavato sāvakasaṅgho,",
            hi: "यही भगवान का श्रावक संघ है,",
            en: "this is the Blessed One's community of disciples,",
          },
          {
            pi: "āhuneyyo pāhuneyyo dakkhiṇeyyo añjalikaraṇīyo,",
            hi: "जो आह्वान, आतिथ्य, दक्षिणा और हाथ जोड़कर वंदना के योग्य है,",
            en: "worthy of gifts, worthy of hospitality, worthy of offerings, worthy of reverent salutation,",
          },
          {
            pi: "anuttaraṃ puññakkhettaṃ lokassā ti.",
            hi: "और संसार के लिए पुण्य का अनुपम क्षेत्र है।",
            en: "the unsurpassed field of merit for the world.",
          },
        ],
      },
    ],
    source: { title: "Dhajagga Sutta", reference: "Saṃyutta Nikāya 11.3" },
    review: ALL_DRAFT,
    audio: null,
  },
  {
    slug: "metta",
    title: { pi: "Mettā", hi: "मैत्री भावना", en: "Loving-kindness" },
    category: { hi: "मैत्री", en: "Loving-kindness" },
    summary: {
      en: "Verses wishing well-being to all beings without exception, from the Discourse on Loving-kindness.",
      hi: "मैत्री सुत्त से वे गाथाएँ जो बिना किसी अपवाद के सभी प्राणियों के कल्याण की कामना करती हैं।",
    },
    tradition: "Theravāda / Pali",
    durationMinutes: 2,
    sections: [
      {
        lines: [
          {
            pi: "Sukhino vā khemino hontu, sabbe sattā bhavantu sukhitattā.",
            hi: "सभी प्राणी सुखी और सुरक्षित हों; सभी का मन सुखी हो।",
            en: "May all beings be happy and secure; may they be happy at heart.",
          },
          {
            pi: "Ye keci pāṇabhūtatthi, tasā vā thāvarā vā anavasesā,",
            hi: "जो भी प्राणी हैं — दुर्बल हों या सबल, बिना किसी अपवाद के,",
            en: "Whatever living beings there are, frail or firm, without exception,",
          },
          {
            pi: "dīghā vā ye mahantā vā, majjhimā rassakā aṇukathūlā,",
            hi: "लंबे हों या बड़े, मध्यम, छोटे, सूक्ष्म या स्थूल,",
            en: "long or large, middling, short, subtle or gross,",
          },
          {
            pi: "diṭṭhā vā ye ca adiṭṭhā, ye ca dūre vasanti avidūre,",
            hi: "दिखाई देने वाले हों या न दिखने वाले, दूर रहते हों या पास,",
            en: "seen or unseen, living far away or near,",
          },
          {
            pi: "bhūtā vā sambhavesī vā, sabbe sattā bhavantu sukhitattā.",
            hi: "जो जन्म ले चुके हैं या जन्म लेने वाले हैं — सभी प्राणी सुखी मन वाले हों।",
            en: "born or yet to be born: may all beings be happy at heart.",
          },
        ],
      },
    ],
    source: { title: "Karaṇīya Mettā Sutta (excerpt)", reference: "Sutta Nipāta 1.8; also Khuddakapāṭha 9" },
    notes: {
      en: "This is an excerpt of the 'Sukhino vā' verses, not the complete discourse.",
      hi: "यह 'सुखिनो वा' गाथाओं का अंश है, पूरा सुत्त नहीं।",
    },
    review: ALL_DRAFT,
    audio: null,
  },
];

export function getPrayer(slug: string): Prayer | undefined {
  return PRAYERS.find((p) => p.slug === slug);
}
