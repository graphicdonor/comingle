import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Pause, Play, SkipBack, SkipForward, Square } from "lucide-react-native";
import { STORY_SPEEDS, type useStoryVoice } from "~/lib/voice";
import { C } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { T } from "./ui";
import { IconButton } from "./screen";

// Listening controls for narrated stories (Jātaka tales and the Dhammapada
// commentary stories), kept at the bottom of the screen.

type Voice = ReturnType<typeof useStoryVoice>;

export function StoryListenBar({ voice, minutes }: { voice: Voice; minutes: number }) {
  const { t } = useT();
  const insets = useSafeAreaInsets();
  const active = voice.status !== "idle";
  const playing = voice.status === "playing";
  return (
    <View style={{ backgroundColor: C.paper, borderTopWidth: 1, borderTopColor: C.line, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8 + insets.bottom, gap: 4 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Pressable
          onPress={playing ? voice.pause : voice.play}
          accessibilityRole="button"
          accessibilityLabel={playing ? t("listen.pause") : voice.status === "paused" ? t("listen.resume") : t("listen.play")}
          style={({ pressed }) => [{ width: 52, height: 52, borderRadius: 26, backgroundColor: C.burgundy, alignItems: "center", justifyContent: "center" }, pressed && { opacity: 0.85 }]}
        >
          {playing ? <Pause size={22} color={C.cream} fill={C.cream} /> : <Play size={22} color={C.cream} fill={C.cream} style={{ marginLeft: 3 }} />}
        </Pressable>
        <View style={{ flex: 1, paddingHorizontal: 6 }}>
          <T bold style={{ fontSize: 15 }}>
            {t("listen.title")}
          </T>
          <T style={{ fontSize: 12, color: C.faint }} accessibilityLiveRegion="polite">
            {active ? t("jataka.progress", { i: voice.partNumber, n: voice.partCount }) : t("common.min", { n: minutes })}
          </T>
        </View>
        {active && (
          <>
            <IconButton label={t("listen.previous")} onPress={voice.previous}>
              <SkipBack size={20} color={C.ink} />
            </IconButton>
            <IconButton label={t("listen.next")} onPress={voice.next}>
              <SkipForward size={20} color={C.ink} />
            </IconButton>
            <IconButton label={t("listen.stop")} onPress={voice.stop}>
              <Square size={18} color={C.ink} />
            </IconButton>
          </>
        )}
      </View>
      {active && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }} accessibilityRole="radiogroup" accessibilityLabel={t("listen.speed")}>
          <T style={{ fontSize: 12, color: C.faint }}>{t("listen.speed")}</T>
          {STORY_SPEEDS.map((sp) => {
            const on = voice.speed === sp;
            return (
              <Pressable
                key={sp}
                onPress={() => voice.setSpeed(sp)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`${t("listen.speed")} ${sp}×`}
                hitSlop={4}
                style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: on ? C.burgundy : C.tint }}
              >
                <T bold style={{ fontSize: 12, color: on ? C.cream : C.muted }}>
                  {sp}×
                </T>
              </Pressable>
            );
          })}
        </View>
      )}
      <T style={{ fontSize: 11, color: C.faint, textAlign: "center" }}>{voice.aiVoice ? t("jataka.aiVoice") : t("jataka.deviceVoice")}</T>
    </View>
  );
}

