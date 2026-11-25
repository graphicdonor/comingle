import { View } from "react-native";
import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { GUIDES } from "@/lib/learn/guides";
import { StoryCard } from "~/components/story-card";
import { useContent } from "~/lib/content";
import { Screen } from "~/components/screen";
import { Button, Card, Eyebrow, H1, H2, Muted } from "~/components/ui";
import { Figure } from "~/components/figure";
import { C } from "~/lib/theme";
import { useT } from "~/lib/i18n";

export default function Learn() {
  const { t, lang } = useT();
  const { stories } = useContent();
  return (
    <Screen>
      <View>
        <H1>{t("learn.title")}</H1>
        <Muted style={{ marginTop: 4 }}>{t("learn.intro")}</Muted>
      </View>
      {GUIDES.map((g) => (
        <Card key={g.slug} onPress={() => router.push(`/learn/${g.slug}`)} accessibilityLabel={`${g.title[lang]}. ${g.summary[lang]}`} style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <View style={{ backgroundColor: C.tint, borderRadius: 18, padding: 8 }}>
            <Figure id={g.cover} height={110} decorative />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Eyebrow>{t("learn.guideMeta", { n: g.minutes })}</Eyebrow>
            <H2>{g.title[lang]}</H2>
            <Muted numberOfLines={3} style={{ fontSize: 14 }}>
              {g.summary[lang]}
            </Muted>
          </View>
          <ArrowRight size={20} color={C.burgundy} />
        </Card>
      ))}
      <View style={{ gap: 6, marginTop: 8 }}>
        <H2>{t("jataka.title")}</H2>
        <Muted style={{ fontSize: 14 }}>{t("jataka.intro")}</Muted>
      </View>
      {stories.slice(0, 3).map((s) => (
        <StoryCard key={s.slug} story={s} />
      ))}
      <Button variant="secondary" label={`${t("jataka.all")} (${stories.length})`} onPress={() => router.push("/learn/jataka")} icon={<ArrowRight size={18} color={C.burgundy} />} />
      <Muted style={{ textAlign: "center", fontSize: 14 }}>{t("learn.more")}</Muted>
    </Screen>
  );
}
