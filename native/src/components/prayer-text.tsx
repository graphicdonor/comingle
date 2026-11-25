import { memo } from "react";
import { Pressable, View, type LayoutChangeEvent } from "react-native";
import { paliToDevanagari } from "@/lib/practice/pali-devanagari";
import type { Prayer } from "@/lib/practice/prayers";
import type { ReadingPrefs } from "@/lib/practice/preferences";
import { C, F, readingSize } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { Pill, T } from "./ui";

interface Props {
  prayer: Prayer;
  prefs: ReadingPrefs;
  /** Line being read aloud or marked by the reader ("section-line"). */
  activeLine: string | null;
  onLinePress: (line: string) => void;
  onLineLayout?: (line: string, y: number) => void;
}

/** A prayer's sections and lines, in Pali and/or translation as the reader prefers. */
export const PrayerText = memo(function PrayerText({ prayer, prefs, activeLine, onLinePress, onLineLayout }: Props) {
  const { t, lang } = useT();
  const size = readingSize(prefs.size);
  const deva = prefs.script === "devanagari";

  return (
    <View style={{ gap: 22 }}>
      {prayer.sections.map((section, si) => (
        <View key={si} style={{ gap: 6 }} onLayout={(e: LayoutChangeEvent) => onLineLayout?.(`s${si}`, e.nativeEvent.layout.y)}>
          {(section.heading || (section.repeat ?? 1) > 1) && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
              {section.heading && (
                <T bold style={{ fontSize: 14, color: C.gold, textTransform: lang === "en" ? "uppercase" : "none", letterSpacing: lang === "en" ? 1 : 0 }} accessibilityRole="header">
                  {section.heading[lang]}
                </T>
              )}
              {(section.repeat ?? 1) > 1 && <Pill tone="sage">{t("prayers.recite", { n: section.repeat! })}</Pill>}
            </View>
          )}
          {section.lines.map((line, li) => {
            const key = `${si}-${li}`;
            const active = activeLine === key;
            const pali = deva ? paliToDevanagari(line.pi) : line.pi;
            const translation = line[prefs.translation];
            return (
              <Pressable
                key={key}
                onPress={() => onLinePress(key)}
                onLayout={(e) => onLineLayout?.(key, e.nativeEvent.layout.y)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={[prefs.mode !== "translation" ? line.pi : "", prefs.mode !== "pali" ? translation : ""].filter(Boolean).join(". ")}
                style={({ pressed }) => [
                  { borderRadius: 16, paddingVertical: 10, paddingHorizontal: 12, marginHorizontal: -12, borderLeftWidth: 3, borderLeftColor: "transparent" },
                  active && { backgroundColor: "#F6E7C8", borderLeftColor: C.saffron },
                  pressed && !active && { backgroundColor: C.tint },
                ]}
              >
                {prefs.mode !== "translation" && (
                  <T
                    style={{
                      fontFamily: deva ? F.deva : F.pali,
                      fontSize: size.pali,
                      lineHeight: size.pali * (deva ? 1.75 : size.lineHeight),
                      color: C.ink,
                    }}
                  >
                    {pali}
                  </T>
                )}
                {prefs.mode !== "pali" && (
                  <T
                    style={{
                      fontFamily: prefs.translation === "hi" ? F.deva : F.regular,
                      fontSize: prefs.mode === "translation" ? size.pali : size.translation,
                      lineHeight: (prefs.mode === "translation" ? size.pali : size.translation) * (prefs.translation === "hi" ? 1.7 : 1.5),
                      color: prefs.mode === "translation" ? C.ink : C.muted,
                      marginTop: prefs.mode === "both" ? 4 : 0,
                    }}
                  >
                    {translation}
                  </T>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
});
