# MVP — Invest-AI: Dashboard Inteligente de Investimentos

## Vision Statement

**Invest-AI** transforms raw brokerage PDF reports into an intelligent, visual investment dashboard — powered by AI — so that individual investors can understand their portfolio without spreadsheets or financial expertise.

---

## Target User

**Brazilian individual investor** who:
- Receives monthly PDF reports from their brokerage (B3 consolidated or broker-specific)
- Has little to no financial analysis background
- Wants to understand: "Am I doing well? What should I do next?"
- Uses mobile primarily (PWA-first)

---

## Core Value Proposition

> "Upload your brokerage PDF. Get a complete dashboard with AI insights in under 60 seconds."

---

## MVP Feature Map

### Tier 1 — Must Have (Core Loop)

These are the features without which the product has no reason to exist.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | **Google OAuth login** | DONE | Auth.js v5, JWT sessions, middleware guard |
| 2 | **PDF upload + AI extraction** | DONE | Gemini parses PDF → structured JSON, background task with polling |
| 3 | **Password-protected PDF support** | DONE | WASM-based decryption (qpdf) |
| 4 | **Dashboard with key metrics** | DONE | Summary cards (patrimonio, rentabilidade, variacao mensal) |
| 5 | **Wealth evolution chart** | DONE | Line chart over time with takeaway conclusions |
| 6 | **Asset allocation breakdown** | DONE | Pie/donut chart by strategy |
| 7 | **Benchmark comparison** (CDI/IPCA/Ibov) | DONE | Line chart, carteira vs benchmarks |
| 8 | **Top/worst performers** | DONE | Ranked tables with auto-conclusions |
| 9 | **Period selector** | DONE | Filter dashboard by uploaded month |
| 10 | **Report management** (list/delete) | DONE | Reports page with CRUD |
| 11 | **Mobile-responsive UI** | DONE | Tailwind responsive, PWA installable |
| 12 | **Dark/light theme** | DONE | next-themes, OkLCH palette |

### Tier 2 — Should Have (Differentiation)

Features that elevate the product from "dashboard" to "intelligent assistant".

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 13 | **AI monthly insights** | DONE | Gemini generates per-period analysis with actionable suggestions |
| 14 | **Consolidated insights** | DONE | Cross-period trend analysis |
| 15 | **AI chat assistant** | DONE | Streaming, context-aware, conversation history, visual highlighting |
| 16 | **Action plan** | DONE | AI-enriched tasks from insights + takeaways, status tracking |
| 17 | **Data-driven takeaways** | DONE | Auto-conclusions on every chart card |
| 18 | **Educational tooltips** | DONE | 100+ glossary terms linked throughout UI |
| 19 | **Background task system** | DONE | 202 + after() + polling + retry, activity center in header |
| 20 | **Notification center** | DONE | Server-side persistence, bell badge, mark-as-read |

### Tier 3 — Nice to Have (Depth & Engagement)

Features that add depth but are not essential for first users.

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 21 | **Per-asset performance** (`/desempenho`) | DONE | Portfolio asset detail + AI analysis |
| 22 | **Market trends** (`/trends`) | DONE | Requires BRAPI_TOKEN; graceful fallback |
| 23 | **Learning center** (`/aprender`) | DONE | 8 articles, 7 categories, searchable glossary |
| 24 | **Monthly returns heatmap** | DONE | 12-month visual heatmap |
| 25 | **Risk/consistency analysis** | DONE | Risk-return card |
| 26 | **Liquidity ladder** | DONE | Tier breakdown |
| 27 | **Allocation evolution over time** | DONE | Stacked area chart |
| 28 | **Chat TTS** (text-to-speech) | DONE | Browser SpeechSynthesis |
| 29 | **Manual JSON import** | DONE | Fallback for failed AI extraction |

---

## What's NOT Built (Post-MVP Backlog)

