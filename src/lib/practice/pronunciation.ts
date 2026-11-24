// Pronunciation practice helpers (PRD roadmap v1.1): split a romanised Pali
// line into syllables, mark the heavy ones, and pick the sound tips that
// apply to it.
//
// Pali syllables follow simple rules: every syllable has one vowel; a single
// consonant between vowels starts the next syllable; of a consonant cluster,
// the first consonant closes the syllable before. A syllable is heavy
// (garu, held longer in chanting) when its vowel is long (ā ī ū e o), or it
// is closed by a consonant or ṃ; otherwise it is light (lahu).

import type { Localised } from "./prayers";

export interface Syllable {
  text: string;
  heavy: boolean;
}

type Token = { kind: "C" | "V" | "M" | "X"; text: string };

// Aspirated pairs first, so "kh" is read as one consonant, not k + h.
const TOKEN = /(kh|gh|ch|jh|ṭh|ḍh|th|dh|ph|bh)|([kgṅcjñṭḍṇtdnpbmyrlḷvsh])|(ā|ī|ū|a|i|u|e|o)|(ṃ)/iy;
const LONG = /^[āīūeo]$/i;

function tokenize(word: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < word.length) {
    TOKEN.lastIndex = i;
    const m = TOKEN.exec(word);
    if (m) {
      out.push({ kind: m[1] || m[2] ? "C" : m[3] ? "V" : "M", text: m[0] });
      i += m[0].length;
    } else {
      out.push({ kind: "X", text: word[i] }); // punctuation, apostrophes
      i++;
    }
  }
  return out;
}

/** Splits one word into syllables. */
export function syllabifyWord(word: string): Syllable[] {
  const tokens = tokenize(word);
  const vowels = tokens.flatMap((t, i) => (t.kind === "V" ? [i] : []));
  if (!vowels.length) return [{ text: word, heavy: false }];

  // Where each syllable starts, in token positions.
  const starts = [0];
  for (let k = 0; k < vowels.length - 1; k++) {
    const between = tokens.slice(vowels[k] + 1, vowels[k + 1]);
    const consonants = between.flatMap((t, j) => (t.kind === "C" ? [vowels[k] + 1 + j] : []));
    // One consonant (or none) starts the next syllable; in a cluster, the first closes this one.
    starts.push(consonants.length <= 1 ? (consonants[0] ?? vowels[k + 1]) : consonants[1]);
  }

  return starts.map((start, k) => {
    const end = k + 1 < starts.length ? starts[k + 1] : tokens.length;
    const part = tokens.slice(start, end);
    const vowelAt = part.findIndex((t) => t.kind === "V");
    const after = part.slice(vowelAt + 1);
    const heavy = LONG.test(part[vowelAt].text) || after.some((t) => t.kind === "C" || t.kind === "M");
    return { text: part.map((t) => t.text).join(""), heavy };
  });
}

/** Splits a line into words, each split into syllables. */
export function syllabify(line: string): Syllable[][] {
  return line.split(/\s+/).filter(Boolean).map(syllabifyWord);
}

export type TipId = "niggahita" | "aspirate" | "double" | "retroflex" | "palatalNasal" | "velarNasal" | "c" | "long" | "v";

export const TIPS: Record<TipId, { sample: string } & Localised> = {
  niggahita: {
    sample: "aṃ · अं",
    en: "ṃ is a soft nasal hum closing the syllable, close to “ng”: saraṇaṃ sounds like sa-ra-ṇang.",
    hi: "ṃ (ं) अक्षर को बंद करने वाली हल्की नासिक ध्वनि है, लगभग “ङ” जैसी: saraṇaṃ को स-र-णङ् की तरह बोलें।",
  },
  aspirate: {
    sample: "kh · th · dh · bh",
    en: "An h after a consonant is a puff of breath, as in Hindi ख, थ, ध, भ. “th” is never the English “th” of “the”.",
    hi: "व्यंजन के बाद h का अर्थ है साँस का हल्का झोंका, जैसे ख, थ, ध, भ में। “th” अंग्रेज़ी “the” वाला th नहीं, बल्कि थ है।",
  },
  double: {
    sample: "tt · mm · cc",
    en: "Double consonants are held a moment longer: sut-ta, dham-ma, gac-chā-mi.",
    hi: "दोहरे व्यंजनों को थोड़ा रोककर बोलें: सुत्-त, धम्-म, गच्-छा-मि।",
  },
  retroflex: {
    sample: "ṭ · ḍ · ṇ · ḷ",
    en: "Letters with a dot below (ṭ ḍ ṇ ḷ) are said with the tip of the tongue curled back, as in ट, ड, ण.",
    hi: "नीचे बिंदु वाले अक्षर (ṭ ḍ ṇ ḷ) जीभ को पीछे मोड़कर बोले जाते हैं, जैसे ट, ड, ण।",
  },
  palatalNasal: {
    sample: "ñ · ञ",
    en: "ñ sounds like the “ny” in “canyon”: puñña is pun-nya.",
    hi: "ñ (ञ) “न्य” जैसी ध्वनि है: puñña को पुन्-न्य की तरह बोलें।",
  },
  velarNasal: {
    sample: "ṅ · ङ",
    en: "ṅ is the “ng” of “sing”: saṅgha is sang-gha.",
    hi: "ṅ (ङ) “ङ” की ध्वनि है, जैसे संग में: saṅgha को सङ्-घ बोलें।",
  },
  c: {
    sample: "c · च",
    en: "c is always “ch” as in “church” (च), never “k” or “s”.",
    hi: "c हमेशा “च” है, कभी “क” या “स” नहीं।",
  },
  long: {
    sample: "ā · ī · ū",
    en: "Hold ā, ī and ū about twice as long as a, i and u.",
    hi: "ā, ī, ū (आ, ई, ऊ) को a, i, u (अ, इ, उ) से लगभग दोगुना लंबा बोलें।",
  },
  v: {
    sample: "v · व",
    en: "v is soft, between “v” and “w”, as in Hindi व.",
    hi: "v कोमल “व” है, अंग्रेज़ी v और w के बीच का।",
  },
};

// Most helpful first; a line shows at most four.
const TIP_TESTS: [TipId, RegExp][] = [
  ["niggahita", /ṃ/i],
  ["aspirate", /(kh|gh|ch|jh|ṭh|ḍh|th|dh|ph|bh)/i],
  ["double", /([kgcjṭḍṇtdnpbmyls])\1/i],
  ["retroflex", /[ṭḍṇḷ]/i],
  ["palatalNasal", /ñ/i],
  ["velarNasal", /ṅ/i],
  ["c", /c/i],
  ["long", /[āīū]/i],
  ["v", /v/i],
];

export function tipsFor(line: string, max = 4): TipId[] {
  return TIP_TESTS.filter(([, re]) => re.test(line))
    .map(([id]) => id)
    .slice(0, max);
}
