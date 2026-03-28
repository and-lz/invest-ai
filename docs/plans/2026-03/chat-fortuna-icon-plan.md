# Chat Widget: Use Fortuna Icon

## Context
Replace the lucide `Bot` icon with `fortuna-icon.png` in the chat widget — FAB button, header, and assistant message avatar.

### Affected files
- `src/components/chat/chat-widget.tsx` — FAB (line 184), header (line 255)
- `src/components/chat/chat-message.tsx` — assistant avatar (line 50-57)

### Pattern reference
`src/components/ui/logo.tsx` uses `next/image` with `fortuna-icon.png`, rounded-full clip.

## Plan

### Step 1: `chat-widget.tsx`
- Import `Image` from `next/image`
- Replace FAB `<Bot>` (line 184) with `<Image src="/fortuna-icon.png" ...>` sized `h-6 w-6` (24px)
- Replace header `<Bot>` (line 255) with `<Image>` sized responsively (h-5/h-7)
- Remove `Bot` from lucide imports if no longer used

### Step 2: `chat-message.tsx`
- Import `Image` from `next/image`
- Replace assistant avatar `<Bot>` (line 56) with `<Image>` sized responsively (h-4/h-6)
- Remove `Bot` from lucide imports
- Keep the rounded-full container div

## Verification
- Visual: FAB, header icon, and assistant message bubbles show fortuna icon
- Build: `tsc --noEmit` passes
- No regressions in chat functionality
