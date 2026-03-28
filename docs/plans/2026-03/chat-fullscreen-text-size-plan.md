# Chat Fullscreen — Increase Bubble Text Size

## Context
User wants larger text in fullscreen chat bubbles. Current fullscreen uses `text-lg` (18px) for bubbles and `prose-lg` for markdown. Target: `text-2xl` (24px) and `prose-xl`.

## Plan
1. `chat-message.tsx`: bubble text `text-lg` → `text-2xl`
2. `chat-markdown-content.tsx`: prose `prose-lg` → `prose-xl`, headings bump one step (3xl→4xl, 2xl→3xl, xl→2xl)

## Verification
- Open chat in fullscreen mode, verify text is visibly larger
- Verify normal (non-fullscreen) mode is unchanged
