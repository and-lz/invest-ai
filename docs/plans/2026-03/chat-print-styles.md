# Chat Print Styles
## Context
User wants `/chat/[id]` page to be printable, showing **only the conversation** (messages).

## Plan
1. Add `@media print` block to `globals.css`:
   - Hide: sidebar, header, input field, scroll-to-bottom FAB, error banner, bookmark buttons, suggestion chips, mobile sidebar, gradient overlay, reasoning collapsibles, loading indicators
   - Show: messages only, full-width, auto height, white bg, black text
   - Remove overflow:hidden so all messages render, no clipping
   - Remove bottom padding (no input to cover)
   - Break pages between messages cleanly

2. Add "Imprimir" menu item to `ChatPageHeader` dropdown (Printer icon from lucide)

## Verification
- Open `/chat/[id]` with messages
- Cmd+P or click Print menu item → only conversation messages visible
- No sidebar, header, input, or UI chrome in print preview
