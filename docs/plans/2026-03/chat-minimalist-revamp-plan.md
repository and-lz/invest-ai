# Plan: Chat Minimalist Revamp

**Context**: [chat-minimalist-revamp-context.md](./chat-minimalist-revamp-context.md)

## Steps

### Step 1: Strip message bubbles to text-only
**Files**: `src/components/chat/chat-message.tsx` (modify)
**Changes**:
- Remove `Avatar` + `AvatarImage` + `AvatarFallback` imports and usage
- Remove role label row (`"Você"` / `"Fortuna"` text)
- Remove `bg-muted/50` background from assistant messages
- Differentiate user vs assistant by: user messages get `text-muted-foreground` (lighter), assistant messages stay `text-foreground` (default)
- Move bookmark button to inline at end of message content row, using `interaction.hoverReveal` pattern
- Keep reasoning collapsible, streaming dots, error/retry — just without the avatar row
- Keep `group/msg` class for hover interactions
- Simplify padding: uniform `py-2` for both roles (no `px-5 py-4` bubble padding)
**Verify**: `tsc --noEmit` passes. Messages render without avatars/labels. User/assistant visually distinct.

### Step 2: Simplify header to essential-only with overflow menu
**Files**: `src/components/chat/chat-page-header.tsx` (modify)
**Changes**:
- Remove `border-b` from header container
- Remove `bg-background/95` frosted glass — use `bg-transparent`
- Keep: sidebar toggle (Menu icon) on left, back button (ArrowLeft) on right
- Show conversation title inline between toggle and back, smaller (`text-xs text-muted-foreground`)
- Move TTS toggle + clear history into a `DropdownMenu` (three-dot `MoreHorizontal` icon)
  - Import `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem` from shadcn
  - TTS item: shows Volume2/VolumeX icon + label
  - Clear item: shows Trash2 icon + "Limpar histórico" (only when `hasMessages`)
- Result: `[Menu] [title...] [⋮] [←]` — ultra-minimal top bar
**Verify**: `tsc --noEmit` passes. Header shows only 3-4 icons max. Overflow menu works.

### Step 3: Remove borders and chrome from chat body + input
**Files**: `src/components/chat/chat-body.tsx` (modify), `src/components/chat/chat-input-field.tsx` (modify)
**Changes in chat-body.tsx**:
- Remove `border-t` from the input wrapper `<div className="border-t">`
- Remove `pt-[72px]` from messages container (header is now transparent/minimal, no need for offset)
- Adjust to `pt-12` (just enough for the minimal header)

**Changes in chat-input-field.tsx**:
- Remove `border-t` reference (already handled by `hideBorderTop` prop but ensure clean)
- Remove border from `<textarea>` element — use `border-0 bg-transparent` instead of `border rounded-lg bg-background`
- Add a subtle top gradient fade on the input area to visually separate from messages without a hard line: `bg-gradient-to-t from-background via-background to-transparent`
- Keep reasoning toggle and send/stop buttons as-is
**Verify**: `tsc --noEmit` passes. No hard borders visible between header → messages → input. Seamless vertical flow.

### Step 4: Lighten sidebar border
**Files**: `src/app/chat/[id]/page.tsx` (modify)
**Changes**:
- Replace `border-r` on desktop sidebar with `border-r border-border/20` (very subtle separator)
- Or remove `border-r` entirely and use `shadow-[1px_0_0_0_var(--border)/10]` for ultra-subtle edge
- Keep `w-80` width and collapse behavior unchanged
**Verify**: `tsc --noEmit` passes. Sidebar transition still smooth. Separator barely visible but functional.

### Step 5: Update skeleton loader to match new message style
**Files**: `src/components/chat/chat-body.tsx` (modify)
**Changes**:
- Update `MessageBubbleSkeleton` to match the new stripped-down message format
- Remove avatar skeleton and role label skeleton
- Remove `bg-muted/50` background
- Simplify to just content line skeletons with matching padding
**Verify**: `tsc --noEmit` passes. Loading state matches the new message visual style.

## New Files
None — all changes are modifications to existing files.

## Verification Plan
- Build: `npx tsc --noEmit` → succeeds
- Lint: `npm run lint` → passes
- Tests: `npm run test` → all pass (no UI tests to break, logic unchanged)
- Manual:
  1. Open `/chat` — empty state shows logo + suggestions, no chrome
  2. Send a message — user text renders lighter, assistant text renders normal, no avatars or labels
  3. Toggle sidebar — opens/closes smoothly, barely visible separator
  4. Open overflow menu (⋮) — TTS and clear options appear
  5. Bookmark a message — button appears on hover at message end
  6. Enable reasoning — collapsible still works
  7. Streaming — dots indicator visible
  8. Error state — error banner still visible with background tint

## Risks
- Readability (Low) — User/assistant differentiation via text color weight. If insufficient, can add a thin left-border accent as fallback.
- Discoverability (Low) — TTS/clear in overflow menu is standard UX pattern.
