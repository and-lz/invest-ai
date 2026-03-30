# Context: Per-Message Model & Reasoning Selection

## Requirements

### Goal
Move reasoning toggle and model tier selection from system/session-wide settings to per-message controls in the chat input area. Users should be able to pick the model and toggle reasoning for each individual message they send.

### Acceptance Criteria
- [ ] Model tier selector (Haiku/Sonnet/Opus) visible in the chat input row
- [ ] Reasoning toggle remains in the chat input row (already there)
- [ ] Each message sent includes the chosen model tier in the API request
- [ ] API route uses the per-request model tier instead of fetching from user settings DB
- [ ] Default model/reasoning values persist across page reloads (localStorage)
- [ ] Settings page model selector remains as the "global default" for non-chat AI features
- [ ] Existing conversations load and work correctly (backward compatible)

### Out of Scope
- Storing which model/reasoning was used per-message in the conversation history (metadata tracking)
- Changing model selection for non-chat AI features (insights, PDF extraction, etc.)
- Removing the settings page model tier selector

### Edge Cases
- User changes model mid-conversation → next message uses new model, previous messages unaffected
- User has no model preference in settings → defaults to Sonnet in chat input
- Streaming in progress → model selector should be disabled
- Mobile layout → model selector must fit without breaking the input row

## Q&A Record
- Q: How should the UI look? → A: Follow Claude.ai's input pattern — model name + "Estendido" toggle at the bottom-right inside the textarea container, with a dropdown chevron for model selection. No separate icon buttons.

## UI Reference (Claude.ai Code pattern)
```
┌──────────────────────────────────────────────────┐
│ Placeholder text...                              │
│                                                  │
│  [+]  Claude 3.7 Sonnet ⌕  Estendido ⊙           │
└──────────────────────────────────────────────────┘
```
- Model selector ("Claude 3.7 Sonnet ⌕") sits at bottom-left inside input, opens dropdown for Haiku/Sonnet/Opus
- Reasoning toggle ("Estendido ⊙") sits at bottom-right inside input, toggles on/off (⊙ when active, ○ when inactive)
- Both inline at input row baseline, no separate icon buttons
- Follows Claude.ai Code's compact, text-based control pattern

## Codebase Analysis

### Existing Patterns to Follow
- **Reasoning toggle pattern** — `src/app/chat/[id]/page.tsx:31-44` — localStorage persistence + state passed through ChatBody → CampoEntradaChat as prop. Model selector should follow the exact same pattern.
- **Model tier options** — `src/lib/model-tiers.ts:10-30` — `CLAUDE_MODEL_TIER_OPTIONS` array with value/label/description. Reuse this for the inline selector.
- **Chat request schema** — `src/schemas/chat.schema.ts:32-37` — `RequisicaoChatSchema` already has optional `raciocinio` field. Add optional `modelTier` similarly.

### Reusable Code Found
- `CLAUDE_MODEL_TIER_OPTIONS` at `src/lib/model-tiers.ts:10` — tier labels and icons for selector UI
- `resolveClaudeModelId()` at `src/lib/model-tiers.ts:35` — resolve tier to model ID (already used in API)
- `ClaudeModelTier` type at `src/lib/model-tiers.ts:6` — reuse for state typing
- `TIER_ICONS` mapping at `src/components/settings/model-tier-selector.tsx:13` — icons per tier (Zap/Cpu/Sparkles)

### Affected Files
- `src/schemas/chat.schema.ts` (modify) — Add optional `modelTier` field to `RequisicaoChatSchema`
- `src/app/api/chat/route.ts` (modify) — Use per-request model tier instead of DB lookup when provided
- `src/hooks/use-chat-assistant.ts` (modify) — Accept and pass `modelTier` option to API
- `src/components/chat/chat-input-field.tsx` (modify) — Add inline model tier selector next to Brain icon
- `src/components/chat/chat-body.tsx` (modify) — Thread `modelTier`/`onModelTierChange` props
- `src/app/chat/[id]/page.tsx` (modify) — Add modelTier state with localStorage persistence (same pattern as reasoning)

### Risks
- **UI clutter on mobile** (Med) — Model name + reasoning label inside input. Mitigation: abbreviate model names on small screens (e.g. "Sonnet" instead of "Sonnet 4.5").
- **Breaking existing API callers** (Low) — New field is optional with fallback to DB settings.
