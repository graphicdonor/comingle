import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
// Only the weights the app uses (importing a font package's root bundles every weight).
import { Figtree_400Regular } from "@expo-google-fonts/figtree/400Regular";
import { Figtree_500Medium } from "@expo-google-fonts/figtree/500Medium";
import { Figtree_600SemiBold } from "@expo-google-fonts/figtree/600SemiBold";
import { Figtree_700Bold } from "@expo-google-fonts/figtree/700Bold";
import { NotoSansDevanagari_400Regular } from "@expo-google-fonts/noto-sans-devanagari/400Regular";
import { NotoSansDevanagari_600SemiBold } from "@expo-google-fonts/noto-sans-devanagari/600SemiBold";
import { NotoSerif_400Regular } from "@expo-google-fonts/noto-serif/400Regular";
import { NotoSerif_400Regular_Italic } from "@expo-google-fonts/noto-serif/400Regular_Italic";
import { NotoSerif_600SemiBold } from "@expo-google-fonts/noto-serif/600SemiBold";
import { welcomeDone } from "@/lib/practice/preferences";
import { C } from "~/lib/theme";
import { refreshContent } from "~/lib/content";
import { uiLang } from "~/lib/i18n";
import { reportDailyUse } from "~/lib/usage";
import { routeFor } from "~/lib/notifications";
import { LotusSplash } from "~/components/lotus-splash";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_600SemiBold,
    NotoSerif_400Regular,
    NotoSerif_400Regular_Italic,
    NotoSerif_600SemiBold,
  });
  const ready = loaded || Boolean(error);
  const welcomed = welcomeDone.use();
  // The lotus portal plays once, each time the app starts.
  const [intro, setIntro] = useState(true);

  useEffect(() => {
    if (ready) SplashScreen.hide();
  }, [ready]);

  // Latest published content, and the anonymous daily count, on launch and on return.
  useEffect(() => {
    void refreshContent();
    reportDailyUse(uiLang.get());
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active") {
        void refreshContent();
        reportDailyUse(uiLang.get());
      }
    });
    return () => sub.remove();
  }, []);

  // Opening a reminder goes to its practice.
  useEffect(() => {
    if (!ready) return;
    const open = (n: Notifications.Notification) => {
      const url = n.request.content.data?.url;
      if (typeof url === "string") router.push(routeFor(url) as never);
    };
    const last = Notifications.getLastNotificationResponse();
    if (last?.notification) {
      open(last.notification);
      Notifications.clearLastNotificationResponse();
    }
    const sub = Notifications.addNotificationResponseReceivedListener((r) => open(r.notification));
    return () => sub.remove();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: C.cream },
          animation: "slide_from_right",
        }}
      >
        <Stack.Protected guard={welcomed}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="practice/[slug]/index" />
          <Stack.Screen name="practice/[slug]/pronounce" />
          <Stack.Screen name="practice/session/[id]" options={{ animation: "fade_from_bottom" }} />
          <Stack.Screen name="meditate/session" options={{ animation: "fade", gestureEnabled: false }} />
          <Stack.Screen name="learn/[slug]" />
          <Stack.Screen name="learn/jataka/index" />
          <Stack.Screen name="learn/jataka/[slug]" />
          <Stack.Screen name="learn/dhammapada/index" />
          <Stack.Screen name="learn/dhammapada/[chapter]" />
          <Stack.Screen name="learn/dhammapada/verse/[n]" />
          <Stack.Screen name="learn/dhammapada/stories/index" />
          <Stack.Screen name="learn/dhammapada/stories/[slug]" />
          <Stack.Screen name="search" options={{ animation: "fade" }} />
        </Stack.Protected>
        <Stack.Protected guard={!welcomed}>
          <Stack.Screen name="welcome" options={{ animation: "fade" }} />
        </Stack.Protected>
      </Stack>
      {intro && <LotusSplash onDone={() => setIntro(false)} />}
    </SafeAreaProvider>
  );
}
