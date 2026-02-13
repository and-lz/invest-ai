"use client";

import { useCyberpunkPalette } from "@/contexts/cyberpunk-palette-context";

export function FloatingParticles() {
  const { isEnabled } = useCyberpunkPalette();

  if (!isEnabled) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {Array.from({ length: 10 }).map((_, i) => {
        const randomLeft = Math.random() * 100;
        const randomTop = Math.random() * 100;
        const randomDuration = 15 + Math.random() * 10;
        const randomDelay = i * 1.5;
        const randomSize = 1.5 + Math.random() * 2.5;

        return (
          <div
            key={i}
            className="absolute rounded-full bg-[var(--neon-glow-primary)]"
            style={{
              left: `${randomLeft}%`,
              top: `${randomTop}%`,
              width: `${randomSize}px`,
              height: `${randomSize}px`,
              opacity: 0.2,
              animationName: "float",
              animationDuration: `${randomDuration}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: `${randomDelay}s`,
            }}
          />
        );
      })}
    </div>
  );
}
