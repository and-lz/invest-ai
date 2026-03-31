# Context: Loading Skeletons Deep Dive

## Requirements

### Goal
Audit every page/component in the app and add proper loading skeletons that match the actual rendered layout. Replace weak single-block skeletons with layout-accurate ones. Add `loading.tsx` files where they provide value.

### Acceptance Criteria
- [ ] Every data-fetching page has a skeleton that mirrors its actual layout (grid structure, card heights, table rows)
- [ ] Reports page skeleton matches the header + table layout (not a single `h-64` block)
- [ ] Insights page skeleton matches the header + list layout (not a single `h-64` block)
- [ ] Admin Proxy page uses skeleton cards + table instead of Loader2 spinner text
- [ ] Settings page has a `loading.tsx` (only Server Component that fetches data — blank screen without it)
- [ ] Plano de Ação skeleton matches the card layout (currently 3 generic `h-32` blocks)
- [ ] Insights list component skeleton matches the list layout (currently single `h-48` block)
- [ ] All skeletons use existing `Skeleton` component from `src/components/ui/skeleton.tsx`
- [ ] All skeletons use design system tokens (`layout.*`, `icon.*`, `typography.*`)
- [ ] No regressions — existing good skeletons (Dashboard, Desempenho, Trends, Chat) remain untouched

### Out of Scope
- Dashboard page skeleton (already good — `DashboardSkeleton` with 4-card grid + chart)
- Desempenho page skeleton (already good — grid + charts + Suspense boundary)
- Trends page skeleton (already good — 4-card grid + charts)
- Chat components (already have detailed skeletons for conversations list and message loading)
- Aprender routes (static content, no data fetching)
- Auth page (static, no data fetching)
- Adding Suspense boundaries (only 1 exists in desempenho — not in scope to add more)
- Dynamic import loading fallbacks (already well-handled with `<Skeleton className="h-XX" />`)

### Edge Cases
- Settings page: `loading.tsx` must work with the Server Component async data fetch pattern
- Reports page: skeleton should account for responsive table columns (some hidden on mobile)
- Admin Proxy: skeleton should work both when proxy is reachable and unreachable

## Q&A Record
- Q: Should we add `loading.tsx` for all routes? → A: Only for Settings (Server Component with async fetch). Client component pages handle loading via SWR hooks — `loading.tsx` would flash briefly before the client bundle loads, which is worse UX than the current behavior.

## Codebase Analysis

### Existing Patterns to Follow
- **DashboardSkeleton** — see `src/components/dashboard/dashboard-sub-components.tsx:97-108` — Grid of `Skeleton` blocks matching real layout (4 cards + 1 chart). Best example of layout-accurate skeleton.
- **Desempenho skeleton** — see `src/app/desempenho/page.tsx:176-186` — Grid + chart blocks. Inline skeleton with `Array.from({ length: 4 }).map(...)` pattern.
- **Chat conversations skeleton** — see `src/components/chat/conversations-list.tsx:58-80` — Most detailed: group headers + rows with varying widths. Best example of content-shaped skeleton.
- **SWR hook pattern** — all hooks return `estaCarregando` boolean from `isLoading`. Pages do `{estaCarregando && <Skeleton />}`.
- **Design system tokens**: `layout.pageSpacing`, `layout.sectionSpacing`, `layout.pageHeader`, `layout.emptyStateCard`, `icon.pageTitle`, `typography.*`

### Reusable Code Found
- `Skeleton` component at `src/components/ui/skeleton.tsx` — base building block
- `DashboardSkeleton` at `src/components/dashboard/dashboard-sub-components.tsx:97` — pattern reference
- Design system tokens at `src/lib/design-system.ts` — layout constants

### Affected Files

**Weak skeletons to improve (modify):**
1. `src/app/reports/page.tsx` — Replace single `<Skeleton className="h-64" />` with table-shaped skeleton
2. `src/app/insights/page.tsx` — Replace single `<Skeleton className="h-64" />` with list-shaped skeleton
3. `src/app/plano-acao/page.tsx` — Replace 3x `<Skeleton className="h-32" />` with card-shaped skeletons
4. `src/app/admin/proxy/page.tsx` — Replace Loader2 spinner with 3-card grid + table skeleton
5. `src/components/insights/insights-list.tsx` — Replace single `<Skeleton className="h-48" />` with list-shaped skeleton

**Missing loading states (create):**
6. `src/app/settings/loading.tsx` — New file. Only Server Component route that fetches data.

### Risks
- Low — All changes are additive/replacement of existing loading UI. No logic changes.
- Low — Skeleton dimensions are cosmetic. If slightly off, it's still better than a single block.
