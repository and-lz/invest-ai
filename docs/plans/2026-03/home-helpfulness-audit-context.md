# Context: Home Page Helpfulness Audit

## Requirements

### Goal
Critically audit the home page (`/`) across four axes — visual hierarchy, actionability, empty/onboarding state, and information clarity — and produce a prioritized list of findings to inform a future implementation plan.

### Acceptance Criteria
- [ ] Every finding is backed by a specific file + line reference
- [ ] Findings are categorized by axis and severity (High / Med / Low)
- [ ] Each finding has a concrete, testable "what good looks like" description
- [ ] No implementation work in this phase — findings only

### Out of Scope
- Changes to non-dashboard pages
- Navigation header redesign
- Backend/data changes
- Chart internals

### Edge Cases
- User with no data → `EstadoVazio` shown (audited separately)
- User with one period of data → period selector hidden
- Mobile viewport → layout collapses to single column

## Q&A Record
- Q: What should the home page achieve? → A: Both portfolio overview AND navigation hub
- Q: What dimensions of helpfulness? → A: Visual hierarchy, actionability, empty/onboarding state, information clarity (all four)
- Q: Should audit result in code changes? → A: Audit only first — findings doc, then decide what to fix

---

## Codebase Analysis

### Affected Files
- `src/app/(dashboard)/page.tsx` (read) — main page, `EstadoVazio`, layout order
- `src/components/dashboard/summary-cards.tsx` (read) — 4 KPI cards at top
- `src/components/layout/header.tsx` (read) — reusable page title + separator
- `src/components/layout/header-navigation.tsx` (read) — global sticky nav
- `src/components/dashboard/period-selector.tsx` (read) — period dropdown
- `src/components/dashboard/wealth-evolution-chart.tsx` (read) — first chart, wealth area chart
- `src/components/dashboard/risk-consistency-card.tsx` (read) — risk card in 3-col row
- `src/components/dashboard/all-positions-table.tsx` (read) — full-width detail table
- `src/components/dashboard/transactions-table.tsx` (read) — full-width movimentações table

---

## Blueprint: Current vs Proposed

### Current

```
NAV: [Dashboard*] [Relatórios] [Análises] [•••]

h2 "Dashboard"  ·············  [Último mês ▾]   ← title duplicates nav, period hidden
───────────────────────────────

[Patrimônio] [Ganhos Mês] [Rent. Anual] [Desde Início]   ← 4 equal cards, no hero
                                                            ← all jargon, no subtitles
                                                            ← help = hover-only tooltips

[===== Evolução Patrimonial (chart) =====]

[Risco] [Alocação] [Benchmarks]                           ← no section label
[====== Heatmap Retornos Mensais ========]                 ← no legend
[Evol. Alocação] [Rent. Categoria]
[Comp. Períodos] [Liquidez D+0/D+30]                      ← D+ jargon raw
[Melhores Mês]   [Piores Mês]
[====== TODAS AS POSIÇÕES (table) =======]                 ← detail table on home!
[====== GANHOS POR ESTRATÉGIA (table) ===]                 ← detail table on home!
[Eventos Financ.] [Movimentações]                          ← detail table on home!

Problems: 14 flat components, no grouping, no headline,
          jargon everywhere, Fortuna AI buried as tiny icon,
          detail tables bloat the page
```

### Current Empty State

```
        (upload icon)
   "Nenhum relatório encontrado"
   "...relatório Inter Prime..."          ← hardcoded broker
        [ Fazer Upload ]                  ← no value prop, no steps, no AI mention
```

### Proposed

```
NAV: [Dashboard*] [Relatórios] [Análises] [•••]

Dashboard · Fevereiro 2026  ···  [Mudar mês ▾]   ← period in title (VH-1, IC-1)

┌ HEADLINE ─────────────────────────────────────┐
│ "Seu patrimônio cresceu R$2.4k — acima da     │ ← plain-language (NI-1)
│  inflação."        [Perguntar à Fortuna →]    │ ← Fortuna CTA (NI-3)
└───────────────────────────────────────────────┘

── Resumo ──────────────────────────────────────  ← section label (VH-2)

[==PATRIMÔNIO TOTAL==] [Ganhos] [Rent. 2026] [Desde Mar/22]
       hero card ↑        ← wider (VH-3)
  each has 1-line plain subtitle (NI-2)
  time labels are concrete (IC-3)

[===== Evolução Patrimonial =====]

── Análise ─────────────────────────────────────  ← section label (VH-2)

[Risco] [Alocação] [Benchmarks — "CDI = poupança simples"]  ← anchoring (NI-4)
[Retornos Mensais — "verde=cresceu, vermelho=encolheu"]     ← legend (NI-5)
[Evol. Alocação] [Rent. Categoria]
[Comp. Períodos] [Liquidez — "D+0 (disponível hoje)"]       ← plain labels (NI-6)

── Destaques ───────────────────────────────────  ← section label (VH-2)

[Melhores Mês]        [Piores Mês]
[Ganhos Estratégia]   [Eventos Financeiros]

[Ver todas as posições →] [Ver movimentações →]   ← links, not tables (ACT-1)
```

