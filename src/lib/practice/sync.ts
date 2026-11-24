"use client";
import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { favourites, readingPrefs, recentPrayers, type ReadingPrefs } from "./preferences";
import { uiLang } from "@/lib/i18n/use-t";

// Optional sign-in with Google to sync practice data across devices.
//
// Without an account everything stays in the device's local storage, as
// before. When signed in, the same data (saved prayers, recently opened
// prayers, reading preferences, interface language) is mirrored to the
// user's own private metadata on their Supabase Auth account
// (user_metadata.practice): readable and writable only by that user, deleted
// with the account, and needing no database table or migration. It's small
// (a few ids and settings), so it stays well within metadata limits.
//
// On sign-in the device and the account are merged so nothing is lost:
// saved prayers are combined, recent prayers interleaved, and the account's
// settings (if it has any) win. After that, local changes upload shortly
// after they happen. Signing out keeps everything on the device.

export type SyncStatus = "off" | "syncing" | "synced" | "error";

export interface AccountUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

export interface AccountState {
  /** False until the stored session has been checked. */
  ready: boolean;
  user: AccountUser | null;
  status: SyncStatus;
  lastSyncedAt: number | null;
}

const INITIAL: AccountState = { ready: false, user: null, status: "off", lastSyncedAt: null };
let state: AccountState = INITIAL;
const listeners = new Set<() => void>();

function setState(patch: Partial<AccountState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useAccount(): AccountState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => INITIAL,
  );
}

function toAccountUser(user: User): AccountUser {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? null,
    name: (meta.full_name as string) || (meta.name as string) || null,
    avatarUrl: (meta.avatar_url as string) || (meta.picture as string) || null,
  };
}

/** Shape stored in user_metadata.practice. */
interface RemotePractice {
  favourites?: string[];
  recent?: string[];
  prefs?: unknown;
  ui_lang?: string;
  updated_at?: string;
}

const strings = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

const unique = (items: string[]) => Array.from(new Set(items));

const PREF_KEYS: (keyof ReadingPrefs)[] = ["mode", "translation", "script", "size", "keepAwake"];

function pickPrefs(raw: unknown): Partial<ReadingPrefs> {
  if (!raw || typeof raw !== "object") return {};
  const out: Partial<ReadingPrefs> = {};
  for (const k of PREF_KEYS) if (k in (raw as object)) (out as Record<string, unknown>)[k] = (raw as Record<string, unknown>)[k];
  return out;
}

let started = false;
let applyingRemote = false;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let currentUserId: string | null = null;

function supabase() {
  return createClient();
}

async function push() {
  if (!currentUserId) return;
  setState({ status: "syncing" });
  const practice: RemotePractice = {
    favourites: favourites.get(),
    recent: recentPrayers.get(),
    prefs: readingPrefs.get(),
    ui_lang: uiLang.get(),
    updated_at: new Date().toISOString(),
  };
  // Merges into the existing metadata (Google's name and photo are kept).
  const { error } = await supabase().auth.updateUser({ data: { practice } });
  if (error) setState({ status: "error" });
  else setState({ status: "synced", lastSyncedAt: Date.now() });
}

function schedulePush() {
  if (applyingRemote || !currentUserId) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void push(), 1200);
}

async function onSignedIn(user: User) {
  if (currentUserId === user.id) return;
  currentUserId = user.id;
  setState({ ready: true, user: toAccountUser(user), status: "syncing" });

  // Fetch the latest copy from the server (the session's copy may be older).
  const { data, error } = await supabase().auth.getUser();
  if (currentUserId !== user.id) return; // signed out meanwhile
  if (error || !data.user) {
    setState({ status: "error" });
    return;
  }
  const remote = (data.user.user_metadata?.practice ?? null) as RemotePractice | null;

  // Merge the account into the device, without losing anything on either side.
  applyingRemote = true;
  try {
    if (remote) {
      favourites.set(unique([...strings(remote.favourites), ...favourites.get()]));
      recentPrayers.set(unique([...recentPrayers.get(), ...strings(remote.recent)]).slice(0, 5));
      const remotePrefs = pickPrefs(remote.prefs);
      if (Object.keys(remotePrefs).length) readingPrefs.set({ ...readingPrefs.get(), ...remotePrefs });
      if (remote.ui_lang === "en" || remote.ui_lang === "hi") uiLang.set(remote.ui_lang);
    }
  } finally {
    applyingRemote = false;
  }
  await push();
}

function onSignedOut() {
  currentUserId = null;
  if (pushTimer) clearTimeout(pushTimer);
  setState({ ready: true, user: null, status: "off", lastSyncedAt: null });
}

/** Start watching the session and local changes. Safe to call more than once. */
export function startAccountSync() {
  if (started || typeof window === "undefined") return;
  started = true;
  const sb = supabase();
  sb.auth.getSession().then(({ data }) => {
    if (data.session?.user) void onSignedIn(data.session.user);
    else onSignedOut();
  });
  sb.auth.onAuthStateChange((_event, session) => {
    if (session?.user) void onSignedIn(session.user);
    else onSignedOut();
  });
  for (const store of [favourites, recentPrayers, readingPrefs, uiLang]) store.subscribe(schedulePush);
  // Upload anything pending if the page is being hidden or closed.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && pushTimer) {
      clearTimeout(pushTimer);
      pushTimer = null;
      void push();
    }
  });
}

/** Where /auth/callback should return to after Google (read by the callback route). */
export const AUTH_NEXT_COOKIE = "auth-next";

export async function signInWithGoogle(): Promise<string | null> {
  // A short-lived cookie tells the callback to come back here, rather than to
  // the community sign-up flow, without changing the OAuth redirect URL.
  document.cookie = `${AUTH_NEXT_COOKIE}=${encodeURIComponent(window.location.pathname)}; path=/; max-age=600; samesite=lax`;
  const { error } = await supabase().auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { prompt: "select_account" },
    },
  });
  return error?.message ?? null;
}

/** Signs out on this device only; other devices stay signed in. */
export async function signOut() {
  await supabase().auth.signOut({ scope: "local" });
}

/** Deletes the account and everything linked to it; data on this device stays. */
export async function deleteAccount(): Promise<boolean> {
  const res = await fetch("/api/account/delete", { method: "POST" });
  if (!res.ok) return false;
  await supabase().auth.signOut({ scope: "local" });
  return true;
}
