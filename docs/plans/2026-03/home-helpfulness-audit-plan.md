# Plan: Home Page Helpfulness Improvements

**Context**: [home-helpfulness-audit-context.md](./home-helpfulness-audit-context.md)
**Personas**: [personas.md](../ux/personas.md) — all 5: Marcos (self-directed), Camila (beginner), Roberto (passive income), Juliana (anxious), Ana & Pedro (delegator couple)

## Steps

### Step 1: Rewrite empty state (EMT-1, EMT-2, EMT-3, NI-3)
**Files**: `src/app/(dashboard)/page.tsx` (modify)
**Changes**:
- Remove hardcoded "Inter Prime" from `EstadoVazio`
- Add value proposition bullets (what dashboard shows)
- Add step indicator (upload → process → done)
- Add "Perguntar à Fortuna" CTA (reuse `abrirChatComPergunta` from `ai-explain-button.tsx`)
**Verify**: Load `/` with no reports → see new empty state

### Step 2: Page header — period in title, remove redundancy (VH-1, IC-1, VH-4)
**Files**: `src/app/(dashboard)/page.tsx` (modify)
**Changes**:
- Replace `<Header titulo="Dashboard">` with inline `<h1>` that includes the active period name: "Dashboard · Fevereiro 2026"
- Move period selector into the same line
- Remove `<Separator>` gap
**Verify**: Title shows period name, no duplicate "Dashboard" label vs nav

### Step 3: Section labels (VH-2)
**Files**: `src/app/(dashboard)/page.tsx` (modify)
**Changes**:
- Add three section dividers in the component list: "Resumo", "Análise", "Destaques"
- Use `text-muted-foreground text-xs font-medium uppercase tracking-wider` + subtle border — no new component, just inline markup
**Verify**: Scroll the page → three visible section labels grouping content

### Step 4: Hero card for Patrimônio Total (VH-3)
**Files**: `src/components/dashboard/summary-cards.tsx` (modify)
**Changes**:
- First card (`Patrimônio Total`) spans 2 columns on `md:` and above via `md:col-span-2`
- Remaining 3 cards fill the other 2 columns (using `lg:grid-cols-4` → keep existing grid, first card takes 2 cols)
**Verify**: Patrimônio card is wider than the other three on desktop

### Step 5: Plain-language subtitles on summary cards (NI-2, IC-2, IC-3)
**Files**: `src/components/dashboard/summary-cards.tsx` (modify)
**Changes**:
- Add a `<p className={typography.helper}>` subtitle below each card's main value:
  - Patrimônio: "Quanto vale tudo junto"
  - Ganhos no Mês: "Quanto seu dinheiro rendeu este mês"
  - Rent. Anual → rename to "Rent. em {year}": "Crescimento no ano até agora"
  - Desde o Início → rename to "Desde {month/year}": "Resultado total desde o começo"
- Make time labels concrete: "Rentabilidade em 2026", "Desde Mar/2022"
**Verify**: Each card has a visible subtitle without hovering

### Step 6: Page-level headline (NI-1, ACT-2, NI-3)
**Files**: `src/app/(dashboard)/page.tsx` (modify)
**Changes**:
- Add a `DashboardHeadline` section between the title and summary cards
- Dynamic text derived from `dadosDashboard`: patrimônio variation + comparison to IPCA from benchmarks
- **Tone branches for all 5 personas** (especially Juliana — the anxious saver):
  - Positive + beats inflation: "Seu patrimônio cresceu R$X — acima da inflação." (confident)
  - Positive but below CDI: "Seu patrimônio cresceu R$X. Ficou abaixo da renda fixa, mas cresceu." (honest, not alarming)
  - Negative (small): "Seu patrimônio recuou R$X este mês — variações pequenas são normais." (reassuring — Juliana)
  - Negative (significant): "Seu patrimônio recuou R$X. Quer entender o que aconteceu?" (redirect to Fortuna — Juliana)
  - No variation data: "Confira o resumo dos seus investimentos abaixo." (fallback)
- Include "Perguntar à Fortuna →" button (reuse `abrirChatComPergunta`)
**Verify**: Headline renders correct tone for positive/negative/neutral months, Fortuna CTA opens chat

### Step 7: Remove detail tables from home, add link CTAs (ACT-1)
**Files**: `src/app/(dashboard)/page.tsx` (modify)
**Changes**:
- Remove `AllPositionsTable`, `TransactionsTable` imports and renders
- Add a footer section with two link buttons: "Ver todas as posições →" → `/desempenho`, "Ver movimentações →" → `/reports`
**Verify**: Page is shorter, links navigate correctly

### Step 8: Verify + cleanup
**Files**: all modified files
**Verify**: `tsc --noEmit` + `npm run lint` + `npm run test` pass, manual check on desktop + mobile viewport

## New Files
None — all changes are to existing files.

## Verification Plan
- Build: `npx tsc --noEmit && npm run lint` → no errors
- Tests: `npm run test` → all pass
- Manual:
  - Empty state: `/` with no data → value prop + steps + Fortuna CTA visible
  - With data: period in title, headline sentence, section labels, hero card wider, subtitles visible
  - Mobile: single-column layout, no broken overflow
  - Fortuna CTA: clicking opens chat

## Risks
- Removing AllPositionsTable/TransactionsTable from home (ACT-1) changes UX — users who relied on scrolling to them will need to navigate to `/desempenho` or `/reports` (Med) — mitigated by visible link CTAs
- Headline text generation is data-dependent — needs graceful fallback for edge cases (single period, missing benchmarks) (Low)
