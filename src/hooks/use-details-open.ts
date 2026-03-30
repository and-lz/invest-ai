"use client";

import { useState, useEffect, useCallback } from "react";

const DETAILS_STORAGE_KEY = "dashboard-details-open";

export function useDetailsOpen() {
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(DETAILS_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const setDetailsOpen = useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setOpen((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      try {
        localStorage.setItem(DETAILS_STORAGE_KEY, String(next));
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  // Listen for chat highlight expand requests
  useEffect(() => {
    const handler = () => setDetailsOpen(true);
    window.addEventListener("dashboard-expand-details", handler);
    return () => window.removeEventListener("dashboard-expand-details", handler);
  }, [setDetailsOpen]);

  return [open, setDetailsOpen] as const;
}
