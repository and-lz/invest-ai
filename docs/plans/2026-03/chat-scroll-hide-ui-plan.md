# Plan: Chat Scroll Hide Header & Input

**Context**: [chat-scroll-hide-ui-context.md](./chat-scroll-hide-ui-context.md)

## Steps

### Step 1: Create throttle utility + update CSS

**Files**: `src/lib/throttle.ts` (create), `src/app/globals.css` (modify)

**Changes**:
- Create `src/lib/throttle.ts` — simple leading-edge throttle function (`throttle<T>(fn, ms): T`)
- Update `.chat-auto-header` comment (remove "kept for reference, no longer toggled")
- Add `.chat-auto-footer` CSS class:
  ```css
  .chat-auto-footer {
    transition: transform 200ms ease, opacity 150ms ease;
  }
  .chat-auto-footer.chat-auto-footer--hidden {
    transform: translateY(100%);
    opacity: 0;
    pointer-events: none;
  }
  ```

**Verify**: `tsc --noEmit` passes

### Step 2: Refactor `useAutoHideOnScroll` for multiple targets

**Files**: `src/hooks/use-auto-hide-on-scroll.ts` (modify)

**Pattern**: Same DOM class toggling approach, extended to N targets

**Changes**:
- Change signature to accept an array of `{ ref, hiddenClass }` targets instead of single ref + class
- Wrap scroll callback with throttle (16ms — one animation frame)
- When hide/show triggers, iterate all targets and toggle their respective `hiddenClass`
- Return `{ onScroll }` only (no single ref — each target manages its own ref)

New signature:
```ts
interface AutoHideTarget {
  ref: React.RefObject<HTMLElement | null>;
  hiddenClass: string;
}

export function useAutoHideOnScroll(targets: AutoHideTarget[]): {
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
};
```

**Verify**: `tsc --noEmit` passes

### Step 3: Wire up in chat page — header + footer

**Files**: `src/components/chat/chat-page-header.tsx` (modify), `src/components/chat/chat-body.tsx` (modify), `src/app/chat/[id]/page.tsx` (modify)

**Changes**:

**`chat-page-header.tsx`**:
- Convert to `forwardRef` so parent can attach a ref
- Add `chat-auto-header` class to the root `div`

**`chat-body.tsx`**:
- Accept `footerRef` prop (`React.RefObject<HTMLDivElement>`)
- Add `chat-auto-footer` class to the floating footer container `div`
- Attach `footerRef` to that same `div`

**`page.tsx`**:
- Create `headerRef` and `footerRef` via `useRef`
- Call `useAutoHideOnScroll([{ ref: headerRef, hiddenClass: "chat-auto-header--hidden" }, { ref: footerRef, hiddenClass: "chat-auto-footer--hidden" }])`
- Pass `headerRef` to `ChatPageHeader` via ref
- Pass `footerRef` to `ChatBody` via new prop
- Pass `onScroll` to `ChatBody` (already has `onScroll` prop)

**Verify**: `tsc --noEmit` + manual test: scroll down in chat → header slides up, input slides down. Scroll up → both return.

## New Files
- `src/lib/throttle.ts` — Generic leading-edge throttle utility

## Verification Plan
- Build: `npx tsc --noEmit` → succeeds
- Lint: `npm run lint` → passes
- Tests: `npm run test` → all pass
- Manual:
  1. Open `/chat/{id}` with several messages
  2. Scroll down → header hides up, input hides down (smooth 200ms)
  3. Scroll up → both reappear
  4. At top of scroll → header always visible
  5. During streaming (auto-scroll near bottom) → input stays visible
  6. Scroll-to-bottom FAB still works when input is hidden
  7. Empty conversation → nothing hides

## Risks
- (Low) FAB positioning unchanged — input is absolutely positioned, transform doesn't affect layout
- (Low) Auto-scroll near bottom — existing `isNearBottomRef` logic means user won't be scrolling down at bottom, so hide won't trigger
