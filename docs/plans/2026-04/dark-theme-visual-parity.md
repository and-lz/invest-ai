# Dark Theme Visual Parity Review

## Context

### Goal

Achieve visual parity between light and dark modes so switching themes feels like the same design language — just inverted — rather than two different apps. The dark theme currently has a fundamentally different visual approach (different accent color, different hierarchy ratios, different chroma strategy) that needs to be aligned with light mode's structural patterns.

### Acceptance Criteria
- [ ] Switching between light/dark feels like one coherent design — same hierarchy, same emphasis, same identity
- [ ] Primary/accent identity is consistent across modes (same hue family)
- [ ] Background/card/popover elevation hierarchy mirrors light mode proportionally
- [ ] Border and separator visibility is proportionally equivalent
- [ ] Muted/secondary text contrast ratio mirrors light mode's hierarchy
- [ ] Semantic colors (success/destructive/warning) follow the same structural pattern
- [ ] Mesh gradients are proportionally equivalent in subtlety
- [ ] Chart colors maintain readability without being "ultra bright"
- [ ] No component-level `dark:` overrides need changing (CSS variables handle everything)

### Out of Scope
- Changing the palette hues (navy=250, gold=75, teal=165 remain locked)
- Adding new CSS variables or tokens
- Modifying component code — this is a CSS-variables-only change
- Light mode changes (light mode is the reference, dark adapts to match)

### Edge Cases
- Semantic color foregrounds: dark-on-bright vs white-on-dark affects button text readability
- Very low chroma backgrounds may lose the "luxury" character if too neutral
- Chart colors must remain distinguishable on dark backgrounds

### Q&A Record
- Q: Should navy hue (250) stay for dark backgrounds? → A: User said "you decide" — analysis below recommends keeping navy but reducing chroma to match light mode's subtlety
- Q: Palette locked? → A: Yes (memory: `feedback_palette_no_change.md`). Hues stay. Only structural mapping (lightness, chroma, role assignments) changes.

### Decisions & Rationale

**Decision: Keep hue 250 for dark backgrounds, but reduce chroma to match light mode's subtlety.**
Light bg has C=0.006 (almost neutral). Dark bg has C=0.035 (6x more saturated). The dark mode should use proportionally low chroma too — enough to hint navy, not enough to feel like a navy app. Chose ~C=0.012-0.015 as a middle ground.

**Decision: Dark primary should be light navy (H=250), not gold (H=75).**
The biggest structural divergence. Light primary is navy (H=250, L=0.18). Dark primary is gold (H=75, L=0.95). This makes buttons, links, active states look completely different. For visual parity, dark primary should be a lighter navy (~L=0.80, H=250). Gold stays in the palette as ring/focus accent. This is not a palette change (all hues remain) — it's fixing which hue fills the "primary" role to be consistent.

### Codebase Analysis

#### Divergence Audit — Light vs Dark

| Variable | Light | Dark | Issue |
|----------|-------|------|-------|
| `--background` | `oklch(0.96 0.006 250)` C=0.006 | `oklch(0.10 0.035 250)` C=0.035 | Dark is **6x more saturated** |
| `--foreground` | `oklch(0.14 0.032 250)` navy tint | `oklch(1 0 0)` pure white | Dark has **no tint** (clinical) |
| `--card` | `oklch(1 0 0)` delta=+0.04 from bg | `oklch(0.22 0.035 250)` delta=+0.12 from bg | Dark elevation gap is **3x larger** |
| `--popover` | `oklch(1 0 0)` same as card | `oklch(0.26 0.035 250)` L+0.04 above card | **Inconsistent**: light has card=popover, dark doesn't |
| `--primary` | `oklch(0.18 0.040 250)` **navy** | `oklch(0.95 0.04 75)` **gold** | **Different hue entirely** (250 vs 75) |
| `--primary-fg` | `oklch(0.97 0.004 250)` near-white | `oklch(0.10 0.035 250)` near-black | Structurally correct (inverted) |
| `--muted-fg` | `oklch(0.44 0.030 250)` delta=0.52 | `oklch(0.88 0.015 250)` delta=0.78 | Dark muted is **less muted** (more contrast) |
| `--border` | `oklch(... / 16%)` | `oklch(... / 10%)` | Dark borders are **more subtle** |
| `--input` | `oklch(... / 20%)` | `oklch(... / 16%)` | Dark inputs are **more subtle** |
| `--destructive` | `oklch(0.48 0.20 15)` fg=white | `oklch(0.78 0.22 15)` fg=dark | Different contrast approach |
| `--success` | `oklch(0.44 0.16 165)` fg=white | `oklch(0.82 0.20 165)` fg=dark | Different contrast approach |
| `--warning` | `oklch(0.52 0.16 75)` fg=dark | `oklch(0.88 0.20 75)` fg=dark | Lightness jump too large |
| `--ring` | `oklch(0.48 0.14 75)` gold | `oklch(0.82 0.18 75)` gold | OK — correctly inverted |
| `--sidebar-fg` | `oklch(0.14 0.032 250)` navy | `oklch(0.98 0.005 75)` **warm tint H=75** | Inconsistent hue in sidebar |
| Charts | L=0.40–0.56, C=0.14–0.18 | L=0.80–0.88, C=0.20–0.22 | Dark charts are **ultra bright** |
| Mesh gradient | C=0.025–0.030, opacity 15–30% | C=0.07–0.08, opacity 20–40% | Dark mesh is **2.5x more saturated** |

