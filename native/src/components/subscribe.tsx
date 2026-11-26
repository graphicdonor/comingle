import { useState } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Check, Mail } from "lucide-react-native";
import { Muted, T } from "./ui";
import { C, F } from "~/lib/theme";
import { useT } from "~/lib/i18n";
import { SITE } from "~/lib/site";

// Opt-in sign-up for occasional emails (the website's form, same endpoint).

export function SubscribeForm() {
  const { t, lang } = useT();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(email.trim())) return setError(t("subscribe.invalid"));
    setError(null);
    setState("sending");
    try {
      const res = await fetch(`${SITE}/api/subscribe`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, lang, source: "android" }) });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? t("subscribe.failed"));
        setState("idle");
        return;
      }
      setState("done");
    } catch {
      setError(t("subscribe.failed"));
      setState("idle");
    }
  };

  if (state === "done")
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }} accessibilityLiveRegion="polite">
        <Check size={20} color="#56634A" />
        <T bold>{t("subscribe.done")}</T>
      </View>
    );

  return (
    <View style={{ gap: 10 }}>
      <Muted style={{ fontSize: 14 }}>{t("subscribe.intro")}</Muted>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: error ? "#B4442F" : C.line, borderRadius: 999, paddingHorizontal: 14, backgroundColor: C.paper }}>
        <Mail size={18} color={C.faint} />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t("subscribe.placeholder")}
          placeholderTextColor={C.faint}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          returnKeyType="send"
          onSubmitEditing={submit}
          accessibilityLabel={t("subscribe.placeholder")}
          style={{ flex: 1, paddingVertical: 11, fontFamily: F.regular, fontSize: 15, color: C.ink }}
        />
      </View>
      {error && (
        <T style={{ color: "#B4442F", fontSize: 13 }} accessibilityRole="alert">
          {error}
        </T>
      )}
      <Pressable
        onPress={submit}
        disabled={state === "sending"}
        accessibilityRole="button"
        style={({ pressed }) => [{ flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", borderRadius: 999, paddingVertical: 13, backgroundColor: C.burgundy }, (pressed || state === "sending") && { opacity: 0.8 }]}
      >
        {state === "sending" && <ActivityIndicator color={C.cream} size="small" />}
        <T bold style={{ color: C.cream }}>
          {t("subscribe.button")}
        </T>
      </Pressable>
      <Muted style={{ fontSize: 12 }}>
        {t("subscribe.consent")}{" "}
        <T style={{ fontSize: 12, color: C.burgundy, textDecorationLine: "underline" }} onPress={() => void WebBrowser.openBrowserAsync(`${SITE}/privacy`)}>
          {t("subscribe.privacy")}
        </T>
      </Muted>
    </View>
  );
}
