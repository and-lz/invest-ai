# Friendly Notifications — Fix JSON in explain-takeaway description

## Context
`explain-takeaway/route.ts` stores `JSON.stringify(explanations)` as `descricaoResultado`.
`background-task-executor.ts` passes `descricaoResultado` directly as the notification description.
`takeaway-box.tsx` NEEDS the JSON in `descricaoResultado` — it parses it to render explanations.
Result: notification center shows raw JSON (`{"0":"..."}`) instead of a human-readable message.

## Plan

### Step 1 — Add `mensagemNotificacao` to `ResultadoTarefaSucesso`
File: `src/lib/background-task-executor.ts`
- Add optional `mensagemNotificacao?: string` to the interface
- In the success notification, use `mensagemNotificacao ?? descricaoResultado` as description

### Step 2 — Set friendly message in explain-takeaway
File: `src/app/api/explain-takeaway/route.ts`
- On success: add `mensagemNotificacao: "Conclusões explicadas com sucesso"`
- On invalid_format: add `mensagemNotificacao: "Formato inesperado da IA"`

## Verification
- Notification description shows plain text, not JSON
- `takeaway-box.tsx` still works (parses `descricaoResultado` JSON correctly)
- No TypeScript errors
