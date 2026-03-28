# Plan: Inject User Portfolio Data into Chat AI Context

**Context**: [chat-portfolio-context-context.md](./chat-portfolio-context-context.md)

## Steps

### Step 1: Add comprehensive portfolio serializer
**Files**: `src/lib/serialize-chat-context.ts` (modify)
**Pattern**: Following existing `serializarContextoDashboard()` at same file
**Changes**:
- Add `serializarContextoCompletoUsuario(dados: DashboardData): string` that serializes ALL DashboardData fields currently skipped:
  - `todasPosicoes` — all asset positions (compact: name, ticker, strategy, balance, monthly return, participation)
  - `evolucaoPatrimonial` — historical wealth evolution (all months)
  - `eventosRecentes` — recent financial events (type, asset, value, date)
  - `movimentacoes` — transactions (compact: date, type, asset, value)
  - `faixasLiquidez` — liquidity ladder
  - `retornosMensais` — monthly returns heatmap data
  - `comparacaoPeriodos` — multi-period performance comparison
  - `rentabilidadePorCategoria` — returns by asset category
- Includes everything from `serializarContextoDashboard` plus the missing fields
- Uses same markdown format and `truncar()` function (15K char limit)
- Prioritizes most recent data when truncating
**Verify**: `tsc --noEmit` passes

### Step 2: Modify chat API to load portfolio data server-side
**Files**: `src/app/api/chat/route.ts` (modify)
**Pattern**: Following `/api/dashboard/route.ts` for use case instantiation
**Changes**:
- When `contextoPagina` is absent/empty, call `obterGetDashboardDataUseCase()` and `executar()` to load dashboard data
- Serialize with `serializarContextoCompletoUsuario()`
- Pass serialized data as `contextoPagina` to system prompt builder
- Wrap in try/catch: if data loading fails, proceed without context (graceful degradation)
- When `contextoPagina` IS present (page already provided context), use it as-is (no regression)
**Verify**: `tsc --noEmit` passes; manual test: open `/chat`, ask "qual meu patrimonio?" → AI should answer with real data

### Step 3: Add tests for comprehensive serializer
**Files**: `__tests__/unit/lib/serialize-chat-context.test.ts` (modify)
**Pattern**: Following existing test patterns in same file
**Changes**:
- Add tests for `serializarContextoCompletoUsuario()`:
  - Given complete DashboardData → serializes all sections
  - Given DashboardData with empty arrays → handles gracefully
  - Given large dataset → truncates within limit
  - Given data → includes all positions, events, evolution, liquidity, returns
**Verify**: `npm run test -- serialize-chat-context` passes

## New Files
None — all changes to existing files.

## Verification Plan
- Build: `npx tsc --noEmit` → succeeds
- Lint: `npm run lint` → passes
- Tests: `npm run test -- serialize-chat-context` → all pass
- Manual: Open `/chat`, ask "qual meu patrimonio?" → AI answers with real portfolio data
- Manual: Open dashboard, open chat widget, ask same → uses page-specific context (no regression)

## Risks
- **Token bloat** (Medium) — `todasPosicoes` with 50+ assets + all months could hit 15K truncation. Mitigation: compact markdown format, truncation already in place.
- **Latency** (Low) — Extra ~100ms for dashboard data loading on first chat message. Mitigation: only when no `contextoPagina` is provided.