### Proposed Empty State

```
   "Bem-vindo ao Fortuna!"
   ✓ Patrimônio e crescimento mensal
   ✓ Comparação com inflação e renda fixa
   ✓ Análises em linguagem simples
   ✓ Fortuna AI responde suas dúvidas

   1. Upload → 2. Aguarde ~30s → 3. Pronto

   [ Fazer Upload ]   [Perguntar à Fortuna →]
```

## Audit Findings

---

### AXIS 1 — Visual Hierarchy

#### VH-1 · HIGH — Page title duplicates navigation state
**File:** `src/app/(dashboard)/page.tsx:119-132` + `src/components/layout/header.tsx:10-18`

The page renders a `<h2>` "Dashboard" with an icon + separator, directly below the sticky nav which already highlights "Dashboard" as the active link. This doubles up the same label with no added information. The separator that follows (`mt-4` spacing) also cuts the title row from the period selector, making the header look like a separate section from the control it governs.

**What good looks like:** The page title row should either be removed (relying on nav active state) or condensed into a single compact line that includes the period selector in the same visual unit — "Dashboard — Último mês ▾".

---

#### VH-2 · HIGH — 14 components, zero section grouping
**File:** `src/app/(dashboard)/page.tsx:139-186`

The page renders 14 components in a flat vertical stack. There is no visual or semantic separation between "summary" content and "deep dive" content. Every component has identical visual weight. A user who lands here has no focal point.

Content naturally groups into three tiers:
- **Tier 1 — At a glance** (SummaryCards, WealthEvolutionChart)
- **Tier 2 — Analysis** (Asset allocation, Benchmark, Risk, Heatmap, Category performance)
- **Tier 3 — Detail** (AllPositionsTable, TransactionsTable, StrategyGainsTable, TopPerformers, FinancialEvents)

None of this hierarchy is communicated visually.

**What good looks like:** Section labels or visual separators that group Tier 1/2/3, so users can scroll with intent rather than discovery.

---

#### VH-3 · MED — Summary cards are visually identical; most important KPI not emphasized
**File:** `src/components/dashboard/summary-cards.tsx:36-141`

All four summary cards use identical styling (`Card` with `CardHeader`/`CardContent`). Patrimônio Total is the most important number — it's the answer to "am I doing well?" — but it has the same visual weight as "Desde o Início" which is a tertiary metric. No card is larger, bolder, or colored differently to signal priority.

**What good looks like:** Patrimônio Total card should be visually dominant (wider or taller) or colored differently to signal it's the primary KPI. Secondary KPIs can be smaller/lighter.

---

#### VH-4 · MED — Period selector scope is not communicated
**File:** `src/app/(dashboard)/page.tsx:125-131`

The period selector sits at the top-right corner as a small button labeled "Último mês". Nothing on the page communicates that this single control filters ALL 14 components below. A user may not realize changing this transforms the entire page.

**What good looks like:** A subtitle or badge next to the title that clearly states the active period ("Visualizando: Fevereiro 2026"), plus a subtle visual indicator when a non-default period is active.

---

#### VH-5 · LOW — `<h2>` used as page title instead of `<h1>`
**File:** `src/components/layout/header.tsx:12`

The `Header` component uses `<h2>` for the page title. The global navigation already uses `<h1>` for "Fortuna" (the app name). This creates a document outline where the first heading inside the main content area is a second-level heading — semantically wrong. Screen readers and search engines expect `<h1>` to be the page's primary subject.

**What good looks like:** Page title should be `<h1>`. The nav's "Fortuna" could be a `<span>` or `<p>` since it's a logo/brand, not a document heading.

