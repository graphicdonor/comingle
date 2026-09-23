export const SERVICE_TYPES = ["Tuition", "Coaching Class", "Course", "Workshop", "Online Class"];

export const SUBJECTS = [
  "Math",
  "Science",
  "English",
  "Computer Science",
  "Exam Prep",
  "Music",
  "Dance",
  "Art",
  "Language",
  "Other",
];

export const LEVELS = ["Primary", "Secondary", "Senior Secondary", "College", "Professional", "All Ages"];

export const MODES = ["Online", "Offline", "Hybrid"] as const;

export const FEE_PERIODS = ["Per Month", "Per Session", "One-time"];

export interface EducationListingBody {
  title: string;
  provider_name?: string | null;
  service_type?: string | null;
  subject?: string | null;
  level?: string | null;
  mode: "Online" | "Offline" | "Hybrid";
  fee?: number | null;
  fee_period?: string | null;
  address_line1?: string | null;
  city?: string | null;
  state?: string | null;
  description?: string | null;
  poc_name?: string | null;
  email?: string | null;
  mobile_number?: string | null;
  whatsapp_number?: string | null;
  photo_urls: string[];
}

/** Shared by the create and edit routes so the column list can't drift between the two. */
export function sanitizeEducationListingBody(body: EducationListingBody) {
  return {
    title: body.title.trim(),
    provider_name: body.provider_name?.trim() || null,
    service_type: body.service_type || null,
    subject: body.subject || null,
    level: body.level || null,
    mode: body.mode,
    fee: body.fee ?? null,
    fee_period: body.fee_period || null,
    address_line1: body.mode === "Online" ? null : body.address_line1?.trim() || null,
    city: body.city?.trim() || null,
    state: body.state?.trim() || null,
    description: body.description?.trim() || null,
    poc_name: body.poc_name?.trim() || null,
    email: body.email?.trim() || null,
    mobile_number: body.mobile_number?.trim() || null,
    whatsapp_number: body.whatsapp_number?.trim() || null,
    photo_urls: body.photo_urls ?? [],
  };
}

export function educationListingModerationText(body: EducationListingBody) {
  return [body.title, body.description, body.provider_name, body.subject].filter(Boolean).join("\n\n");
}
