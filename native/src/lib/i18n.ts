import { DICTIONARY, format, type MessageKey, type UiLang } from "@/lib/i18n/dictionary";
import { createLocalStore } from "./local-store";

// The website's Hindi/English interface text, with the language kept on the device.
export const uiLang = createLocalStore<UiLang>("practice:ui-lang", "en", (raw) => (raw === "hi" ? "hi" : "en"));

export type T = (key: MessageKey, vars?: Record<string, string | number>) => string;

export function useT(): { t: T; lang: UiLang } {
  const lang = uiLang.use();
  const t: T = (key, vars) => format(DICTIONARY[lang][key] ?? DICTIONARY.en[key] ?? key, vars);
  return { t, lang };
}

export type { MessageKey, UiLang };
