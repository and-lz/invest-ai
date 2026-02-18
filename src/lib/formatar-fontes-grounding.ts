import type { GroundingMetadata } from "@google/generative-ai";

/**
 * Formats grounding metadata from Google Search into a markdown sources section.
 * Returns null if no valid sources are available.
 */
export function formatarFontesGrounding(metadata?: GroundingMetadata): string | null {
  if (!metadata?.groundingChunks?.length) return null;

  const fontes = metadata.groundingChunks
    .filter((chunk) => Boolean(chunk.web?.uri && chunk.web?.title))
    .map((chunk) => `- [${chunk.web!.title}](${chunk.web!.uri})`);

  if (fontes.length === 0) return null;

  return `\n\n---\n**Fontes:**\n${fontes.join("\n")}\n`;
}