| # | Feature | Priority | Rationale |
|---|---------|----------|-----------|
| 1 | **Multi-broker PDF support** | HIGH | Current extraction depends on report format — needs testing with XP, Rico, Clear, BTG, Inter, Nu, etc. |
| 2 | **Onboarding flow** | HIGH | No guided first-use experience — new user lands on empty dashboard |
| 3 | **Goal setting** | MEDIUM | "I want to reach R$1M by 2030" — track progress toward financial goals |
| 4 | **Email notifications / digest** | MEDIUM | Monthly summary email when new report is expected |
| 5 | **Data export** (CSV/PDF) | MEDIUM | Users may want to export their processed data |
| 6 | **Multi-user sharing** | LOW | Advisor/family member view |
| 7 | **Automated PDF ingestion** | LOW | Email forwarding or broker API integration |
| 8 | **Tax report assistant** | LOW | DARF/IR calculation from transactions |
| 9 | **Portfolio simulation** | LOW | "What if I add R$10k to PETR4?" |
| 10 | **Social/community** | LOW | Compare anonymized performance with peers |

---

## Technical Requirements for Launch

### Environment Variables (Minimum)

| Variable | Required | Where |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Neon PostgreSQL |
| `GOOGLE_CLIENT_ID` | Yes | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Yes | Google Cloud Console |
| `AUTH_SECRET` | Yes | Random secret for JWT |
| `GOOGLE_API_KEY` | Yes | Google AI Studio (Gemini) |
| `BLOB_READ_WRITE_TOKEN` | Production | Vercel Blob |
| `BRAPI_TOKEN` | Optional | Enables /trends + real-time quotes |

### Infrastructure

| Component | Service | Cost |
|-----------|---------|------|
| Hosting | Vercel (Hobby/Pro) | Free–$20/mo |
| Database | Neon PostgreSQL | Free tier sufficient |
| AI | Google Gemini API | Pay-per-use (~$0.01/report) |
| Blob storage | Vercel Blob | Included in Vercel plan |
| OAuth | Google Cloud | Free |
| Market data | BRAPI | Free tier (optional) |

### Pre-Launch Checklist

- [ ] **Multi-broker PDF testing** — validate extraction with top 5 Brazilian brokers
- [ ] **Onboarding UX** — empty state → upload CTA → first dashboard (guided)
- [ ] **Error recovery UX** — better guidance when Gemini extraction fails
- [ ] **Rate limiting** — no API rate limiting currently; needed before public launch
- [ ] **Terms of service / privacy policy** — handling financial data requires legal compliance
- [ ] **LGPD compliance** — data deletion, export, consent flows
- [ ] **Gemini API cost monitoring** — alerts for unexpected usage spikes
- [ ] **Performance audit** — Lighthouse score, LCP, bundle size analysis
- [ ] **Clean up dead env vars** — remove `AI_PROVIDER` and `ANTHROPIC_API_KEY` from .env.example

---

## MVP Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| PDF extraction success rate | > 90% | Track Gemini extraction failures vs attempts |
| Time to first dashboard | < 60s | From upload click to dashboard render |
| User retention (week 1) | > 40% | Return visit within 7 days of signup |
| Reports uploaded per user | > 2 | Average across active users |
| Chat engagement | > 30% | % of users who open chat at least once |
| PWA install rate | > 15% | Install prompt acceptance rate |

---

## Verdict

**The product is feature-complete for an MVP.** All 29 features across the three tiers are implemented and functional. The core loop (upload → dashboard → insights → action) works end-to-end.

**The main gap is not features — it's validation:**

1. **PDF compatibility** — Does extraction work reliably across different Brazilian brokers?
2. **Onboarding** — Can a new user figure out the product without guidance?
3. **Legal/compliance** — LGPD, terms of service, privacy policy
4. **Operational readiness** — Rate limiting, cost monitoring, error alerting

The product is ready for a **closed beta** with 10-20 users to validate these assumptions before a public launch.
