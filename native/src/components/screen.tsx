import type { ReactNode } from "react";
import { Pressable, ScrollView, View, type ScrollViewProps } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { C } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { T } from "./ui";

/** A scrolling page with the cream background and safe-area padding. */
export function Screen({ children, header, footer, contentStyle, ...rest }: { children: ReactNode; header?: ReactNode; footer?: ReactNode; contentStyle?: ScrollViewProps["contentContainerStyle"] } & Omit<ScrollViewProps, "contentContainerStyle">) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.cream, paddingTop: insets.top }}>
      {header}
      <ScrollView {...rest} contentContainerStyle={[{ padding: 20, paddingBottom: 40 + (footer ? 0 : insets.bottom), gap: 16 }, contentStyle]} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}

/** Top bar with a back button and an optional title and actions. */
export function TopBar({ title, right, onBack }: { title?: string; right?: ReactNode; onBack?: () => void }) {
  const { t } = useT();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8, height: 56, borderBottomWidth: 1, borderBottomColor: C.lineSoft }}>
      <Pressable
        onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/")))}
        accessibilityRole="button"
        accessibilityLabel={t("session.back")}
        hitSlop={8}
        style={({ pressed }) => [{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" }, pressed && { backgroundColor: C.tint }]}
      >
        <ArrowLeft size={22} color={C.ink} />
      </Pressable>
      <T bold numberOfLines={1} style={{ flex: 1, fontSize: 17 }} accessibilityRole="header">
        {title ?? ""}
      </T>
      {right}
    </View>
  );
}

export function IconButton({ label, onPress, children, active }: { label: string; onPress: () => void; children: ReactNode; active?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={active === undefined ? undefined : { selected: active }}
      hitSlop={6}
      style={({ pressed }) => [{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" }, (pressed || active) && { backgroundColor: C.tint }]}
    >
      {children}
    </Pressable>
  );
}
