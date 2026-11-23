// Converts romanised Pali (IAST-style diacritics) to Devanagari.
//
// Pali's Roman spelling maps onto Devanagari almost one-to-one, so the
// Devanagari text is derived rather than stored twice. Output is still shown
// to readers as "auto-transliterated" until a reviewer has checked it.

const CONSONANTS: Record<string, string> = {
  kh: "ख", gh: "घ", ch: "छ", jh: "झ", "ṭh": "ठ", "ḍh": "ढ", th: "थ", dh: "ध", ph: "फ", bh: "भ",
  k: "क", g: "ग", "ṅ": "ङ", c: "च", j: "ज", "ñ": "ञ", "ṭ": "ट", "ḍ": "ड", "ṇ": "ण",
  t: "त", d: "द", n: "न", p: "प", b: "ब", m: "म", y: "य", r: "र", l: "ल", v: "व",
  s: "स", h: "ह", "ḷ": "ळ",
};

const VOWELS: Record<string, string> = {
  a: "अ", "ā": "आ", i: "इ", "ī": "ई", u: "उ", "ū": "ऊ", e: "ए", o: "ओ",
};

const MATRAS: Record<string, string> = {
  a: "", "ā": "ा", i: "ि", "ī": "ी", u: "ु", "ū": "ू", e: "े", o: "ो",
};

const VIRAMA = "्";
const NIGGAHITA = "ं";

export function paliToDevanagari(input: string): string {
  // Normalise so precomposed and combining diacritics compare equal, and
  // accept ṁ as a common alternative spelling of ṃ.
  const text = input.normalize("NFC").toLowerCase().replace(/ṁ/g, "ṃ");
  let out = "";
  let afterConsonant = false;
  let i = 0;

  while (i < text.length) {
    const two = text.slice(i, i + 2);
    const one = text[i];

    const consonant = CONSONANTS[two] !== undefined ? two : CONSONANTS[one] !== undefined ? one : null;
    if (consonant) {
      if (afterConsonant) out += VIRAMA;
      out += CONSONANTS[consonant];
      afterConsonant = true;
      i += consonant.length;
      continue;
    }

    if (VOWELS[one] !== undefined) {
      out += afterConsonant ? MATRAS[one] : VOWELS[one];
      afterConsonant = false;
      i += 1;
      continue;
    }

    if (afterConsonant) out += VIRAMA;
    afterConsonant = false;

    if (one === "ṃ") out += NIGGAHITA;
    else if (one === ".") out += "।";
    else out += one;
    i += 1;
  }

  if (afterConsonant) out += VIRAMA;
  return out;
}