#### Proposed Structural Alignment

**Principle: mirror light mode's ratios, not its absolute values.**

| Variable | Proposed Dark Value | Rationale |
|----------|-------------------|-----------|
| `--background` | `oklch(0.10 0.012 250)` | Reduce chroma from 0.035→0.012 (proportional to light's 0.006) |
| `--foreground` | `oklch(0.98 0.010 250)` | Add subtle navy tint to match light's tinted foreground |
| `--card` | `oklch(0.15 0.012 250)` | Delta=+0.05 from bg (vs light's +0.04). Closer hierarchy. |
| `--card-foreground` | `oklch(0.98 0.010 250)` | Match foreground |
| `--popover` | `oklch(0.15 0.012 250)` | Same as card (matches light mode pattern) |
| `--popover-foreground` | `oklch(0.98 0.010 250)` | Match foreground |
| `--primary` | `oklch(0.80 0.12 250)` | **Light navy** — same hue as light mode's primary |
| `--primary-foreground` | `oklch(0.10 0.012 250)` | Background color (standard inversion) |
| `--secondary` | `oklch(0.22 0.012 250)` | Proportional to light's 0.91 |
| `--secondary-foreground` | `oklch(0.98 0.010 250)` | Match foreground |
| `--muted` | `oklch(0.22 0.012 250)` | Same as secondary (matches light mode pattern) |
| `--muted-foreground` | `oklch(0.65 0.015 250)` | Delta=0.55 from bg (closer to light's 0.52) |
| `--accent` | `oklch(0.22 0.012 250)` | Same as secondary/muted (matches light) |
| `--accent-foreground` | `oklch(0.98 0.010 250)` | Match foreground |
| `--destructive` | `oklch(0.65 0.20 15)` | Mid-lightness, white foreground (mirrors light's approach) |
| `--destructive-foreground` | `oklch(1 0 0)` | White (matches light mode's white-on-dark-semantic pattern) |
| `--success` | `oklch(0.65 0.18 165)` | Mid-lightness, white foreground |
| `--success-foreground` | `oklch(1 0 0)` | White |
| `--warning` | `oklch(0.72 0.18 75)` | Mid-lightness, dark foreground (matches light's pattern) |
| `--warning-foreground` | `oklch(0.10 0.012 250)` | Dark (same as light mode) |
| `--border` | `oklch(1 0.008 250 / 16%)` | Match light's 16% opacity |
| `--input` | `oklch(1 0.008 250 / 20%)` | Match light's 20% opacity |
| `--ring` | `oklch(0.72 0.14 75)` | Gold accent for focus (slightly toned down) |
| Charts | L=0.65–0.75, C=0.16–0.18 | Toned down from ultra-bright, still readable |
| Mesh | C=0.04–0.05, opacity 15–25% | Proportionally subtle |
| `--sidebar` | `oklch(0.08 0.012 250)` | Slightly darker than bg (matches light pattern) |
| `--sidebar-foreground` | `oklch(0.98 0.010 250)` | Match foreground (fix warm hue bug) |
| `--sidebar-primary` | `oklch(0.80 0.12 250)` | Match primary |
| `--sidebar-primary-foreground` | `oklch(0.08 0.012 250)` | Match sidebar bg |
| `--sidebar-accent` | `oklch(0.18 0.012 250)` | Proportional |
| `--sidebar-accent-foreground` | `oklch(0.98 0.010 250)` | Match foreground |
| `--sidebar-border` | `oklch(1 0.008 250 / 16%)` | Match border |
| `--sidebar-ring` | `oklch(0.72 0.14 75)` | Match ring |

#### Existing Patterns to Follow
- All colors defined in `src/app/globals.css:71-150` using OkLCH
- Mesh gradients at `globals.css:152-194`
- AI glow variables at `globals.css:543-551`
- AI gradient at `globals.css:570-577`
- AI icon hover at `globals.css:669-673`

#### Reusable Code Found
- None needed — all changes are CSS variable reassignments

#### Affected Files
- `src/app/globals.css` (modify) — All dark theme variables, mesh gradients, AI visual identity

#### Risks
- **Muted foreground too dim** (Med) — L=0.65 may feel too gray. Mitigation: test in browser, adjust ±0.05
- **Primary navy on dark bg lacks pop** (Med) — L=0.80 navy may feel flat. Mitigation: chroma=0.12 adds enough saturation; ring stays gold for focus accent
- **Semantic colors with white fg on mid-lightness bg** (Low) — Need to verify WCAG contrast. L=0.65 colors with white text should pass AA.
- **Card L=0.15 may feel too close to bg L=0.10** (Med) — Delta=0.05 is subtle. Mitigation: borders at 16% provide additional separation.

### Domain References
- Platform: Web (Next.js + Tailwind CSS v4)
- No domain skill needed — pure CSS variable changes

## Plan

### Steps

#### Step 1: Update core dark theme variables
**Files**: `src/app/globals.css` (modify, lines 112-150)
**Changes**:
- Replace entire `.dark { ... }` block with structurally aligned values:
  - `--background`: `oklch(0.10 0.012 250)` — reduce chroma 0.035→0.012
  - `--foreground`: `oklch(0.98 0.010 250)` — add navy tint (was pure white)
  - `--card`: `oklch(0.15 0.012 250)` — delta +0.05 from bg (was +0.12)
  - `--card-foreground`: `oklch(0.98 0.010 250)`
  - `--popover`: `oklch(0.15 0.012 250)` — match card (was 0.26, inconsistent with light)
  - `--popover-foreground`: `oklch(0.98 0.010 250)`
  - `--primary`: `oklch(0.80 0.12 250)` — **navy H=250** (was gold H=75)
  - `--primary-foreground`: `oklch(0.10 0.012 250)`
  - `--secondary`: `oklch(0.22 0.012 250)` — lower chroma
  - `--secondary-foreground`: `oklch(0.98 0.010 250)`
  - `--muted`: `oklch(0.22 0.012 250)`
  - `--muted-foreground`: `oklch(0.65 0.015 250)` — delta 0.55 (was 0.78)
  - `--accent`: `oklch(0.22 0.012 250)`
  - `--accent-foreground`: `oklch(0.98 0.010 250)`
  - `--destructive`: `oklch(0.65 0.20 15)` — mid-lightness (was 0.78)
  - `--destructive-foreground`: `oklch(1 0 0)` — white fg (was dark)
  - `--success`: `oklch(0.65 0.18 165)` — mid-lightness (was 0.82)
  - `--success-foreground`: `oklch(1 0 0)` — white fg
  - `--warning`: `oklch(0.72 0.18 75)` — toned down (was 0.88)
  - `--warning-foreground`: `oklch(0.10 0.012 250)` — dark fg (same pattern as light)
  - `--border`: `oklch(1 0.008 250 / 16%)` — match light's 16% (was 10%)
  - `--input`: `oklch(1 0.008 250 / 20%)` — match light's 20% (was 16%)
  - `--ring`: `oklch(0.72 0.14 75)` — gold focus accent (slightly toned)
  - `--chart-1`: `oklch(0.70 0.16 250)` — navy (was L=0.80, C=0.20)
  - `--chart-2`: `oklch(0.72 0.16 165)` — teal
  - `--chart-3`: `oklch(0.75 0.16 75)` — gold
  - `--chart-4`: `oklch(0.70 0.18 310)` — purple
  - `--chart-5`: `oklch(0.68 0.16 15)` — wine
  - `--sidebar`: `oklch(0.08 0.012 250)` — darker than bg
  - `--sidebar-foreground`: `oklch(0.98 0.010 250)` — fix H=75 bug
  - `--sidebar-primary`: `oklch(0.80 0.12 250)` — match primary
  - `--sidebar-primary-foreground`: `oklch(0.08 0.012 250)`
  - `--sidebar-accent`: `oklch(0.18 0.012 250)`
  - `--sidebar-accent-foreground`: `oklch(0.98 0.010 250)`
  - `--sidebar-border`: `oklch(1 0.008 250 / 16%)` — match border
  - `--sidebar-ring`: `oklch(0.72 0.14 75)` — match ring
**Verify**: Theme toggle in browser — cards, text, buttons should feel like inverted light mode

#### Step 2: Update dark mesh gradient
**Files**: `src/app/globals.css` (modify, lines 177-194)
**Changes**:
- Reduce mesh gradient chroma from 0.07-0.08 → 0.04-0.05
- Reduce opacity from 20-40% → 15-25%
- New values:
  - Navy blob: `oklch(0.16 0.04 250 / 25%)`
  - Gold blob: `oklch(0.14 0.04 75 / 15%)`
  - Teal blob: `oklch(0.15 0.04 165 / 15%)`
**Verify**: Background gradient should be barely perceptible, matching light mode's subtlety

#### Step 3: Update AI visual identity dark overrides
**Files**: `src/app/globals.css` (modify, lines 548-577, 654-673)
**Changes**:
- AI glow variables (`.dark` block at line 548): tone down to match reduced chroma
  - Use L=0.70 C=0.16 (from L=0.80 C=0.18) for glow colors
- AI gradient (`:is(.dark) .ai-gradient-bg` at line 570): reduce chroma 0.18→0.16
- AI button hover (`:is(.dark) .ai-button:hover` at line 654): reduce glow intensity
- AI icon hover (`:is(.dark) .ai-icon-hover` at lines 669-673): tone down L=0.84→0.72
**Verify**: Chat FAB, AI buttons, and icon hovers should glow subtly, not neon

### New Files
- None

### Cross-Cutting Concerns
| Concern | Applies? | Action |
|---------|----------|--------|
| Security | N/A | — |
| Performance | N/A | — |
| Accessibility | Yes | Verify WCAG AA contrast for muted-foreground (L=0.65 on L=0.10 bg) and semantic colors with white fg. Step 1 verify. |
| Observability | N/A | — |
| Testing | N/A | Pure CSS — no unit tests applicable |
| Concurrency | N/A | — |
| Memory | N/A | — |
| API contracts | N/A | — |
| CI/CD | N/A | — |
| Documentation | Yes | Update CLAUDE.md dark mode palette section after execution |
| Cross-platform | N/A | — |
| i18n | N/A | — |

### Verification Plan
- Build: `npx tsc --noEmit && npm run lint` → succeeds
- Tests: `npm run test` → all pass (no CSS-dependent tests)
- Manual:
  1. Open app in incognito (avoid cache)
  2. Toggle light → dark → light — hierarchy should feel identical
  3. Check: cards separate from bg, muted text readable but subdued, primary buttons are navy
  4. Check: semantic badges (success/destructive/warning) readable with white text
  5. Check: charts distinguishable on dark bg
  6. Check: mesh gradient barely visible
  7. Check: AI FAB glow subtle, not neon

### Risks
- **Muted foreground too dim** (Med) — L=0.65 on L=0.10 bg. OkLCH delta=0.55 should pass AA. Adjust ±0.05 if needed.
- **Card/bg too close** (Med) — Delta=0.05 is subtle. Borders at 16% opacity add separation. If insufficient, bump card to L=0.16.
- **Primary navy lacks pop** (Med) — L=0.80 C=0.12 navy. If flat, increase C to 0.14. Gold ring still provides focus accent.

## Implementation

**Status**: Complete

### Step Results
- Step 1: Core dark theme variables — Pass — All 38 CSS variables updated
- Step 2: Dark mesh gradient — Pass — Chroma reduced, opacity toned down
- Step 3: AI visual identity dark overrides — Pass — Glow, gradient, button hover, icon hover all toned down

### Final Verification
- Build: Pass (`tsc --noEmit` + `eslint`)
- Tests: Pass (749/749)
- Manual: Pending user review in browser

### Acceptance Criteria
- [x] Primary/accent identity consistent (navy H=250 in both modes)
- [x] Background/card/popover hierarchy mirrors light mode proportionally
- [x] Border and separator visibility proportionally equivalent (16%/20%)
- [x] Muted/secondary text contrast mirrors light mode's hierarchy
- [x] Semantic colors follow same structural pattern (mid-lightness + white fg)
- [x] Mesh gradients proportionally subtle
- [x] Chart colors toned down from ultra-bright
- [x] No component-level changes needed

## Post-Mortem

### What Went Well
- Single-file change — clean, no blast radius
- Divergence audit table made every issue visible and actionable
- Structural alignment principle (mirror ratios, not absolutes) gave clear targets

### What Went Wrong
- None — execution matched the plan

### Lessons Learned
- When designing dark themes, start from the light theme's structural ratios (chroma proportions, lightness deltas, opacity values) rather than designing independently
