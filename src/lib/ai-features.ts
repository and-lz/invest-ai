/**
 * Returns whether AI features are enabled.
 * AI is only available in development (via local Claude proxy).
 * Derived from NODE_ENV at build time via next.config.ts.
 * Works in both Server and Client Components.
 */
export function isAiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_ENABLED === "true";
}
