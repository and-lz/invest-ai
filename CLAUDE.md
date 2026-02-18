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
- `npm run generate:icons` - gerar icones PWA a partir do SVG

## PWA (Progressive Web App)
- App instalavel no iOS/Android com `display: standalone` (sem UI do browser)
- `public/manifest.json` - Configuracao PWA (nome, icones, cores, orientacao)
- `public/sw.js` - Service Worker com cache Network-First
- `public/icon.svg` - Icone base vetorial (512x512)
- `scripts/gerar-icones-pwa.mjs` - Script para gerar PNGs (192, 512, 180 para Apple)
- `PwaRegistration` component - Registra Service Worker em producao
- Meta tags iOS: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`
- Cores tema: `#0d0c14` (dark) para statusbar translucent no iOS

## Metadata (Page Titles)
Todas as rotas tem titulos dinamicos no formato "[Pagina] | Investimentos":
- `/` - "Dashboard | Investimentos" (route group `(dashboard)`)
- `/auth/signin` - "Login | Investimentos"
- `/reports` - "Relatorios | Investimentos"
- `/insights` - "Insights | Investimentos"
- `/trends` - "Tendencias de Mercado | Investimentos"
- `/desempenho` - "Desempenho de Ativos | Investimentos"
- `/aprender` - "Centro de Aprendizado | Investimentos"
- `/aprender/glossario` - "Glossario Financeiro | Investimentos"
- `/aprender/[categoria]` - "[Titulo Categoria] | Investimentos" (dinamico via generateMetadata)
- `/aprender/[categoria]/[slug]` - "[Titulo Artigo] | Investimentos" (dinamico via generateMetadata)

Metadata e definida via layouts (Server Components) para permitir Client Components nas pages

## Autenticacao
- Auth.js v5 (NextAuth) com Google OAuth
- Sessoes JWT stateless (sem database)
- Middleware em `src/middleware.ts` protege todas as rotas
- Helper `requireAuth()` em `src/lib/auth-utils.ts` para API routes
- Configuracao em `src/auth.ts`
- Tipos estendidos em `src/types/next-auth.d.ts`
- User ID formato: `google_{sub}` (ex: `google_123456789`)

## Storage
- **Desenvolvimento**: Filesystem (`data/` directory) via `FilesystemReportRepository`
- **Producao (Vercel)**: Vercel Blob via `VercelBlobReportRepository`
- Switching automatico via `NODE_ENV` no container
- Isolamento por usuario: `{userId}/` prefix em todos os paths
- Interface abstrata: `FileManager` em `src/domain/interfaces/file-manager.ts`
- PDFs em `data/reports/` (local) ou `{userId}/reports/` (blob)
- JSON extraido em `data/extracted/` (local) ou `{userId}/extracted/` (blob)
- Insights em `data/insights/` (local) ou `{userId}/insights/` (blob)
- Conversas do chat em `data/conversations/{userId}/index.json` (local) ou `{userId}/conversations/index.json` (blob)
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

## Design System: Constants (DS Tokens)

Centralized constants in `src/lib/design-system.ts` — single source of truth for visual patterns.
ALWAYS use these constants instead of hardcoded Tailwind classes for typography, icons, layout, and interactions.
When creating new UI, ALWAYS check if a DS token exists before writing raw Tailwind classes.

### Usage
```typescript
import { typography, icon, layout, interaction, valueColor } from "@/lib/design-system";
// Or aggregate object:
import { ds } from "@/lib/design-system";
```

