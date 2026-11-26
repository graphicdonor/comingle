import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { chapterHref, getChapter, verseHref, versesOf } from "@/lib/learn/dhammapada";
import { Screen, TopBar } from "~/components/screen";
import { Card, Eyebrow, H1, T } from "~/components/ui";
import { usePali } from "~/components/dhammapada";
import { C, F } from "~/lib/theme";
import { useT } from "~/lib/i18n";

export default function ChapterScreen() {
  const { chapter: param } = useLocalSearchParams<{ chapter: string }>();
  const { t, lang } = useT();
  const pali = usePali();
  const chapter = getChapter(Number(param));
  if (!chapter) return <TopBar />;
  const prev = getChapter(chapter.number - 1);
  const next = getChapter(chapter.number + 1);

  return (
    <Screen header={<TopBar title={t("dhp.title")} />}>
      <View style={{ gap: 4 }}>
        <Eyebrow>
          {t("dhp.chapter", { n: chapter.number })} · {t("dhp.versesRange", { a: chapter.from, b: chapter.to })}
        </Eyebrow>
        <H1>{chapter.title[lang]}</H1>
        <T style={{ fontFamily: F.paliItalic, fontSize: 16, color: C.faint }}>{pali(chapter.pi)}</T>
        {chapter.intro && <T style={{ marginTop: 8, fontSize: 16, lineHeight: 25, color: C.muted }}>{chapter.intro[lang]}</T>}
      </View>

      {versesOf(chapter).map((v) => (
        <Card key={v.n} onPress={() => router.push(verseHref(v.n) as never)} style={{ flexDirection: "row", gap: 12, paddingVertical: 12 }}>
          <T bold style={{ width: 34, textAlign: "right", fontSize: 14, color: C.gold, fontVariant: ["tabular-nums"], paddingTop: 2 }}>
            {v.n}
          </T>
          <View style={{ flex: 1, gap: 4 }}>
            <T style={{ fontFamily: F.paliItalic, fontSize: 16, color: C.ink }}>{pali(v.pi[0].replace(/[;,]\s*$/, ""))}…</T>
            <T numberOfLines={2} style={{ fontSize: 14, lineHeight: 21, color: C.muted }}>
              {lang === "hi" && v.hi ? v.hi : v.en}
            </T>
          </View>
        </Card>
      ))}

      <View style={{ flexDirection: "row", gap: 10 }}>
        {prev ? (
          <Card onPress={() => router.replace(chapterHref(prev.number) as never)} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <ChevronLeft size={20} color={C.burgundy} />
            <View style={{ flex: 1 }}>
              <T style={{ fontSize: 12, color: C.gold }}>{t("dhp.prevChapter")}</T>
              <T bold numberOfLines={1} style={{ fontSize: 15 }}>
                {prev.title[lang]}
              </T>
            </View>
          </Card>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {next && (
          <Card onPress={() => router.replace(chapterHref(next.number) as never)} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <T style={{ fontSize: 12, color: C.gold }}>{t("dhp.nextChapter")}</T>
              <T bold numberOfLines={1} style={{ fontSize: 15 }}>
                {next.title[lang]}
              </T>
            </View>
            <ChevronRight size={20} color={C.burgundy} />
          </Card>
        )}
      </View>
    </Screen>
  );
}
