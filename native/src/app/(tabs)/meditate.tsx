import { useState } from "react";
import { Pressable, Switch, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Play } from "lucide-react-native";
import { MEDITATION_DURATIONS } from "@/lib/practice/meditations";
import { Screen } from "~/components/screen";
import { Button, Card, H1, H2, Muted, T } from "~/components/ui";
import { C, F } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { useContent } from "~/lib/content";

export default function Meditate() {
  const { t, lang } = useT();
  const content = useContent();
  const params = useLocalSearchParams<{ practice?: string; minutes?: string }>();
  const [picked, setPicked] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<number>(() => {
    const m = Number(params.minutes);
    return (MEDITATION_DURATIONS as readonly number[]).includes(m) ? m : 10;
  });
  const [guide, setGuide] = useState(false);
  const id = picked ?? (content.meditations.some((m) => m.id === params.practice) ? params.practice! : content.meditations[0].id);
  const practice = content.meditations.find((m) => m.id === id)!;

  return (
    <Screen>
      <View>
        <H1>{t("meditate.title")}</H1>
        <Muted style={{ marginTop: 4 }}>{t("meditate.intro")}</Muted>
      </View>

      <H2>{t("meditate.practice")}</H2>
      <View style={{ gap: 8 }} accessibilityRole="radiogroup" accessibilityLabel={t("meditate.practice")}>
        {content.meditations.map((m) => {
          const on = m.id === id;
          return (
            <Pressable
              key={m.id}
              onPress={() => setPicked(m.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              style={{ borderRadius: 18, borderWidth: on ? 2 : 1, borderColor: on ? C.burgundy : C.line, backgroundColor: on ? "#FBF3F0" : C.card, padding: 14, gap: 2 }}
            >
              <T bold style={{ fontSize: 16 }}>
                {m.title[lang]} <T style={{ fontFamily: F.paliItalic, color: C.faint, fontSize: 14 }}>· {m.pali}</T>
              </T>
              <Muted style={{ fontSize: 14 }}>{m.summary[lang]}</Muted>
            </Pressable>
          );
        })}
      </View>

      <H2>{t("meditate.duration")}</H2>
      <View style={{ flexDirection: "row", gap: 8 }} accessibilityRole="radiogroup" accessibilityLabel={t("meditate.durationLabel")}>
        {MEDITATION_DURATIONS.map((n) => {
          const on = n === minutes;
          return (
            <Pressable
              key={n}
              onPress={() => setMinutes(n)}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={t("common.min", { n })}
              style={{ flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 16, backgroundColor: on ? C.burgundy : C.card, borderWidth: 1, borderColor: on ? C.burgundy : C.line }}
            >
              <T bold style={{ fontSize: 20, color: on ? C.cream : C.ink }}>
                {n}
              </T>
              <T style={{ fontSize: 12, color: on ? "rgba(247,242,232,0.8)" : C.faint }}>{t("meditate.minShort")}</T>
            </Pressable>
          );
        })}
      </View>

      <Card style={{ gap: 10 }}>
        <T bold style={{ fontSize: 16 }}>
          {t("meditate.howTo")}
        </T>
        {practice.steps.map((step, i) => (
          <View key={i} style={{ flexDirection: "row", gap: 10 }}>
            <T bold style={{ color: C.gold, width: 18 }}>
              {i + 1}.
            </T>
            <T style={{ flex: 1, fontSize: 15, lineHeight: 23, color: C.muted }}>{step[lang]}</T>
          </View>
        ))}
        <Muted style={{ fontSize: 13, fontStyle: "italic" }}>{practice.context[lang]}</Muted>
      </Card>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <T bold>{t("meditate.guide")}</T>
          <Muted style={{ fontSize: 13 }}>{t("meditate.guideHint")}</Muted>
        </View>
        <Switch value={guide} onValueChange={setGuide} trackColor={{ true: C.burgundy, false: C.line }} thumbColor={C.paper} accessibilityLabel={t("meditate.guide")} />
      </View>

      <Button
        label={t("common.begin", { n: minutes })}
        icon={<Play size={18} color={C.cream} fill={C.cream} />}
        onPress={() => router.push({ pathname: "/meditate/session", params: { practice: id, minutes: String(minutes), guide: guide ? "1" : "0" } })}
      />
      <Muted style={{ fontSize: 13, textAlign: "center" }}>{t("meditate.disclaimer")}</Muted>
    </Screen>
  );
}
