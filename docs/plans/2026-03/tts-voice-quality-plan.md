# TTS Voice Quality — Best Voice + Warning

## Context
- User's Mac has premium pt-BR voice installed, but TTS reading mode uses a low-quality one
- Voice selection algorithm in `use-speech-synthesis.ts` may have scoring issues or timing bugs
- Need to: (1) fix selection to always pick best voice, (2) warn user when no good voice available

## Affected Files
- `src/hooks/use-speech-synthesis.ts` — fix scoring, expose `voiceQuality` + `selectedVoiceName`
- `src/components/chat/chat-header.tsx` — add warning badge on TTS button
- `src/components/chat/chat-page-header.tsx` — add warning badge in dropdown
- `src/components/chat/chat-widget.tsx` — show toast on toggle + pass quality info
- `src/app/chat/[id]/page.tsx` — show toast on toggle + pass quality info

## Plan

### Step 1: Fix `use-speech-synthesis.ts`
- Store selected voice in state (trigger re-render on `voiceschanged`)
- Cache best voice after voices load (not re-compute each `speak()`)
- Expose: `selectedVoiceName`, `isHighQualityVoice` (score >= 100), `voiceScore`
- Add dev logging of ALL voices + scores for debugging
- Threshold: score >= 140 = high quality (premium/enhanced/neural + pt-BR)

### Step 2: Add toast warning when TTS toggled on with low quality voice
- In `chat-widget.tsx` and `chat/[id]/page.tsx`: show `notificar.warning()` when toggling TTS on and `!isHighQualityVoice`
- Message: "Voz de alta qualidade não encontrada. Instale uma voz premium em Ajustes do Sistema > Acessibilidade > Conteúdo Falado."

### Step 3: Add warning badge on TTS button
- In `chat-header.tsx`: show small `AlertTriangle` indicator when TTS enabled + low quality
- In `chat-page-header.tsx`: add "(qualidade baixa)" label in dropdown item

## Verification
- `tsc --noEmit` passes
- Toggle TTS in both widget and fullscreen — verify toast + badge appear/disappear correctly
- Dev console logs all voices with scores for debugging
