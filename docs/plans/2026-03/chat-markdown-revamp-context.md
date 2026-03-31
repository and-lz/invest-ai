# Context: Chat Markdown Content Formatting Revamp

## Requirements

### Goal
Complete overhaul of how chat message content is rendered — improve visual hierarchy, readability, and polish for all markdown elements. The chat should feel like a premium, well-typeset conversation — not raw rendered markdown.

### Acceptance Criteria
- [ ] **Headings**: Clear visual hierarchy (h1 > h2 > h3) with proper sizing, weight, and spacing — not all the same size
- [ ] **Paragraphs**: Comfortable reading rhythm with proper line-height and inter-paragraph spacing
- [ ] **Lists**: Proper indentation, bullet/number styling, nested list support with visual distinction per level
- [ ] **Code blocks**: Distinct visual treatment with proper padding, readable font size (not text-xs), and syntax highlighting via shiki
- [ ] **Inline code**: Clear distinction from surrounding text with proper padding and background
- [ ] **Blockquotes**: Visually distinct callout style — not just italic text
- [ ] **Tables**: Clean, readable formatting with proper cell padding and header distinction
- [ ] **Bold/italic/strikethrough**: Proper emphasis that's visually clear
- [ ] **Links**: Styled distinctly from text with hover state
- [ ] **Horizontal rules**: Clean section separators
- [ ] **No prose ghost classes**: Remove unused `prose`/`prose-sm`/`prose-xl` (Tailwind Typography plugin not installed)
- [ ] **Consistent spacing**: No double-styling conflicts between CSS rules and inline component classes
- [ ] **Responsive**: Works in both normal (420px chat widget) and potential fullscreen mode
- [ ] **Dark/light mode**: All elements look correct in both themes

### Out of Scope
- Copy-to-clipboard button on code blocks (chat rarely uses code blocks)
- Image rendering in chat messages
- Math/LaTeX rendering
- Mermaid diagram rendering
- Changes to message bubble layout (user vs assistant positioning)
- Changes to reasoning/thinking block styling
- New features (e.g., message reactions, threading)

### Edge Cases
- Very long code blocks → horizontal scroll, max-height with expand
- Deeply nested lists (3+ levels) → visual distinction per level
- Tables with many columns → horizontal scroll in narrow chat
- Mixed content (heading → list → code → paragraph) → consistent spacing between different block types
- Empty content / single-line messages → no excessive whitespace
- Streaming content → styles must not cause layout shift during streaming
- User messages with markdown → lighter formatting since they're in bubbles

## Q&A Record
- Q: Should user messages also get full markdown formatting? → A: Yes, but lighter — they're inside `bg-muted/40` bubbles with constrained width (85%). Heavy formatting (code blocks, tables) should still work but be space-conscious.
- Q: What pain points bother you most? → A: All — headings lack distinction, lists feel flat, code blocks are plain, overall spacing is off
- Q: Syntax highlighting? → A: Yes, add it via shiki
- Q: Copy button on code blocks? → A: Chat doesn't really use code blocks, so not needed
- Q: Reference style? → A: No specific reference — just make it better

## Codebase Analysis

### Critical Bug: Ghost Prose Classes
`chat-markdown-content.tsx:33` applies `prose prose-sm` / `prose-xl` classes but `@tailwindcss/typography` is NOT installed (not in package.json). These classes are **no-ops** — all actual styling comes from `.markdown-content` in globals.css and inline component overrides. This creates confusion and should be cleaned up.

### Existing Patterns to Follow

1. **Design System Typography** — see `src/lib/design-system.ts`
   - Use `typography.*` tokens for consistent sizing
   - `body` = `text-sm`, `helper` = `text-xs text-muted-foreground`, `mono` = `text-xs font-mono`
   - Headings use `tracking-tight` in the design system but markdown headings omit it

