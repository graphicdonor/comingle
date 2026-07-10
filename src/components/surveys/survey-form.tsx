"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { validateAnswers, type SurveyDefinition, type SurveyAnswers } from "@/lib/surveys";

interface SurveyFormProps {
  survey: SurveyDefinition;
  alreadySubmitted: boolean;
}

export function SurveyForm({ survey, alreadySubmitted }: SurveyFormProps) {
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [submitted, setSubmitted] = useState(alreadySubmitted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  if (submitted) {
    return (
      <div className="bg-white rounded-3xl shadow-sm p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-[#E8355A] mx-auto mb-3" strokeWidth={1.5} />
        <h2 className="font-bold text-gray-900 mb-1">Thanks for your feedback!</h2>
        <p className="text-sm text-gray-500">You&apos;ve already completed this survey.</p>
      </div>
    );
  }

  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const validationError = validateAnswers(survey, answers);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/surveys/${survey.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Something went wrong — please try again.");
        return;
      }
      setSubmitted(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-6">
      <h1 className="font-bold text-lg text-gray-900 mb-1">{survey.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{survey.desc}</p>

      <div className="space-y-6">
        {survey.questions.map((q) => (
          <div key={q.id}>
            <p className="text-sm font-semibold text-gray-800 mb-2.5">
              {q.label}
              {q.required === false && <span className="text-gray-400 font-normal"> (optional)</span>}
            </p>

            {q.type === "rating" && (
              <div className="flex gap-2">
                {Array.from({ length: q.max }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: n }))}
                    className={cn(
                      "w-10 h-10 rounded-full text-sm font-semibold border transition-colors",
                      answers[q.id] === n
                        ? "bg-[#E8355A] text-white border-[#E8355A]"
                        : "border-gray-200 text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}

            {q.type === "single_choice" && (
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                      answers[q.id] === opt
                        ? "bg-[#1E2952] text-white border-[#1E2952]"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {q.type === "multi_choice" && (
              <div className="flex flex-wrap gap-2">
                {q.options.map((opt) => {
                  const selected = Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        setAnswers((a) => {
                          const current = Array.isArray(a[q.id]) ? (a[q.id] as string[]) : [];
                          const next = current.includes(opt) ? current.filter((o) => o !== opt) : [...current, opt];
                          return { ...a, [q.id]: next };
                        })
                      }
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                        selected
                          ? "bg-[#1E2952] text-white border-[#1E2952]"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === "text" && (
              <Textarea
                rows={3}
                value={(answers[q.id] as string) ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                placeholder="Type your answer..."
              />
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-500 mt-4">{error}</p>}

      <Button fullWidth loading={loading} onClick={handleSubmit} className="mt-6">
        Submit
      </Button>
    </div>
  );
}
