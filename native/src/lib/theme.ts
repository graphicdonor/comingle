import type { TextStyle } from "react-native";

// WePray's colours and type, matching the website.
export const C = {
  cream: "#F7F2E8",
  paper: "#FFFCF6",
  card: "#FFFFFF",
  line: "#E7DCC8",
  lineSoft: "#EFE7D8",
  ink: "#2A1A1C",
  muted: "#5B5350",
  faint: "#6E6560",
  burgundy: "#6D252C",
  burgundyDark: "#3A1418",
  gold: "#885F19",
  saffron: "#D99A38",
  sage: "#87977A",
  tint: "#F3ECDF",
  error: "#7A2A24",
} as const;

export const F = {
  regular: "Figtree_400Regular",
  medium: "Figtree_500Medium",
  semibold: "Figtree_600SemiBold",
  bold: "Figtree_700Bold",
  deva: "NotoSansDevanagari_400Regular",
  devaBold: "NotoSansDevanagari_600SemiBold",
  pali: "NotoSerif_400Regular",
  paliItalic: "NotoSerif_400Regular_Italic",
  paliBold: "NotoSerif_600SemiBold",
} as const;

const DEVANAGARI = /[ऀ-ॿ]/;

/** Font for a piece of text: Devanagari text needs its own face. */
export function fontFor(text: string, weight: "regular" | "bold" = "regular"): TextStyle {
  if (DEVANAGARI.test(text)) return { fontFamily: weight === "bold" ? F.devaBold : F.deva };
  return { fontFamily: weight === "bold" ? F.bold : F.regular };
}

/** Reading text sizes, by the reader's text-size step (-1 … 3). */
export function readingSize(step: number) {
  const base = 18 + step * 2.5;
  return { pali: base + 1, translation: base - 2, lineHeight: 1.55 };
}
