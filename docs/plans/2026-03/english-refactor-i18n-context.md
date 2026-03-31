# Context: English Refactor + i18n Extraction

## Requirements

### Goal
Refactor the entire codebase so that all code identifiers, file names, comments, and internal strings are in English. Extract all user-facing Portuguese strings into an i18n system for future localization.

### Acceptance Criteria
- [ ] All TypeScript identifiers (variables, functions, types, constants, hooks, components) are in English
- [ ] All file and directory names are in English
- [ ] All comments are in English
- [ ] All user-facing PT-BR strings extracted to i18n translation files
- [ ] Route paths in Portuguese (`/aprender`, `/desempenho`, `/plano-acao`) have English equivalents with redirects from old paths
- [ ] DB schema (table names, column names, enum values) unchanged — no SQL migrations
- [ ] Zod schema field keys unchanged (stored as JSONB keys in PostgreSQL)
- [ ] Zod enum values unchanged (stored in JSONB data)
- [ ] All tests pass after refactoring
- [ ] `tsc --noEmit` clean
- [ ] Lint clean
- [ ] App renders correctly (manual check in incognito)

### Out of Scope
- Database migrations (no SQL changes)
- Changing Zod field keys or enum values (would break stored JSONB data)
- Changing the Gemini API extraction prompt field mappings
- Changing API route paths (already in English)
- Adding new features or changing behavior
- Full i18n with language switching UI (just extraction for now)

### Edge Cases
- **Stored JSONB data**: All `dados` columns store JSON with Portuguese keys. The Zod schemas MUST keep the same field keys (e.g., `patrimonioTotal`, `valorEmCentavos`, `mesReferencia`). Only the TypeScript variable/type names wrapping these schemas can change.
- **Zod enum values**: Values like `"Dividendo"`, `"JCP"`, `"Liquidez"`, `"Aplicacao"` etc. are stored in existing data. These CANNOT change.
- **Route redirects**: Old URLs (`/aprender`, `/desempenho`, `/plano-acao`) need `next.config.ts` redirects to prevent broken bookmarks.
- **Drizzle ORM identifiers**: TypeScript property names in schema.ts can be renamed (Drizzle maps via string args), but ALL repository files that reference these properties must be updated simultaneously.
- **Design system tokens**: `src/lib/design-system.ts` identifiers — already mostly English.
- **Test data factories**: Tests use Portuguese field names from Zod schemas — these stay.

## Q&A Record
- Q: What should stay in Portuguese? → A: "Only things that would break if we change" — DB schema, Zod field keys, Zod enum values
- Q: What about UI strings? → A: Externalize to i18n translation files
- Q: Batch or incremental? → A: Batch refactor (single commit)

## Codebase Analysis

### Scale
- **317 total source files** (~31k lines)
- **202 files** contain Portuguese identifiers
- **~20 Portuguese-named files/directories** need renaming
- **3 route directories** in Portuguese: `/aprender`, `/desempenho`, `/plano-acao`
- **12 Zod schema files** with Portuguese variable names (field keys stay)
- **8 DB tables** with Portuguese names (SQL stays, TS identifiers change)

### What MUST Stay Portuguese (Breaking Changes)

#### 1. DB SQL names (schema.ts string args)
All `pgTable("table_name")`, `text("column_name")`, `pgEnum("enum_name", [...values])` first-argument strings. These are the actual SQL identifiers.

#### 2. Zod schema field keys
Every property key in Zod `.object({})` calls — e.g., `patrimonioTotal`, `valorEmCentavos`, `mesReferencia`, `nomeAtivo`, `codigoAtivo`, etc. These are JSON keys stored in JSONB columns.

#### 3. Zod enum values
All values in `z.enum([...])` — e.g., `"Dividendo"`, `"JCP"`, `"Liquidez"`, `"Renda Variavel"`, `"Aplicacao"`, `"Resgate"`, etc.

### What CAN Be Renamed to English

#### 1. TypeScript identifiers (compile-time only)
| Current (PT) | Proposed (EN) | Category |
|---|---|---|
| `RelatorioExtraidoSchema` | `ExtractedReportSchema` | Zod schema var |
| `type Resumo` | `type Summary` | Inferred type |
| `type Conversa` | `type Conversation` | Inferred type |
| `relatoriosMetadados` | `reportMetadata` | Drizzle table var |
| `notificacoes` | `notifications` | Drizzle table var |
| `tarefasBackground` | `backgroundTasks` | Drizzle table var |
| `formatarMoeda()` | `formatCurrency()` | Function |
| `centavosParaReais()` | `centsToCurrency()` | Function |
| `obterConversaRepository()` | `getConversationRepository()` | Factory |
| `gerarConclusao*()` | `generateTakeaway*()` | Function |
| `notificar.success()` | `notify.success()` | Wrapper |
| All hooks `use-tarefa-*` | `use-task-*` | Hook files |
| All hooks `use-conversa*` | `use-conversation*` | Hook files |

