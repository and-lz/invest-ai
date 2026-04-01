# Chat Header — Non-Sticky, Integrated

## Context

**Request:** Make the header in `/chat` non-sticky. It should visually "stand" at the top of the
conversation; after the user scrolls down through messages, the header scrolls away and only the
chat continues.

**Current behavior:**
- `chat-page-header.tsx:38` has `sticky inset-x-0 top-0 z-10` → header stays fixed at top always
- Scroll container is the `<article>` inside `ChatBody` (not the outer `<main>`)
- Because scroll is inside `<article>`, simply removing `sticky` from the header won't make it
  scroll away — the header lives outside the scroll container

**Root cause:** To make the header scroll away with messages, it must live *inside* the scroll
container (`<article>` in `ChatBody`).

**Affected files:**
1. `src/components/chat/chat-body.tsx` — add optional `headerSlot` prop, render at top of article
2. `src/components/chat/chat-page-header.tsx` — remove sticky/z classes
3. `src/app/chat/[id]/page.tsx` — pass `<ChatPageHeader>` as `headerSlot`, remove standalone usage

## Plan

### Step 1 — Add `headerSlot` to `ChatBody`
- Add `headerSlot?: React.ReactNode` to `ChatBodyProps`
- Render it as the first child inside the `<article>` scroll container, before the skeleton/messages

### Step 2 — Remove sticky from `ChatPageHeader`
- In `chat-page-header.tsx:38`, change:
  ```
  "chat-page-nav sticky inset-x-0 top-0 z-10 bg-background border-b"
  ```
  to:
  ```
  "chat-page-nav bg-background border-b"
  ```
- Keeps visual styling (border-b, background) but no sticky positioning

### Step 3 — Wire up in `chat/[id]/page.tsx`
- Pass `<ChatPageHeader .../>` as the `headerSlot` prop on `<ChatBody>`
- Remove the standalone `<ChatPageHeader>` that currently sits between print-header and `<ChatBody>`

## Verification

- Open `/chat` — header visible at top, integrated into message flow
- Scroll through messages — header scrolls away, only chat visible
- Scroll back to top — header reappears
- Back button, sidebar toggle, overflow menu all still function
- No TypeScript errors: `tsc --noEmit`