### Typography (`typography.*`)
| Token | Classes | Usage |
|-------|---------|-------|
| `h1` | `text-2xl font-bold tracking-tight` | Page titles |
| `h1Large` | `text-3xl font-bold tracking-tight` | Article titles |
| `h2` | `text-xl font-semibold tracking-tight` | Section titles, headers |
| `h3` | `text-lg font-semibold` | Card titles (CardTitle) |
| `mainValue` | `text-2xl font-bold` | Highlight numbers in summary cards |
| `label` | `text-sm font-medium` | Labels, nav, buttons, table headers |
| `body` | `text-sm` | Descriptions, paragraphs, content |
| `helper` | `text-xs text-muted-foreground` | Tooltips, timestamps, hints |
| `mono` | `text-xs font-mono` | Code, technical errors |
| `monoMedium` | `text-sm font-mono` | Larger code blocks |

### Icons (`icon.*`)
| Token | Classes | Usage |
|-------|---------|-------|
| `cardTitle` | `h-5 w-5` | Icon in CardHeader |
| `pageTitle` | `h-6 w-6` | Page header icon |
| `button` | `h-4 w-4` | Inline icon in button/input |
| `micro` | `h-3.5 w-3.5` | Small indicators, badges |
| `tiny` | `h-3 w-3` | Chart swatches, bullet points (non-interactive) |
| `emptyState` | `h-12 w-12 text-muted-foreground` | Centered large icon |
| `loadingSmall` | `h-4 w-4 animate-spin` | Inline loading |
| `loadingMedium` | `h-8 w-8 animate-spin` | Card/section loading |
| `loadingLarge` | `h-12 w-12 animate-spin` | Full page loading |

### Layout (`layout.*`)
| Token | Classes | Usage |
|-------|---------|-------|
| `pageSpacing` | `space-y-6` | Between page sections |
| `sectionSpacing` | `space-y-4` | Within sections |
| `gridCards` | `grid gap-4 md:grid-cols-2 lg:grid-cols-4` | Summary cards grid |
| `gridContent` | `grid gap-4 md:grid-cols-2 lg:grid-cols-3` | Content grid |
| `gridCharts` | `grid gap-6 lg:grid-cols-2` | Charts grid |
| `emptyState` | `flex flex-col items-center justify-center gap-3 p-6` | Empty state |
| `emptyStateCard` | `flex flex-col items-center gap-4 py-12` | Empty state in card |
| `pageHeader` | `flex items-center gap-3` | Header with icon + title |
| `cardContent` | `space-y-4 p-6` | Default CardContent padding |
| `cardTitleRow` | `flex items-center gap-1` | Card title row with icon + tooltip |

### Interaction (`interaction.*`)
| Token | Classes | Usage |
|-------|---------|-------|
| `cardHover` | `transition-all duration-200 hover:border-primary/30 hover:shadow-md` | Hoverable card |
| `hoverReveal` | `opacity-0 transition-opacity group-hover:opacity-100` | Element revealed on hover |

### Dialog (`dialog.*`)
| Token | Classes | Usage |
|-------|---------|-------|
| `backdrop` | `backdrop:bg-background/40` | Native `<dialog>` backdrop |

### Semantic color utilities
| Function | Returns | Usage |
|----------|---------|-------|
| `valueColor(n)` | `text-success` or `text-destructive` | Positive/negative values |
| `trendIconColor(n)` | semantic color or `text-muted-foreground` | Trend icon |
| `badgeColor(type)` | `bg-*/10 text-* border-*/30` | Semantic badge |

### Combining with extra classes
Use `cn()` from `@/lib/utils`:
```tsx
<h1 className={cn(typography.h1Large, "flex-1")}>Title</h1>
<Icon className={cn(icon.cardTitle, "text-muted-foreground")} />
<Card className={interaction.cardHover}>...</Card>
```

## Design System: Paleta Financeira OkLCH

### Filosofia
Paleta inspirada em private banking e wealth management: **luxo, sobriedade, estabilidade**.
Cores usam formato OkLCH (perceptualmente uniforme) — mesma lightness percebida independente do hue.

### Arquivo central: `src/app/globals.css`
Todas as cores sao definidas como CSS custom properties em `:root` (light) e `.dark` (dark).

