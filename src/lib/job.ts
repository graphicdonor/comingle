export const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];

export const JOB_CATEGORIES = [
  "Retail",
  "Hospitality",
  "Education",
  "Healthcare",
  "IT & Software",
  "Sales & Marketing",
  "Construction",
  "Transportation",
  "Customer Service",
  "Other",
];

export interface JobListingBody {
  title: string;
  company_name?: string | null;
  job_type?: string | null;
  categories: string[];
  city?: string | null;
  state?: string | null;
  is_remote: boolean;
  salary_min?: number | null;
  salary_max?: number | null;
  description?: string | null;
  poc_name?: string | null;
  email?: string | null;
  mobile_number?: string | null;
  whatsapp_number?: string | null;
  application_link?: string | null;
  photo_urls: string[];
}

/** Shared by the create and edit routes so the column list can't drift between the two. */
export function sanitizeJobListingBody(body: JobListingBody) {
  return {
    title: body.title.trim(),
    company_name: body.company_name?.trim() || null,
    job_type: body.job_type || null,
    categories: body.categories ?? [],
    city: body.city?.trim() || null,
    state: body.state?.trim() || null,
    is_remote: !!body.is_remote,
    salary_min: body.salary_min ?? null,
    salary_max: body.salary_max ?? null,
    description: body.description?.trim() || null,
    poc_name: body.poc_name?.trim() || null,
    email: body.email?.trim() || null,
    mobile_number: body.mobile_number?.trim() || null,
    whatsapp_number: body.whatsapp_number?.trim() || null,
    application_link: body.application_link?.trim() || null,
    photo_urls: body.photo_urls ?? [],
  };
}

export function jobListingModerationText(body: JobListingBody) {
  return [body.title, body.company_name, body.description, body.categories?.join(", ")].filter(Boolean).join("\n\n");
}