---

### AXIS 2 — Actionability

#### ACT-1 · HIGH — Detail tables don't belong on the home page
**File:** `src/app/(dashboard)/page.tsx:178-185`

`AllPositionsTable` (every single position with sortable columns) and `TransactionsTable` (all movimentações) are detail-level data grids that require intentional interaction. They should live in a dedicated view (e.g., `/reports` or `/desempenho`). On the home page they:
- Add enormous vertical length (users must scroll past 10+ components to reach them)
- Dilute the "overview" purpose of the home page
- Are never "at a glance" by nature — they require sorting and scanning

**What good looks like:** Remove `AllPositionsTable` and `TransactionsTable` from the home page. Link to them from a "Ver todas as posições →" and "Ver movimentações →" CTA within their respective summary cards.

---

#### ACT-2 · MED — No suggested next action after viewing summary
**File:** `src/app/(dashboard)/page.tsx`

After a user digests the summary cards and wealth chart, the page offers no guidance on what to do next. No contextual prompt like "Seus rendimentos caíram 2% este mês — veja as Análises →" or "Você tem eventos financeiros pendentes → Plano de Ação". The takeaway boxes (`TakeawayBox`) provide insight text but no action links.

**What good looks like:** At least one contextual CTA near the top of the page (after summary cards) that links to the most relevant next step based on the data shown.

---

#### ACT-3 · LOW — "Mais" dropdown hides useful sections from new users
**File:** `src/components/layout/header-navigation.tsx:47-53`

Tendências, Plano de Ação, and Aprender are hidden in a "Mais" overflow dropdown. For a new user trying to understand what the app offers, these are invisible unless they hover/click "Mais". The home page could serve as a discovery surface for these features.

**What good looks like:** Brief section cards or callouts on the home page (or in the empty state) that explain what Tendências, Análises, and Aprender offer.

---

### AXIS 3 — Empty / Onboarding State

#### EMT-1 · HIGH — Hardcoded broker name "Inter Prime"
**File:** `src/app/(dashboard)/page.tsx:91-93`

The empty state reads: *"Faca upload do seu relatorio Inter Prime para comecar a visualizar seus investimentos."* This hardcodes a specific broker, which is wrong if the user is with a different institution. It makes the app appear broker-specific rather than general-purpose.

**What good looks like:** Generic language: *"Faça upload do seu relatório de investimentos para começar."* Or if the app only supports Inter Prime, make that explicit and prominent in a different, more intentional way.

---

#### EMT-2 · HIGH — Empty state offers zero value proposition
**File:** `src/app/(dashboard)/page.tsx:84-99`

The `EstadoVazio` shows an upload icon, a heading "Nenhum relatorio encontrado", and one button. It doesn't answer: *What will I see after uploading? Why should I trust this app with my data? What insights will I get?* The user has no motivation to proceed.

**What good looks like:** Brief preview of what the dashboard shows (3–4 feature bullets, or a blurred/masked preview screenshot), with a confident CTA: *"Veja seu patrimônio, rentabilidade e análises automáticas — comece com o upload do seu relatório."*

---

#### EMT-3 · MED — No step indicator or expectation setting
**File:** `src/app/(dashboard)/page.tsx:84-99`

New users don't know that uploading a PDF is the only step, or how long it takes, or what happens afterward (background processing). After clicking "Fazer Upload" and going to `/reports`, they're on their own.

**What good looks like:** A brief step indicator: "1. Faça upload → 2. Aguarde processamento (~30s) → 3. Volte ao Dashboard" or at minimum a description of what happens after upload.

---

### AXIS 4 — Information Clarity

#### IC-1 · HIGH — Active period not prominently labeled
**File:** `src/app/(dashboard)/page.tsx:119-131`

The page shows data for a specific month, but the only indication of which month is the small period selector button at the top-right (e.g., "Último mês"). When the user scrolls down to charts and tables, there's no persistent indicator of which period they're viewing. This creates confusion when comparing values across sections.

**What good looks like:** The active period displayed in the page subtitle area ("Visualizando: Fevereiro 2026") and within each chart's title or description.

---

#### IC-2 · MED — "Ganhos no Mês" and "Rentabilidade Mensal" overlap conceptually
**File:** `src/components/dashboard/summary-cards.tsx:75-98`