### Paleta Dark Mode (Deep Backgrounds + Ultra Bright Colors)
**Filosofia:** Contraste maximo com backgrounds profundos e cores ultra vibrantes — legibilidade perfeita

- **Backgrounds:** Hue 250 (navy), quase preto para maxima profundidade
  - `--background: oklch(0.10 0.035 250)` — fundo principal (quase preto puro, dramatico)
  - `--card: oklch(0.18 0.035 250)` — cards elevados (8% mais claro, hierarquia clara)
  - `--popover: oklch(0.22 0.035 250)` — popovers flutuantes (12% mais claro)
  - `--sidebar: oklch(0.12 0.035 250)` — sidebar (ligeiramente mais escuro que bg)
  - `--secondary/muted: oklch(0.28 0.035 250)` — elementos secundarios

- **Foreground:** Branco puro + cores ultra brilhantes
  - `--foreground: oklch(1 0 0)` — texto principal (branco absoluto, contraste maximo)
  - `--muted-foreground: oklch(0.88 0.015 250)` — texto secundario (ultra claro)
  - `--primary: oklch(0.95 0.04 75)` — elementos interativos (gold radiante)

- **Borders:** Branco com tint navy, 40% opacity para maxima visibilidade
  - `--border: oklch(1 0.01 250 / 40%)`
  - `--ring: oklch(0.82 0.18 75)` — focus ring em ouro brilhante

### Paleta Light Mode (Warm White com Navy Accents)
**Filosofia:** Limpo, elegante, profissional — com sutis undertones quentes

- **Backgrounds:** Hue 75 (warm white), navy para contraste
  - `--background: oklch(0.98 0.008 75)` — fundo principal (branco quente)
  - `--card: oklch(1 0 0)` — cards em branco puro (maxima elevacao)
  - `--secondary/muted: oklch(0.95 0.008 250)` — elementos secundarios

- **Foreground:** Navy profundo enriquecido
  - `--foreground: oklch(0.16 0.025 250)` — texto principal (navy rico)
  - `--muted-foreground: oklch(0.48 0.025 250)` — texto secundario
  - `--primary: oklch(0.20 0.025 250)` — elementos interativos (navy)

### Cores Semanticas (Ultra Bright Maximum Contrast)
Registradas no `@theme inline` do Tailwind v4 — suporte nativo a `text-success`, `bg-destructive/10`, etc.

| Variavel | Light Mode | Dark Mode | Uso |
|----------|-----------|-----------|-----|
| `--success` | `oklch(0.40 0.14 165)` esmeralda rico | `oklch(0.82 0.20 165)` teal ultra vibrante | Valores positivos, confirmacoes |
| `--destructive` | `oklch(0.45 0.18 15)` burgundy profundo | `oklch(0.78 0.22 15)` wine neon | Valores negativos, erros, alertas |
| `--warning` | `oklch(0.50 0.14 75)` gold rico | `oklch(0.88 0.20 75)` gold radiante | Alertas de atencao, pendencias |

### Mesh Gradients (Background Depth)
- **Light mode:** Sutis gradientes navy + gold + teal (chroma 0.045-0.05, opacity 35-70%)
- **Dark mode:** Sutis gradientes sobre fundo profundo (chroma 0.07-0.08, opacity 20-40%, lightness 16-20%)
- **Efeito:** Layered depth, premium feel, subtle movement — contraste maximo mantido

### Regras de Uso de Cores
- NUNCA usar cores Tailwind hardcoded (`text-green-600`, `bg-red-50`, `border-red-200`)
- Sempre usar variaveis semanticas: `text-success`, `text-destructive`, `text-warning`
- Para backgrounds com opacidade: `bg-success/10`, `bg-destructive/5`, `border-warning/30`
- Cores de chart usam paleta dedicada (`--chart-1` a `--chart-5`) com hues complementares
- **Chroma strategy:** Base (0.02-0.025), Semantics (0.12-0.18), Charts (0.12-0.16)

