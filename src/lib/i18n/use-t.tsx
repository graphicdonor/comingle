"use client";
import { createLocalStore } from "@/lib/practice/local-store";
import { DICTIONARY, format, type MessageKey, type UiLang } from "./dictionary";

/**
 * Interface language, kept on the device like the other preferences.
 * The server renders English; a Hindi reader's choice applies on hydration
 * (behind the splash screen on a full load, instantly on client navigation).
 */
export const uiLang = createLocalStore<UiLang>("practice:ui-lang", "en", (raw) => (raw === "hi" ? "hi" : "en"));

export function useT() {
  const lang = uiLang.use();
  const t = (key: MessageKey, vars?: Record<string, string | number>) => format(DICTIONARY[lang][key], vars);
  return { t, lang };
}

/** For server components: renders one interface string in the reader's language. */
export function T({ k, vars }: { k: MessageKey; vars?: Record<string, string | number> }) {
  const { t } = useT();
  return <>{t(k, vars)}</>;
}

/** Pick the reader's language from a bilingual content field. */
export function pick<V>(value: { en: V; hi: V }, lang: UiLang): V {
  return value[lang];
}
