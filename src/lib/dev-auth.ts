// Development-only mock auth — bypasses Supabase when DEV_MODE is enabled

export const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === "true";
export const DEV_PHONE = process.env.NEXT_PUBLIC_DEV_PHONE || "8840871715";
export const DEV_OTP = process.env.NEXT_PUBLIC_DEV_OTP || "1234";

const USER_KEY = "dev_user";
const PROFILE_KEY = "dev_profile";

export interface DevUser {
  id: string;
  phone: string;
  full_phone: string;
}

export interface DevProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  date_of_birth: string | null;
  gender: string | null;
  state: string | null;
  city: string | null;
  pin_hash: string | null;
  created_at: string;
}

function safe<T>(fn: () => T): T | null {
  try { return fn(); } catch { return null; }
}

export function setDevUser(phone: string, fullPhone: string): DevUser {
  const user: DevUser = { id: `dev-${phone}`, phone, full_phone: fullPhone };
  safe(() => localStorage.setItem(USER_KEY, JSON.stringify(user)));
  return user;
}

export function setDevGoogleUser(): DevUser {
  const user: DevUser = { id: "dev-google-user", phone: "google", full_phone: "google" };
  safe(() => localStorage.setItem(USER_KEY, JSON.stringify(user)));
  return user;
}

export function getDevUser(): DevUser | null {
  return safe(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
}

export function setDevProfile(profile: Partial<DevProfile>): DevProfile {
  const existing = getDevProfile() ?? {
    id: getDevUser()?.id ?? "dev",
    username: "",
    full_name: "",
    avatar_url: null,
    bio: null,
    date_of_birth: null,
    gender: null,
    state: null,
    city: null,
    pin_hash: null,
    created_at: new Date().toISOString(),
  };
  const merged = { ...existing, ...profile };
  safe(() => localStorage.setItem(PROFILE_KEY, JSON.stringify(merged)));
  return merged;
}

export function getDevProfile(): DevProfile | null {
  return safe(() => {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  });
}

export function clearDevSession() {
  safe(() => { localStorage.removeItem(USER_KEY); localStorage.removeItem(PROFILE_KEY); });
  clearDevCookie();
}

export function isDevAuthenticated(): boolean {
  return !!getDevUser();
}

// Cookie-based flag so proxy.ts (server-side) can detect dev auth
export function setDevCookie() {
  safe(() => {
    document.cookie = "dev-session=1; path=/; SameSite=Lax; Max-Age=86400";
  });
}

export function clearDevCookie() {
  safe(() => {
    document.cookie = "dev-session=; path=/; SameSite=Lax; Max-Age=0";
  });
}
