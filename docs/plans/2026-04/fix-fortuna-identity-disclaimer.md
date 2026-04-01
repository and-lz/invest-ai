# Fix: Fortuna Identity — Remove Development-Agent Disclaimers

## Context

**Problem:** The Fortuna chat assistant is leaking its underlying identity and generating disclaimers like:
- "do escopo do que faço aqui — sou um agente de desenvolvimento para o projeto Invest-AI."
- "Para decisões de investimento, consulte um assessor financeiro certificado (CEA/CFP) ou plataformas como BTG, XP, ou seu banco."

**Root cause:** The system prompt at `src/lib/build-chat-system-prompt.ts` already bans generic disclaimers but doesn't:
1. Reinforce Fortuna's identity strongly enough (the LLM reverts to its training persona)
2. Explicitly forbid platform referrals (BTG, XP, etc.)
3. Explicitly forbid revealing its underlying nature as a "development agent"

**Affected file:** `src/lib/build-chat-system-prompt.ts` — POSTURA section

## Plan

1. Strengthen the identity line: make Fortuna's persona unambiguous — she is NOT a generic AI assistant, NOT a development agent, she IS a specialized investment analyst for this user's portfolio.
2. Add explicit prohibitions to the POSTURA block:
   - Never refer to yourself as an "agente de desenvolvimento" or any other non-investment role
   - Never redirect users to external platforms (BTG, XP, banco, etc.)
   - Never say "fora do meu escopo" — either answer with available data or admit the data is missing

## Verification

- Read the updated prompt and confirm the new identity line and prohibitions are present
- No build step required — prompt-only change
