# Chat Floating Input with Gradient Fade

## Context
The chat input at the bottom of the chat widget currently sits in normal document flow below the messages area. The user wants:
1. Remove the solid background behind the input area at the bottom
2. Add a gradient fade (transparent → card bg) above the input
3. Make the input field float/overlay on top of the messages

### Current structure (`chat-body.tsx`)
```
<div flex-col>                    ← outer container
  <div flex-1 overflow-y-auto>   ← scrollable messages area
    ...messages...
  </div>
  <div>                          ← footer (normal flow, solid bg)
    <CampoEntradaChat />
  </div>
</div>
```

### Affected files
- `src/components/chat/chat-body.tsx` — Layout restructure (make input overlay)
- `src/components/chat/chat-input-field.tsx` — No changes needed (already has `bg-muted/30` on inner box)

## Plan

### Step 1: Make input overlay the messages area
In `chat-body.tsx`:
- Add `relative` to the outer `<div>` container
- Change the footer `<div>` to `absolute inset-x-0 bottom-0 z-10`
- Use `pointer-events-none` on wrapper, `pointer-events-auto` on the input itself
- Add a gradient `<div>` above the input: `bg-gradient-to-b from-transparent to-card` (h-6 normal, h-10 fullscreen)
- Below the gradient, wrap input in `bg-card` so text remains readable

### Step 2: Prevent content occlusion
- Add `pb-20` (normal) / `pb-28` (fullscreen) to the messages scroll area so the last message isn't hidden behind the floating input

## Verification
- Messages scroll behind the input with a smooth gradient fade
- Input field visually floats over the bottom of the chat
- Works in both normal and fullscreen modes
- Last message is fully visible when scrolled to bottom
- Input remains interactive (pointer-events)
