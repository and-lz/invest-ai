# Market Analysis Toggle — Chat

## Context

### Goal

Adicionar um toggle no toolbar do chat que, quando ativo, habilita a Fortuna a buscar informações de mercado em tempo real via web search antes de responder. Isso permite análises contextualizadas com dados atuais (SELIC, inflação, performance de setores, cenário macro, notícias) que vão além dos dados pessoais do usuário importados no app.

O estado do toggle é persistido por conversa (salvo no JSON da conversa). Quando ativo, o resultado da busca web é injetado no system prompt como contexto de mercado, e a IA menciona nas respostas que está usando dados atualizados.

---

### Acceptance Criteria

- [ ] Toggle "Mercado" aparece na toolbar do input (ao lado do toggle "Extendido"), com ícone e label
- [ ] Toggle ativo: visual diferente (mesmo padrão do toggle "Extendido": `bg-primary/15 text-primary`)
- [ ] Estado persiste por conversa: salvo no campo `modoMercado` no JSON da conversa
- [ ] Ao restaurar conversa com `modoMercado: true`, toggle inicia ativo
- [ ] Quando ativo, API route faz busca web antes de chamar o Claude
- [ ] Resultado da busca é injetado no system prompt como bloco `CONTEXTO DE MERCADO ATUAL:`
- [ ] Quando ativo e com resultados, a resposta inclui disclaimer sobre dados de mercado (instrução no system prompt — a IA menciona naturalmente)
- [ ] Quando ativo mas busca falha (API indisponível, sem chave), a conversa continua normalmente sem o contexto de mercado (silent fail — sem interromper o fluxo)
- [ ] `TAVILY_API_KEY` configurada em `.env.local` e `.env.example`
- [ ] Busca realizada server-side via fetch nativo (sem novo pacote npm)

---

### Out of Scope

- Pré-definir tópicos de mercado fixos (o contexto é dinâmico, gerado a partir da mensagem do usuário)
- Cancelamento de busca em andamento
- Cache de resultados de busca
- Indicador de loading específico para a busca web no cliente (não há feedback visual separado — o usuário já vê o streaming iniciando)
- Limite de rate / billing do Tavily

---

### Edge Cases

- **API key ausente**: `TAVILY_API_KEY` não configurada → busca é ignorada silenciosamente, conversa continua sem contexto de mercado
- **Tavily retorna erro HTTP**: Log server-side, continua sem contexto de mercado
- **Resultado de busca muito longo**: Truncar a 3.000 chars antes de injetar no prompt (dentro do limite de 15.000 do contexto atual)
- **Toggle ativo + conversa sem mensagens**: Toggle pode ser ativado antes de enviar a primeira mensagem — comportamento normal
- **Toggle ativo durante streaming**: Desabilitado visualmente durante `estaTransmitindo` (mesmo padrão do toggle "Extendido")
- **Conversa antiga sem campo `modoMercado`**: Campo é optional com default `false` — backward compatible
- **Busca sem resultados relevantes**: Tavily retorna lista vazia → não injeta bloco de mercado, continua normalmente

---

### Q&A Record

- Q: O que exatamente a IA faz no modo mercado? → A: Busca web em tempo real via API externa (Tavily) antes de cada resposta
- Q: Onde aparece o toggle na UI? → A: Toolbar do chat widget (ao lado do toggle "Extendido")
- Q: O estado persiste entre conversas? → A: Por conversa — salvo no JSON da conversa, campo `modoMercado: boolean`
- Q: O que muda visualmente? → A: Ícone/badge do toggle muda de estado + a IA inclui disclaimer nas respostas quando usa dados de mercado

---

### Decisions & Rationale

