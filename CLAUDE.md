# Investimentos Dashboard - Convencoes do Projeto

## Stack
- Next.js 15 (App Router) + TypeScript strict
- shadcn/ui + Tailwind CSS v4 + Recharts
- Zod para validacao + types inferidos
- Vitest + Testing Library para testes
- Claude API (Anthropic SDK) para parsing PDF e insights

## Arquitetura (DDD Simplificado)
- `src/schemas/` - Zod schemas (fonte unica dos tipos)
- `src/domain/` - Value objects, interfaces, erros
- `src/infrastructure/` - Implementacoes (filesystem, Claude API)
- `src/application/use-cases/` - Orquestracao de logica
- `src/app/api/` - API Routes
- `src/components/` - UI (dashboard, layout, upload, insights)
- `src/hooks/` - React hooks customizados
- `src/lib/` - Utilitarios e configuracao

## Padroes
- Valores monetarios em centavos (inteiros) para evitar float
- Nomes de variaveis verbosos em portugues
- NUNCA usar `any` - usar tipos Zod inferidos
- Schemas Zod sao a fonte unica de verdade dos tipos TypeScript
- Use cases recebem interfaces (inversao de dependencia)
- Componentes de UI recebem dados via props tipadas

## Comandos
- `npm run dev` - desenvolvimento
- `npm run build` - build producao
- `npm run test` - rodar testes
- `npm run lint` - verificar lint
- `npm run format` - formatar codigo

## Storage
- PDFs em `data/reports/`
- JSON extraido em `data/extracted/`
- Insights em `data/insights/`

# Testing Strategy

## Overview
- Test framework: Vitest
- Environment: Node (jsdom not used due to ESM incompatibilities)
- Setup: `__tests__/setup.ts`
- Pattern: Unit tests for domain logic, application use cases, and utilities
- NEVER test mocks - test real business logic and transformations

## Test Coverage

### ✅ Domain Value Objects (27 tests)
**Location:** `__tests__/unit/domain/`

#### Money Value Object (18 tests)
- **File:** `money.test.ts`
- **Coverage:**
  - `formatarMoeda()` - BRL formatting with locale (4 tests)
  - `formatarMoedaCompacta()` - Compact format (M, k, normal) (3 tests)
  - `somarMoney()` - Addition with edge cases (4 tests)
  - `subtrairMoney()` - Subtraction with negatives (4 tests)
  - `centavosParaReais()` - Cents to reals conversion (1 test)
  - `reaisParaCentavos()` - Reals to cents with rounding (2 tests)
- **Value:** Catches localization bugs, floating-point issues, format boundaries

#### Percentage Value Object (9 tests)
- **File:** `percentage.test.ts`
- **Coverage:**
  - `formatarPercentual()` - Locale-aware percentage formatting (3 tests)
  - `formatarPercentualSimples()` - Simple string formatting (3 tests)
  - `calcularVariacaoPercentual()` - Percentage change calculation (3 tests)
- **Value:** Verifies i18n, mathematical accuracy, edge case handling

### ✅ Date/Time Utilities (48 tests)
**Location:** `__tests__/unit/lib/format-date.test.ts`

**Coverage:**
- `formatarMesAno()` - Format YYYY-MM to extenso/abreviado/compacto (10 tests)
- `formatarDataBrasileira()` - ISO to DD/MM/YYYY conversion (4 tests)
- `formatarTimestampBrasileiro()` - ISO timestamp to DD/MM/YYYY HH:MM (5 tests)
- `converterParaISO()` - DD/MM/YYYY to ISO conversion (4 tests)
- `obterMesAnterior()` - Month navigation with year wrapping (6 tests)
- `validarMesAno()` - Regex validation of YYYY-MM format (12 tests)
- Round-trip conversions and multi-step navigation (3 tests)

**Value:** Foundation for all time-based features, catches year boundary issues

### ✅ Application Use Cases (22 tests)
**Location:** `__tests__/unit/application/`

#### GetDashboardDataUseCase (22 tests)
- **File:** `get-dashboard-data.test.ts`
- **Coverage:**
  - No reports scenario (2 tests)
  - Single report processing (4 tests)
  - Multiple reports with sorting (4 tests)
  - Period selection filtering (3 tests)
  - Top 5 best performers ranking (2 tests)
  - Top 5 worst performers ranking (2 tests)
  - Complete data aggregation (3 tests)
- **Test Approach:**
  - Mock repository implementation
  - Comprehensive test data factories
  - Isolated testing of orchestration logic
