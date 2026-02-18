import { cn } from "@/lib/utils";

/**
 * Brand logo mark — miniature "app icon" style for header use.
 * Uses CSS custom properties so it adapts to light/dark themes automatically.
 *
 * - Dark mode: gold background, navy growth line
 * - Light mode: navy background, white growth line
 */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("h-6 w-6 shrink-0", className)}
      aria-hidden="true"
    >
      {/* Rounded square background */}
      <rect
        width="32"
        height="32"
        rx="8"
        style={{ fill: "var(--primary)" }}
      />

      {/* Upward growth trend line */}
      <path
        d="M7 22L12.5 16.5L16.5 19L25 10"
        style={{ stroke: "var(--primary-foreground)" }}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Peak endpoint dot */}
      <circle
        cx="25"
        cy="10"
        r="2.5"
        style={{ fill: "var(--primary-foreground)" }}
      />
    </svg>
  );
}
