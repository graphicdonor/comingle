// Prayer catalogue for the Practice section.
//
// Content lives in code (like src/lib/blog.ts) until there is enough of it to
// justify a CMS. Each line carries the Pali source alongside Hindi and English
// renderings so the reader can show them in parallel.
//
// Review status is tracked per language and shown to readers: nothing here is
// presented as reviewed until a qualified reviewer has signed it off. To mark
// a language reviewed, set its status to "reviewed" and fill in `reviewedBy`.

import published from "@/lib/cms/published-content.json";

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
  /** Rights record (PRD §9.4): licence of the text and translations, and who made them. */
  rights?: {
    licence: string;
    translator?: string;
    notes?: string;
  };
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

/** The prayers built into the app; the CMS starts from these. */
export const SEED_PRAYERS: Prayer[] = [
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
  {
    slug: "buddha-puja",
    title: { pi: "Buddha Pūjā", hi: "बुद्ध पूजा", en: "Offerings to the Buddha" },
    category: { hi: "पूजा", en: "Offering" },
    summary: {
      en: "Verses recited while offering flowers, a lamp and incense at a shrine, morning or evening.",
      hi: "प्रातः या सायं, पूजा-स्थल पर फूल, दीप और धूप अर्पित करते समय पढ़ी जाने वाली गाथाएँ।",
    },
    tradition: "Theravāda / Pali",
    durationMinutes: 2,
    sections: [
      {
        heading: { hi: "पुष्प पूजा", en: "Offering flowers" },
        lines: [
          {
            pi: "Vaṇṇagandhaguṇopetaṃ, etaṃ kusumasantatiṃ,",
            hi: "रंग, सुगंध और गुणों से युक्त इन फूलों से,",
            en: "With these flowers, rich in colour, fragrance and quality,",
          },
          {
            pi: "pūjayāmi munindassa, sirīpādasaroruhe.",
            hi: "मैं मुनियों में श्रेष्ठ बुद्ध के कमल-समान श्रीचरणों की पूजा करता हूँ।",
            en: "I honour the lotus-like feet of the Lord of Sages.",
          },
          {
            pi: "Pūjemi buddhaṃ kusumena'nena, puññena'metena ca hotu mokkhaṃ.",
            hi: "इन फूलों से मैं बुद्ध की पूजा करता हूँ; इस पुण्य से मुक्ति प्राप्त हो।",
            en: "With these flowers I honour the Buddha; through this merit may there be liberation.",
          },
          {
            pi: "Pupphaṃ milāyāti yathā idaṃ me, kāyo tathā yāti vināsabhāvaṃ.",
            hi: "जैसे ये फूल मुरझा जाते हैं, वैसे ही मेरा यह शरीर भी नाश की ओर जाता है।",
            en: "Just as these flowers wither, so this body of mine moves towards its end.",
          },
        ],
      },
      {
        heading: { hi: "दीप पूजा", en: "Offering light" },
        lines: [
          {
            pi: "Ghanasārappadittena, dīpena tamadhaṃsinā,",
            hi: "कपूर से प्रज्वलित, अंधकार मिटाने वाले इस दीप से,",
            en: "With this lamp, burning bright with camphor, dispelling darkness,",
          },
          {
            pi: "tilokadīpaṃ sambuddhaṃ, pūjayāmi tamonudaṃ.",
            hi: "मैं तीनों लोकों के दीपक, अज्ञान का अंधकार दूर करने वाले सम्बुद्ध की पूजा करता हूँ।",
            en: "I honour the Awakened One, light of the three worlds, who dispels the darkness.",
          },
        ],
      },
      {
        heading: { hi: "सुगंध पूजा", en: "Offering incense" },
        lines: [
          {
            pi: "Gandhasambhārayuttena, dhūpenāhaṃ sugandhinā,",
            hi: "सुगंधित पदार्थों से बनी इस सुगंधित धूप से,",
            en: "With this fragrant incense, made of sweet-smelling things,",
          },
          {
            pi: "pūjaye pūjaneyyaṃ taṃ, pūjābhājanamuttamaṃ.",
            hi: "मैं उन पूजनीय की पूजा करता हूँ, जो पूजा के सर्वोत्तम पात्र हैं।",
            en: "I honour the One worthy of honour, the highest recipient of offerings.",
          },
        ],
      },
    ],
    source: {
      title: "Traditional offering verses (pūjā gāthā)",
      reference: "Devotional verses used in Theravāda practice in India and Sri Lanka; not part of the Pali Canon",
    },
    notes: {
      en: "Each offering can be recited on its own, as you place flowers, light a lamp or light incense. The Hindi verb is shown in the masculine form (करता हूँ); women commonly say करती हूँ.",
      hi: "हर पूजा अलग से भी पढ़ी जा सकती है — फूल रखते, दीप जलाते या धूप जलाते समय। हिन्दी क्रिया पुल्लिंग रूप (करता हूँ) में दी गई है; महिलाएँ प्रायः 'करती हूँ' कहती हैं।",
    },
    review: ALL_DRAFT,
    audio: null,
  },
  {
    slug: "mangala-sutta",
    title: { pi: "Mahāmaṅgala Sutta", hi: "महामंगल सुत्त", en: "Discourse on Blessings" },
    category: { hi: "सुत्त", en: "Discourse" },
    summary: {
      en: "Asked what the highest blessing is, the Buddha answers with a path of everyday good conduct that leads to peace.",
      hi: "उत्तम मंगल क्या है, इस प्रश्न पर बुद्ध रोज़मर्रा के अच्छे आचरण का ऐसा मार्ग बताते हैं जो शांति तक ले जाता है।",
    },
    tradition: "Theravāda / Pali",
    durationMinutes: 5,
    sections: [
      {
        heading: { hi: "प्रश्न", en: "The question" },
        lines: [
          {
            pi: "Bahū devā manussā ca, maṅgalāni acintayuṃ,",
            hi: "बहुत से देवताओं और मनुष्यों ने मंगल के विषय में विचार किया,",
            en: "Many gods and humans have pondered on blessings,",
          },
          {
            pi: "ākaṅkhamānā sotthānaṃ, brūhi maṅgalamuttamaṃ.",
            hi: "कल्याण की कामना करते हुए। बताइए, उत्तम मंगल क्या है?",
            en: "longing for well-being. Tell us the highest blessing.",
          },
        ],
      },
      {
        heading: { hi: "बुद्ध का उत्तर", en: "The Buddha's answer" },
        lines: [
          {
            pi: "Asevanā ca bālānaṃ, paṇḍitānañca sevanā,",
            hi: "मूर्खों की संगति न करना, बुद्धिमानों की संगति करना,",
            en: "Not keeping company with fools, keeping company with the wise,",
          },
          {
            pi: "pūjā ca pūjanīyānaṃ, etaṃ maṅgalamuttamaṃ.",
            hi: "और पूजनीयों का सम्मान करना — यह उत्तम मंगल है।",
            en: "and honouring those worthy of honour: this is the highest blessing.",
          },
          {
            pi: "Patirūpadesavāso ca, pubbe ca katapuññatā,",
            hi: "अनुकूल स्थान में रहना, पहले किए गए पुण्य का होना,",
            en: "Living in a suitable place, having done good in the past,",
          },
          {
            pi: "attasammāpaṇidhi ca, etaṃ maṅgalamuttamaṃ.",
            hi: "और स्वयं को सही दिशा में लगाना — यह उत्तम मंगल है।",
            en: "and setting oneself on the right course: this is the highest blessing.",
          },
          {
            pi: "Bāhusaccañca sippañca, vinayo ca susikkhito,",
            hi: "विस्तृत ज्ञान और कौशल, भली-भाँति सीखा हुआ अनुशासन,",
            en: "Broad learning and skill, a well-trained discipline,",
          },
          {
            pi: "subhāsitā ca yā vācā, etaṃ maṅgalamuttamaṃ.",
            hi: "और सुंदर ढंग से कही गई वाणी — यह उत्तम मंगल है।",
            en: "and words that are well spoken: this is the highest blessing.",
          },
          {
            pi: "Mātāpitu upaṭṭhānaṃ, puttadārassa saṅgaho,",
            hi: "माता-पिता की सेवा करना, पत्नी और संतान की देखभाल करना,",
            en: "Caring for mother and father, looking after spouse and children,",
          },
          {
            pi: "anākulā ca kammantā, etaṃ maṅgalamuttamaṃ.",
            hi: "और उलझन-रहित काम-काज — यह उत्तम मंगल है।",
            en: "and work that is free from confusion: this is the highest blessing.",
          },
          {
            pi: "Dānañca dhammacariyā ca, ñātakānañca saṅgaho,",
            hi: "दान देना, धम्म के अनुसार जीना, संबंधियों की सहायता करना,",
            en: "Giving, living by the Dhamma, helping one's relatives,",
          },
          {
            pi: "anavajjāni kammāni, etaṃ maṅgalamuttamaṃ.",
            hi: "और निर्दोष कर्म — यह उत्तम मंगल है।",
            en: "and blameless actions: this is the highest blessing.",
          },
          {
            pi: "Āratī viratī pāpā, majjapānā ca saṃyamo,",
            hi: "पाप से दूर रहना और विरत होना, नशीले पेय से संयम रखना,",
            en: "Shunning and abstaining from wrongdoing, refraining from intoxicating drink,",
          },
          {
            pi: "appamādo ca dhammesu, etaṃ maṅgalamuttamaṃ.",
            hi: "और अच्छे कर्मों में सजग रहना — यह उत्तम मंगल है।",
            en: "and being heedful in what is good: this is the highest blessing.",
          },
          {
            pi: "Gāravo ca nivāto ca, santuṭṭhi ca kataññutā,",
            hi: "आदर और विनम्रता, संतोष और कृतज्ञता,",
            en: "Respect and humility, contentment and gratitude,",
          },
          {
            pi: "kālena dhammassavanaṃ, etaṃ maṅgalamuttamaṃ.",
            hi: "और उचित समय पर धम्म सुनना — यह उत्तम मंगल है।",
            en: "and hearing the Dhamma at the right time: this is the highest blessing.",
          },
          {
            pi: "Khantī ca sovacassatā, samaṇānañca dassanaṃ,",
            hi: "धैर्य, सलाह को सहजता से स्वीकार करना, श्रमणों के दर्शन करना,",
            en: "Patience, being open to advice, meeting those who live the spiritual life,",
          },
          {
            pi: "kālena dhammasākacchā, etaṃ maṅgalamuttamaṃ.",
            hi: "और उचित समय पर धम्म-चर्चा — यह उत्तम मंगल है।",
            en: "and discussing the Dhamma at the right time: this is the highest blessing.",
          },
          {
            pi: "Tapo ca brahmacariyañca, ariyasaccāna dassanaṃ,",
            hi: "तप और पवित्र जीवन, आर्य सत्यों का दर्शन,",
            en: "Self-discipline and the holy life, seeing the Noble Truths,",
          },
          {
            pi: "nibbānasacchikiriyā ca, etaṃ maṅgalamuttamaṃ.",
            hi: "और निब्बान का साक्षात्कार — यह उत्तम मंगल है।",
            en: "and realising Nibbāna: this is the highest blessing.",
          },
          {
            pi: "Phuṭṭhassa lokadhammehi, cittaṃ yassa na kampati,",
            hi: "संसार के उतार-चढ़ाव से छूने पर भी जिसका चित्त नहीं डगमगाता,",
            en: "A mind that does not waver when touched by the ups and downs of the world,",
          },
          {
            pi: "asokaṃ virajaṃ khemaṃ, etaṃ maṅgalamuttamaṃ.",
            hi: "जो शोक-रहित, निर्मल और सुरक्षित है — यह उत्तम मंगल है।",
            en: "free of sorrow, stainless and secure: this is the highest blessing.",
          },
          {
            pi: "Etādisāni katvāna, sabbatthamaparājitā,",
            hi: "ऐसे कर्म करके, सर्वत्र अपराजित रहकर,",
            en: "Having done such things, undefeated everywhere,",
          },
          {
            pi: "sabbattha sotthiṃ gacchanti, taṃ tesaṃ maṅgalamuttaman ti.",
            hi: "लोग हर जगह कल्याण पाते हैं — यही उनका उत्तम मंगल है।",
            en: "people go everywhere in safety: that is their highest blessing.",
          },
        ],
      },
    ],
    source: { title: "Maṅgala Sutta", reference: "Sutta Nipāta 2.4; Khuddakapāṭha 5" },
    notes: {
      en: "The verses only; the short prose introduction, in which a deva asks the Buddha this question at Jetavana, is not included.",
      hi: "केवल गाथाएँ दी गई हैं; छोटा गद्य परिचय, जिसमें जेतवन में एक देवता बुद्ध से यह प्रश्न पूछता है, शामिल नहीं है।",
    },
    review: ALL_DRAFT,
    audio: null,
  },
  {
    slug: "dhammapada-gatha",
    title: { pi: "Dhammapada Gāthā", hi: "धम्मपद गाथाएँ", en: "Verses from the Dhammapada" },
    category: { hi: "उपदेश", en: "Teaching" },
    summary: {
      en: "Six of the best-loved verses of the Dhammapada: on the mind, hatred, the heart of the teaching, contentment and winning by goodness.",
      hi: "धम्मपद की छह सबसे प्रिय गाथाएँ: मन, वैर, शिक्षा का सार, संतोष और भलाई से जीतने पर।",
    },
    tradition: "Theravāda / Pali",
    durationMinutes: 3,
    sections: [
      {
        heading: { hi: "धम्मपद 1", en: "Dhammapada 1" },
        lines: [
          {
            pi: "Manopubbaṅgamā dhammā, manoseṭṭhā manomayā;",
            hi: "मन सभी बातों का अगुआ है, मन ही प्रधान है, सब मन से ही बनती हैं।",
            en: "Mind leads all things; mind is their chief, they are made by mind.",
          },
          {
            pi: "manasā ce paduṭṭhena, bhāsati vā karoti vā,",
            hi: "यदि कोई दूषित मन से बोलता है या कुछ करता है,",
            en: "If one speaks or acts with a corrupted mind,",
          },
          {
            pi: "tato naṃ dukkhamanveti, cakkaṃva vahato padaṃ.",
            hi: "तो दुःख उसके पीछे वैसे ही चलता है, जैसे गाड़ी का पहिया खींचने वाले बैल के पैरों के पीछे।",
            en: "suffering follows, as the wheel follows the foot of the ox.",
          },
        ],
      },
      {
        heading: { hi: "धम्मपद 2", en: "Dhammapada 2" },
        lines: [
          {
            pi: "Manopubbaṅgamā dhammā, manoseṭṭhā manomayā;",
            hi: "मन सभी बातों का अगुआ है, मन ही प्रधान है, सब मन से ही बनती हैं।",
            en: "Mind leads all things; mind is their chief, they are made by mind.",
          },
          {
            pi: "manasā ce pasannena, bhāsati vā karoti vā,",
            hi: "यदि कोई निर्मल, प्रसन्न मन से बोलता है या कुछ करता है,",
            en: "If one speaks or acts with a clear and peaceful mind,",
          },
          {
            pi: "tato naṃ sukhamanveti, chāyāva anapāyinī.",
            hi: "तो सुख उसके पीछे वैसे ही चलता है, जैसे कभी साथ न छोड़ने वाली छाया।",
            en: "happiness follows, like a shadow that never leaves.",
          },
        ],
      },
      {
        heading: { hi: "धम्मपद 5", en: "Dhammapada 5" },
        lines: [
          {
            pi: "Na hi verena verāni, sammantīdha kudācanaṃ;",
            hi: "इस संसार में वैर से वैर कभी शांत नहीं होता;",
            en: "Hatred is never calmed by hatred in this world;",
          },
          {
            pi: "averena ca sammanti, esa dhammo sanantano.",
            hi: "अवैर से ही वैर शांत होता है — यही सनातन नियम है।",
            en: "by non-hatred alone is it calmed. This is an eternal law.",
          },
        ],
      },
      {
        heading: { hi: "धम्मपद 183", en: "Dhammapada 183" },
        lines: [
          {
            pi: "Sabbapāpassa akaraṇaṃ, kusalassa upasampadā,",
            hi: "सभी पापों से बचना, कुशल कर्मों को अपनाना,",
            en: "Not doing any evil, cultivating what is good,",
          },
          {
            pi: "sacittapariyodapanaṃ, etaṃ buddhāna sāsanaṃ.",
            hi: "और अपने चित्त को शुद्ध करना — यही बुद्धों की शिक्षा है।",
            en: "and purifying one's mind: this is the teaching of the Buddhas.",
          },
        ],
      },
      {
        heading: { hi: "धम्मपद 204", en: "Dhammapada 204" },
        lines: [
          {
            pi: "Ārogyaparamā lābhā, santuṭṭhiparamaṃ dhanaṃ,",
            hi: "आरोग्य सबसे बड़ा लाभ है, संतोष सबसे बड़ा धन है,",
            en: "Health is the greatest gain, contentment the greatest wealth,",
          },
          {
            pi: "vissāsaparamā ñātī, nibbānaparamaṃ sukhaṃ.",
            hi: "भरोसेमंद व्यक्ति सबसे अच्छा संबंधी है, निब्बान सबसे बड़ा सुख है।",
            en: "the trusted are the best of kin, Nibbāna the highest happiness.",
          },
        ],
      },
      {
        heading: { hi: "धम्मपद 223", en: "Dhammapada 223" },
        lines: [
          {
            pi: "Akkodhena jine kodhaṃ, asādhuṃ sādhunā jine,",
            hi: "क्रोध को अक्रोध से जीतें, बुराई को भलाई से जीतें,",
            en: "Overcome anger with calm, overcome wrong with good,",
          },
          {
            pi: "jine kadariyaṃ dānena, saccenālikavādinaṃ.",
            hi: "कंजूस को दान से जीतें, और झूठ बोलने वाले को सत्य से।",
            en: "overcome the miser with giving, and the liar with truth.",
          },
        ],
      },
    ],
    source: { title: "Dhammapada", reference: "Verses 1, 2, 5, 183, 204 and 223 (Khuddaka Nikāya)" },
    review: ALL_DRAFT,
    audio: null,
  },
  {
    slug: "sabba-mangala",
    title: { pi: "Bhavatu Sabbamaṅgalaṃ", hi: "मंगल कामना", en: "Blessings for All" },
    category: { hi: "शांति", en: "Peace" },
    summary: {
      en: "A wish that every being be free from suffering, fear and grief, followed by the traditional closing blessings.",
      hi: "यह कामना कि सभी प्राणी दुःख, भय और शोक से मुक्त हों, और उसके बाद पारंपरिक समापन आशीर्वाद।",
    },
    tradition: "Theravāda / Pali",
    durationMinutes: 1,
    sections: [
      {
        heading: { hi: "करुणा", en: "Compassion" },
        lines: [
          {
            pi: "Dukkhappattā ca niddukkhā, bhayappattā ca nibbhayā,",
            hi: "दुःख में पड़े प्राणी दुःख से मुक्त हों, भय में पड़े प्राणी निर्भय हों,",
            en: "May those who suffer be free from suffering, may those in fear be free from fear,",
          },
          {
            pi: "sokappattā ca nissokā, hontu sabbepi pāṇino.",
            hi: "शोक में डूबे प्राणी शोक-रहित हों — सभी प्राणी ऐसे हों।",
            en: "may those who grieve be free from grief: may all beings be so.",
          },
        ],
      },
      {
        heading: { hi: "मंगल आशीर्वाद", en: "Blessings" },
        lines: [
          {
            pi: "Bhavatu sabbamaṅgalaṃ, rakkhantu sabbadevatā,",
            hi: "सब मंगल हो, सभी देवता रक्षा करें,",
            en: "May every blessing be yours, may all the devas protect you,",
          },
          {
            pi: "sabbabuddhānubhāvena, sadā sotthī bhavantu te.",
            hi: "सभी बुद्धों के प्रभाव से आपका सदा कल्याण हो।",
            en: "by the power of all the Buddhas, may you always be well.",
          },
          {
            pi: "Bhavatu sabbamaṅgalaṃ, rakkhantu sabbadevatā,",
            hi: "सब मंगल हो, सभी देवता रक्षा करें,",
            en: "May every blessing be yours, may all the devas protect you,",
          },
          {
            pi: "sabbadhammānubhāvena, sadā sotthī bhavantu te.",
            hi: "सम्पूर्ण धम्म के प्रभाव से आपका सदा कल्याण हो।",
            en: "by the power of all the Dhamma, may you always be well.",
          },
          {
            pi: "Bhavatu sabbamaṅgalaṃ, rakkhantu sabbadevatā,",
            hi: "सब मंगल हो, सभी देवता रक्षा करें,",
            en: "May every blessing be yours, may all the devas protect you,",
          },
          {
            pi: "sabbasaṅghānubhāvena, sadā sotthī bhavantu te.",
            hi: "सम्पूर्ण संघ के प्रभाव से आपका सदा कल्याण हो।",
            en: "by the power of all the Saṅgha, may you always be well.",
          },
        ],
      },
    ],
    source: {
      title: "Traditional paritta blessing verses",
      reference: "Recited at the close of paritta chanting in Theravāda traditions; the blessings close the Mahājayamaṅgala Gāthā",
    },
    review: ALL_DRAFT,
    audio: null,
  },
  {
    slug: "punnanumodana",
    title: { pi: "Puññānumodanā", hi: "पुण्यानुमोदन", en: "Sharing of Merit" },
    category: { hi: "समापन", en: "Dedication" },
    summary: {
      en: "Closing verses that share the good of one's practice with all beings and with departed relatives.",
      hi: "समापन गाथाएँ, जिनमें अपने अभ्यास का पुण्य सभी प्राणियों और दिवंगत संबंधियों के साथ बाँटा जाता है।",
    },
    tradition: "Theravāda / Pali",
    durationMinutes: 1,
    sections: [
      {
        lines: [
          {
            pi: "Ettāvatā ca amhehi, sambhataṃ puññasampadaṃ,",
            hi: "अब तक हमने जो पुण्य संचित किया है,",
            en: "In the merit we have gathered so far,",
          },
          {
            pi: "sabbe devā anumodantu, sabbasampattisiddhiyā.",
            hi: "उसमें सभी देवता आनंदित हों, सब प्रकार के कल्याण की सिद्धि के लिए।",
            en: "may all the devas rejoice, for the fulfilment of every blessing.",
          },
          {
            pi: "Ettāvatā ca amhehi, sambhataṃ puññasampadaṃ,",
            hi: "अब तक हमने जो पुण्य संचित किया है,",
            en: "In the merit we have gathered so far,",
          },
          {
            pi: "sabbe bhūtā anumodantu, sabbasampattisiddhiyā.",
            hi: "उसमें सभी अदृश्य प्राणी आनंदित हों, सब प्रकार के कल्याण की सिद्धि के लिए।",
            en: "may all unseen beings rejoice, for the fulfilment of every blessing.",
          },
          {
            pi: "Ettāvatā ca amhehi, sambhataṃ puññasampadaṃ,",
            hi: "अब तक हमने जो पुण्य संचित किया है,",
            en: "In the merit we have gathered so far,",
          },
          {
            pi: "sabbe sattā anumodantu, sabbasampattisiddhiyā.",
            hi: "उसमें सभी प्राणी आनंदित हों, सब प्रकार के कल्याण की सिद्धि के लिए।",
            en: "may all beings rejoice, for the fulfilment of every blessing.",
          },
        ],
      },
      {
        heading: { hi: "दिवंगत संबंधियों के लिए", en: "For departed relatives" },
        repeat: 3,
        lines: [
          {
            pi: "Idaṃ me ñātīnaṃ hotu, sukhitā hontu ñātayo.",
            hi: "यह पुण्य मेरे संबंधियों को प्राप्त हो; मेरे संबंधी सुखी हों।",
            en: "May this merit go to my relatives; may my relatives be happy.",
          },
        ],
      },
    ],
    source: {
      title: "Traditional merit-sharing verses",
      reference: "The last line adapts Khuddakapāṭha 7 (Tirokuṭṭa Sutta), where it reads 'idaṃ vo ñātīnaṃ hotu'",
    },
    notes: {
      en: "Often recited at the end of a practice, or when remembering someone who has passed away.",
      hi: "प्रायः अभ्यास के अंत में, या किसी दिवंगत को याद करते समय इसका पाठ किया जाता है।",
    },
    review: ALL_DRAFT,
    audio: null,
  },
];

/**
 * Prayers the app shows: what is published in the CMS (fetched at build time
 * by scripts/fetch-cms-content.ts), or the built-in set before the CMS has
 * any content.
 */
export const PRAYERS: Prayer[] = (published.prayers as unknown as Prayer[]).length ? (published.prayers as unknown as Prayer[]) : SEED_PRAYERS;

export function getPrayer(slug: string): Prayer | undefined {
  return PRAYERS.find((p) => p.slug === slug);
}
