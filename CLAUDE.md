# Investimentos Dashboard - Convencoes do Projeto

## Stack
- Next.js 15 (App Router) + TypeScript strict
- shadcn/ui + Tailwind CSS v4 + Recharts
- Zod para validacao + types inferidos
- Vitest + Testing Library para testes
- Gemini API (Google AI SDK) para parsing PDF e insights

## Arquitetura (DDD Simplificado)
- `src/schemas/` - Zod schemas (fonte unica dos tipos)
- `src/domain/` - Value objects, interfaces, erros
- `src/infrastructure/` - Implementacoes (filesystem, Gemini API)
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
- Tarefas em background em `data/tasks/`

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
- TakeawayBox usa texto `text-muted-foreground` com icone colorido (`text-success`, `text-warning`) como indicador
- Valores negativos usam `text-destructive`, positivos `text-success` — apenas onde necessario
- Evitar cor em elementos decorativos ou informativos que nao exigem atencao imediata
- NUNCA usar cores Tailwind hardcoded (`text-green-600`, `bg-red-50`, etc.) — sempre usar variaveis semanticas

## Design System: Paleta Financeira OkLCH

### Filosofia
Paleta inspirada em private banking e wealth management: **luxo, sobriedade, estabilidade**.
Cores usam formato OkLCH (perceptualmente uniforme) — mesma lightness percebida independente do hue.

### Arquivo central: `src/app/globals.css`
Todas as cores sao definidas como CSS custom properties em `:root` (light) e `.dark` (dark).

### Paleta Dark Mode (navy-charcoal)
- Backgrounds: hue 250 (azul-marinho/charcoal), nao cinza puro
  - `--background: oklch(0.28 0.015 250)` — fundo principal
  - `--card: oklch(0.35 0.015 250)` — cards elevados (7% mais claro que bg)
  - `--sidebar: oklch(0.25 0.015 250)` — sidebar (mais escuro que bg)
  - `--secondary/muted: oklch(0.42 0.015 250)` — elementos secundarios
- Foreground: hue 80 (off-white quente, leve tom dourado)
  - `--foreground: oklch(0.92 0.01 80)` — texto principal
  - `--muted-foreground: oklch(0.65 0.015 250)` — texto secundario (slate)
- Borders: branco com tint azulado, 16-20% opacity

### Paleta Light Mode (branco com undertone azul)
- Backgrounds: hue 250 com lightness alta (branco quente com tint azulado sutil)
  - `--background: oklch(0.985 0.005 250)` — fundo principal
  - `--card: oklch(1 0 0)` — cards em branco puro
- Foreground: navy profundo (hue 250, 18% lightness)
  - `--foreground: oklch(0.18 0.015 250)` — texto principal

### Cores Semanticas
Registradas no `@theme inline` do Tailwind v4 — suporte nativo a `text-success`, `bg-destructive/10`, etc.

| Variavel | Light Mode | Dark Mode | Uso |
|----------|-----------|-----------|-----|
| `--success` | `oklch(0.42 0.12 165)` esmeralda | `oklch(0.65 0.10 165)` teal | Valores positivos, confirmacoes |
| `--destructive` | `oklch(0.50 0.16 20)` bordo | `oklch(0.65 0.12 20)` vinho suave | Valores negativos, erros, alertas |
| `--warning` | `oklch(0.52 0.12 75)` ouro | `oklch(0.70 0.10 75)` champagne | Alertas de atencao, pendencias |

### Regras de Uso de Cores
- NUNCA usar cores Tailwind hardcoded (`text-green-600`, `bg-red-50`, `border-red-200`)
- Sempre usar variaveis semanticas: `text-success`, `text-destructive`, `text-warning`
- Para backgrounds com opacidade: `bg-success/10`, `bg-destructive/5`, `border-warning/30`
- Cores de chart usam paleta dedicada (`--chart-1` a `--chart-5`) com hues complementares
- Saturacao (chroma) baixa nos elementos base (0.01-0.015), moderada nas semanticas (0.10-0.16)