- **Tavily via fetch nativo** (sem `@tavily/core`) — o projeto usa fetch nativo em todo lugar e evita dependências desnecessárias. A API do Tavily é simples REST, uma chamada `POST https://api.tavily.com/search` com JSON body.
- **Query gerada a partir da última mensagem do usuário** — abordagem mais simples e suficiente. Alternativa (gerar query via AI) adiciona latência e custo sem ganho proporcional para MVP.
- **Injeção no system prompt** (não como mensagem de sistema separada) — consistente com como o contexto de página é injetado hoje em `construirInstrucaoSistemaChat`.
- **Silent fail na busca** — o chat não pode quebrar por falha de API externa. Toast de erro seria intrusivo para algo que o usuário nem percebe acontecer.
- **`modoMercado` na conversa, não por mensagem** — o usuário ativa o modo para toda a conversa, não mensagem a mensagem. Mais simples e corresponde ao mental model do toggle.

---

### Codebase Analysis

#### Existing Patterns to Follow

- **Reasoning toggle** em `src/components/chat/chat-input-field.tsx:218-235` — botão toggle com `bg-primary/15 text-primary` quando ativo, `text-muted-foreground` quando inativo, usa `onPointerDown` para não tirar o foco do textarea. **Replicar exatamente este padrão para o toggle de mercado.**
- **Context injection** em `src/lib/build-chat-system-prompt.ts` — o contexto de página é injetado como bloco `DADOS DE CONTEXTO DA PAGINA:`. Criar bloco análogo `CONTEXTO DE MERCADO ATUAL:` antes desse bloco.
- **Request schema extension** em `src/schemas/chat.schema.ts` — `raciocinio?: z.boolean().optional()` já existe. Adicionar `modoMercado` com o mesmo padrão.
- **Conversation schema** em `src/schemas/conversation.schema.ts` — campo opcional backward compatible (como `pensamento?: string` em `MensagemChatSchema`).
- **API route pattern** em `src/app/api/chat/route.ts` — carrega contexto antes de chamar o Claude. A busca web entra neste mesmo fluxo, após `requireAuth`, antes de `construirInstrucaoSistemaChat`.
- **Infrastructure service** em `src/infrastructure/services/brapi-market-data-service.ts` — fetch nativo, sem dependências externas, tratamento de erro explícito. Replicar estrutura para `web-search-service.ts`.

#### Reusable Code Found

- `serializarContextoCompletoUsuario` em `src/lib/serialize-full-user-context.ts` — padrão para serializar contexto e truncar. O contexto de mercado seguirá o mesmo padrão de truncagem (3.000 chars).
- `useChatAssistente` hook em `src/hooks/use-chat-assistant.ts` — já gerencia `raciocinio`, `modelTier` como estados. Adicionar `modoMercado` com o mesmo padrão.
- `ChatBody` em `src/components/chat/chat-body.tsx` — já passa `raciocinio` e `onRaciocinioChange` para `CampoEntradaChat`. Adicionar `modoMercado` e `onModoMercadoChange` no mesmo fluxo.

#### Affected Files

- `src/schemas/conversation.schema.ts` (modify) — adicionar `modoMercado: z.boolean().optional().default(false)`
- `src/schemas/chat.schema.ts` (modify) — adicionar `modoMercado: z.boolean().optional()` em `RequisicaoChatSchema`
- `src/infrastructure/services/web-search-service.ts` (create) — serviço de busca Tavily via fetch nativo
- `src/lib/build-chat-system-prompt.ts` (modify) — aceitar `marketContext?: string`, injetar bloco antes do contexto de página
- `src/app/api/chat/route.ts` (modify) — chamar busca web quando `modoMercado: true`, passar resultado para system prompt
- `src/hooks/use-chat-assistant.ts` (modify) — adicionar estado `modoMercado`, enviar no payload, persistir/restaurar por conversa
- `src/components/chat/chat-input-field.tsx` (modify) — adicionar props `modoMercado` + `onModoMercadoChange`, renderizar toggle
- `src/components/chat/chat-body.tsx` (modify) — passar `modoMercado` e `onModoMercadoChange` para `CampoEntradaChat`
- `.env.local` + `.env.example` (modify) — adicionar `TAVILY_API_KEY`

**Total: 9 arquivos (8 source + 1 env)** — dentro do limite, sem risco de scope explosion.

#### Risks