- **Value:** Ensures core dashboard aggregation works correctly across all scenarios

## Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- format-date

# Watch mode (development)
npm run test:watch

# With coverage (requires @vitest/coverage-v8)
npm run test:coverage
```

## Test Data Patterns

All tests use realistic data factories that create valid domain objects:
- Money values in centavos (integer cents)
- Dates in YYYY-MM-DD and YYYY-MM formats
- Portuguese locale formatting
- Zod schema-validated data structures

## Quality Metrics

| Category | Test Files | Tests | Quality |
|----------|-----------|-------|---------|
| Domain Value Objects | 2 | 27 | ✅ High - Tests real business logic |
| Date/Time Utilities | 1 | 48 | ✅ High - Tests edge cases and boundaries |
| Application Use Cases | 1 | 22 | ✅ High - Tests orchestration logic |
| Glossario Financeiro | 1 | 84 | ✅ High - Tests schema alignment and content |
| **TOTAL** | **5** | **181** | ✅ All meaningful tests |

## Priority for Additional Tests

1. **Validation Use Cases** (Medium Priority)
   - `SalvarRelatorioManualUseCase` - JSON validation
   - `SalvarInsightsManualUseCase` - Schema validation

2. **Infrastructure Services** (Lower Priority)
   - `ClaudeInsightsService` - JSON extraction
   - `ClaudePdfExtractionService` - API integration

3. **Components** (Not Recommended)
   - Skip UI component testing (fragile, low ROI)
   - Focus on integration tests for workflows instead

## Important Testing Guidelines

- ✅ Test actual implementation, not mocks
- ✅ Test edge cases and boundaries
- ✅ Test error handling and validation
- ✅ Use Zod schemas as single source of truth for test data
- ✅ Create reusable test data factories for complex objects
- ✅ Mock external dependencies (APIs, file system) via interfaces
- ❌ Never test mock behavior
- ❌ Don't test library code (shadcn/ui, Zod, Vitest)
- ❌ Don't add tests for unused/stub functions

## Educational Tooltips Pattern
- Glossario de termos financeiros: `src/lib/glossario-financeiro.ts`
- Componente InfoTooltip: `src/components/ui/info-tooltip.tsx`
- Uso: `<InfoTooltip conteudo={GLOSSARIO_XYZ.explicacao} />`
- Descricoes educacionais em graficos usam `<CardDescription>` com texto do glossario
- Todas as explicacoes assumem zero conhecimento sobre investimentos
- Estrategias e tipos de evento usam `Record<string, EntradaGlossario>` com chaves alinhadas aos Zod enums
- Testes: `__tests__/unit/lib/glossario-financeiro.test.ts` valida alinhamento com schemas

## Data-Driven Takeaways Pattern
- O usuario nao deve precisar interpretar graficos sozinho — o dashboard deve mostrar conclusoes automaticas
- Componente reutilizavel: `src/components/ui/takeaway-box.tsx` (`TakeawayBox`)
- Tipo `Conclusao`: `{ texto: string, tipo: "positivo" | "neutro" | "atencao" }`
- Padrao: funcao pura `gerarConclusaoXyz(dados)` que retorna `Conclusao[]`
- Uso: `<TakeawayBox conclusoes={conclusoes} />`
- Implementado em todos os cards do dashboard:
  - `benchmark-comparison-chart.tsx` — carteira vs CDI/Ibovespa/IPCA
  - `wealth-evolution-chart.tsx` — rendimentos acumulados e tendencia
  - `asset-allocation-chart.tsx` — concentracao e diversificacao
  - `top-performers-table.tsx` — melhor/pior ativo do mes
  - `strategy-gains-table.tsx` — melhor/pior estrategia do mes
  - `financial-events-list.tsx` — renda passiva total e tipo mais frequente

## 80/20 Color Rule
- Cor reservada para apenas 20% dos elementos: indicadores, CTAs, alertas urgentes
- Os outros 80% usam `text-muted-foreground` e tons neutros
- TakeawayBox usa texto `text-muted-foreground` com apenas um pequeno dot colorido (`h-2 w-2 rounded-full`) como indicador
- Valores negativos usam `text-red-600`, positivos `text-green-600` — apenas onde necessario
- Evitar cor em elementos decorativos ou informativos que nao exigem atencao imediata

# Reports

All changes to the report JSON structure must be backward compatible. New fields should be optional with sensible defaults so that previously generated reports remain valid and functional.