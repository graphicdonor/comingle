import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from "react-native";
import { C, F, fontFor } from "~/lib/theme";

/** Text in the app's font, switching to the Devanagari face for Hindi. */
export function T({ style, children, bold, ...rest }: TextProps & { bold?: boolean }) {
  const sample = typeof children === "string" ? children : Array.isArray(children) ? children.filter((c) => typeof c === "string").join("") : "";
  return (
    <Text {...rest} style={[{ color: C.ink, fontSize: 16 }, fontFor(sample, bold ? "bold" : "regular"), style]}>
      {children}
    </Text>
  );
}

export function Eyebrow({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <T bold style={[s.eyebrow, { color: light ? "#E9BE73" : C.gold }]}>
      {children}
    </T>
  );
}

export function H1({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <T bold style={[s.h1, style]} accessibilityRole="header">
      {children}
    </T>
  );
}

export function H2({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <T bold style={[s.h2, style]} accessibilityRole="header">
      {children}
    </T>
  );
}

export function Muted({ children, style, ...rest }: TextProps) {
  return (
    <T {...rest} style={[{ color: C.muted, fontSize: 15, lineHeight: 22 }, style]}>
      {children}
    </T>
  );
}

export function Card({ children, style, onPress, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accessibilityLabel?: string }) {
  if (!onPress) return <View style={[s.card, style]}>{children}</View>;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={({ pressed }) => [s.card, style, pressed && s.pressed]}>
      {children}
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  style,
  disabled,
  numberOfLines,
  labelColor,
  ...rest
}: { label: string; onPress: () => void; variant?: "primary" | "secondary" | "ghost"; icon?: ReactNode; style?: StyleProp<ViewStyle>; disabled?: boolean; numberOfLines?: number; labelColor?: string } & Omit<PressableProps, "style" | "onPress">) {
  const primary = variant === "primary";
  return (
    <Pressable
      {...rest}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        s.button,
        primary ? s.buttonPrimary : variant === "secondary" ? s.buttonSecondary : s.buttonGhost,
        pressed && s.pressed,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      {icon}
      <T bold numberOfLines={numberOfLines} style={{ color: labelColor ?? (primary ? C.cream : C.burgundy), fontSize: 15, flexShrink: 1 }}>
        {label}
      </T>
    </Pressable>
  );
}

/** A row of options where one is chosen. */
export function Segmented<V extends string | number>({ options, value, onChange, label }: { options: { value: V; label: string }[]; value: V; onChange: (v: V) => void; label: string }) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={s.segmented}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            style={[s.segment, on && s.segmentOn]}
          >
            <T bold={on} style={{ fontSize: 14, color: on ? C.cream : C.muted, textAlign: "center" }}>
              {o.label}
            </T>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Pill({ children, tone = "plain" }: { children: ReactNode; tone?: "plain" | "gold" | "sage" }) {
  const bg = tone === "gold" ? "#F6E7C8" : tone === "sage" ? "#E3E9DC" : C.tint;
  const fg = tone === "gold" ? C.gold : tone === "sage" ? "#4F5E44" : C.muted;
  return (
    <View style={[s.pill, { backgroundColor: bg }]}>
      <T bold style={{ fontSize: 12, color: fg }}>
        {children}
      </T>
    </View>
  );
}

export function Divider() {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.line, marginVertical: 4 }} />;
}

export const s = StyleSheet.create({
  eyebrow: { fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase" },
  h1: { fontSize: 30, lineHeight: 36, letterSpacing: -0.4 },
  h2: { fontSize: 20, lineHeight: 26 },
  card: { backgroundColor: C.card, borderRadius: 22, borderWidth: 1, borderColor: C.line, padding: 18 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  button: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 999, paddingVertical: 13, paddingHorizontal: 20, minHeight: 48 },
  buttonPrimary: { backgroundColor: C.burgundy },
  buttonSecondary: { backgroundColor: C.card, borderWidth: 1, borderColor: "rgba(109,37,44,0.25)" },
  buttonGhost: { backgroundColor: "transparent" },
  segmented: { flexDirection: "row", backgroundColor: C.tint, borderRadius: 999, padding: 4, gap: 4 },
  segment: { flex: 1, borderRadius: 999, paddingVertical: 9, paddingHorizontal: 8, minHeight: 40, justifyContent: "center" },
  segmentOn: { backgroundColor: C.burgundy },
  pill: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
});

export { F };
