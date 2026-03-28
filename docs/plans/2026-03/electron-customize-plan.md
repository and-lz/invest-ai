# Customize Electron App (Icon + Name)

## Context
- App name should be "Investimentos" (remove "Dev" suffix)
- App ID should be "com.investimentos.app" (remove ".dev")
- Use existing `public/icon-512.png` as the macOS app icon
- Window title already says "Investimentos" — no change needed

## Plan
1. **package.json**: Update `productName` to "Investimentos", `appId` to "com.investimentos.app"
2. **electron/main.ts**: Update `app.name` to "Investimentos" (sets macOS dock name)

## Verification
- `npm run desktop:build-main` compiles without errors
- Dock shows "Investimentos" when running