### Charts
- Paleta de 5 cores com hues espacados: navy (250), teal (165), ouro (75), purpura (310), vinho (20)
- Dark mode: lightness 55-72%, chroma 0.10-0.14
- Light mode: lightness 45-60%, chroma 0.10-0.14

### Header Navigation
- Backdrop-blur com efeito frosted glass (`backdrop-blur-md backdrop-saturate-150`)
- Titulo em `font-serif` (Lora) para sensacao editorial/premium
- Navegacao ativa: underline sutil (`bg-foreground/60`) em vez de background preenchido
- Auto-hide no scroll para maximizar area de conteudo

## Typography System

### Font Families
- **Geist Sans** (`font-sans`) - Body text, UI elements, labels (default)
- **Inter** (base layer h1-h6) - All headings throughout the app
- **Lora** (`font-serif`) - Brand logo only (intentional distinction)
- **Geist Mono** (`font-mono`) - Code blocks, error messages, technical content

### Visual Hierarchy

#### Headings (Inter font family)
- **H1 - Page Titles**: `text-2xl font-bold tracking-tight`
  - Uso: Titulos principais de paginas (via componente `Header`)
  - Exemplo: "Dashboard", "Insights", "Importar Relatorio"

- **H2 - Section Titles**: `text-xl font-semibold tracking-tight`
  - Uso: Titulos de secoes principais dentro de uma pagina
  - Exemplo: Titulos de dialogs, titulos de stepper steps

- **H3 - Card/Component Titles**: `text-lg font-semibold`
  - Uso: Titulos de cards, titulos de tabelas (via `CardTitle`)
  - Exemplo: "Evolucao Patrimonial", "Top 5 Ativos"

#### Body Text (Geist Sans font family)
- **Labels/Navigation**: `text-sm font-medium`
  - Uso: Labels de formularios, links de navegacao, botoes, table headers
  - Consistencia: Sempre `font-medium` para elementos interativos ou de controle

- **Body/Descriptions**: `text-sm` (font-weight normal/400)
  - Uso: Descricoes de cards, paragrafos, conteudo de tabelas
  - Consistencia: Peso normal para conteudo de leitura

- **Helper Text**: `text-xs text-muted-foreground`
  - Uso: Tooltips, hints, badges, timestamps, footnotes
  - Consistencia: Sempre usar `text-muted-foreground` para reduzir hierarquia visual

#### Monospace (Geist Mono font family)
- **Code/Technical**: `text-xs font-mono`
  - Uso: Mensagens de erro, blocos de codigo, IDs tecnicos
  - Exemplo: Stack traces, JSON display

### Typography Principles
1. **Consistencia de peso por tamanho**: Elementos do mesmo tamanho devem usar o mesmo peso em contextos similares
2. **Tracking tight para headings**: `tracking-tight` em h1 e h2 melhora legibilidade em titulos grandes
3. **Evitar tracking em body text**: Texto corrido nao deve ter letter-spacing customizado
4. **Font-medium para controles**: Botoes, labels, navigation sempre usam `font-medium` para destaque
5. **Brand exception**: Logo usa `font-serif` como elemento de identidade visual (unica excecao a regra de headings)

### Usage Guidelines
- NUNCA misturar diferentes pesos para o mesmo tamanho de texto em contextos similares
- NUNCA usar `font-bold` em elementos de UI pequenos (text-sm ou menor)
- SEMPRE usar `tracking-tight` em h1 e h2 para melhor legibilidade
- SEMPRE usar `text-muted-foreground` em helper text para hierarquia visual
- O logo `font-serif` e a UNICA excecao permitida ao sistema de headings

## Background Tasks Pattern (Fire-and-Forget)

Operacoes longas (upload PDF, geracao de insights via Gemini) usam fire-and-forget para nao bloquear a UI.

### Fluxo
1. API route valida request, cria tarefa em `data/tasks/{uuid}.json`, retorna `202 Accepted`
2. Processamento continua em background via `void asyncFunction()` no event loop do Node.js
3. Frontend salva `identificadorTarefa` no `localStorage` e navega normalmente
4. `IndicadorTarefaAtiva` no header faz polling via SWR (2s) e exibe toast ao concluir/falhar

