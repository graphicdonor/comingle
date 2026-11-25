import { useSyncExternalStore } from "react";
import Storage from "expo-sqlite/kv-store";

// On-device version of the website's local store (src/lib/practice/local-store.ts),
// with the same interface, so the shared preference, reminder and language
// stores work unchanged. Values live in the app's private storage and never
// leave the phone.

export interface LocalStore<T> {
  use(): T;
  set(value: T): void;
  get(): T;
  subscribe(listener: () => void): () => void;
}

export function createLocalStore<T>(key: string, fallback: T, parse: (raw: unknown) => T, _serverValue: T = fallback): LocalStore<T> {
  const listeners = new Set<() => void>();
  let loaded = false;
  let value: T = fallback;

  function get(): T {
    if (!loaded) {
      loaded = true;
      try {
        const raw = Storage.getItemSync(key);
        value = raw === null ? fallback : parse(JSON.parse(raw));
      } catch {
        value = fallback;
      }
    }
    return value;
  }

  function set(next: T) {
    loaded = true;
    value = next;
    try {
      Storage.setItemSync(key, JSON.stringify(next));
    } catch {
      // Keep the in-memory value so the screen still responds.
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return { get, set, subscribe, use: () => useSyncExternalStore(subscribe, get, get) };
}
