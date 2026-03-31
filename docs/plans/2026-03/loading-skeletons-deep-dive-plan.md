# Plan: Loading Skeletons Deep Dive

**Context**: [loading-skeletons-deep-dive-context.md](./loading-skeletons-deep-dive-context.md)

## Steps

### Step 1: Settings `loading.tsx`
**Files**: `src/app/settings/loading.tsx` (create)
**Pattern**: Following `src/components/settings/settings-content.tsx` layout
**Changes**:
- Create `loading.tsx` that mirrors: page header (icon + h1) + Card with header + 3-column grid of skeleton cards
- Use `layout.pageSpacing`, `layout.pageHeader`, `icon.pageTitle`, `typography.h1`
**Verify**: `tsc --noEmit` passes

### Step 2: Reports page skeleton
**Files**: `src/app/reports/page.tsx` (modify)
**Pattern**: Following `DashboardSkeleton` grid pattern + table rows
**Changes**:
- Replace `<Skeleton className="h-64" />` with a Card containing:
  - Table header row (5 skeleton cells)
  - 3 skeleton table rows with varying widths per column
**Verify**: `tsc --noEmit` passes

### Step 3: Insights page + InsightsList skeleton
**Files**: `src/app/insights/page.tsx` (modify), `src/components/insights/insights-list.tsx` (modify)
**Pattern**: Following conversations-list skeleton (group headers + rows with varying widths)
**Changes**:
- `insights/page.tsx`: Replace `<Skeleton className="h-64" />` with Card skeleton matching insights-list table layout
- `insights-list.tsx`: Replace `<Skeleton className="h-48" />` with Card + table header + 3 skeleton rows
**Verify**: `tsc --noEmit` passes

### Step 4: Plano de Acao skeleton
**Files**: `src/app/plano-acao/page.tsx` (modify)
**Pattern**: Following `ActionItemCard` layout
**Changes**:
- Replace 3x `<Skeleton className="h-32" />` with 3 Card-shaped skeletons:
  - Each has: skeleton badge (top-right), skeleton title line, skeleton description (2 lines), skeleton action buttons row
**Verify**: `tsc --noEmit` passes

### Step 5: Admin Proxy skeleton
**Files**: `src/app/admin/proxy/page.tsx` (modify)
**Pattern**: Following existing page layout (3-card grid + table card)
**Changes**:
- Replace Loader2 spinner block with:
  - 3-column grid of Card skeletons (h-24 each, matching Status/Uptime/Total Requests)
  - Card with skeleton table header + 3 rows
**Verify**: `tsc --noEmit` passes

## New Files
- `src/app/settings/loading.tsx` — Next.js loading boundary for Settings Server Component — pattern from `src/components/settings/settings-content.tsx`

## Verification Plan
- Build: `npx tsc --noEmit` → succeeds
- Lint: `npm run lint` → passes
- Tests: `npm run test` → all pass (no logic changes)
- Manual: Navigate to each affected page and verify skeleton appears during loading, matches the actual layout shape

## Risks
- Low — All changes are cosmetic loading UI. No logic, data, or behavior changes.
