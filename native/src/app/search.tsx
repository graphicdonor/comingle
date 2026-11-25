import { useMemo, useState } from "react";
import { FlatList, Pressable, TextInput, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, BookOpen, BookText, Flower2, GraduationCap, X } from "lucide-react-native";
import { search, type ResultKind } from "@/lib/practice/search";
import { IconButton } from "~/components/screen";
import { Muted, T } from "~/components/ui";
import { C, F, fontFor } from "~/lib/theme";
import { useT } from "~/lib/i18n";

const ICONS: Record<ResultKind, typeof BookOpen> = { prayer: BookOpen, guide: GraduationCap, meditation: Flower2, story: BookText };
const SUGGESTIONS = ["Buddha Vandanā", "मैत्री", "Tisaraṇa", "breathing", "Jātaka", "how to sit"];

export default function Search() {
  const { t, lang } = useT();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState("");
  const results = useMemo(() => search(q, lang), [q, lang]);

  return (
    <View style={{ flex: 1, backgroundColor: C.cream, paddingTop: insets.top }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.lineSoft }}>
        <IconButton label={t("search.close")} onPress={() => router.back()}>
          <ArrowLeft size={22} color={C.ink} />
        </IconButton>
        <TextInput
          autoFocus
          value={q}
          onChangeText={setQ}
          placeholder={t("search.placeholder")}
          placeholderTextColor={C.faint}
          returnKeyType="search"
          accessibilityLabel={t("search.open")}
          style={[{ flex: 1, fontSize: 17, color: C.ink, paddingVertical: 10 }, fontFor(q || t("search.placeholder"))]}
        />
        {q.length > 0 && (
          <IconButton label={t("search.clear")} onPress={() => setQ("")}>
            <X size={20} color={C.faint} />
          </IconButton>
        )}
      </View>

      {q.trim() === "" ? (
        <View style={{ padding: 20, gap: 12 }}>
          <T bold style={{ color: C.muted, fontSize: 14 }}>
            {t("search.try")}
          </T>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} onPress={() => setQ(s)} accessibilityRole="button" style={{ backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 }}>
                <T style={{ fontSize: 15 }}>{s}</T>
              </Pressable>
            ))}
          </View>
          <Muted style={{ fontSize: 13 }}>{t("search.hint")}</Muted>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(r) => `${r.kind}:${r.id}`}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 12, paddingBottom: 24 + insets.bottom }}
          ListHeaderComponent={
            <T style={{ fontSize: 13, color: C.faint, paddingHorizontal: 8, paddingBottom: 6 }} accessibilityLiveRegion="polite">
              {results.length ? t("search.count", { n: results.length }) : t("search.none", { q })}
            </T>
          }
          renderItem={({ item }) => {
            const Icon = ICONS[item.kind];
            return (
              <Pressable
                onPress={() => router.push(item.href as never)}
                accessibilityRole="button"
                style={({ pressed }) => [{ flexDirection: "row", gap: 12, padding: 12, borderRadius: 16 }, pressed && { backgroundColor: C.tint }]}
              >
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.tint, alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} color={C.burgundy} />
                </View>
                <View style={{ flex: 1 }}>
                  <T bold style={{ fontSize: 16 }}>
                    {item.title[lang]}
                  </T>
                  {item.title.pi && <T style={{ fontFamily: F.paliItalic, color: C.faint, fontSize: 14 }}>{item.title.pi}</T>}
                  {item.snippet && (
                    <Muted numberOfLines={2} style={{ fontSize: 14 }}>
                      {item.snippet}
                    </Muted>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
