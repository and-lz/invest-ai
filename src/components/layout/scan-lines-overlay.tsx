"use client";

import { useCyberpunkPalette } from "@/contexts/cyberpunk-palette-context";

export function ScanLinesOverlay() {
  const { isEnabled } = useCyberpunkPalette();

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      className="scan-lines fixed inset-0 z-9999 pointer-events-none"
      aria-hidden="true"
    />
  );
}
