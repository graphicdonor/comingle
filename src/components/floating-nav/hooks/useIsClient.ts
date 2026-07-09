"use client";

import { useSyncExternalStore } from "react";

const subscribeNever = () => () => {};

/**
 * True only once the component has actually mounted on the client.
 * Implemented via useSyncExternalStore (server snapshot `false`, client
 * snapshot `true`) rather than an effect + setState — the latter trips
 * this project's react-hooks/set-state-in-effect rule and, more to the
 * point, is exactly the "value differs between server and client" case
 * useSyncExternalStore exists for.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
}
