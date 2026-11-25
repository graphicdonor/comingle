import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { ArrowRight, Bookmark, Search, Volume2 } from "lucide-react-native";
import { favourites } from "@/lib/practice/preferences";
import { Screen, IconButton } from "~/components/screen";
import { Card, Eyebrow, H1, H2, Muted, Segmented, T } from "~/components/ui";
import { C, F } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { SESSIONS, sessionMinutes, sessionPrayers, useContent } from "~/lib/content";

export default function Prayers() {
  const { t, lang } = useT();
  const content = useContent();
  const saved = favourites.use();
  const [filter, setFilter] = useState<"all" | "saved">("all");
  const list = filter === "saved" ? content.prayers.filter((p) => saved.includes(p.slug)) : content.prayers;

  return (
    <Screen
      header={
        <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 12, paddingTop: 8 }}>
          <IconButton label={t("search.open")} onPress={() => router.push("/search")}>
            <Search size={22} color={C.ink} />
          </IconButton>
        </View>
      }
    >
      <View>
        <H1>{t("prayers.title")}</H1>
        <Muted style={{ marginTop: 4 }}>{t("prayers.intro")}</Muted>
      </View>

      <H2>{t("prayers.sessions")}</H2>
      <View style={{ flexDirection: "row", gap: 12 }}>
        {SESSIONS.map((s) => (
          <Card key={s.id} onPress={() => router.push(`/practice/session/${s.id}`)} style={{ flex: 1, backgroundColor: s.id === "morning" ? "#FBEFD9" : "#EDE3EF", borderColor: "transparent" }}>
            <T bold style={{ fontSize: 17 }}>
              {s.title[lang]}
            </T>
            <Muted style={{ fontSize: 13, marginTop: 4 }}>{t("prayers.sessionMeta", { n: sessionMinutes(content, s), k: sessionPrayers(content, s).length })}</Muted>
          </Card>
        ))}
      </View>

      <H2 style={{ marginTop: 8 }}>{t("prayers.all")}</H2>
      <Segmented
        label={t("prayers.filters")}
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: t("prayers.filterAll", { n: content.prayers.length }) },
          { value: "saved", label: t("prayers.filterSaved", { n: saved.length }) },
        ]}
      />
      {list.length === 0 && <Muted style={{ textAlign: "center", paddingVertical: 24 }}>{t("prayers.emptySaved")}</Muted>}
      {list.map((p) => {
        const audio = Boolean(content.clips[p.slug]);
        return (
          <Card key={p.slug} onPress={() => router.push(`/practice/${p.slug}`)} accessibilityLabel={`${p.title[lang]}, ${p.title.pi}, ${t("common.min", { n: p.durationMinutes })}`} style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Eyebrow>{p.category[lang]}</Eyebrow>
              <T bold style={{ fontSize: 18 }}>
                {p.title[lang]}
              </T>
              <T style={{ fontFamily: F.paliItalic, color: C.faint, fontSize: 15 }}>{p.title.pi}</T>
              <Muted numberOfLines={2} style={{ fontSize: 14, marginTop: 4 }}>
                {p.summary[lang]}
              </Muted>
              <View style={{ flexDirection: "row", gap: 12, marginTop: 6, alignItems: "center" }}>
                <T style={{ fontSize: 13, color: C.faint }}>{t("common.min", { n: p.durationMinutes })}</T>
                {audio && <Volume2 size={14} color={C.gold} accessibilityLabel={t("prayers.audio")} />}
                {saved.includes(p.slug) && <Bookmark size={14} color={C.burgundy} fill={C.burgundy} accessibilityLabel={t("prayers.saved")} />}
              </View>
            </View>
            <ArrowRight size={20} color={C.burgundy} />
          </Card>
        );
      })}
    </Screen>
  );
}