- **API key do Tavily não configurada em produção** (Med) — mitigação: silent fail, app continua funcionando. Documentar no `.env.example` com instrução clara.
- **Latência adicional por busca web** (Low) — Tavily típico: 200-800ms. O usuário já espera o streaming; o atraso adicional é imperceptível.
- **Custo de API** (Low) — plano free da Tavily: 1.000 requests/mês. Suficiente para MVP. Não há rate limiting implementado por ora (fora de escopo).
- **Resultados irrelevantes em queries de baixa qualidade** (Low) — mitigação: sem resultado útil, o bloco simplesmente não é injetado. A IA responde com conhecimento de treinamento.

### Dependencies

- **Tavily Search API** via fetch nativo (HTTP REST) — sem novo pacote npm
  - Endpoint: `POST https://api.tavily.com/search`
  - Auth: Bearer token (`TAVILY_API_KEY`)
  - Free tier: 1.000 req/mês
  - Status: **OK** — ativa, bem mantida, purpose-built para AI agents
  - Alternativa descartada: Brave Search (precisa de cartão de crédito; Tavily tem tier gratuito)

### Concurrent Work

- Solo project, sem branches em paralelo.

## Plan

### Steps

#### Step 1: Schema updates
**Files**: `src/schemas/conversation.schema.ts` (modify), `src/schemas/chat.schema.ts` (modify)
**Changes**:
- `ConversaSchema`: add `modoMercado: z.boolean().optional().default(false)`
- `AtualizarConversaSchema`: add `modoMercado: z.boolean().optional()`
- `RequisicaoChatSchema`: add `modoMercado: z.boolean().optional()`
**Verify**: `tsc --noEmit` passes

#### Step 2: Web search service
**Files**: `src/infrastructure/services/web-search-service.ts` (create), `.env.local`, `.env.example` (modify)
**Pattern**: Following `src/infrastructure/services/brapi-market-data-service.ts`
**Changes**:
- Create `buscarContextoMercado(query: string): Promise<string | null>` — Tavily REST via fetch
- Silent fail on missing key or API error; truncate result to 3000 chars
- Add `TAVILY_API_KEY` to env files
**Verify**: `tsc --noEmit`, null returned when key absent

#### Step 3: System prompt
**Files**: `src/lib/build-chat-system-prompt.ts` (modify)
**Changes**:
- Add `marketContext?: string` third param
- Inject `CONTEXTO DE MERCADO ATUAL:` block before page context when provided
**Verify**: `tsc --noEmit`

#### Step 4: API route
**Files**: `src/app/api/chat/route.ts` (modify)
**Changes**:
- Import `buscarContextoMercado`
- Destructure `modoMercado` from validated data
- Call search service when `modoMercado && mensagens.length > 0`
- Pass `marketContext` as third arg to `construirInstrucaoSistemaChat`
**Verify**: `tsc --noEmit`

#### Step 5: Persistence
**Files**: `src/lib/chat-persistence.ts` (modify)
**Changes**:
- `loadConversation` return type: add `modoMercado: boolean`
- `AutoSaveParams`: add `modoMercado: boolean`
- Include `modoMercado` in POST/PATCH bodies
**Verify**: `tsc --noEmit`

#### Step 6: Hook
**Files**: `src/hooks/use-chat-assistant.ts` (modify)
**Changes**:
- Add `modoMercado` state (default `false`), export `modoMercado` + `setModoMercado`
- `enviarMensagem`: add to API payload + deps
- `salvarConversaAutomaticamente`: pass `modoMercado` + add to deps
- `carregarConversa`: restore from loaded conversation
- `criarNovaConversa`: reset to `false`
**Verify**: `tsc --noEmit`

#### Step 7: UI
**Files**: `src/components/chat/chat-input-field.tsx` (modify), `src/components/chat/chat-body.tsx` (modify), `src/components/chat/chat-widget.tsx` (modify)
**Changes**:
- `CampoEntradaChat`: add `modoMercado?` + `onModoMercadoChange?` props; render toggle button with `aria-pressed`, same style as "Extendido"
- `ChatBody`: add same props, forward to `CampoEntradaChat`
- `ChatWidget`: destructure `modoMercado`, `setModoMercado` from hook, pass to `ChatBody`
**Verify**: `tsc --noEmit` + manual UI check

