# Plan: Chat Error Handling

**Context**: [chat-error-handling-context.md](./chat-error-handling-context.md)

## Steps

### Step 1: Delete conversation — toast on failure
**Files**: `src/components/chat/conversations-list.tsx` (modify)
**Pattern**: Following `notificar.error()` usage across the app
**Changes**:
- Import `notificar` from `@/lib/notifier`
- In `handleDeletar` catch block, call `notificar.error("Erro ao excluir conversa", { description: "Tente novamente." })`
- Error is already caught and swallowed — just add the toast call
**Verify**: Delete a conversation while API is down → error toast appears, list rolls back

### Step 2: Auto-save — warning toast after 3 consecutive failures
**Files**: `src/hooks/use-chat-assistant.ts` (modify)
**Changes**:
- Add `autoSaveFailCountRef = useRef(0)` to track consecutive failures
- In `salvarConversaAutomaticamente` catch block: increment counter, if `>= 3` call `notificar.warning("Conversa não salva", { description: "Suas mensagens podem não ser preservadas." })`
- On success: reset counter to 0
- Reset counter to 0 in `criarNovaConversa` and `carregarConversa` (conversation change)
**Verify**: Simulate 3 consecutive auto-save failures → warning toast appears on 3rd failure; success resets counter

### Step 3: Title generation + load conversation — toast on failure
**Files**: `src/hooks/use-chat-assistant.ts` (modify)
**Changes**:
- In `gerarTituloInteligente` catch block: call `notificar.info("Não foi possível gerar título da conversa")`
- In `carregarConversa` catch block (after existing `setErro`): call `notificar.error("Erro ao carregar conversa")`
- Import `notificar` from `@/lib/notifier`
**Verify**: Force title API failure → info toast; force load API failure → error toast + inline error state

### Step 4: Stop re-throwing in useConversas
**Files**: `src/hooks/use-conversations.ts` (modify)
**Changes**:
- In `deletarConversa` catch block: remove `throw erro` — caller (`ListaConversas`) now handles feedback via toast
- Keep `console.error` for debugging
**Verify**: `tsc --noEmit` passes; delete failure no longer causes unhandled promise rejection in console

## New Files
None.

## Verification Plan
- Build: `npx tsc --noEmit` → succeeds
- Lint: `npm run lint` → passes
- Tests: `npm run test` → all pass
- Manual: Open chat → delete conversation with network blocked → toast appears, list rolls back
- Manual: Send message with auto-save endpoint blocked → after 3 messages, warning toast appears
- Manual: Check that successful operations show no toasts (no regression)

## Risks
- Auto-save toast spam (Low) — 3-failure threshold + reset on success mitigates
- Title toast annoyance (Low) — `notificar.info` is the most subtle level
