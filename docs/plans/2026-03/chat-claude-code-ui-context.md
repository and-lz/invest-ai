# Context: Chat UI — Claude Code Web Style

## Requirements

### Goal
Redesign the chat UI (both floating widget and fullscreen `/chat/` page) to mimic Claude Code's web interface style:
- **Full-width messages** with light background on assistant messages only (no chat bubbles)
- **Clear visual separators** between conversation turns
- **Conversation sidebar grouped by date** (Today, Yesterday, Last 7 days, Older)
- **Keep Fortuna branding** (avatar, name, icon)

### Acceptance Criteria
- [ ] Messages display full-width, no rounded bubble containers
- [ ] Assistant messages have a subtle `bg-muted` background; user messages have no background
- [ ] Each message shows role label (avatar + name) above content, left-aligned
- [ ] Clear visual separator (border or spacing) between conversation turns
- [ ] Sidebar groups conversations by date: Today, Yesterday, Last 7 days, Older
- [ ] Sidebar items are compact: title + timestamp only (no preview, no message count)
- [ ] Widget and fullscreen page both use the new message style
- [ ] Fortuna avatar and branding preserved
- [ ] Markdown rendering still works correctly in assistant messages
- [ ] Empty state and suggestion chips still functional
- [ ] Mobile responsive (widget fullscreen on mobile, sidebar drawer)

### Out of Scope
- Monospace font / terminal aesthetic (keeping system-ui)
- Input field redesign (keeping current textarea + send button)
- Tool use blocks / code execution UI
- Slash command system
- Chat API changes / backend changes
- Color palette changes (using existing design system)

### Edge Cases
- Empty conversation list → show existing empty state per date group (or single empty state)
- Very long messages → full-width should handle gracefully with max-width constraint
- Streaming messages → loading dots still work without bubble container
- Stream errors → error display adapts to new layout (no bubble wrapper)
- Single message conversations → no separator needed above first message

## Q&A Record
- Q: Which aspects of Claude Code UI to mimic? → A: Conversation sidebar (date grouping), message layout (full-width, subtle containers)
- Q: Widget or page only? → A: Both widget and fullscreen page
- Q: Message bubble style? → A: Subtle containers — full-width, light bg on assistant only, no bubble shape
- Q: Fortuna branding? → A: Keep it (avatar, name, icon)
- Q: Sidebar style? → A: Project-style grouping by date (Today, Yesterday, Last 7 days, Older), compact items
- Q: Message container style? → A: Claude Code web style — full-width, clear separators between turns

## Codebase Analysis

### Existing Patterns to Follow
- Design system tokens at `src/lib/design-system.ts` — use `typography.*`, `icon.*`, `layout.*` for all styling
- `cn()` utility from `src/lib/utils` for conditional classes
- `fullscreen` / `fs` prop pattern used across all chat components for widget vs page sizing
- `formatBrazilianTimestamp()` from `src/lib/format-date.ts` for date display
- Native `<dialog>` pattern for modals/drawers with `useNativeDialog` hook

### Reusable Code Found
- `formatBrazilianTimestamp()` at `src/lib/format-date.ts` — reuse for sidebar timestamps
- `ConteudoMarkdownChat` at `src/components/chat/chat-markdown-content.tsx` — keep as-is for message rendering
- `useConversas` hook at `src/hooks/use-conversations.ts` — provides `conversas` array with `criadaEm`/`atualizadaEm` timestamps for date grouping
- `dialog` tokens from `src/lib/design-system.ts` — backdrop/drawer patterns
- Need to create: date grouping utility function (group conversations by Today/Yesterday/Last 7 days/Older)

### Affected Files
- `src/components/chat/chat-message.tsx` (modify) — Remove bubble styling, switch to full-width layout with role label
- `src/components/chat/chat-body.tsx` (modify) — Update message container, add separators between turns
- `src/components/chat/conversations-list.tsx` (modify) — Add date grouping headers
- `src/components/chat/conversation-item.tsx` (modify) — Compact layout (title + timestamp, no preview/count)
- `src/components/chat/chat-input-field.tsx` (minor) — May need minor adjustments to match new layout spacing
- `src/app/chat/[id]/page.tsx` (minor) — Possible header adjustments
- `src/components/chat/chat-widget.tsx` (minor) — Possible header adjustments
- `src/lib/date-grouping.ts` (create) — Utility to group conversations by relative date

### Risks
- **Message readability** (Low) — Full-width messages without bubbles need careful spacing/padding to remain scannable. Mitigated by subtle bg on assistant messages + clear separators.
- **Widget compactness** (Medium) — The widget is 420px wide; full-width messages + role labels may feel cramped. Mitigated by keeping compact sizing with `fullscreen` prop variations.
- **Conversation grouping performance** (Low) — Grouping is a simple O(n) operation on already-loaded data. No backend changes needed.
