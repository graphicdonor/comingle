import { Tabs } from "expo-router/tabs";
import { BookOpen, Flower2, GraduationCap, Settings, Sun } from "lucide-react-native";
import { C, F } from "~/lib/theme";
import { useT } from "~/lib/i18n";

export default function TabsLayout() {
  const { t, lang } = useT();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.burgundy,
        tabBarInactiveTintColor: C.faint,
        tabBarStyle: { backgroundColor: C.paper, borderTopColor: C.line },
        tabBarLabelStyle: { fontFamily: lang === "hi" ? F.deva : F.semibold, fontSize: 12 },
        sceneStyle: { backgroundColor: C.cream },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("nav.today"), tabBarIcon: ({ color }) => <Sun size={22} color={color} /> }} />
      <Tabs.Screen name="practice" options={{ title: t("nav.prayers"), tabBarIcon: ({ color }) => <BookOpen size={22} color={color} /> }} />
      <Tabs.Screen name="meditate" options={{ title: t("nav.meditate"), tabBarIcon: ({ color }) => <Flower2 size={22} color={color} /> }} />
      <Tabs.Screen name="learn" options={{ title: t("nav.learn"), tabBarIcon: ({ color }) => <GraduationCap size={22} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: t("nav.settings"), tabBarIcon: ({ color }) => <Settings size={22} color={color} /> }} />
    </Tabs>
  );
}
