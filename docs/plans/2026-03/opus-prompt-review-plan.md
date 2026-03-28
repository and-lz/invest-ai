# Plan: Opus Prompt Review — Align AI Prompts with Claude Opus 4.6

## Context
Claude Opus 4.6 is now the available model. All system prompts were written when Gemini was primary, with heavy-handed guardrails needed for smaller models. Gemini is being stripped from the project. This is the opportunity to:
1. Fix all Portuguese diacritics (accents) across prompts
2. Streamline instructions for Opus's superior instruction-following
3. Remove Gemini-specific sections (web search instructions)
4. Keep all functional behavior intact

## Steps

### Step 1: `src/lib/build-chat-system-prompt.ts` — Main chat prompt
**The biggest and most impactful file.**

Changes:
- Fix all missing accents in `DESCRICOES_PAGINA` and the system prompt string
- Remove the entire `PESQUISA WEB` section (lines 62-66) — Gemini-only feature
- Consolidate redundant NUNCA directives (8 occurrences) into a single "Evite:" list
- Remove "ULTRA SUCINTO" / "ZERO preâmbulo" repetition — replace with one clear conciseness directive
- Keep: persona, opinionated stance, markdown rules, highlighting, suggestions format

### Step 2: `src/lib/asset-analysis-prompt.ts` — Asset analysis
Changes:
- Fix all missing accents in `SYSTEM_PROMPT_ANALISE_ATIVO` and `EXEMPLO_SAIDA_ANALISE_ATIVO`
- Streamline DIRETRIZES — remove "ULTRA SUCINTO" repetition, keep one conciseness line
- Keep: all 7 analysis directives, enum values, JSON schema requirement

### Step 3: `src/lib/insights-prompts.ts` — Insights generation
Changes:
- Fix accents in both `SYSTEM_PROMPT_INSIGHTS` and `SYSTEM_PROMPT_INSIGHTS_CONSOLIDADO`
- Streamline: both prompts share ~80% text — remove repeated "ULTRA SUCINTO" and "zero enrolação"
- Keep: all analytical directives, JSON format, concluida=false rule

### Step 4: `src/lib/manual-extraction-prompt.ts` — PDF extraction
Changes:
- Fix accents in `SYSTEM_PROMPT_EXTRACAO`
- Minimal prompt changes — extraction needs precision, not creativity. Temperature 0.1 stays.
- Keep: all 12 extraction rules (these are functional, not guardrails)

### Step 5: `src/lib/explain-conclusion-prompt.ts` — Conclusion explanations
Changes:
- Fix accents in `SYSTEM_PROMPT_EXPLANATION`
- Tighten slightly — remove redundant phrasing
- Keep: educational tone, 200-char limit, JSON format, example

### Step 6: `src/lib/enrich-action-prompt.ts` — Action plan enrichment
Changes:
- Fix accents in `SYSTEM_PROMPT_ENRIQUECER_ACAO`
- Tighten "TOM DE VOZ" section — Opus doesn't need "NUNCA comece com X, Y, Z" lists
- Keep: conversational friend tone, character limits, JSON format, example

### Step 7: `src/app/api/chat/suggestions/route.ts` — Inline suggestions prompt
Changes:
- Fix accents in the inline `SYSTEM_PROMPT`
- Minor — prompt is already concise

### Step 8: `src/lib/background-task-executor.ts` — Error messages
Changes:
- Fix Gemini-specific error messages to be provider-agnostic (reference "IA" instead of "Gemini")

### Step 9: Verify
- `tsc --noEmit` — type check
- `npm run lint` — lint
- `npm run test` — tests pass

## Files Modified
| File | Change type |
|------|------------|
| `src/lib/build-chat-system-prompt.ts` | Fix accents, remove web search, streamline |
| `src/lib/asset-analysis-prompt.ts` | Fix accents, streamline |
| `src/lib/insights-prompts.ts` | Fix accents, streamline |
| `src/lib/manual-extraction-prompt.ts` | Fix accents |
| `src/lib/explain-conclusion-prompt.ts` | Fix accents, tighten |
| `src/lib/enrich-action-prompt.ts` | Fix accents, tighten |
| `src/app/api/chat/suggestions/route.ts` | Fix accents |
| `src/lib/background-task-executor.ts` | Provider-agnostic error messages |

## Verification
1. `npx tsc --noEmit` passes
2. `npm run lint` passes
3. `npm run test` passes
4. Manual: open chat, send a message, verify response quality unchanged
