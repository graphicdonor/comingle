import { Figtree, Noto_Sans_Devanagari, Noto_Serif } from "next/font/google";

// Figtree is the interface and English reading font. It has no Devanagari
// glyphs, so the body font stack (see globals.css) falls through to Noto Sans
// Devanagari for Hindi automatically. Pali in Roman script uses Noto Serif,
// which covers its diacritics (ā ī ū ṃ ṅ ñ ṭ ḍ ṇ ḷ).

export const figtreeFont = Figtree({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

export const devanagariFont = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-devanagari",
  display: "swap",
});

export const paliRomanFont = Noto_Serif({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-pali",
  display: "swap",
});
