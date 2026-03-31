import { defaultSchema } from "rehype-sanitize";
import type { Options } from "rehype-sanitize";

/**
 * Schema de segurança para sanitização de markdown.
 * Remove elementos e atributos perigosos (scripts, iframes, event handlers).
 */
export const schemaSegurancaMarkdown: Options = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    // Elementos permitidos adicionais
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
  ],
  attributes: {
    ...defaultSchema.attributes,
    // Links podem ter href e title
    a: ["href", "title", "target", "rel"],
    // Code blocks podem ter className para syntax highlighting
    // Shiki outputs inline styles on code elements for theme-based background
    code: ["className", "style"],
    // Shiki outputs inline styles on span elements for token coloring
    span: ["style"],
    // Shiki wraps output in pre with style for background color
    pre: ["className", "style"],
  },
};
