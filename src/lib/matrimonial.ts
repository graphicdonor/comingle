// Shared constants and helpers for the matrimonial service — one source for
// dropdown options and eligibility rules instead of duplicating them per page.

import { timeAgo } from "@/lib/utils";

export const MARITAL_STATUSES = ["Never Married", "Divorced", "Widowed", "Separated"] as const;

export const INCOME_BRACKETS = [
  "Below ₹5 Lakhs",
  "₹5–10 Lakhs",
  "₹10–15 Lakhs",
  "₹15–20 Lakhs",
  "₹20–25 Lakhs",
  "₹25–30 Lakhs",
  "₹30–50 Lakhs",
  "Above ₹50 Lakhs",
  "Prefer not to say",
];

export const EDUCATION_OPTIONS = [
  "High School",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate (PhD)",
  "Professional Degree (CA/CS/Doctor/Lawyer)",
  "Other",
];

export const EMPLOYMENT_OPTIONS = ["Working", "Not Working", "Self-Employed", "Business Owner", "Student", "Retired"];

export const CREATED_BY_OPTIONS = ["Self", "Parents", "Sibling", "Relative", "Friend"] as const;

export const ABOUT_ME_MAX_LENGTH = 500;
export const MAX_PHOTOS = 5;
export const MAX_PHOTO_SIZE_BYTES = 200 * 1024;

type EligibleGender = "Male" | "Female";

export function isMatrimonialEligible(gender: string | null | undefined): gender is EligibleGender {
  return gender === "Male" || gender === "Female";
}

export function oppositeGender(gender: EligibleGender): EligibleGender {
  return gender === "Male" ? "Female" : "Male";
}

export function calculateAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthdayThisYear) age--;
  return age;
}

// A short, stable, display-only "member code" (e.g. "JYO876767") derived
// from the name and user id — not stored, just computed the same way every
// time so it doesn't need a schema column or a uniqueness guarantee.
export function generateMemberCode(fullName: string, userId: string): string {
  const letters = fullName.toUpperCase().replace(/[^A-Z]/g, "");
  const initials = (letters.slice(0, 3) || "MEM").padEnd(3, "X");
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  const digits = String(100000 + (hash % 900000));
  return `${initials}${digits}`;
}

// "Last seen 30 min ago" — null means never tracked (e.g. a fresh account).
export function formatLastSeen(timestamp: string | null | undefined): string {
  if (!timestamp) return "Last seen recently";
  return `Last seen ${timeAgo(timestamp)}`;
}
