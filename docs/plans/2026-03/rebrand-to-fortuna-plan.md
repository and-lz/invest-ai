# Plan: Rebrand App Text from "Investimentos" to "Fortuna"

**Context**: [rebrand-to-fortuna-context.md](./rebrand-to-fortuna-context.md)

## Steps

### Step 1: App config files
**Files**: `public/manifest.json`, `public/sw.js`, `package.json`
**Changes**:
- `manifest.json`: name → "Fortuna", short_name → "Fortuna", description → "Dashboard pessoal financeiro - Fortuna"
- `sw.js`: cache name `investimentos-*` → `fortuna-*`
- `package.json`: appId → `com.fortuna.app`, productName → `Fortuna`
**Verify**: Files are valid JSON/JS

### Step 2: Root layout metadata
**Files**: `src/app/layout.tsx`
**Changes**:
- title → "Fortuna"
- description → update branding
- applicationName → "Fortuna"
- appleWebApp title → "Fortuna"
**Verify**: `tsc --noEmit` passes

### Step 3: All page title suffixes (batch replace)
**Files**: All 13+ layout.tsx files listed in context + 2 dynamic page files
**Changes**: Replace `| Investimentos` with `| Fortuna` in every metadata title
- Special: `chat/layout.tsx` → "Fortuna Chat | Fortuna"
- Special: `insights/layout.tsx` → "Análises Fortuna | Fortuna"
**Verify**: Grep for `| Investimentos` returns 0 results

### Step 4: Header navigation + Sign-in page
**Files**: `src/components/layout/header-navigation.tsx`, `src/app/auth/signin/page.tsx`
**Changes**:
- Header: Replace "Investimentos" text with "Fortuna" (mobile L107, desktop L164)
- Sign-in: Change heading to "Fortuna", add `<Logo />` component import and render above/beside the title
**Verify**: Visual check at `/auth/signin` and header

### Step 5: Electron + Report template
**Files**: `electron/main.ts`, `src/lib/serialize-report-markdown.ts`
**Changes**:
- Electron: title → "Fortuna", app.name → "Fortuna"
- Report: "Relatorio de Investimentos" → "Relatório Fortuna"
**Verify**: Grep for remaining "Investimentos" branding

### Step 6: Update tests
**Files**: `__tests__/unit/lib/serializar-relatorio-markdown.test.ts` + any others found
**Changes**: Update string assertions to match new branding
**Verify**: `npm run test` passes

## Verification Plan
- Build: `npx tsc --noEmit && npm run lint` → succeeds
- Tests: `npm run test` → all pass
- Manual: Grep entire src/ for `Investimentos` — only domain terms (glossary, articles) should remain
