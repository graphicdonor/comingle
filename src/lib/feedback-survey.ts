import type { SurveyAnswers, SurveyQuestion } from "@/lib/surveys";

/**
 * The public feedback survey at /survey — open to anyone, signed in or not.
 * Answers land in the `public_feedback` table and are reviewed in the admin
 * panel (/admin/feedback). Question ids are stored as answer keys, so change
 * a label freely but keep ids stable once responses exist.
 */
export const FEEDBACK_QUESTIONS: SurveyQuestion[] = [
  {
    id: "used_app",
    type: "single_choice",
    label: "Have you used WePray yet?",
    options: ["Yes, regularly", "Yes, a few times", "Not yet"],
  },
  {
    id: "how_heard",
    type: "single_choice",
    label: "How did you hear about WePray?",
    options: ["Friend or family", "At a place of worship", "WhatsApp or social media", "Community event", "Search", "Other"],
  },
  {
    id: "overall",
    type: "rating",
    max: 5,
    label: "How would you rate WePray overall (or your first impression)?",
  },
  {
    id: "ease",
    type: "rating",
    max: 5,
    label: "How easy is WePray to use?",
  },
  {
    id: "most_useful",
    type: "multi_choice",
    label: "Which parts are most useful to you? (select all that apply)",
    options: ["Community feed", "Matrimonial", "Jobs", "Events", "Businesses", "Housing", "Education", "Surveys", "Not sure yet"],
  },
  {
    id: "wanted_next",
    type: "multi_choice",
    label: "What would you like WePray to offer next? (select all that apply)",
    options: [
      "Health Care",
      "Legal Aid",
      "Event and festival reminders",
      "Live streams of gatherings",
      "Religious classes and teachings",
      "Volunteering and seva",
      "Donations",
      "Something else",
    ],
  },
  {
    id: "recommend",
    type: "rating",
    max: 10,
    label: "How likely are you to recommend WePray to someone in your community? (1 = not likely, 10 = very likely)",
  },
  {
    id: "faith",
    type: "single_choice",
    label: "Which faith community do you belong to?",
    options: ["Hindu", "Buddhist", "Jain", "Sikh", "Muslim", "Christian", "Other", "Prefer not to say"],
    required: false,
  },
  { id: "liked", type: "text", label: "What do you like most about WePray?", required: false },
  { id: "improve", type: "text", label: "What should we improve or fix?", required: false },
  { id: "suggestions", type: "text", label: "Your suggestions: what would make WePray more useful for your community?" },
];

export const MAX_TEXT_LENGTH = 2000;

export interface FeedbackContact {
  name?: string;
  contact?: string;
}

/** Validates answers against the question list and returns a cleaned copy
 * holding only known keys and allowed values — never trust the client's shape. */
export function sanitizeFeedback(raw: unknown): { answers: SurveyAnswers } | { error: string } {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const answers: SurveyAnswers = {};

  for (const q of FEEDBACK_QUESTIONS) {
    const value = input[q.id];
    const required = q.required !== false;
    const missing = () => ({ error: `Please answer: ${q.label}` });

    if (q.type === "rating") {
      if (value === undefined || value === null || value === "") {
        if (required) return missing();
        continue;
      }
      const n = Number(value);
      if (!Number.isInteger(n) || n < 1 || n > q.max) return { error: `Invalid answer for: ${q.label}` };
      answers[q.id] = n;
    } else if (q.type === "single_choice") {
      if (typeof value !== "string" || value === "") {
        if (required) return missing();
        continue;
      }
      if (!q.options.includes(value)) return { error: `Invalid answer for: ${q.label}` };
      answers[q.id] = value;
    } else if (q.type === "multi_choice") {
      const list = Array.isArray(value) ? value.filter((v): v is string => typeof v === "string" && q.options.includes(v)) : [];
      if (list.length === 0) {
        if (required) return missing();
        continue;
      }
      answers[q.id] = [...new Set(list)];
    } else {
      const text = typeof value === "string" ? value.trim() : "";
      if (!text) {
        if (required) return missing();
        continue;
      }
      answers[q.id] = text.slice(0, MAX_TEXT_LENGTH);
    }
  }
  return { answers };
}
