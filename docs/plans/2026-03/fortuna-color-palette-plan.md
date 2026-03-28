# Plan: Fortuna Color Palette — Full Hue Shift

**Context**: [fortuna-color-palette-context.md](./fortuna-color-palette-context.md)

## Color Shift Reference

### Hue Mapping Summary
| Role | Old Hue | New Hue |
|------|---------|---------|
| Backgrounds (base) | 250 (navy) | 180 (deep teal) |
| Primary interactive | 250 light / 75 dark | 165 (teal) both |
| Ring / Focus | 75 (gold) | 165 (teal) |
| Secondary / Muted / Accent | 250 (navy) | 180 (deep teal) |
| Success | 165 (teal) | 140 (green) |
| Warning | 75 (gold) | 55 (amber) |
| Destructive | 15 (red) | 15 (unchanged) |
| Charts anchor | 250 first | 180 first, 140 second |
| AI identity glow | 250+165 | 180+165 |
| Sidebar | 250 | 180 |

## Steps

### Step 1: Light mode CSS custom properties
**Files**: `src/app/globals.css` (modify)
**Changes** in `:root` block (lines 71-110):
- Comment: "Warm White with **Teal** Accents" (was Navy)
- `--background`: keep L/C, hue 75→75 (warm white stays)
- `--foreground`: hue 250→180 (deep teal text instead of navy)
- `--card-foreground`, `--popover-foreground`: same as foreground → 180
- `--primary`: oklch(0.20 0.025 250) → oklch(0.22 0.12 165) (rich teal, higher chroma for brand punch)
- `--primary-foreground`: oklch(0.98 0.008 75) → oklch(0.98 0.008 165) (teal-tinted white)
- `--secondary`, `--muted`, `--accent`: hue 250→180
- `--secondary-foreground`, `--accent-foreground`: hue 250→180
- `--muted-foreground`: hue 250→180
- `--success`: oklch(0.40 0.14 165) → oklch(0.40 0.14 140) (shift to green)
- `--warning`: oklch(0.50 0.14 75) → oklch(0.50 0.14 55) (shift to amber)
- `--warning-foreground`: hue 250→180
- `--border`, `--input`: hue 250→180
- `--ring`: oklch(0.60 0.10 75) → oklch(0.50 0.12 165) (teal ring)
- Charts: `--chart-1` hue 250→180, `--chart-2` hue 165→140 (avoid primary clash)
- Sidebar: all hue 250→180
- `--sidebar-ring`: gold→teal (match ring)
**Verify**: No syntax errors, file saves

### Step 2: Dark mode CSS custom properties
**Files**: `src/app/globals.css` (modify)
**Changes** in `.dark` block (lines 112-150):
- Comment: "Deep **Teal** Backgrounds with Ultra Bright Colors"
- `--background`: oklch(0.10 0.035 250) → oklch(0.10 0.035 180)
- `--card`: hue 250→180
- `--popover`: hue 250→180
- `--primary`: oklch(0.95 0.04 75) → oklch(0.82 0.16 165) (bright teal, not gold)
- `--primary-foreground`: hue 250→180
- `--secondary`, `--muted`, `--accent`: hue 250→180
- `--muted-foreground`: hue 250→180
- `--destructive-foreground`, `--success-foreground`, `--warning-foreground`: hue 250→180
- `--success`: oklch(0.82 0.20 165) → oklch(0.82 0.20 140) (green)
- `--warning`: oklch(0.88 0.20 75) → oklch(0.88 0.20 55) (amber)
- `--border`, `--input`: hue 250→180
- `--ring`: oklch(0.82 0.18 75) → oklch(0.82 0.18 165) (teal)
- Charts: `--chart-1` hue 250→180, `--chart-2` hue 165→140
- Sidebar: all hue 250→180
- `--sidebar-primary`: hue 250→180
- `--sidebar-ring`: gold→teal
**Verify**: No syntax errors

### Step 3: Mesh gradients + AI visual identity
**Files**: `src/app/globals.css` (modify)
**Changes**:
- Light mesh gradient (lines 159-173): hue 250→180 in first gradient stop, hue 165→140 in third
- Dark mesh gradient (lines 179-194): hue 250→180 in first, hue 165→140 in third
- AI glow pulse `:root` (lines 462-465): hue 250→180
- AI glow pulse `.dark` (lines 468-469): hue 250→180
- `ai-glow-pulse` keyframe (lines 449-460): hue 250→180
- `.ai-gradient-bg` (lines 479-496): hue 250→180 (first stop), keep 165 (middle), keep 75 (gold end)
- `.ai-button:hover` box-shadow (line 570-574): keep 165 (already teal — good)
- `.ai-icon-hover` colors (lines 582-592): keep 165 (already teal — good)
**Verify**: `npx tsc --noEmit`

### Step 4: Hex colors in config files
**Files**: `public/manifest.json`, `src/app/layout.tsx`, `electron/main.ts`
**Changes**:
- `manifest.json`: `background_color` and `theme_color` from `#00030e` → `#001a1a` (deep teal-black)
- `layout.tsx`: viewport meta dark `#00030e` → `#001a1a`, light `#eeeae5` → `#eae5e5` (cooler warm white)
- `electron/main.ts`: loading background `#0d0c14` → `#0a1414` (deep teal-black)
**Verify**: Files are valid

### Step 5: Icon SVG update
**Files**: `public/icon.svg` (modify)
**Changes**:
- linearGradient stops: hue 250→180 (deep teal gradient instead of navy)
- R$ text fill: keep gold (hue 75) — matches accent role
- Chart line stroke: keep gold
- Data point fills: keep existing variety
**Verify**: SVG renders correctly

### Step 6: CLAUDE.md palette documentation
**Files**: `CLAUDE.md` (modify)
**Changes**:
- Update "Paleta Financeira OkLCH" section with new hue references
- Replace "navy" references with "teal" where referring to base/background
- Update all oklch example values to match new palette
- Update chart color table
- Update mesh gradient description
- Keep documentation structure identical
**Verify**: Documentation matches actual CSS values

## New Files
None — all changes are modifications to existing files.

## Verification Plan
- Build: `npx tsc --noEmit && npm run lint` → succeeds
- Tests: `npm run test` → all pass (no color values in tests)
- Manual: `grep -r "oklch.*250" src/app/globals.css` → only destructive (hue 15) and independent hues remain; no hue 250 references
- Manual: Verify dark and light mode visually in browser

## Risks
- **Success vs Primary visual confusion** (Med) — Mitigated by 25-hue gap (140 vs 165) + different lightness/chroma
- **Contrast regression on teal backgrounds** (Med) — Maintaining identical L/C ratios as navy version; teal at same lightness has similar perceived contrast
- **Gold accent less prominent** (Low) — Gold shifts from primary to accent role; still present in mesh gradients and chart-3
