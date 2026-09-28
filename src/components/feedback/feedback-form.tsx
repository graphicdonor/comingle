"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { FEEDBACK_QUESTIONS, MAX_TEXT_LENGTH, sanitizeFeedback } from "@/lib/feedback-survey";
import type { SurveyAnswers } from "@/lib/surveys";

const chip = (active: boolean) =>
  cn(
    "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
    active ? "bg-[#1E2952] text-white border-[#1E2952]" : "border-gray-200 text-gray-700 bg-white hover:border-[#1E2952]/40"
  );

export function FeedbackForm() {
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = FEEDBACK_QUESTIONS.filter((q) => {
    const v = answers[q.id];
    return Array.isArray(v) ? v.length > 0 : v !== undefined && v !== "";
  }).length;

  const set = (id: string, value: SurveyAnswers[string]) => setAnswers((a) => ({ ...a, [id]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = sanitizeFeedback(answers);
    if ("error" in check) {
      setError(check.error);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, name, contact, website }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Couldn't send your feedback. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-3xl bg-white p-8 sm:p-12 text-center shadow-sm border border-gray-100">
        <CheckCircle2 className="h-14 w-14 text-[#2A5C27] mx-auto" strokeWidth={1.5} />
        <h2 className="mt-5 text-2xl font-bold">Thank you for your feedback!</h2>
        <p className="mt-3 text-gray-600 leading-relaxed max-w-md mx-auto">
          Every response is read by our team, and your suggestions help decide what we build next for your
          community.
        </p>
        <Link
          href="/app"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#8B1A6B] px-6 py-3 font-semibold text-white hover:bg-[#741458] transition-colors"
        >
          Open WePray <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="sticky top-16 z-10 -mx-1 px-1 py-2 bg-[#fdf7f9]/90 backdrop-blur">
        <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-1.5">
          <span>
            {answeredCount} of {FEEDBACK_QUESTIONS.length} answered
          </span>
          <span>About 3 minutes</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div
            className="h-full bg-[#8B1A6B] transition-all duration-300"
            style={{ width: `${(answeredCount / FEEDBACK_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {FEEDBACK_QUESTIONS.map((q, i) => (
        <fieldset key={q.id} className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-gray-100">
          <legend className="sr-only">{q.label}</legend>
          <p className="font-semibold text-gray-900 leading-snug" aria-hidden>
            <span className="text-[#8B1A6B] mr-1.5">{i + 1}.</span>
            {q.label}
            {q.required === false && <span className="font-normal text-gray-400"> (optional)</span>}
          </p>

          <div className="mt-4">
            {q.type === "rating" && (
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: q.max }, (_, n) => n + 1).map((n) => {
                  const active = answers[q.id] === n;
                  return q.max === 5 ? (
                    <button key={n} type="button" onClick={() => set(q.id, n)} aria-label={`${n} out of 5`} aria-pressed={active} className="p-1">
                      <Star
                        className={cn("h-9 w-9 transition-colors", (answers[q.id] as number) >= n ? "fill-[#F5B301] text-[#F5B301]" : "text-gray-300")}
                        strokeWidth={1.5}
                      />
                    </button>
                  ) : (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set(q.id, n)}
                      aria-pressed={active}
                      className={cn(
                        "h-10 w-10 rounded-full text-sm font-semibold border transition-colors",
                        active ? "bg-[#E8355A] text-white border-[#E8355A]" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === "single_choice" && (
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button key={opt} type="button" aria-pressed={answers[q.id] === opt} onClick={() => set(q.id, opt)} className={chip(answers[q.id] === opt)}>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q.type === "multi_choice" && (
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const current = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
                  const active = current.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      aria-pressed={active}
                      onClick={() => set(q.id, active ? current.filter((o) => o !== opt) : [...current, opt])}
                      className={chip(active)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === "text" && (
              <textarea
                rows={q.id === "suggestions" ? 5 : 3}
                maxLength={MAX_TEXT_LENGTH}
                value={(answers[q.id] as string) ?? ""}
                onChange={(e) => set(q.id, e.target.value)}
                placeholder="Write in any language you're comfortable with…"
                aria-label={q.label}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#8B1A6B] focus:ring-2 focus:ring-[#8B1A6B]/15"
              />
            )}
          </div>
        </fieldset>
      ))}

      <fieldset className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-gray-100">
        <p className="font-semibold text-gray-900">
          Can we follow up with you? <span className="font-normal text-gray-400">(optional)</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">Leave your details only if you&apos;re happy for our team to contact you about your feedback.</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            placeholder="Your name"
            aria-label="Your name"
            className="rounded-xl border border-gray-200 px-4 py-3 text-[15px] focus:outline-none focus:border-[#8B1A6B] focus:ring-2 focus:ring-[#8B1A6B]/15"
          />
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            maxLength={200}
            placeholder="Email or phone number"
            aria-label="Email or phone number"
            className="rounded-xl border border-gray-200 px-4 py-3 text-[15px] focus:outline-none focus:border-[#8B1A6B] focus:ring-2 focus:ring-[#8B1A6B]/15"
          />
        </div>
        {/* Honeypot — hidden from people, tempting to bots. */}
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
        />
      </fieldset>

      {error && <p role="alert" className="text-sm font-medium text-red-600 text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#8B1A6B] py-4 text-base font-semibold text-white shadow-lg shadow-[#8B1A6B]/25 hover:bg-[#741458] disabled:opacity-60 transition-colors"
      >
        {loading ? "Sending…" : "Send feedback"}
      </button>
      <p className="text-center text-xs text-gray-400">
        Your answers are used only to improve WePray. See our <Link href="/privacy" className="underline">privacy policy</Link>.
      </p>
    </form>
  );
}
