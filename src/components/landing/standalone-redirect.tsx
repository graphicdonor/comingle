"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Copies of the app installed before it moved to /app still open "/" until
 * their manifest refreshes (and the Android TWA wrapper always opens "/").
 * When the landing page is opened in app mode rather than a browser tab,
 * send it straight to the app. */
export function StandaloneRedirect() {
  const router = useRouter();
  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) router.replace("/app");
  }, [router]);
  return null;
}