### Cross-Cutting Concerns
| Concern | Applies? | Action |
|---------|----------|--------|
| Security | Yes | API key server-side only; `modoMercado` validated as boolean by Zod |
| Performance | Yes | Tavily ~200-800ms latency; accepted for MVP |
| Accessibility | Yes | `aria-pressed` on toggle button (Step 7) |
| Observability | Yes | `console.log("[Chat] Modo mercado ativo")` in API route (Step 4) |
| Testing | N/A | Web search service is a thin fetch wrapper — no unit tests this cycle |
| Concurrency | N/A | Sequential within request handler |
| Memory | N/A | No long-lived objects |
| API contracts | Yes | All schema changes are optional fields — backward compatible |
| CI/CD | N/A | No new build steps |
| Documentation | N/A | Internal feature |
| Cross-platform | N/A | Web only |
| i18n | Yes | New string "Mercado" in PT-BR — consistent with "Extendido" label |

### Verification Plan
- Build: `tsc --noEmit` → clean
- Tests: `npm run test` → all pass
- Manual: toggle appears, persists per conversation, search fires when active, silent fail without API key

## Implementation

**Status**: Complete

### Step Results
- Step 1: Schema updates — Pass
- Step 2: Web search service + env — Pass
- Step 3: System prompt market context — Pass
- Step 4: API route modoMercado — Pass (minor fix: noEmit error on `mensagens[last]` possibly undefined → added `mensagens.length > 0` guard + non-null assertion)
- Step 5: Persistence save/restore — Pass
- Step 6: Hook modoMercado state — Pass
- Step 7: UI toggle + propagation — Pass (file had changed since Phase 1 read; adapted to current state without suggestions/chips)

### Final Verification
- Build: Pass — `tsc --noEmit` clean
- Tests: Pass — 749 tests, 43 files
- Manual: Pending (requires dev server + Tavily API key)

### Acceptance Criteria
- [x] Toggle "Mercado" aparece na toolbar do chat — rendered in `chat-input-field.tsx` before "Extendido"
- [x] Toggle ativo com visual `bg-primary/15 text-primary` — same pattern as reasoning toggle
- [x] Estado persiste por conversa (`modoMercado` in conversation JSON) — Steps 5+6
- [x] Restaura estado ao carregar conversa — `carregarConversa` sets `modoMercado` from loaded data
- [x] API route busca mercado quando ativo — Step 4
- [x] Contexto de mercado injetado no system prompt — Step 3
- [x] AI inclui disclaimer (instrução no system prompt) — natural incorporation instruction added
- [x] Silent fail sem API key — `buscarContextoMercado` returns null if `TAVILY_API_KEY` absent
- [x] `TAVILY_API_KEY` em `.env.example` e `.env.local` — Step 2
- [x] Busca via fetch nativo (sem novo pacote npm) — `web-search-service.ts` uses native fetch

## Post-Mortem

### What Went Well
- Dependency chain was correctly ordered: schemas → service → prompt → API → persistence → hook → UI
- Silent fail pattern for Tavily API was straightforward and kept the error surface minimal
- Existing `raciocinio` toggle was a perfect pattern to replicate exactly for `modoMercado`
- TypeScript caught the `mensagens[last]` undefined edge case cleanly at verification time

### What Went Wrong
- `chat-input-field.tsx` had changed significantly since Phase 1 read (suggestions/chips removed in a recent commit). The component was smaller than expected, which made the change simpler — no issue.

### Root Cause
Phase 1 read the file from a recent session; a subsequent commit (fix: quick reply chips blocking textarea) refactored the input field. Phase 1 context was slightly stale for that one file.

### What Was Missed
- Phase 1: File staleness on `chat-input-field.tsx` — could have run `git log` since Phase 1 date as the staleness check requires
- Phase 2: N/A — the plan adapted cleanly

### Lessons Learned
- Always run the staleness check on affected UI files between Phase 2 approval and Phase 3 start, especially for active components

### Cross-Cutting Concerns Review
- All concerns correctly identified in Phase 2
- `aria-pressed` accessibility was correctly flagged and implemented