2. **Learning Center article components** — see `src/components/aprender/article-template.tsx`
   - Better typography: paragraphs use `text-muted-foreground` for softer reading
   - `Destaque` component with 4 callout types (info/warning/success/atencao)
   - `Codigo` with `bg-secondary rounded px-1.5 py-0.5 font-mono text-sm`
   - Lists use `space-y-2 pl-6` (more generous than chat's `space-y-1 pl-5`)

3. **Semantic colors** — see `src/app/globals.css`
   - Use `text-foreground`, `text-muted-foreground`, `bg-muted`, `border-border` etc.
   - Never hardcode Tailwind colors

### Reusable Code Found
- `cn()` at `src/lib/utils.ts` — className merging
- shadcn `Table` components at `src/components/ui/table.tsx` — already used
- shadcn `Separator` at `src/components/ui/separator.tsx` — already used
- `BlocoCodigoChat` at `src/components/chat/chat-code-block.tsx` — needs enhancement (shiki syntax highlighting, better sizing)

### Affected Files
- `src/components/chat/chat-markdown-content.tsx` (modify) — Remove prose classes, consolidate component overrides with CSS
- `src/components/chat/chat-markdown-components.tsx` (modify) — Enhance table, link, inline code, add blockquote component
- `src/components/chat/chat-code-block.tsx` (modify) — Integrate shiki syntax highlighting, better sizing
- `src/app/globals.css` (modify) — Rewrite `.markdown-content` section with proper hierarchy and spacing
- `src/lib/markdown-config.ts` (modify) — Allow `style` attribute for shiki-generated inline styles
- `package.json` (modify) — Add `shiki` dependency

### Dependency Chain (build order)
1. `package.json` → install shiki
2. `src/lib/markdown-config.ts` → allow style attributes for shiki output
3. `src/app/globals.css` → rewrite .markdown-content CSS
4. `src/components/chat/chat-markdown-components.tsx` → enhanced element components
5. `src/components/chat/chat-code-block.tsx` → shiki integration
6. `src/components/chat/chat-markdown-content.tsx` → wire everything together

### Current Issues Inventory

#### 1. Typography Hierarchy is Flat
- h1 = `text-base`, h2 = `text-sm`, h3/h4 = `text-sm` — h2/h3/h4 are identical
- No `tracking-tight` on headings (design system uses it)
- No color differentiation — headings blend with body text
- No bottom border or visual separator for h1/h2

#### 2. Paragraphs Lack Breathing Room
- `mb-3` in CSS but `mb-2` in component override — conflicting
- No `text-muted-foreground` for softer reading (learning center uses it)
- Leading is `leading-relaxed` which is good but applied inconsistently

#### 3. Lists Are Cramped
- `space-y-1` (4px) between items — too tight for readable lists
- `list-inside` in component but `list-disc` with `pl-5` in CSS — conflicts
- Nested lists have no visual distinction (same bullet, same indentation feel)
- `list-inside` causes bullets to consume text space in narrow bubbles

#### 4. Code Blocks Are Minimal
- `text-xs` (12px) is too small for code readability
- No syntax highlighting — monochrome text only
- No language indicator/badge
- Same `text-foreground` color as surrounding text — poor distinction
- No fullscreen responsive sizing (hardcoded `text-xs`)
- `bg-muted/50` is very subtle, especially in dark mode
- Shiki will add language-aware coloring with light/dark theme support

#### 5. Inline Code Lacks Distinction
- `text-xs` is smaller than surrounding `text-sm` body text — jarring
- `bg-muted` background but no border — blends in light mode
- Missing in globals.css: no background color defined (relies on component)

#### 6. Blockquotes Are Weak
- `opacity-90` instead of semantic color — not accessible
- `italic` makes long blockquotes hard to read
- `border-l-2` is too subtle — needs more visual weight
- No background color — blends with content

#### 7. Tables Are Too Small
- Cell text `text-xs` (12px) — hard to read
- No alternating row colors
- No header background distinction
- Table header vs body distinction relies only on font weight

#### 8. Bold Text Doesn't Pop
- `font-semibold` (600) on already `text-sm` text — subtle
- `text-foreground` explicit but same as parent — no contrast gain
- In dark mode with bright foreground, bold barely differs visually

#### 9. Styling Conflicts (CSS vs Component)
- Paragraph: CSS says `mb-3`, component says `mb-2`
- Lists: CSS says `pl-5 list-disc`, component says `list-inside list-disc`
- Headings: CSS defines sizes, component overrides with different sizes
- `.markdown-content` declared twice in globals.css (lines 306 and 412)

#### 10. Dead Code
- `ehUsuario` prop passed to `ConteudoMarkdownChat` but never used in render
- `prose`/`prose-sm`/`prose-xl` classes are no-ops without the typography plugin

### Risks
- **Streaming layout shift** (Med) — Changing spacing/sizing may cause content to jump during streaming. Mitigation: test with streaming responses, ensure consistent line-heights
- **User message overflow** (Low) — Enhanced code blocks/tables may overflow 85% max-width user bubbles. Mitigation: test edge cases, add overflow-x-auto
- **CSS specificity wars** (Med) — Dual-source styling (CSS + components) can create cascade issues. Mitigation: single source of truth — either CSS OR component classes, not both
