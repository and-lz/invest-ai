# Context: Chat Minimalist Revamp

## Requirements

### Goal
Revamp the `/chat` page UI to be borderless, embedded, and minimalistic. The chat should feel like a native part of the app — no distinct chrome, borders, or visual noise. Focus on the content itself.

### Acceptance Criteria
- [ ] Messages render without avatars, role labels, or visible bubble backgrounds — just clean text with minimal user/assistant differentiation
- [ ] Header is reduced to essential-only: sidebar toggle + back button. TTS, clear history moved to a compact overflow menu (three-dot)
- [ ] No visible borders between header, messages, and input — seamless vertical flow
- [ ] Input area floats at the bottom with no border-top, blending into the page
- [ ] Sidebar (desktop collapsible + mobile drawer) stays functional but visually lighter (no hard border-right, use subtle separator or shadow)
- [ ] Conversation title displayed inline, not in a heavy header bar
- [ ] Empty state remains clean — logo + suggestions, no chrome
- [ ] All existing functionality preserved (TTS, clear, bookmark, reasoning, suggestions, streaming)

### Out of Scope
- Sidebar content/layout changes (conversation list, saved messages, tabs)
- Chat widget (floating modal) — only `/chat` page
- Chat logic/hooks changes — purely visual
- Mobile sidebar drawer behavior
- Color palette changes

### Edge Cases
- Streaming state: dots indicator still visible without bubble background → use subtle opacity
- Error banner: still needs to be visible without border-top → use background tint
- Bookmark button: needs to remain discoverable on hover without avatar row → position at message end
- Empty response + retry: still clear without role labels
- Reasoning collapsible: still accessible without header chrome

## Q&A Record
- Q: What does "integrated" mean? → A: Borderless & embedded. Remove all chrome (header bar, borders). Messages flow on page background. Input floats.
- Q: Sidebar behavior? → A: Keep collapsible on desktop, drawer on mobile. Just make visually lighter.
- Q: What to declutter? → A: Both header + message chrome. Minimal header, clean messages without avatars/labels.

## Codebase Analysis

### Existing Patterns to Follow
- Design system tokens at `src/lib/design-system.ts` — use `typography.*`, `icon.*`, `layout.*`
- `cn()` utility for conditional classes at `src/lib/utils.ts`
- `bg-background/95 supports-[backdrop-filter]:bg-background/80 backdrop-blur-sm` pattern for frosted headers
- `chat-fullbleed` CSS class in `globals.css` for immersive chat mode

### Reusable Code Found
- `interaction.hoverReveal` (`opacity-0 transition-opacity group-hover:opacity-100`) — for hover actions
- `typography.helper` (`text-xs text-muted-foreground`) — for subtle metadata
- `dialog.backdrop` — for sidebar overlay feel

### Affected Files
- `src/components/chat/chat-page-header.tsx` (modify) — Strip to minimal: sidebar toggle + overflow menu + back
- `src/components/chat/chat-message.tsx` (modify) — Remove avatar, role label. Clean text-only layout with subtle differentiation
- `src/components/chat/chat-body.tsx` (modify) — Remove border-t on input, remove pt-[72px] top padding, seamless message flow
- `src/components/chat/chat-input-field.tsx` (modify) — Remove border, float at bottom with transparent bg
- `src/app/chat/[id]/page.tsx` (modify) — Remove border-r on sidebar, lighter sidebar styling
- `src/components/chat/suggestion-chips.tsx` (no change) — Already minimal
- `src/components/chat/sidebar-tabs.tsx` (no change) — Out of scope

### Risks
- Readability (Low) — Without avatars/labels, user vs assistant distinction must be clear via other means (alignment, subtle bg tint, or typography weight)
- Discoverability (Low) — TTS/clear hidden in overflow menu. Mitigated by three-dot menu pattern users understand
- Bookmark button (Low) — Without avatar row, needs new anchor point. Mitigated by floating at message trailing edge on hover
