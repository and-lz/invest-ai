# Collapsible Reasoning Before Bubble

## Context
Move the reasoning/thinking display from inside the chat bubble to a separate collapsible block rendered **before** the bubble (like Claude Code). Uses existing `Collapsible` component from shadcn/ui.

## Plan
1. Modify `src/components/chat/chat-message.tsx`:
   - Remove inline reasoning block (lines 92-103)
   - Add a collapsible reasoning block **before** the bubble div
   - Use `Collapsible` + `CollapsibleTrigger` + `CollapsibleContent`
   - Show "Raciocínio" label with ChevronRight icon that rotates on expand
   - Collapsed by default, expandable on click
   - Keep muted styling (dimmed, italic, smaller text)

## Verification
- Reasoning toggle still works (brain button)
- Reasoning appears before the bubble, not inside
- Collapsible opens/closes on click
- Streaming messages still render correctly
- No layout shift when reasoning is absent
