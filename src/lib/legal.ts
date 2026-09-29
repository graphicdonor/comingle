export const PROVIDER_TYPES = [
  "Advocate / Lawyer",
  "Law Firm",
  "Legal Aid Clinic",
  "NGO",
  "Notary",
  "Mediator",
  "Legal Consultant",
  "Other",
];

export const PRACTICE_AREAS = [
  "Family & Matrimonial",
  "Property & Land",
  "Criminal",
  "Civil",
  "Consumer",
  "Labour & Employment",
  "Documentation & Affidavits",
  "Wills & Succession",
  "Tax",
  "Cyber",
  "Other",
];

export const CONSULTATION_MODES = ["In-person", "Online", "Both"] as const;

export const FEE_PERIODS = ["Per Consultation", "Per Hearing", "Per Case"];

/** Shown on every legal listing — the app doesn't verify legal credentials. */
export const LEGAL_DISCLAIMER =
  "WePray doesn't verify legal qualifications, and listings aren't legal advice. Please confirm an advocate's credentials before engaging them. For free legal aid, call the NALSA helpline on 15100.";

export interface LegalListingBody {
  title: string;
  provider_name?: string | null;
  provider_type?: string | null;
  practice_area?: string | null;
  consultation_mode: (typeof CONSULTATION_MODES)[number];
  fee?: number | null;
  fee_period?: string | null;
  timings?: string | null;
  address_line1?: string | null;
  city?: string | null;
  state?: string | null;
  pin_code?: string | null;
  description?: string | null;
  poc_name?: string | null;
  email?: string | null;
  mobile_number?: string | null;
  whatsapp_number?: string | null;
  photo_urls: string[];
}

/** Same role as sanitizeLegalListingBody: one column list for create (and a future edit route). */
export function sanitizeLegalListingBody(body: LegalListingBody) {
  const online = body.consultation_mode === "Online";
  return {
    title: body.title.trim(),
    provider_name: body.provider_name?.trim() || null,
    provider_type: body.provider_type && PROVIDER_TYPES.includes(body.provider_type) ? body.provider_type : null,
    practice_area: body.practice_area && PRACTICE_AREAS.includes(body.practice_area) ? body.practice_area : null,
    consultation_mode: body.consultation_mode,
    fee: typeof body.fee === "number" && body.fee >= 0 ? body.fee : null,
    fee_period: body.fee_period && FEE_PERIODS.includes(body.fee_period) ? body.fee_period : null,
    timings: body.timings?.trim() || null,
    address_line1: online ? null : body.address_line1?.trim() || null,
    city: body.city?.trim() || null,
    state: body.state?.trim() || null,
    pin_code: online ? null : body.pin_code?.trim() || null,
    description: body.description?.trim() || null,
    poc_name: body.poc_name?.trim() || null,
    email: body.email?.trim() || null,
    mobile_number: body.mobile_number?.trim() || null,
    whatsapp_number: body.whatsapp_number?.trim() || null,
    photo_urls: body.photo_urls ?? [],
  };
}

export function legalListingModerationText(body: LegalListingBody) {
  return [body.title, body.description, body.provider_name, body.practice_area, body.timings].filter(Boolean).join("\n\n");
}
