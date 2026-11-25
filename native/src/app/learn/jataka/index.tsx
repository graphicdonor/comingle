import { View } from "react-native";
import { JATAKA_INTRO } from "@/lib/learn/jataka";
import { Screen, TopBar } from "~/components/screen";
import { Eyebrow, H1, T } from "~/components/ui";
import { StoryCard } from "~/components/story-card";
import { C } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { useContent } from "~/lib/content";

export default function JatakaList() {
  const { t, lang } = useT();
  const { stories } = useContent();
  return (
    <Screen header={<TopBar title={t("jataka.title")} />}>
      <View style={{ gap: 8 }}>
        <Eyebrow>{t("jataka.count", { n: stories.length })}</Eyebrow>
        <H1>{t("jataka.title")}</H1>
        {JATAKA_INTRO.map((p) => (
          <T key={p.en} style={{ fontSize: 15, lineHeight: 23, color: C.muted }}>
            {p[lang]}
          </T>
        ))}
      </View>
      {stories.map((s) => (
        <StoryCard key={s.slug} story={s} />
      ))}
    </Screen>
  );
}
