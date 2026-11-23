"use client";
import { useSyncExternalStore } from "react";

// Tiny localStorage-backed store for per-device practice state (reading
// preferences, favourites). Nothing here leaves the device. Storage can be
// unavailable (private mode, blocked site data), so every access is guarded
// and the fallback value is used instead.

export interface LocalStore<T> {
  use(): T;
  set(value: T): void;
  get(): T;
}

export function createLocalStore<T>(key: string, fallback: T, parse: (raw: unknown) => T): LocalStore<T> {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedValue: T = fallback;

  function get(): T {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return cachedValue;
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cachedValue = raw === null ? fallback : parse(JSON.parse(raw));
      } catch {
        cachedValue = fallback;
      }
    }
    return cachedValue;
  }

  function set(value: T) {
    cachedValue = value;
    try {
      cachedRaw = JSON.stringify(value);
      window.localStorage.setItem(key, cachedRaw);
    } catch {
      // Keep the in-memory value so the UI still responds this session.
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return {
    get,
    set,
    use: () => useSyncExternalStore(subscribe, get, () => fallback),
  };
}
