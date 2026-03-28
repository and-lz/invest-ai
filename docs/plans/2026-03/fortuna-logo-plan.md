# Fortuna Logo Integration

## Context
Replace the inline SVG logo and all app icons with the Fortuna goddess branding images already in `public/`.

- `fortuna.png` — full logo with navy background (for splash/marketing)
- `fortuna-icon.png` — circular icon with black background (for app icons)

## Affected Files
1. `src/components/ui/logo.tsx` — Replace inline SVG with `<Image>` using `fortuna-icon.png`
2. `scripts/generate-pwa-icons.mjs` — Update to use `fortuna-icon.png` as source instead of `icon.svg`
3. Run icon generation to produce: `icon-192.png`, `icon-512.png`, `apple-icon-180.png`, `favicon.ico`
4. `electron/icons/icon.png` — Generate from `fortuna-icon.png`
5. `package.json` — Electron build icon already points to `public/icon-512.png` (auto-updated via script)

## Plan
1. Update `logo.tsx` to use Next.js `<Image>` with `fortuna-icon.png`, rounded to clip black corners
2. Update `generate-pwa-icons.mjs` to use `fortuna-icon.png` as source
3. Run the script to regenerate all PWA icons + favicon
4. Copy/resize `fortuna-icon.png` to `electron/icons/icon.png`
5. Verify: build check with `tsc --noEmit` + lint

## Verification
- Header shows Fortuna icon (visual check)
- PWA icons regenerated at correct sizes
- Electron icon updated
- No TypeScript/lint errors
