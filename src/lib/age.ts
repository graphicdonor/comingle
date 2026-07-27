// Shared age-from-date-of-birth logic — any form that collects a date of
// birth and needs to enforce a minimum age uses this instead of
// re-implementing the calculation per form.

export const MIN_SIGNUP_AGE = 13;
export const MIN_MATRIMONIAL_AGE = 18;

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

/** User-facing error for a date-of-birth field, or null if it satisfies `minAge`. */
export function ageValidationError(dob: string, minAge: number): string | null {
  if (!dob) return "Date of birth is required";
  const age = calculateAge(dob);
  if (age === null) return "Enter a valid date of birth";
  if (age < minAge) return `You must be at least ${minAge} years old`;
  return null;
}

/** Latest date of birth that still satisfies `minAge` today — used as a date
 * input's `max` so the native picker steers people away from an underage
 * date up front, though the real enforcement is `ageValidationError` above. */
export function maxDobForAge(minAge: number): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - minAge);
  return d.toISOString().slice(0, 10);
}