The second summary card shows "Ganhos no Mês" (R$ value) and a helper text "Rentabilidade: X%" directly below it. While technically distinct (absolute vs relative), placed together without explanation they feel redundant. Worse, the third card shows "Rentabilidade Anual" — a third rentabilidade metric in three cards. Users with limited financial vocabulary will be confused about what they're reading.

**What good looks like:** Each card should have a one-liner explanation (beyond a tooltip) of how it differs from adjacent metrics. The card ordering should build a story: Total → Monthly return → Annual trend → Since inception.

---

#### IC-3 · MED — "Rentabilidade Anual" vs "Desde o Início" distinction not intuitive
**File:** `src/components/dashboard/summary-cards.tsx:100-138`

Cards 3 and 4 both show percentage returns with no immediate distinction visible to a novice. The difference (calendar year vs all-time since first investment) is significant but only discoverable via InfoTooltip hover.

**What good looks like:** More distinctive labeling — e.g., "2025 completo" vs "Desde Março 2022" — so users understand the time frame without hovering. Or combine into one card with two sub-values.

---

---

### AXIS 5 — Naive Investor Perspective (new axis — user-requested)

This axis specifically evaluates the page through the eyes of someone who just started investing and has no financial vocabulary.

---

#### NI-1 · HIGH — No page-level plain-language headline
**File:** `src/app/(dashboard)/page.tsx:119-132`

A naive investor lands on the home page and sees numbers, charts, and tables. Nowhere does the page answer the one question they actually have: **"Am I doing well?"** There is no page-level summary sentence. The TakeawayBoxes inside individual cards help locally, but there is no global "headline" that synthesizes all the data for this period into a human-readable conclusion at the top.

**What good looks like:** A dynamic headline directly under the page title: *"Este mês, seu patrimônio cresceu R$ 2.400 — acima da inflação. Confira os detalhes abaixo."* This gives naive users immediate orientation before they engage with any component.

---

#### NI-2 · HIGH — Jargon overload with no visual fallback
**File:** All dashboard components

Every component title and metric name is a financial term: "Patrimônio Total", "Rentabilidade Mensal", "Carteira vs Benchmarks (CDI / IPCA / Ibovespa)", "Risco e Consistência", "Heatmap de Retornos Mensais", "Liquidez por Faixa", "Movimentações". A naive investor does not know what any of these mean.

The InfoTooltips exist (`InfoTooltip` via `HelpCircle` icon) but:
- They are `h-3.5 w-3.5` (14px) and `text-muted-foreground/60` (very low opacity)
- They require hover to activate — invisible on mobile, invisible unless the user knows to look
- They are passive — the user must seek help; the page does not proactively offer it
- Most users never discover them

The net result: a naive investor sees a wall of jargon with no path to understanding.

**What good looks like:** Below each card title, a one-line plain-language description rendered at all times (not on hover): *"Quanto seu dinheiro cresceu comparado ao mês passado."* Or: a prominent "New to investing? Ask Fortuna to explain this page →" banner that surfaces the existing AI feature.

---

#### NI-3 · HIGH — Fortuna AI (BotaoExplicarIA) is the perfect tool for naive users but is buried
**Files:** `src/components/ui/ai-explain-button.tsx:42-70`, `src/components/layout/header-navigation.tsx:44`

The `BotaoExplicarIA` component exists on every chart card — it opens the Fortuna chat and auto-sends an explanation prompt. This is exactly what a naive investor needs. But:
- It is a tiny ghost icon (`size="icon-xs"`) placed in `<CardAction>`, low-opacity until hover
- The nav shows "Fortuna" as an icon link with no description of what it does
- There is no page-level prompt directing naive users to ask Fortuna for help
- The empty state (`EstadoVazio`) does not mention Fortuna at all

A naive investor could have every question answered instantly by Fortuna — but they have no idea it exists or what it does.

**What good looks like:** A sticky or inline "Não entende algum gráfico? Pergunte à Fortuna →" CTA somewhere prominent on the page. The empty state should also mention: *"Após o upload, a Fortuna pode responder perguntas sobre seus investimentos em linguagem simples."*

---

#### NI-4 · MED — Benchmark chart (CDI/IPCA/Ibovespa) meaningless without anchoring
**File:** `src/components/dashboard/benchmark-comparison-chart.tsx:27-58`