### Charts (Ultra Bright)
Paleta de 5 cores com hues espacados: navy (250), teal (165), gold (75), purple (310), wine (15)

**Dark mode:** Lightness 80-88%, chroma 0.20-0.22 (ultra vibrantes, maxima visibilidade)
- `--chart-1: oklch(0.80 0.20 250)` navy radiante
- `--chart-2: oklch(0.84 0.20 165)` teal neon
- `--chart-3: oklch(0.88 0.20 75)` gold brilhante
- `--chart-4: oklch(0.82 0.22 310)` purple vibrante
- `--chart-5: oklch(0.80 0.20 15)` wine intenso

**Light mode:** Lightness 42-58%, chroma 0.12-0.16 (profundos, ricos)
- `--chart-1: oklch(0.42 0.14 250)` navy profundo
- `--chart-2: oklch(0.52 0.12 165)` teal escuro
- `--chart-3: oklch(0.58 0.14 75)` gold rico
- `--chart-4: oklch(0.48 0.16 310)` purple profundo
- `--chart-5: oklch(0.50 0.16 15)` wine escuro

### Header Navigation
- Backdrop-blur com efeito frosted glass (`backdrop-blur-md backdrop-saturate-150`)
- Navegacao ativa: underline sutil (`bg-foreground/60`) em vez de background preenchido
- Always sticky (no auto-hide on scroll)

## Typography System

### Font Families
- **System UI** (`font-sans`) - All text: body, headings, UI elements (system-ui stack for zero network requests)
- **System Mono** (`font-mono`) - Code blocks, error messages, technical content (ui-monospace stack)

### Visual Hierarchy

#### Headings (system-ui)
- **H1 - Page Titles**: `text-2xl font-bold tracking-tight`
- **H2 - Section Titles**: `text-xl font-semibold tracking-tight`
- **H3 - Card/Component Titles**: `text-lg font-semibold`

#### Body Text (system-ui)
- **Labels/Navigation**: `text-sm font-medium`
- **Body/Descriptions**: `text-sm` (font-weight normal/400)
- **Helper Text**: `text-xs text-muted-foreground`

#### Monospace (system mono)
- **Code/Technical**: `text-xs font-mono`

### Typography Principles
1. **Consistencia de peso por tamanho**: Elementos do mesmo tamanho devem usar o mesmo peso em contextos similares
2. **Tracking tight para headings**: `tracking-tight` em h1 e h2 melhora legibilidade em titulos grandes
3. **Evitar tracking em body text**: Texto corrido nao deve ter letter-spacing customizado
4. **Font-medium para controles**: Botoes, labels, navigation sempre usam `font-medium` para destaque

### Usage Guidelines
- NUNCA misturar diferentes pesos para o mesmo tamanho de texto em contextos similares
- NUNCA usar `font-bold` em elementos de UI pequenos (text-sm ou menor)
- SEMPRE usar `tracking-tight` em h1 e h2 para melhor legibilidade
- SEMPRE usar `text-muted-foreground` em helper text para hierarquia visual
- NUNCA importar custom fonts — system-ui only for performance

## Background Tasks Pattern (after + Fire-and-Forget)

Operacoes longas (upload PDF, geracao de insights via Gemini) usam `after()` do Next.js para nao bloquear a UI.

### Fluxo
1. API route valida request, cria tarefa em `data/tasks/{uuid}.json`, retorna `202 Accepted`
2. Processamento continua em background via `after()` de `next/server` (keeps serverless alive until done)
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
- `after()` de `next/server` em vez de `void`: garante que Vercel nao mata a funcao antes de completar
- Retry automatico com backoff exponencial via `executarTarefaEmBackground` para erros transientes
- Timeout de 5 minutos: tarefas "processando" por mais de 5min sao consideradas falhas
- Sem cancel: operacoes de 30-60s nao justificam cancelamento

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

