/**
 * Strips markdown formatting from text, producing plain text suitable
 * for speech synthesis. Removes bold, italic, links, code blocks,
 * headings, list markers, horizontal rules, images, and blockquotes.
 */
export function stripMarkdown(markdown: string): string {
  return (
    markdown
      // Remove fenced code blocks (```...```)
      .replace(/```[\s\S]*?```/g, "")
      // Remove inline code (`...`)
      .replace(/`([^`]+)`/g, "$1")
      // Remove images ![alt](url)
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
      // Remove links [text](url) -> keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove heading markers (# ## ### etc.)
      .replace(/^#{1,6}\s+/gm, "")
      // Remove bold **text** or __text__
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      // Remove italic *text* or _text_
      .replace(/(\*|_)(.*?)\1/g, "$2")
      // Remove strikethrough ~~text~~
      .replace(/~~(.*?)~~/g, "$1")
      // Remove horizontal rules (---, ***, ___)
      .replace(/^[-*_]{3,}\s*$/gm, "")
      // Remove unordered list markers (-, *, +)
      .replace(/^\s*[-*+]\s+/gm, "")
      // Remove ordered list markers (1., 2., etc.)
      .replace(/^\s*\d+\.\s+/gm, "")
      // Remove blockquote markers (>)
      .replace(/^\s*>\s?/gm, "")
      // Collapse excessive newlines
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}