The benchmark comparison card shows the user's portfolio versus CDI, IPCA, and Ibovespa. The TakeawayBox text says things like *"sua carteira ficou abaixo do CDI"* — but a naive investor doesn't know:
- What CDI is or why it's the "renda fixa básica"
- Whether losing to Ibovespa is normal or catastrophic
- Whether 1.2% is a good or bad return in absolute terms

The glossary tooltips exist but are invisible (see NI-2). Even if discovered, they explain what CDI is without explaining *why it matters as a reference*.

**What good looks like:** The TakeawayBox text should include brief anchoring in plain language: *"O CDI é o que você ganharia em uma poupança simples (Tesouro Selic). Sua carteira rendeu menos que isso este mês."*

---

#### NI-5 · MED — "Heatmap de Retornos Mensais" is unreadable without explanation
**File:** `src/components/dashboard/monthly-returns-heatmap.tsx:41-49`

The monthly returns heatmap shows a color-coded grid (green = positive, red = negative). For a naive investor:
- The grid format is unfamiliar (rows = years, columns = months is not obvious)
- What "% em relação ao CDI" means is not clear from the title alone
- The color-coding thresholds (≥3%, ≥1.5%, >0%) have no legend visible at a glance

**What good looks like:** A one-line description under the card title: *"Cada célula mostra se seu dinheiro cresceu (verde) ou encolheu (vermelho) naquele mês."* And a visible color legend — not just tooltip-triggered.

---

#### NI-6 · LOW — LiquidityLadder uses jargon (D+0, D+30) without translation
**File:** `src/components/dashboard/liquidity-ladder.tsx` (not read in detail — title alone is the signal)

"Liquidez por Faixa" + D+0, D+30, D+180, D+365 terminology is standard financial shorthand but completely opaque to naive investors. They don't know if they should care about their D+365 exposure or what it means for their daily life.

**What good looks like:** Plain-language labels alongside the codes: *"D+0 (disponível hoje)", "D+30 (disponível em até 1 mês)"*, etc.

---

## Priority Summary

| ID | Severity | Axis | Issue |
|----|----------|------|-------|
| NI-1 | HIGH | Naive Investor | No page-level plain-language headline — "am I doing well?" unanswered |
| NI-2 | HIGH | Naive Investor | Jargon overload — every title is financial term, InfoTooltips invisible/hover-only |
| NI-3 | HIGH | Naive Investor | Fortuna AI is perfect for naive users but completely buried (tiny ghost icon) |
| ACT-1 | HIGH | Actionability | AllPositionsTable + TransactionsTable don't belong on home page |
| EMT-1 | HIGH | Empty State | Hardcoded "Inter Prime" broker name |
| EMT-2 | HIGH | Empty State | No value proposition in empty state |
| VH-1 | HIGH | Visual Hierarchy | Page title duplicates nav state; separator splits title from period control |
| VH-2 | HIGH | Visual Hierarchy | 14 components, no grouping, no focal point |
| IC-1 | HIGH | Information Clarity | Active period not prominently labeled |
| NI-4 | MED | Naive Investor | Benchmark chart (CDI/IPCA/Ibovespa) meaningless without plain-language anchoring |
| NI-5 | MED | Naive Investor | Monthly returns heatmap unreadable without explanation or visible legend |
| VH-3 | MED | Visual Hierarchy | All 4 summary cards are identical weight |
| VH-4 | MED | Visual Hierarchy | Period selector scope not communicated |
| ACT-2 | MED | Actionability | No suggested next action after summary |
| EMT-3 | MED | Empty State | No step indicator or expectation setting |
| IC-2 | MED | Information Clarity | "Ganhos no Mês" + "Rentabilidade" overlap |
| IC-3 | MED | Information Clarity | Rentabilidade Anual vs Desde o Início indistinct |
| NI-6 | LOW | Naive Investor | LiquidityLadder uses D+0/D+30 jargon without plain-language labels |
| ACT-3 | LOW | Actionability | "Mais" hides features from new users |
| VH-5 | LOW | Visual Hierarchy | `<h2>` used as page title instead of `<h1>` |

## Risks
- Removing AllPositionsTable / TransactionsTable from home (ACT-1) changes existing behavior — users who rely on them being here will be affected (Med)
- Adding a value proposition to the empty state requires deciding whether "Inter Prime only" is the intended scope or if the app is broker-agnostic (EMT-1 + EMT-2) — needs product decision
