# Context: Chat Message Content Formatting Revamp

## Requirements

### Goal
Revamp the markdown rendering in chat messages for dramatically better visual hierarchy, readability, and polish. The AI assistant produces rich markdown (headings, lists, tables, code, blockquotes, bold/italic) and the current rendering is flat — everything looks the same size and weight, making it hard to scan and parse responses.

### Acceptance Criteria
- [ ] Headings (h1, h2, h3) create clear visual hierarchy with distinct size steps
- [ ] Lists (ul/ol) have proper indentation, spacing, and custom markers (no default browser disc)
- [ ] Code blocks have a header bar with language label + copy button
- [ ] Inline code has higher contrast against surrounding text
- [ ] Blockquotes look distinct and elegant (not just italic + border-l)
- [ ] Tables have better cell padding, alternating row colors, and header distinction
- [ ] Bold text stands out clearly in paragraph flow
- [ ] Paragraph spacing creates comfortable reading rhythm
- [ ] Nested content (lists in lists, lists after headings) has correct spacing
- [ ] Fullscreen mode scales proportionally (already partially handled)
- [ ] All styling works in both light and dark mode using semantic CSS variables

### Out of Scope
- Syntax highlighting for code blocks (can be a future enhancement)
- Message bubble shape/layout changes (only content formatting)
- Chat input, sidebar, or widget layout
- TTS or streaming behavior changes
- New markdown features (math, diagrams, footnotes)

### Edge Cases
- Very long code blocks → horizontal scroll (already handled)
- Deeply nested lists (3+ levels) → diminish markers, maintain readability
- Empty messages / single-line messages → no extra spacing artifacts
- Streaming content → formatting should apply incrementally without jumps
- Tables with many columns → horizontal scroll (already handled)
- Mixed content (heading → list → code → paragraph) → consistent vertical rhythm

## Q&A Record
- Q: Requirements → A: User wants a "real revamp" — better visual hierarchy, all markdown formatting reviewed, clear readability

## Codebase Analysis

### Existing Patterns to Follow
- Design system tokens at `src/lib/design-system.ts` — use `typography.*`, `icon.*` tokens where applicable
- Semantic colors only (`text-foreground`, `text-muted-foreground`, `bg-muted`, etc.) — never hardcoded Tailwind colors
- `cn()` utility from `src/lib/utils` for conditional classes
- shadcn/ui Table component at `src/components/ui/table.tsx` already used for markdown tables
- Responsive fullscreen mode pattern: `fs ? "larger" : "normal"` sizing throughout

### Current Problems Identified

1. **Flat heading hierarchy** — h1 is `text-base`, h2/h3 are `text-sm` (!) in CSS. The component overrides to `text-lg`/`text-base`/`text-sm`. Still too small and no visual distinction between levels.

2. **Prose class conflict** — `prose prose-sm` from Tailwind Typography AND custom `.markdown-content` CSS both apply. Conflicting paragraph margins (`mb-3` in CSS vs `mb-2` in component), heading sizes, etc.

3. **Lifeless code blocks** — just `bg-muted/50` with `text-xs` monospace. No language label, no copy button, no visual frame.

4. **Weak blockquotes** — `border-l-2 pl-3 italic opacity-90` makes them nearly invisible. No background, no icon, nothing distinctive.

5. **Generic list styling** — default `list-disc` and `list-decimal` with basic spacing. No custom markers, no visual interest.

6. **Tables are cramped** — `text-xs` cells in normal mode. No alternating rows, no header contrast.

7. **Bold text blends in** — `font-semibold` alone isn't enough differentiation in `text-sm` body text.

8. **Inconsistent spacing** — CSS says `mb-3` for paragraphs, component says `mb-2`. The `prose` class adds its own spacing. Triple conflict.

### Reusable Code Found
- `BlocoCodigoChat` at `src/components/chat/chat-code-block.tsx` — will be enhanced with copy button + language label
- `CodigoInlineMarkdown` at `src/components/chat/chat-markdown-components.tsx:96` — needs contrast improvement
- Table components at `src/components/chat/chat-markdown-components.tsx:19-67` — need padding/styling improvement
- `schemaSegurancaMarkdown` at `src/lib/markdown-config.ts` — sanitization config (untouched)
- `strip-markdown.ts` — TTS utility (untouched)

### Affected Files
- `src/components/chat/chat-markdown-content.tsx` (modify) — Remove `prose` classes, clean up component overrides to use CSS only
- `src/components/chat/chat-markdown-components.tsx` (modify) — Improve table cells, blockquote, inline code styling
- `src/components/chat/chat-code-block.tsx` (modify) — Add language label + copy-to-clipboard button
- `src/app/globals.css` (modify) — Complete rewrite of `.markdown-content` section with proper hierarchy
- `src/components/chat/chat-message.tsx` (no change) — message bubble itself is out of scope

### Risks
- **Prose class removal** (Low) — Removing Tailwind `prose` in favor of pure `.markdown-content` CSS. Mitigation: we already have comprehensive custom CSS that overrides prose anyway.
- **Streaming jank** (Low) — CSS-only changes don't affect streaming. Component changes are minimal. Mitigation: test with streaming content.
- **Spacing regression** (Medium) — Changing vertical rhythm could affect existing conversations. Mitigation: test with real conversation data containing varied markdown.