## Chat com Historico Persistente

### Arquitetura
- Conversas salvas em `data/{userId}/conversations/index.json` (dev) ou Vercel Blob (prod)
- Single index file (similar a `notifications`) para performance em read-heavy workload
- Limite: 100 conversas por usuario (FIFO queue)
- Auto-save debounced (2s) apos cada interacao com streaming concluido

### Schemas
- `src/schemas/conversa.schema.ts` — Zod schemas (fonte unica dos tipos)
- `Conversa`: conversa completa com mensagens
- `IndiceConversas`: array de conversas (single file storage)
- `CriarConversa`, `AtualizarConversa`: schemas para mutacoes

### Repository Pattern
- Interface: `src/domain/interfaces/conversa-repository.ts`
- Implementacao: `src/infrastructure/repositories/filesystem-conversa-repository.ts`
- Factory: `obterConversaRepository()` em `src/lib/container.ts`
- Reutiliza FileManager existente (switching automatico filesystem/blob)

### API Routes
- `GET /api/conversations` — Lista metadata de conversas (sem mensagens completas)
- `POST /api/conversations` — Cria nova conversa
- `GET /api/conversations/[id]` — Obtem conversa completa
- `PATCH /api/conversations/[id]` — Atualiza titulo ou mensagens
- `DELETE /api/conversations/[id]` — Deleta conversa

### Frontend
- Hook: `src/hooks/use-conversas.ts` (SWR para listar com optimistic updates)
- Hook: `src/hooks/use-chat-assistente.ts` (integrado com persistencia)
- Componentes:
  - `src/components/chat/lista-conversas.tsx` — Sidebar com lista de conversas
  - `src/components/chat/item-conversa.tsx` — Card individual de conversa
  - `src/components/chat/chat-widget.tsx` — Modal com sidebar + tamanho aumentado

### Geracao de Titulo
- Primeira mensagem do usuario truncada a 50 chars
- Fallback: "Nova conversa" se vazio

### Layout do Chat
- Desktop: 85vw ate max 1400px, 85vh (sidebar sempre visivel)
- Mobile: Fullscreen com sidebar como drawer overlay (toggle via botao menu)
- Auto-focus no textarea ao abrir

## Chat Visual Highlighting

Quando o assistente menciona elementos especificos da tela, destaca visualmente o card correspondente.

### Fluxo
1. LLM inclui `[HIGHLIGHT:identificador]` na resposta (instrucao do sistema)
2. Frontend processa marcadores via `processarHighlights()` no hook
3. Marcadores sao removidos do texto exibido
4. `destacarElemento()` aplica class CSS + scroll suave
5. Highlight dura 3s com ring azul pulsante

### Arquivos-chave
- `src/lib/chat-highlight.ts` — Funcao `destacarElemento()` + mapa de identificadores por pagina
- `src/lib/construir-instrucao-sistema-chat.ts` — Instrucoes para LLM sobre highlighting
- `src/app/globals.css` — Classe `.chat-highlight-active` com keyframes

### Data-attributes nos Cards (Dashboard)
- `data-chat-highlight="patrimonio-total"` — Evolucao patrimonial
- `data-chat-highlight="benchmark"` — Carteira vs Benchmarks
- `data-chat-highlight="alocacao-ativos"` — Alocacao por estrategia
- `data-chat-highlight="top-performers"` — Melhores/piores ativos
- `data-chat-highlight="eventos-financeiros"` — Eventos financeiros
- `data-chat-highlight="ganhos-estrategia"` — Ganhos por estrategia

### Regras
- Maximo 1-2 highlights por resposta
- Apenas dados ESPECIFICOS da tela (nao conceitos gerais)
- Highlight com ring-4 ring-primary + scale pulse animation (2s)

# Reports

All changes to the report JSON structure must be backward compatible. New fields should be optional with sensible defaults so that previously generated reports remain valid and functional.