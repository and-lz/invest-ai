# Replace fortuna-icon.png / BotIcon with fortuna-minimal.png

## Context
User wants all FABs and AI icons to use `fortuna-minimal.png` instead of `fortuna-icon.png` or `BotIcon` from lucide.

## Affected Files
1. `src/components/chat/chat-widget.tsx` — FAB (line 185) + chat header (line 256): `fortuna-icon.png` → `fortuna-minimal.png`
2. `src/components/chat/chat-body.tsx` — empty state (line 71): `fortuna-icon.png` → `fortuna-minimal.png`
3. `src/components/chat/chat-message.tsx` — assistant avatar (line 57): `fortuna-icon.png` → `fortuna-minimal.png`
4. `src/components/ui/ai-explain-button.tsx` — BotIcon → Image with fortuna-minimal.png
5. `src/components/ui/takeaway-box.tsx` — BotIcon → Image with fortuna-minimal.png
6. `src/components/desempenho/asset-ai-analysis.tsx` — BotIcon → Image with fortuna-minimal.png
7. `src/app/desempenho/page.tsx` — BotIcon → Image with fortuna-minimal.png

## Plan
- Replace all `fortuna-icon.png` references with `fortuna-minimal.png`
- Replace `BotIcon` from lucide with `<Image src="/fortuna-minimal.png">` at appropriate sizes
- Maintain existing sizing/styling

## Verification
- `tsc --noEmit` passes
- `npm run lint` passes
- Visual check of FAB, chat, and AI buttons
