"use client";

import { useEffect } from "react";

export function PwaRegistration() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    let isReloading = false;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        // Check for updates every 30 minutes (instead of 1 hour)
        setInterval(() => registration.update(), 30 * 60 * 1000);
      })
      .catch((error) => {
        console.error("[PWA] SW registration failed:", error);
      });

    // Force reload when a new SW takes control (new deploy)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (isReloading) return;
      isReloading = true;
      window.location.reload();
    });
  }, []);

  return null;
}
