import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getGuide } from "@/lib/learn/guides";
import { Screen, TopBar } from "~/components/screen";
import { Card, Eyebrow, H1, H2, Muted, Pill, T } from "~/components/ui";
import { Animation, Figure } from "~/components/figure";
import { C } from "~/lib/theme";
import { useT } from "~/lib/i18n";

export default function GuideScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const guide = getGuide(slug);
  const { t, lang } = useT();
  if (!guide) return <TopBar />;

  return (
    <Screen header={<TopBar title={guide.title[lang]} />}>
      <View style={{ backgroundColor: C.tint, borderRadius: 28, paddingVertical: 16 }}>
        <Animation id={guide.coverAnimation} height={240} />
      </View>
      <View style={{ gap: 6 }}>
        <Eyebrow>{t("learn.guideMeta", { n: guide.minutes })}</Eyebrow>
        <H1>{guide.title[lang]}</H1>
        {guide.review === "draft" && <Pill tone="gold">{t("learn.draft")}</Pill>}
      </View>
      {guide.intro.map((p, i) => (
        <T key={i} style={{ fontSize: 16, lineHeight: 25, color: C.muted }}>
          {p[lang]}
        </T>
      ))}

      {guide.steps.map((step, i) => (
        <Card key={i} style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
            <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: C.burgundy, alignItems: "center", justifyContent: "center" }}>
              <T bold style={{ color: C.cream, fontSize: 14 }}>
                {i + 1}
              </T>
            </View>
            <H2 style={{ flex: 1 }}>{step.title[lang]}</H2>
          </View>
          {step.animation && <Animation id={step.animation} height={220} />}
          {step.scene && <Figure id={step.scene} height={200} />}
          {step.figures && step.figures.length > 0 && (
            <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
              {step.figures.map((f) => (
                <Figure key={f} id={f} height={step.figures!.length > 1 ? 150 : 210} />
              ))}
            </View>
          )}
          {step.body.map((p, j) => (
            <T key={j} style={{ fontSize: 15, lineHeight: 23, color: C.muted }}>
              {p[lang]}
            </T>
          ))}
          {step.cues && (
            <View style={{ gap: 6 }}>
              {step.cues.map((c, j) => (
                <View key={j} style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.sage, marginTop: 9 }} />
                  <T style={{ flex: 1, fontSize: 15, lineHeight: 23 }}>{c.text[lang]}</T>
                </View>
              ))}
            </View>
          )}
          {step.caution && (
            <View style={{ backgroundColor: "#FBEFD9", borderRadius: 14, padding: 12 }}>
              <T style={{ fontSize: 14, lineHeight: 21, color: "#6B4A12" }}>{step.caution[lang]}</T>
            </View>
          )}
        </Card>
      ))}

      {guide.closing && <Muted style={{ fontStyle: "italic" }}>{guide.closing[lang]}</Muted>}
    </Screen>
  );
}
