/**
 * Returns whether AI features (Gemini) are enabled.
 * Derived from GOOGLE_API_KEY existence at build time via next.config.ts.
 * Works in both Server and Client Components.
 */
export function isAiEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AI_ENABLED === "true";
}
