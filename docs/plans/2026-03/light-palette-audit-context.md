# Context: Light Palette Audit

## Requirements

### Goal
Audit and improve the light mode color palette so it feels as premium and intentional as dark mode.
Dark mode is the reference bar: deep dramatic layering, ultra-bright semantics, clear visual hierarchy.
Light mode should achieve the same result through *bright precision* — clean whites, confident layering, rich but controlled color.

### Acceptance Criteria
- [ ] Background → Card → Popover → Sidebar show clear, distinct elevation layers (like dark mode's 0.10 → 0.22 → 0.26 → 0.12)
- [ ] Background color reads as crisp/premium, not warm-yellow or dirty white
- [ ] Muted / Secondary tokens are clearly distinct from background (currently near-identical)
- [ ] Semantic colors (success, destructive, warning) look rich and confident, not muddy
- [ ] Borders are visible without looking harsh (currently 10% opacity is too faint against white backgrounds)
- [ ] Mesh gradient on body feels subtle and atmospheric, not saturated/garish
- [ ] All changes limited to `:root` block and light-mode `@layer base body` gradient in `globals.css`
- [ ] Dark mode is NOT touched
- [ ] No visual regressions — all UI elements remain readable and functional

### Out of Scope
- Dark mode palette (already intentional and well-designed)
- Radius, font, animation, or component-level changes
- Adding new tokens (only tuning existing ones)
- shadcn component overrides

### Edge Cases
- Sidebar background must remain clearly distinct from main background and from card
- `--muted-foreground` must pass WCAG AA contrast against both `--background` and `--card`
- `--primary-foreground` on `--primary` background must remain readable (button text)
- `--destructive-foreground` / `--success-foreground` on their backgrounds must stay readable

## Q&A Record
- Q: What is wrong? → A: Full audit needed
- Q: Target outcome? → A: Match dark mode quality — make light mode feel as premium and intentional as dark mode

## Codebase Analysis

### Current Light Palette Issues (Diagnosed)

**1. Background is warm-yellow (L=0.94, hue 75) — dirty-white feel**
- Current: `oklch(0.94 0.008 75)` — yellowish-warm grey
- Dark mode equivalent: `oklch(0.10 0.035 250)` — deep intentional navy
- Problem: hue 75 is gold/yellow territory; at high L it reads as aged paper not luxury white

**2. Background → Card elevation too weak**
- Background: `oklch(0.94 0.008 75)`, Card: `oklch(1 0 0)` — only +6 L delta
- Dark mode: Background `0.10`, Card `0.22` — +12 L delta, dramatic layering
- Light mode cards barely float above the background

**3. Muted and Secondary are nearly identical to background**
- Muted/Secondary: `oklch(0.95 0.008 250)` vs Background `oklch(0.94 0.008 75)`
- 1 L difference, different hue — barely distinguishable
- Creates flat, unlayered look in muted-background UI elements (chips, badges, hover states)

**4. Sidebar barely differentiated**
- Sidebar: `oklch(0.97 0.008 250)` — almost white, visually merges with cards
- Dark mode sidebar: `oklch(0.12 0.035 250)` — clearly a distinct zone

**5. Borders too faint**
- Border: `oklch(0.16 0.025 250 / 10%)` — 10% opacity against near-white is almost invisible
- In dark mode 10% opacity works because it's white-on-very-dark; in light mode it needs to be higher

**6. Semantic colors feel muddy**
- Success: `oklch(0.40 0.14 165)` — dark, low-saturation emerald
- Destructive: `oklch(0.45 0.18 15)` — dark burgundy
- Warning: `oklch(0.50 0.14 75)` — dull gold
- These need to be richer and more confident, while remaining readable

**7. Mesh gradient too intense**
- Light mode gradient: chroma 0.045-0.05, opacity 35-70%
- Creates washed-out or "theme park" feel rather than subtle atmospheric depth

**8. Primary as flat dark navy**
- Primary: `oklch(0.20 0.025 250)` — dark navy with very low chroma (0.025)
- Lacks the richness of dark mode's gold primary `oklch(0.95 0.04 75)`
- Interactive elements in light mode feel heavy, not premium

### Existing Patterns to Follow
- Dark mode layering at `globals.css:112-150` — the reference for how to create intentional hierarchy
- OkLCH philosophy: perceptual uniformity means same L = same perceived brightness regardless of hue
- Hue strategy: backgrounds hue 250 (navy/cool), interactive hue 75 (gold), semantics hue 165/15/75

### Affected Files
- `src/app/globals.css` (modify) — `:root` block (lines 71–110) + body gradient (lines 158–173)

### Risks
- Contrast regression (Med) — Mitigate by checking `--muted-foreground` contrast ratios against both bg and card before finalizing
- Sidebar blending with nav (Low) — Keep sidebar at clearly lower L than card
- Gradient over-correction (Low) — Reduce chroma/opacity, validate visually

## Proposed Palette Direction

The light palette should mirror dark mode's *design intent* not its values:

| Token | Dark Mode Logic | Light Mode Logic |
|-------|----------------|-----------------|
| `--background` | Deepest layer (L=0.10, navy) | Lightest surface, cool-white (L=0.98, hue 250 cool-white, not yellow) |
| `--card` | Elevated +12L (L=0.22) | Slightly deeper than bg — use warm white (L=0.99→1.0) |
| `--sidebar` | Darker than bg (L=0.12) | Slightly darker/cooler than bg (L=0.94-0.95, hue 250) |
| `--muted` | Clear step above bg (L=0.28) | Clear step below card — a visible grey (L=0.92-0.93, hue 250) |
| `--muted-foreground` | Very bright secondary (L=0.88) | Medium navy with enough contrast (L=0.42-0.45, chroma 0.03) |
| `--primary` | Brilliant gold (L=0.95, C=0.04, hue 75) | Rich deep navy (L=0.22, C=0.04, hue 250) — richer chroma |
| `--border` | 10% white-on-dark | 15-18% navy-on-white — more visible |
| `--success` | Ultra-bright teal (L=0.82, C=0.20) | Rich teal — increase chroma (L=0.45, C=0.16) |
| `--destructive` | Neon wine (L=0.78, C=0.22) | Rich wine-red — increase chroma (L=0.48, C=0.20) |
| `--warning` | Gold radiante (L=0.88, C=0.20) | Rich amber gold (L=0.52, C=0.16) |
| body gradient | Subtle dark mesh | Lower chroma (0.03), lower opacity (20-30%) |
