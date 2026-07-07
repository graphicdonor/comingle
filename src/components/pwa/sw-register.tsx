"use client";
import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        // Check for updates every 60 minutes while the tab is open
        setInterval(() => reg.update(), 60 * 60 * 1000);
      })
      .catch((err) => console.error("[SW] Registration failed:", err));
  }, []);

  return null;
}
