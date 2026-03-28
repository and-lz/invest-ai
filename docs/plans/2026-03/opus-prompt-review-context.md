# Context: Opus Prompt Review — Align AI Prompts with Claude Opus 4.6

## Requirements

### Goal
Now that Claude Opus 4.6 is available as the primary AI model (via local proxy), review and optimize all system prompts and LLM instructions to leverage Opus's superior reasoning, nuance, and instruction-following capabilities. Also fix Portuguese text (missing accents/diacritics) across all prompts.

### Acceptance Criteria
- [ ] All Portuguese text in prompts uses correct diacritics (á, é, í, ó, ú, ã, õ, ê, ç, etc.)
- [ ] Prompts are streamlined — remove redundant guardrails that Opus doesn't need (it follows instructions better than smaller models)
- [ ] Remove overly defensive instructions (Opus doesn't need "ULTRA SUCINTO" repeated, "ZERO enrolação" etc. — one clear directive suffices)
- [ ] Leverage Opus's strengths: deeper reasoning, nuanced analysis, better structured output
- [ ] Maintain prompt intent and behavior — no functional regressions
- [ ] Temperature settings reviewed for Opus characteristics
- [ ] Model tier descriptions updated if needed

### Out of Scope
- Changing AI provider infrastructure/architecture (beyond prompt text)
- Adding new features or prompt capabilities
- Modifying Zod schemas or JSON output formats

### Edge Cases
- Users on Haiku/Sonnet tiers still use the same prompts → simplification must work for all tiers

### Additional Context
- Gemini is being stripped from the project — prompts no longer need to accommodate Gemini's quirks or limitations. Can optimize purely for Claude.

## Q&A Record
- Q: Should Portuguese accents be fixed? → A: Yes, all texts must use correct Portuguese with proper accents

## Codebase Analysis

### Affected Files

#### System Prompts (modify — fix accents + optimize for Opus)
1. `src/lib/build-chat-system-prompt.ts` — Main chat system prompt. Missing accents throughout (e.g., "Voce" → "Você", "analise" → "análise", "açoes" → "ações"). Heavy-handed repetition ("ULTRA SUCINTO", "ZERO preâmbulo", "NUNCA" x8).
2. `src/lib/asset-analysis-prompt.ts` — Asset analysis prompt. Missing accents. Same over-instruction pattern.
3. `src/lib/insights-prompts.ts` — Insights + consolidated insights. Missing accents. Repetitive guidelines.
4. `src/lib/manual-extraction-prompt.ts` — PDF extraction. Missing accents. Temperature 0.1 is fine for extraction.
5. `src/lib/explain-conclusion-prompt.ts` — Conclusion explanations. Missing accents. Reasonable prompt structure.
6. `src/lib/enrich-action-prompt.ts` — Action plan enrichment. Missing accents. Good tone guidance, could be tightened.
7. `src/app/api/chat/suggestions/route.ts` — Inline suggestions prompt. Missing accents. Simple, mostly fine.

#### Model Configuration (review)
8. `src/lib/model-tiers.ts` — Model tier definitions. Accents present (uses `rápido`, `análises`). Model IDs correct. Sonnet default is `claude-sonnet-4-5` — verify if should be `claude-sonnet-4-6`.

#### Page Descriptions (modify — fix accents)
9. `src/lib/build-chat-system-prompt.ts:4-16` — `DESCRICOES_PAGINA` record has missing accents throughout.

### Existing Patterns to Follow
- Prompts are plain string literals or template literals — see `build-chat-system-prompt.ts:27`
- Portuguese throughout, but identifiers in English
- All prompts share common directives: succinct, opinionated, PT-BR, JSON format

### Reusable Code Found
- No reusable utilities needed — this is a text-content-only change

### Risks
- **Prompt regression** (Medium) — Simplified prompts might produce different output quality. Mitigation: keep core behavioral directives, only remove redundancy
- **Gemini compatibility** (Low) — Prompts are provider-agnostic strings. No structural changes needed
- **Over-simplification** (Medium) — Removing too many guardrails could make lower-tier models (Haiku) produce worse output. Mitigation: keep essential directives, only remove repetitive ones

## Key Observations for Opus Optimization

### What to fix (accents)
Every prompt file has systematic missing diacritics: `Voce` → `Você`, `analise` → `análise`, `acoes` → `ações`, `financeiro` → `financeiro` (correct), `recomendacoes` → `recomendações`, `diversificacao` → `diversificação`, `posicao` → `posição`, etc.

### What to simplify (Opus doesn't need hand-holding)
1. **Repeated emphasis**: "ULTRA SUCINTO" appears in 3+ prompts, often alongside "zero enrolação", "cada frase deve carregar informação nova". One clear directive is enough for Opus.
2. **Excessive NUNCA/NEVER**: Chat prompt has 8+ NUNCA directives. Opus follows negative instructions well — consolidate into a single "avoid" section.
3. **Redundant formatting rules**: Opus understands markdown natively — detailed "use **bold** for X" instructions can be trimmed.
4. **Over-specified examples**: Opus can infer format from schema alone — verbose examples can be shortened.

### What to keep/enhance
1. **Domain expertise framing**: "Você é um analista..." — keeps the persona strong
2. **Behavioral directives**: Opinionated, data-driven, no disclaimers — these are functional requirements
3. **JSON schema references**: Critical for structured output
4. **Temperature settings**: 0.1 for extraction, 0.4 for explanations, 0.7 for chat — reasonable spread
5. **Highlighting rules**: Functional specification, not model-capability guidance

### Model ID check
- `claude-sonnet-4-5` — Should verify if 4-6 variant exists. Current `claude-opus-4-6` is correct.
- `claude-haiku-4-5` — Correct as latest Haiku.
