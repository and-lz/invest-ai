"use client";

import { useCyberpunkPalette } from "@/contexts/cyberpunk-palette-context";

export function CircuitBoardBackground() {
  const { isEnabled } = useCyberpunkPalette();

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="fixed inset-0 -z-10 opacity-[0.04]">
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="circuit"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            {/* Horizontal lines */}
            <line
              x1="0"
              y1="20"
              x2="100"
              y2="20"
              stroke="var(--neon-primary)"
              strokeWidth="0.5"
              opacity="0.3"
            />
            <line
              x1="0"
              y1="50"
              x2="100"
              y2="50"
              stroke="var(--neon-secondary)"
              strokeWidth="0.5"
              opacity="0.3"
            />
            <line
              x1="0"
              y1="80"
              x2="100"
              y2="80"
              stroke="var(--neon-accent)"
              strokeWidth="0.5"
              opacity="0.3"
            />

            {/* Vertical lines */}
            <line
              x1="25"
              y1="0"
              x2="25"
              y2="100"
              stroke="var(--neon-primary)"
              strokeWidth="0.5"
              opacity="0.3"
            />
            <line
              x1="50"
              y1="0"
              x2="50"
              y2="100"
              stroke="var(--neon-secondary)"
              strokeWidth="0.5"
              opacity="0.3"
            />
            <line
              x1="75"
              y1="0"
              x2="75"
              y2="100"
              stroke="var(--neon-accent)"
              strokeWidth="0.5"
              opacity="0.3"
            />

            {/* Connection nodes */}
            <circle
              cx="25"
              cy="20"
              r="1.5"
              fill="var(--neon-primary)"
              opacity="0.5"
            />
            <circle
              cx="50"
              cy="50"
              r="1.5"
              fill="var(--neon-secondary)"
              opacity="0.5"
            />
            <circle
              cx="75"
              cy="80"
              r="1.5"
              fill="var(--neon-accent)"
              opacity="0.5"
            />
            <circle
              cx="25"
              cy="80"
              r="1.5"
              fill="var(--neon-secondary)"
              opacity="0.5"
            />
            <circle
              cx="75"
              cy="20"
              r="1.5"
              fill="var(--neon-accent)"
              opacity="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)" />
      </svg>
    </div>
  );
}
