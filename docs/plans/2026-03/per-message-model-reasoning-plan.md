# Plan: Per-Message Model & Reasoning Selection

**Context**: [per-message-model-reasoning-context.md](./per-message-model-reasoning-context.md)

## Steps

### Step 1: Add `modelTier` to chat request schema + API route
**Files**: `src/schemas/chat.schema.ts` (modify), `src/app/api/chat/route.ts` (modify)
**Pattern**: Following existing `raciocinio` optional field pattern
**Changes**:
- Add `modelTier: z.enum(["haiku", "sonnet", "opus"]).optional()` to `RequisicaoChatSchema`
- In API route: if `modelTier` is provided, use `resolveClaudeModelId(modelTier)` directly instead of calling `obterAiConfigParaUsuario()`. Fall back to DB settings when not provided.
**Verify**: `tsc --noEmit` passes, existing chat still works without `modelTier`

### Step 2: Thread `modelTier` through hook → API call
**Files**: `src/hooks/use-chat-assistant.ts` (modify)
**Pattern**: Same as `raciocinio` option threading
**Changes**:
- Add `modelTier?: ClaudeModelTier` to `UseChatAssistenteOpcoes`
- Include `modelTier` in the fetch body alongside `raciocinio`
- Add `modelTier` to `enviarMensagem` dependency array
**Verify**: `tsc --noEmit` passes

### Step 3: Redesign `CampoEntradaChat` — Claude.ai-style controls inside input
**Files**: `src/components/chat/chat-input-field.tsx` (modify)
**Pattern**: Claude.ai input — textarea + bottom toolbar inside a single rounded bordered container
**Changes**:
- Remove the standalone Brain icon button
- Wrap textarea + bottom toolbar in a single rounded bordered container (the border is on the outer wrapper, not the textarea)
- Layout inside container:
  - Top: textarea (borderless, transparent bg)
  - Bottom toolbar row: left side empty, right side has `"Sonnet 4.5"` text + `"Estendido"` text + `˅` chevron — all grouped together as `text-muted-foreground` plain text buttons. Send/Stop icon button at far right.
- Model selector: clicking `"Sonnet 4.5 ˅"` opens a `Popover` with 3 options (Haiku/Sonnet/Opus) using `CLAUDE_MODEL_TIER_OPTIONS`
- Reasoning toggle: clicking `"Estendido"` toggles on/off. When active: normal text color. When inactive: `text-muted-foreground` with strikethrough or dimmed.
- New props: `modelTier`, `onModelTierChange`
**Verify**: UI renders correctly matching Claude.ai screenshot — model + reasoning grouped on right, popover opens/closes

### Step 4: Thread new props through `ChatBody` → `CampoEntradaChat`
**Files**: `src/components/chat/chat-body.tsx` (modify), `src/app/chat/[id]/page.tsx` (modify)
**Pattern**: Same prop-threading as `raciocinio`/`onRaciocinioChange`
**Changes**:
- `ChatBody`: add `modelTier`/`onModelTierChange` to props interface, pass to `CampoEntradaChat`
- `page.tsx`: add `modelTier` state with localStorage persistence (key: `"chatModelTier"`, default: `"sonnet"`), pass to both `useChatAssistant` and `ChatBody`
**Verify**: Full flow works: select model → send message → API uses chosen model

### Step 5: Update `ChatWidget` (embedded modal) if it uses the same controls
**Files**: `src/components/chat/chat-widget.tsx` (modify, if needed)
**Changes**:
- Check if ChatWidget passes reasoning/model props — if so, add modelTier threading
- If ChatWidget doesn't expose these controls, skip this step
**Verify**: Embedded chat widget still functional

## New Files
- None — all changes are modifications to existing files

## Verification Plan
- Build: `npx tsc --noEmit && npm run lint` → succeeds
- Tests: `npm run test` → all pass
- Manual:
  1. Open `/chat` → see "Sonnet" + "Estendido" controls inside textarea
  2. Click model name → popover shows Haiku/Sonnet/Opus → select Opus → button updates
  3. Toggle "Estendido" on/off → visual state changes
  4. Send message with Opus + Estendido → verify API receives `modelTier: "opus"` + `raciocinio: true`
  5. Reload page → model and reasoning preferences persist from localStorage
  6. Send message without selecting model → falls back to Sonnet default

## Risks
- **UI clutter on mobile** (Med) — Model name + reasoning text inside input may crowd small screens. Mitigation: use short labels, responsive text sizing.
- **ChatWidget divergence** (Low) — Embedded widget may need same controls. Mitigation: Step 5 handles this.
