# Fortuna-minimal: min 50x50 + bg-primary/10 circular

## Context
All 8 usages of `fortuna-minimal.png` must render at **minimum 50×50px** and have a **circular `bg-primary/10` background**.

## Affected files
| File | Current size | Change |
|------|-------------|--------|
| `chat-widget.tsx` FAB (185) | 56×56 | Add `bg-primary/10 rounded-full` to button |
| `chat-widget.tsx` header (256) | 28/20px | → 50px + bg wrapper |
| `chat-message.tsx` (57) | 24/16px | Container → 50px min, bg-secondary → bg-primary/10 |
| `chat-body.tsx` (71) | 64/40px | Mobile → 50px, add bg wrapper |
| `ai-explain-button.tsx` (62) | 16px | → 50px + bg wrapper (button grows) |
| `takeaway-box.tsx` (350) | 16px | → 50px + bg wrapper |
| `desempenho/page.tsx` (154) | 16px | → 50px + bg wrapper |
| `asset-ai-analysis.tsx` (65) | 20px | → 50px + bg wrapper |

## Plan
1. Edit each file: wrap Image in `<div className="rounded-full bg-primary/10 p-1.5">` where needed, set Image to min 50×50
2. Validate with `tsc --noEmit` + lint

## Verification
- `npm run lint && npx tsc --noEmit`
- Visual check in browser
