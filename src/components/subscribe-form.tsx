"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Check, Loader2, Mail } from "lucide-react";
import { useT } from "@/lib/i18n/use-t";

// Opt-in sign-up for occasional emails (new prayers, stories, app updates).
// Stored only if the reader chooses to; see the Privacy Policy.

export function SubscribeForm({ source, dark = false }: { source: "landing" | "web"; dark?: boolean }) {
  const { t, lang } = useT();
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/.test(email.trim())) return setError(t("subscribe.invalid"));
    setError(null);
    setState("sending");
    try {
      const res = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, lang, source, website }) });
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

  const ink = dark ? "text-[#F7F2E8]" : "text-[#2A1A1C]";
  const soft = dark ? "text-[#F7F2E8]/70" : "text-[#5B5350]";

  if (state === "done")
    return (
      <p role="status" className={`flex items-center gap-2 font-semibold ${ink}`}>
        <Check className="h-5 w-5 text-[#56634A]" /> {t("subscribe.done")}
      </p>
    );

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`sub-${source}`}>
          {t("subscribe.placeholder")}
        </label>
        <div className={`flex flex-1 items-center gap-2 rounded-full px-4 ring-1 ${dark ? "bg-[#F7F2E8]/10 ring-[#F7F2E8]/25 focus-within:ring-[#E9BE73]" : "bg-white ring-[#E7DCC8] focus-within:ring-[#C6A15B]"}`}>
          <Mail className={`h-4 w-4 flex-shrink-0 ${soft}`} />
          <input
            id={`sub-${source}`}
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("subscribe.placeholder")}
            aria-invalid={Boolean(error)}
            className={`min-w-0 flex-1 bg-transparent py-3 text-[15px] outline-none ${ink} ${dark ? "placeholder:text-[#F7F2E8]/50" : "placeholder:text-[#8E847C]"}`}
          />
        </div>
        {/* Honeypot: hidden from people, filled by bots. */}
        <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" />
        <button
          type="submit"
          disabled={state === "sending"}
          className={`flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold disabled:opacity-60 ${dark ? "bg-[#E9BE73] text-[#3A1418]" : "bg-[#6D252C] text-[#F7F2E8] hover:bg-[#5E1F25]"}`}
        >
          {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
          {t("subscribe.button")}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-[#B4442F]">
          {error}
        </p>
      )}
      <p className={`mt-2 text-xs leading-relaxed ${soft}`}>
        {t("subscribe.consent")}{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          {t("subscribe.privacy")}
        </Link>
      </p>
    </form>
  );
}
