# Chat Page — Slightly Smaller

## Context
The fullscreen chat page (`/chat/[id]`) uses `fs=true` branch of all sizing conditionals. The text (`text-lg`), padding (`p-6`, `px-5 py-4`), and spacing (`space-y-5`) feel too large.

Affected files:
- `src/components/chat/chat-message.tsx` — fullscreen avatar/text/padding
- `src/components/chat/chat-input-field.tsx` — fullscreen textarea padding/text
- `src/components/chat/chat-body.tsx` — fullscreen message area padding/spacing/empty state

## Plan

### Step 1 — chat-message.tsx
- Avatar: `h-10 w-10` → `h-9 w-9`
- Bubble text: `text-lg` → `text-base`
- Bubble padding: `px-5 py-3` → `px-4 py-2.5`

### Step 2 — chat-input-field.tsx
- Textarea: `px-5 py-4 text-lg` → `px-4 py-3 text-base`
- Wrapper: `gap-4 p-6` → `gap-3 p-5`
- Max height: `200` → `180`

### Step 3 — chat-body.tsx
- Messages area: `space-y-5 p-6` → `space-y-4 p-5`
- Empty state gap: `gap-8` → `gap-6`
- Empty state icon: `h-16 w-16` → `h-12 w-12`
- Empty state text: `text-lg` → `text-base`, `text-base` → `text-sm`

## Verification
- Open `/chat/[id]` — chat should look proportionally smaller but still comfortable
- Widget mode (non-fullscreen) must be unchanged (only `fs=true` branches touched)
