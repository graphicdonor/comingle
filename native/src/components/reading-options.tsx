import { Modal, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Minus, Plus } from "lucide-react-native";
import { readingPrefs, TEXT_SIZE_MAX, TEXT_SIZE_MIN, type ReadingPrefs } from "@/lib/practice/preferences";
import { C } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { Button, H2, Segmented, T } from "./ui";
import { IconButton } from "./screen";

/** The reading controls: what to show, translation language, Pali script and text size. */
export function ReadingControls() {
  const { t } = useT();
  const prefs = readingPrefs.use();
  const set = (patch: Partial<ReadingPrefs>) => readingPrefs.set({ ...prefs, ...patch });
  return (
    <View style={{ gap: 16 }}>
      <Row label={t("reading.show")}>
        <Segmented
          label={t("reading.show")}
          value={prefs.mode}
          onChange={(mode) => set({ mode })}
          options={[
            { value: "pali", label: t("reading.pali") },
            { value: "both", label: t("reading.both") },
            { value: "translation", label: t("reading.translation") },
          ]}
        />
      </Row>
      <Row label={t("reading.translationLang")}>
        <Segmented
          label={t("reading.translationLang")}
          value={prefs.translation}
          onChange={(translation) => set({ translation })}
          options={[
            { value: "hi", label: "हिन्दी" },
            { value: "en", label: "English" },
          ]}
        />
      </Row>
      <Row label={t("reading.script")}>
        <Segmented
          label={t("reading.script")}
          value={prefs.script}
          onChange={(script) => set({ script })}
          options={[
            { value: "roman", label: t("reading.roman") },
            { value: "devanagari", label: "देवनागरी" },
          ]}
        />
      </Row>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <T bold style={{ fontSize: 14, color: C.muted }}>
          {t("reading.size")}
        </T>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.tint, borderRadius: 999 }}>
          <IconButton label={t("reading.smaller")} onPress={() => set({ size: Math.max(TEXT_SIZE_MIN, prefs.size - 1) })}>
            <Minus size={18} color={prefs.size <= TEXT_SIZE_MIN ? C.line : C.ink} />
          </IconButton>
          <T bold style={{ width: 28, textAlign: "center" }} accessibilityLiveRegion="polite">
            {prefs.size >= 0 ? `+${prefs.size}` : prefs.size}
          </T>
          <IconButton label={t("reading.larger")} onPress={() => set({ size: Math.min(TEXT_SIZE_MAX, prefs.size + 1) })}>
            <Plus size={18} color={prefs.size >= TEXT_SIZE_MAX ? C.line : C.ink} />
          </IconButton>
        </View>
      </View>
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <T bold style={{ fontSize: 14, color: C.muted }}>
        {label}
      </T>
      {children}
    </View>
  );
}

/** Reading options in a bottom sheet. */
export function ReadingOptionsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: "rgba(42,26,28,0.35)" }} onPress={onClose} accessibilityLabel={t("search.close")} />
      <View style={{ backgroundColor: C.paper, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 20 + insets.bottom, gap: 18 }}>
        <View style={{ alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: C.line }} />
        <H2>{t("session.options")}</H2>
        <ReadingControls />
        <Button label={t("install.gotIt")} onPress={onClose} />
      </View>
    </Modal>
  );
}
