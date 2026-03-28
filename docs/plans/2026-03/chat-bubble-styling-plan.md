# Chat Bubble Styling Review

## Context
Fullscreen chat bubbles have too-small text and too much padding.

**Root cause:** `.markdown-content` in globals.css forces `text-sm` (14px), overriding the bubble's `text-2xl`. No `@tailwindcss/typography` plugin installed, so `prose-xl`/`prose-sm` classes are inert.

## Plan
1. **globals.css**: Remove `text-sm` from `.markdown-content` — let bubble container control font size via inheritance
2. **chat-message.tsx**: Change fullscreen text from `text-2xl` (never worked) to `text-lg` (18px). Reduce padding `px-7 py-4` → `px-5 py-3`
3. **chat-body.tsx**: Reduce fullscreen spacing `space-y-8 p-8` → `space-y-5 p-6`
4. **suggestion-chips.tsx**: Reduce fullscreen chip size `text-base px-5 py-2.5` → `text-sm px-4 py-2`

## Verification
- Visual check in fullscreen chat page
- Text should be ~18px (readable), padding tighter
