// Development-only mock store for the matrimonial service's own-profile
// pages. Mirrors dev-auth.ts's localStorage-fixture pattern.
//
// Deliberately NOT used for invites or chat — DEV_MODE is a single browser's
// localStorage and can't represent two distinct people interacting with each
// other. Invites/chat always hit real Supabase, DEV_MODE or not.

export interface DevMatrimonialProfile {
  user_id: string;
  full_name: string;
  date_of_birth: string | null;
  time_of_birth: string | null;
  place_of_birth: string | null;
  city: string | null;
  height: string | null;
  mangalik_dosh: boolean;
  income_range: string | null;
  marital_status: string | null;
  education: string | null;
  employment_status: string | null;
  created_by: string | null;
  about_me: string | null;
  photo_urls: string[];
}

const PROFILE_KEY = "dev_matrimonial_profile";

function safe<T>(fn: () => T): T | null {
  try { return fn(); } catch { return null; }
}

export function setDevMatrimonialProfile(profile: Partial<DevMatrimonialProfile> & { user_id: string }): DevMatrimonialProfile {
  const existing = getDevMatrimonialProfile() ?? {
    user_id: profile.user_id,
    full_name: "",
    date_of_birth: null,
    time_of_birth: null,
    place_of_birth: null,
    city: null,
    height: null,
    mangalik_dosh: false,
    income_range: null,
    marital_status: null,
    education: null,
    employment_status: null,
    created_by: null,
    about_me: null,
    photo_urls: [],
  };
  const merged = { ...existing, ...profile };
  safe(() => localStorage.setItem(PROFILE_KEY, JSON.stringify(merged)));
  return merged;
}

export function getDevMatrimonialProfile(): DevMatrimonialProfile | null {
  return safe(() => {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  });
}

export function clearDevMatrimonialProfile() {
  safe(() => localStorage.removeItem(PROFILE_KEY));
}
