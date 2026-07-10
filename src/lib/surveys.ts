interface BaseQuestion {
  id: string;
  label: string;
  /** Defaults to true — set false for optional free-text follow-ups. */
  required?: boolean;
}

export type SurveyQuestion =
  | (BaseQuestion & { type: "rating"; max: number })
  | (BaseQuestion & { type: "single_choice"; options: string[] })
  | (BaseQuestion & { type: "multi_choice"; options: string[] })
  | (BaseQuestion & { type: "text" });

export interface SurveyDefinition {
  id: number;
  title: string;
  desc: string;
  questions: SurveyQuestion[];
}

export type SurveyAnswers = Record<string, string | string[] | number>;

// Reuses the same category set as the home page's Community Services grid —
// kept as a plain label list here (rather than importing that grid's
// icon/color/href config) since this is the only thing the two share.
const SERVICE_LABELS = [
  "Matrimonial",
  "Health Care",
  "Education",
  "Housing",
  "Businesses",
  "Legal Aid",
  "Jobs",
  "Events",
];

// Survey definitions live in code, same as the rest of this home page's
// static content (COMMUNITY_SERVICES) — only submitted answers need a
// database row. Ids are stable and referenced by survey_responses.survey_id.
export const SURVEYS: SurveyDefinition[] = [
  {
    id: 1,
    title: "Help us improve community services",
    desc: "Share your feedback on our current offerings and help us serve you better.",
    questions: [
      { id: "satisfaction", type: "rating", max: 5, label: "How satisfied are you with Comingle so far?" },
      { id: "used_services", type: "multi_choice", label: "Which community services have you used?", options: [...SERVICE_LABELS, "None yet"] },
      { id: "improve_most", type: "single_choice", label: "Which service would you most like to see improved?", options: SERVICE_LABELS },
      { id: "feedback", type: "text", label: "Anything specific you'd like us to improve?", required: false },
    ],
  },
  {
    id: 2,
    title: "Community needs assessment 2025",
    desc: "Tell us what resources and support your community needs most right now.",
    questions: [
      { id: "needed_services", type: "multi_choice", label: "Which of these do you or your community need most right now? (select all that apply)", options: SERVICE_LABELS },
      { id: "urgency", type: "single_choice", label: "How urgently do you need this support?", options: ["Immediately", "Within a few months", "Just exploring options"] },
      { id: "other_need", type: "text", label: "Is there a specific need not listed above?", required: false },
    ],
  },
];

export function getSurvey(id: number): SurveyDefinition | undefined {
  return SURVEYS.find((s) => s.id === id);
}

export function validateAnswers(survey: SurveyDefinition, answers: SurveyAnswers): string | null {
  for (const q of survey.questions) {
    if (q.required === false) continue;
    const value = answers[q.id];
    if (q.type === "multi_choice") {
      if (!Array.isArray(value) || value.length === 0) return `Please answer: ${q.label}`;
    } else if (value === undefined || value === null || value === "") {
      return `Please answer: ${q.label}`;
    }
  }
  return null;
}
