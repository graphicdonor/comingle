import { View } from "react-native";
import { COMMENTARY_INTRO, COMMENTARY_STORIES } from "@/lib/learn/dhammapada";
import { Screen, TopBar } from "~/components/screen";
import { Eyebrow, H1, T } from "~/components/ui";
import { CommentaryCard } from "~/components/dhammapada";
import { C } from "~/lib/theme";
import { useT } from "~/lib/i18n";

export default function CommentaryStories() {
  const { t, lang } = useT();
  return (
    <Screen header={<TopBar title={t("dhp.title")} />}>
      <View style={{ gap: 8 }}>
        <Eyebrow>{t("jataka.count", { n: COMMENTARY_STORIES.length })}</Eyebrow>
        <H1>{t("dhp.stories")}</H1>
        <T style={{ fontSize: 15, lineHeight: 23, color: C.muted }}>{COMMENTARY_INTRO[lang]}</T>
      </View>
      {COMMENTARY_STORIES.map((s) => (
        <CommentaryCard key={s.slug} story={s} />
      ))}
    </Screen>
  );
}
