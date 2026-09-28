export const PROVIDER_TYPES = [
  "Doctor",
  "Clinic",
  "Hospital",
  "Pharmacy",
  "Diagnostic Lab",
  "Dentist",
  "Physiotherapy",
  "Mental Health",
  "Ayurveda / AYUSH",
  "Home Care",
  "Other",
];

export const SPECIALTIES = [
  "General Physician",
  "Pediatrics",
  "Gynecology",
  "Cardiology",
  "Orthopedics",
  "Dermatology",
  "ENT",
  "Eye Care",
  "Dental",
  "Psychiatry / Counselling",
  "Neurology",
  "Diabetes",
  "Other",
];

export const CONSULTATION_MODES = ["In-person", "Online", "Both"] as const;

export const FEE_PERIODS = ["Per Consultation", "Per Visit", "Per Session"];

/** Shown on every health listing — the app doesn't verify medical credentials. */
export const HEALTH_DISCLAIMER =
  "WePray doesn't verify medical qualifications. Please confirm a provider's credentials before booking. In an emergency, call 108 or 112.";

export interface HealthListingBody {
  title: string;
  provider_name?: string | null;
  provider_type?: string | null;
  specialty?: string | null;
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

/** Same role as sanitizeEducationListingBody: one column list for create (and a future edit route). */
export function sanitizeHealthListingBody(body: HealthListingBody) {
  const online = body.consultation_mode === "Online";
  return {
    title: body.title.trim(),
    provider_name: body.provider_name?.trim() || null,
    provider_type: body.provider_type && PROVIDER_TYPES.includes(body.provider_type) ? body.provider_type : null,
    specialty: body.specialty && SPECIALTIES.includes(body.specialty) ? body.specialty : null,
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

export function healthListingModerationText(body: HealthListingBody) {
  return [body.title, body.description, body.provider_name, body.specialty, body.timings].filter(Boolean).join("\n\n");
}
