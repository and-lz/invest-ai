# Context: Rebrand App Text from "Investimentos" to "Fortuna"

## Requirements

### Goal
Replace all user-facing branding text that says "Investimentos" / "Investimento" (as app name) with "Fortuna". Internal code identifiers, repo name, and package name stay unchanged.

### Acceptance Criteria
- [ ] All page title suffixes changed from `| Investimentos` to `| Fortuna`
- [ ] Root layout metadata uses "Fortuna" as app name
- [ ] PWA manifest uses "Fortuna" branding
- [ ] Header navigation shows "Fortuna" instead of "Investimentos"
- [ ] Sign-in page heading updated
- [ ] Electron window title updated
- [ ] Service worker cache name updated
- [ ] App builds successfully (`tsc --noEmit` + lint)
- [ ] Tests pass (update assertions referencing old branding)

### Out of Scope
- Domain terminology (e.g., "Fundos de Investimento", "Estratégias de Investimento" in glossary/articles — these are financial terms, not branding)
- Repo name, package.json `name` field, folder names, code identifiers
- Educational article body text using "investimentos" as a financial concept
- Glossary definitions explaining financial terms

### Edge Cases
- `package.json` `productName` and `appId` → change (user-visible in Electron)
- `package.json` `name` → keep as-is (internal, not user-facing)
- `sw.js` cache name `investimentos-*` → change to `fortuna-*` (causes cache invalidation on deploy — acceptable)
- Sign-in page: "Dashboard de Investimentos" → "Fortuna" (simpler branding)

## Q&A Record
- Q: Scope? → A: User-facing text only, no internal identifiers
- Q: Repo/package rename? → A: No, in-app branding only
- Q: Title format? → A: `[Page] | Fortuna`

## Codebase Analysis

### Existing Patterns to Follow
- Page titles defined as `export const metadata` in layout.tsx files — simple string replacement
- Root layout metadata at `src/app/layout.tsx:24-30` — multiple fields to update
- Header branding in `src/components/layout/header-navigation.tsx` — two locations (mobile L107, desktop L164)

### Reusable Code Found
- None needed — this is a text replacement task

### Affected Files

**App Config (3 files):**
- `public/manifest.json` (modify) — name, short_name, description
- `public/sw.js` (modify) — cache name
- `package.json` (modify) — productName, appId

**Root Metadata (1 file):**
- `src/app/layout.tsx` (modify) — title, description, applicationName, appleWebApp title

**Page Titles (13 files):**
- `src/app/(dashboard)/layout.tsx` — `Dashboard | Investimentos` → `Dashboard | Fortuna`
- `src/app/auth/layout.tsx` — `Login | Investimentos` → `Login | Fortuna`
- `src/app/desempenho/layout.tsx` — `Desempenho de Ativos | Investimentos` → `... | Fortuna`
- `src/app/reports/layout.tsx` — `Relatorios | Investimentos` → `... | Fortuna`
- `src/app/trends/layout.tsx` — `Tendencias de Mercado | Investimentos` → `... | Fortuna`
- `src/app/plano-acao/layout.tsx` — `Plano de Ação | Investimentos` → `... | Fortuna`
- `src/app/insights/layout.tsx` — `Análises Fortuna | Investimentos` → `Análises Fortuna | Fortuna`
- `src/app/chat/layout.tsx` — `Fortuna | Investimentos` → `Fortuna Chat | Fortuna`
- `src/app/settings/layout.tsx` — `Configurações | Investimentos` → `... | Fortuna`
- `src/app/admin/proxy/layout.tsx` — `Proxy Monitor | Investimentos` → `... | Fortuna`
- `src/app/aprender/glossario/layout.tsx` — `Glossario Financeiro | Investimentos` → `... | Fortuna`
- `src/app/aprender/glossario/page.tsx` — dynamic metadata
- `src/app/aprender/page.tsx` — `Centro de Aprendizado | Investimentos` → `... | Fortuna`
- `src/app/aprender/[categoria]/page.tsx` — dynamic template string
- `src/app/aprender/[categoria]/[slug]/page.tsx` — dynamic template string

**UI Components (2 files):**
- `src/components/layout/header-navigation.tsx` (modify) — branding text x2
- `src/app/auth/signin/page.tsx` (modify) — heading text + add Logo component

**Electron (1 file):**
- `electron/main.ts` (modify) — window title, app name

**Report Template (1 file):**
- `src/lib/serialize-report-markdown.ts` (modify) — report title "Relatorio de Investimentos"

**Tests (2 files):**
- `__tests__/unit/lib/serializar-relatorio-markdown.test.ts` — update assertion
- Any other test referencing old branding strings

### Risks
- Service worker cache name change forces full cache refresh (Low) — expected and acceptable
- Electron productName change may affect OS-level app identity (Low) — acceptable for rebrand