### Arquivos-chave
- `src/lib/tarefa-background.ts` — Schema Zod + `salvarTarefa()` / `lerTarefa()`
- `src/app/api/tasks/[taskId]/route.ts` — GET para polling de status
- `src/hooks/use-tarefa-background.ts` — SWR hook com polling condicional
- `src/components/layout/indicador-tarefa-ativa.tsx` — Componente global no header
  - Exporta `adicionarTarefaAtivaNoStorage()` para outros componentes

### Tipos de tarefa
- `upload-pdf` — Processamento de PDF via Gemini
- `gerar-insights` — Insights mensais via Gemini
- `gerar-insights-consolidados` — Insights consolidados via Gemini

### Comunicacao entre componentes
- `localStorage("tarefasAtivas")` — Array de IDs de tarefas ativas
- Evento `tarefa-ativa-adicionada` — Notifica header quando nova tarefa e criada
- Evento `tarefa-background-concluida` — Notifica paginas para recarregar dados

### Decisoes de design
- Fire-and-forget em vez de job queue: Node.js mantem promises vivas apos enviar response
- Sem retry automatico: usuario pode re-tentar manualmente (uso esporadico)
- Timeout de 5 minutos: tarefas "processando" por mais de 5min sao consideradas falhas
- Sem cancel: operacoes de 30-60s nao justificam cancelamento
- `next/after` nao disponivel no Next.js 15.5.12 instalado

## Notification Center Pattern

Central de notificacoes persistente: todos os toasts sao salvos server-side e podem ser revisitados via drawer no header.

### Fluxo
1. Componente chama `notificar.success()` (wrapper de `toast()`)
2. Toast exibe normalmente + fire-and-forget `POST /api/notifications`
3. Notificacao salva em `data/notifications/index.json` (single file, FIFO 50 max)
4. Hook `useNotificacoes` revalida via evento customizado `notificacao-criada`
5. Bell icon no header mostra badge com contagem de nao-lidas
6. Sheet drawer lateral direito lista historico com acoes

### Arquivos-chave
- `src/lib/notificacao.ts` — Schema Zod + CRUD filesystem (`listarNotificacoes`, `adicionarNotificacao`, etc.)
  - Exporta `CriarNotificacaoSchema` para validacao na API
- `src/lib/notificar.ts` — Wrapper: `notificar.success/error/warning/info()` = toast + POST
- `src/app/api/notifications/route.ts` — GET, POST, DELETE
- `src/app/api/notifications/[id]/route.ts` — PATCH (marcar como lida)
- `src/app/api/notifications/mark-all-read/route.ts` — PATCH (marcar todas como lidas)
- `src/hooks/use-notificacoes.ts` — SWR hook com optimistic updates + evento customizado
  - Exporta `dispararEventoNotificacaoCriada()` (usado pelo wrapper)
- `src/components/layout/central-notificacoes.tsx` — Sheet drawer no header com bell icon + badge

### Comunicacao entre componentes
- Evento `notificacao-criada` — Dispara revalidacao imediata do hook SWR
- Polling 30s como fallback (se evento nao funcionar)
- Optimistic updates em `marcarComoLida` e `limparTodas`

### Decisoes de design
- Storage server-side (filesystem) em vez de localStorage: persist cross-device, sem limite 5MB
- Single index file em vez de arquivo por notificacao: read-heavy workload, 50 items = ~50KB
- Wrapper `notificar()` em vez de monkey-patch: type-safe, explicito, migracao gradual
- Silent fail na persistencia: toast SEMPRE exibe, mesmo se API falhar
- FIFO queue: notificacao 51 remove a mais antiga automaticamente

### Uso do wrapper notificar
```typescript
import { notificar } from "@/lib/notificar";

notificar.success("Titulo", {
  description: "Descricao opcional",
  actionUrl: "/rota-destino",      // Botao no drawer
  actionLabel: "Ver resultado",    // Rotulo do botao
  action: { label: "...", onClick: () => {} },  // Acao do toast Sonner
});
```

# Reports

All changes to the report JSON structure must be backward compatible. New fields should be optional with sensible defaults so that previously generated reports remain valid and functional.