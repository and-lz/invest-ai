# Context: Fortuna Color Palette — Full Hue Shift

## Requirements

### Goal
Rebrand the entire OKLCH color palette from navy-dominant (hue 250) to teal+gold, matching the official Fortuna logo. Teal (~165 hue) becomes the primary interactive color; gold (~75 hue) becomes the accent/highlight. Both light and dark modes updated.

### Logo Reference Colors
From `public/fortuna.png` and `public/fortuna-minimal.png`:
- **Teal/Emerald**: ~oklch(0.55 0.15 170) — goddess figure, brand primary
- **Gold**: ~oklch(0.75 0.12 80) — circle border, accent highlights
- **Dark backdrop**: deep teal-navy gradient (fortuna.png full version)

### Acceptance Criteria
- [ ] Base background hue shifted from 250 (navy) to ~180 (deep teal) in dark mode
- [ ] Primary interactive color is teal (hue ~165) in both modes
- [ ] Gold (hue ~75) used for accents, ring, highlights — not primary
- [ ] All CSS custom properties in `:root` and `.dark` updated in `globals.css`
- [ ] Mesh gradients updated to use teal+gold hues
- [ ] AI visual identity colors (breathing glow, gradient, hover) updated
- [ ] Chart palette rebalanced with teal+gold as anchors
- [ ] Semantic colors (success, destructive, warning) remain functionally distinct
- [ ] Hex colors in `manifest.json`, `layout.tsx` (viewport meta), `electron/main.ts` updated
- [ ] `icon.svg` gradient updated from navy to teal
- [ ] App builds: `tsc --noEmit` + lint passes
- [ ] Both light and dark modes look cohesive
- [ ] CLAUDE.md palette documentation updated to match new values

### Out of Scope
- Logo files themselves (already final)
- Component structure or layout changes
- Design system token names (keep `--primary`, `--card`, etc.)
- Tailwind class names (keep `text-primary`, `bg-card`, etc.)

### Edge Cases
- **Success color (hue 165)**: Currently teal — will conflict with new primary teal. Need to shift success to a distinct green (e.g., hue ~145 or ~130) to avoid confusion.
- **Chart-2 (hue 165)**: Also teal — need to differentiate from primary. Could shift to ~145.
- **Muted-foreground**: Must remain readable on new backgrounds — verify contrast.
- **Border opacity**: Current 10% navy on dark bg — may need adjustment for teal tint.

## Q&A Record
- Q: Scope? → A: Full hue shift, not just naming
- Q: Which modes? → A: Both light and dark
- Q: Primary color? → A: Teal as primary interactive, gold as accent

## Codebase Analysis

### Affected Files

**Primary (color definitions):**
- `src/app/globals.css` (modify) — All CSS custom properties, mesh gradients, AI identity colors, breathing glow keyframes. ~150 color values to update.
- `public/icon.svg` (modify) — Gradient from navy to teal, update fill colors

**Secondary (hex colors):**
- `public/manifest.json` (modify) — `background_color` and `theme_color` from `#00030e` (navy-black) to deep teal equivalent
- `src/app/layout.tsx` (modify) — viewport meta `themeColor` light (`#eeeae5`) and dark (`#00030e`)
- `electron/main.ts` (modify) — loading screen background `#0d0c14`

**Documentation:**
- `CLAUDE.md` (modify) — Palette documentation section (colors, hues, philosophy)

### Existing Patterns to Follow
- All colors use OKLCH format with consistent lightness/chroma strategy
- Dark mode: deep backgrounds (L=0.10-0.28), bright foregrounds (L=0.78-1.0)
- Light mode: bright backgrounds (L=0.94-1.0), deep foregrounds (L=0.16-0.58)
- Chroma strategy: Base (0.02-0.035), Semantics (0.12-0.22), Charts (0.12-0.22)
- Mesh gradients use 3 radial stops with navy/gold/teal hues

### Reusable Code Found
- None needed — this is a value replacement task

### Color Shift Strategy

**Hue Mapping (250 → new hues):**
| Element | Current Hue | New Hue | Rationale |
|---------|------------|---------|-----------|
| Backgrounds | 250 (navy) | 180 (deep teal) | Brand identity |
| Primary | 250/75 (navy/gold) | 165 (teal) | User choice |
| Ring/Focus | 75 (gold) | 165 (teal) | Match primary |
| Accent/Highlight | 250 (navy) | 75 (gold) | Logo accent |
| Success | 165 (teal) | 140 (green) | Disambiguate from primary |
| Destructive | 15 (red) | 15 (red) | Keep — functionally distinct |
| Warning | 75 (gold) | 55 (amber) | Shift slightly to not conflict with gold accent |
| Charts | 250,165,75,310,15 | 180,140,75,310,15 | Anchor on brand teal+gold |
| Mesh gradients | 250,75,165 | 180,75,140 | Follow base shift |
| AI identity | 250,165 | 180,165 | Align with brand |

### Risks
- **Success vs Primary confusion** (Med) — Both near hue 165. Mitigated by shifting success to ~140 (greener).
- **Warning vs Gold accent confusion** (Low) — Mitigated by shifting warning to ~55 (amber, warmer).
- **Contrast regression** (Med) — New hue combinations untested. Mitigated by maintaining same lightness/chroma ratios.
- **Icon.svg rendering** (Low) — OKLCH in SVG may not render in all contexts. Current SVG already uses OKLCH, so this is pre-existing.