#### 2. File and directory names
| Current | Proposed |
|---|---|
| `src/app/aprender/` | `src/app/learn/` |
| `src/app/desempenho/` | `src/app/performance/` |
| `src/app/plano-acao/` | `src/app/action-plan/` |
| `src/app/aprender/glossario/` | `src/app/learn/glossary/` |
| `src/components/aprender/` | `src/components/learn/` |
| `src/components/desempenho/` | `src/components/performance/` |
| `src/lib/glossario-financeiro.ts` → already split | Check current names |
| `src/lib/notificar.ts` | `src/lib/notify.ts` |
| `src/lib/tarefa-background.ts` | `src/lib/background-task.ts` (may already exist) |
| `src/hooks/use-tarefa-background.ts` | `src/hooks/use-background-task.ts` |
| Various others | Systematic rename |

#### 3. Route paths (with redirects)
| Current | Proposed | Redirect |
|---|---|---|
| `/aprender` | `/learn` | 301 redirect |
| `/aprender/glossario` | `/learn/glossary` | 301 redirect |
| `/aprender/[categoria]/[slug]` | `/learn/[category]/[slug]` | 301 redirect |
| `/desempenho` | `/performance` | 301 redirect |
| `/plano-acao` | `/action-plan` | 301 redirect |

#### 4. Comments (translate to English)
All Portuguese comments across 202+ files.

### i18n Strategy

No i18n library exists yet. Options for Next.js App Router:
1. **`next-intl`** — Most popular, good App Router support, server components
2. **`next-i18next`** — Legacy, less suited for App Router
3. **Simple JSON + context** — Minimal, no library dependency

Recommended: **`next-intl`** for proper App Router integration.

Structure:
```
src/
  messages/
    pt-BR.json    # Portuguese translations (default)
    en.json       # Future English translations
  i18n/
    config.ts     # i18n configuration
    request.ts    # Server-side i18n
```

### Affected Files (202 files — representative samples by area)

#### Schemas (12 files) — rename vars/types, keep field keys
- `src/schemas/report-extraction.schema.ts` — 30+ type/schema renames
- `src/schemas/insights.schema.ts`
- `src/schemas/conversation.schema.ts`
- All 12 schema files

#### Domain (interfaces + value objects)
- `src/domain/value-objects/money.ts` — `formatarMoeda`, `centavosParaReais`, etc.
- `src/domain/value-objects/percentage.ts` — `formatarPercentual`, etc.
- `src/domain/interfaces/*.ts` — interface names

#### Infrastructure (repositories)
- `src/infrastructure/repositories/db-*.ts` — all reference Drizzle table vars

#### Application (use cases)
- `src/application/use-cases/*.ts` — Portuguese function/class names

#### Hooks (~15 files)
- Portuguese-named hooks and internal identifiers

#### Components (~80+ files)
- UI strings (extract to i18n)
- Portuguese variable names
- Portuguese comments

#### Lib utilities (~30+ files)
- `src/lib/format-date.ts` — `formatarMesAno`, `formatarDataBrasileira`, etc.
- `src/lib/notificar.ts` → `notify.ts`
- `src/lib/tarefa-background.ts` → `background-task.ts`
- Many more

#### Tests (5 files)
- Update imports and function name references
- Portuguese Zod field keys in test data stay

### Risks
- **Massive blast radius** (High) — 202 files, single mistake breaks everything. Mitigation: systematic rename with find-and-replace, verify with `tsc --noEmit` + lint + tests after each batch.
- **JSONB data corruption** (Critical) — Accidentally renaming Zod field keys would break all stored data. Mitigation: strict rule that Zod `.object({})` property keys and `.enum([])` values NEVER change.
- **Route breakage** (Medium) — Old bookmarks/links. Mitigation: 301 redirects in next.config.ts.
- **Scope creep** (High) — 202 files is enormous for one session. Mitigation: Phase the work by layer (schemas → domain → infra → app → components → i18n).
- **i18n setup complexity** (Medium) — Adding next-intl to an existing App Router app requires middleware, layout changes, and component updates. Mitigation: Start with extraction to JSON files, wire up next-intl incrementally.

### Critical Decision Point

This refactoring affects **202 out of 317 files** (~64% of the codebase). A true batch refactor in a single session is extremely risky.

**Recommended approach**: Split into **4-5 focused batch commits** by layer:
1. **Layer 1**: Schemas + Domain + Infra (type system foundation)
2. **Layer 2**: Lib utilities + Hooks
3. **Layer 3**: Components + Pages (identifier renames)
4. **Layer 4**: Route renames + redirects
5. **Layer 5**: i18n extraction (next-intl setup + string extraction)

Each layer is verified independently (`tsc --noEmit` + lint + tests) before moving to the next.
