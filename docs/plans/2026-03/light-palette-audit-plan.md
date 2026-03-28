# Plan: Light Palette Audit

**Context**: [light-palette-audit-context.md](./light-palette-audit-context.md)

## Overview

Single-step change to `src/app/globals.css` — only the `:root` block (lines 71–110) and the light-mode body gradient (lines 158–173).
Dark mode is not touched.

## Token-by-Token Changes

### Backgrounds & Surfaces

| Token | Current | New | Reason |
|-------|---------|-----|--------|
| `--background` | `oklch(0.94 0.008 75)` | `oklch(0.96 0.006 250)` | Remove yellow cast (hue 75→250); slightly brighter crisp cool-white |
| `--card` | `oklch(1 0 0)` | `oklch(1 0 0)` | **No change** — pure white card is correct |
| `--popover` | `oklch(1 0 0)` | `oklch(1 0 0)` | **No change** |
| `--sidebar` | `oklch(0.97 0.008 250)` | `oklch(0.92 0.010 250)` | Sidebar must read as recessed, not elevated — fix inverted layering |
| `--sidebar-accent` | `oklch(0.94 0.01 250)` | `oklch(0.88 0.012 250)` | Hover state in sidebar needs visible contrast from sidebar bg |
| `--muted` | `oklch(0.95 0.008 250)` | `oklch(0.91 0.010 250)` | Muted chips/badges need to pop against cards and background |
| `--secondary` | `oklch(0.95 0.008 250)` | `oklch(0.91 0.010 250)` | Same fix — currently indistinguishable from background |
| `--accent` | `oklch(0.95 0.008 250)` | `oklch(0.91 0.010 250)` | Same |

### Foregrounds

| Token | Current | New | Reason |
|-------|---------|-----|--------|
| `--foreground` | `oklch(0.16 0.025 250)` | `oklch(0.14 0.032 250)` | Richer navy — darker + more chroma for premium feel |
| `--card-foreground` | `oklch(0.16 0.025 250)` | `oklch(0.14 0.032 250)` | Match foreground |
| `--popover-foreground` | `oklch(0.16 0.025 250)` | `oklch(0.14 0.032 250)` | Match |
| `--muted-foreground` | `oklch(0.48 0.025 250)` | `oklch(0.44 0.030 250)` | Stronger secondary contrast + more chroma |
| `--primary` | `oklch(0.20 0.025 250)` | `oklch(0.18 0.040 250)` | Richer navy (match dark mode's gold chroma 0.04 philosophy) |
| `--primary-foreground` | `oklch(0.98 0.008 75)` | `oklch(0.97 0.004 250)` | Align hue to 250 (cool white on navy) |
| `--secondary-foreground` | `oklch(0.20 0.025 250)` | `oklch(0.18 0.040 250)` | Match primary |
| `--accent-foreground` | `oklch(0.20 0.025 250)` | `oklch(0.18 0.040 250)` | Match primary |
| `--sidebar-foreground` | `oklch(0.16 0.025 250)` | `oklch(0.14 0.032 250)` | Match foreground |
| `--sidebar-primary` | `oklch(0.20 0.025 250)` | `oklch(0.18 0.040 250)` | Match primary |
| `--sidebar-primary-foreground` | `oklch(0.97 0.008 250)` | `oklch(0.92 0.010 250)` | Match sidebar bg |
| `--sidebar-accent-foreground` | `oklch(0.20 0.025 250)` | `oklch(0.18 0.040 250)` | Match primary |

### Borders, Inputs & Ring

| Token | Current | New | Reason |
|-------|---------|-----|--------|
| `--border` | `oklch(0.14 0.025 250 / 10%)` | `oklch(0.14 0.032 250 / 16%)` | 10% opacity is invisible on near-white; 16% creates a visible but non-harsh divider |
| `--input` | `oklch(0.16 0.025 250 / 14%)` | `oklch(0.14 0.032 250 / 20%)` | Inputs need stronger definition |
| `--sidebar-border` | `oklch(0.16 0.025 250 / 10%)` | `oklch(0.14 0.032 250 / 14%)` | Slightly more visible in sidebar context |
| `--ring` | `oklch(0.60 0.10 75)` | `oklch(0.48 0.14 75)` | Richer gold focus ring — more intentional |
| `--sidebar-ring` | `oklch(0.60 0.10 75)` | `oklch(0.48 0.14 75)` | Match ring |

### Semantic Colors

| Token | Current | New | Reason |
|-------|---------|-----|--------|
| `--success` | `oklch(0.40 0.14 165)` | `oklch(0.44 0.16 165)` | Richer chroma + brighter — less muddy |
| `--destructive` | `oklch(0.45 0.18 15)` | `oklch(0.48 0.20 15)` | More saturated wine-red |
| `--warning` | `oklch(0.50 0.14 75)` | `oklch(0.52 0.16 75)` | Richer amber gold |
| `--warning-foreground` | `oklch(0.16 0.025 250)` | `oklch(0.12 0.032 250)` | Stronger contrast on bright amber |

### Charts (Light Mode)

| Token | Current | New | Reason |
|-------|---------|-----|--------|
| `--chart-1` | `oklch(0.42 0.14 250)` | `oklch(0.40 0.16 250)` | Richer navy |
| `--chart-2` | `oklch(0.52 0.12 165)` | `oklch(0.50 0.14 165)` | Richer teal |
| `--chart-3` | `oklch(0.58 0.14 75)` | `oklch(0.56 0.16 75)` | Richer gold |
| `--chart-4` | `oklch(0.48 0.16 310)` | `oklch(0.46 0.18 310)` | Richer purple |
| `--chart-5` | `oklch(0.50 0.16 15)` | `oklch(0.48 0.18 15)` | Richer wine |

### Body Gradient (Light Mode)

Current: high chroma (0.045–0.05), high opacity (35–70%) — too garish.
New: reduced chroma (0.025–0.03) and opacity (15–30%) — subtle depth.

```css
background-image: radial-gradient(
    ellipse 80% 60% at 10% 0%,
    oklch(0.94 0.030 250 / 30%),
    transparent
  ),
  radial-gradient(
    ellipse 60% 50% at 90% 10%,
    oklch(0.94 0.025 75 / 20%),
    transparent
  ),
  radial-gradient(
    ellipse 70% 40% at 50% 100%,
    oklch(0.93 0.025 165 / 15%),
    transparent
  );
```

## Steps

### Step 1: Replace `:root` token block
**File**: `src/app/globals.css` (modify — lines 71–110)
**Changes**: Apply all token changes from the tables above in a single replacement of the `:root` block
**Verify**: `npx tsc --noEmit` passes; dev server loads without errors

### Step 2: Update light-mode body gradient
**File**: `src/app/globals.css` (modify — lines 158–173)
**Changes**: Replace the light-mode gradient with reduced chroma/opacity version
**Verify**: Visual check in browser light mode — background should feel clean, not colorful

## New Files
None.

## Verification Plan
- Build: `npx tsc --noEmit` → no type errors (CSS-only change, should pass trivially)
- Lint: `npm run lint` → no issues
- Manual: open the app in light mode and verify:
  - Background is cool-white (not yellow/warm)
  - Cards visibly float above background
  - Sidebar reads as a recessed panel (darker than bg)
  - Muted chips/badges are clearly visible on card backgrounds
  - Borders on cards and inputs are visible but not harsh
  - Success (teal), destructive (wine), warning (gold) look rich and confident
  - Chart colors are vibrant

## Risks
- WCAG contrast regression on `--muted-foreground` (Med) — `oklch(0.44 0.030 250)` on `oklch(0.96 0.006 250)` has sufficient L delta; mitigated by moving L down from 0.48 to 0.44
- Sidebar too dark (Low) — `oklch(0.92 0.010 250)` against background `0.96` creates 4L gap; clearly distinct without being jarring
- Charts too saturated (Low) — chroma increase is modest (+0.02 per channel)
