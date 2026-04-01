# Chat Header — Editorial Redesign

## Context

**Request:** Make the chat header more editorial — display the conversation title prominently,
the start date, and a "in a nutshell" preview of the conversation topic. Fancy visual treatment.

**Available data (no new API/schema needed):**
- `titulo` — conversation title (already displayed, tiny + muted)
- `criadaEm` — ISO datetime from `ConversaMetadata` (already in `useConversas`)
- `previewMensagem` — first message preview string from `ConversaMetadata`
- `identificadorPagina` — enum, can map to human label (Dashboard, Relatórios, etc.)

**Affected files:**
1. `src/components/chat/chat-page-header.tsx` — visual redesign + new optional props
2. `src/app/chat/[id]/page.tsx` — pass `criadaEm`, `preview`, `paginaLabel` from `conversaAtual`

**Design concept:**

```
┌─────────────────────────────────────────┐
│ ☰                              ⋯  ←    │  ← compact action row (unchanged)
│─────────────────────────────────────────│
│                                         │
│  Dashboard  ·  28 mar 2026              │  ← muted label + date (text-xs muted)
│                                         │
│  Análise de alocação de ativos          │  ← title (text-xl font-semibold)
│                                         │
│  "Tenho 70% em renda fixa, como         │  ← nutshell preview (text-sm muted italic)
│   posso diversificar melhor?"           │
│                                         │
└─────────────────────────────────────────┘
```

The editorial section lives below the action row inside the same `<header>` element.
Since the header now scrolls away (from previous task), the larger layout doesn't obstruct the chat.

**Page label mapping (inline in component):**
```typescript
const PAGE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  reports: "Relatórios",
  insights: "Análises",
  trends: "Tendências",
  desempenho: "Desempenho",
  aprender: "Aprendizado",
};
```

**Date format:** `formatBrazilianDate` from `@/lib/format-date` → "28/03/2026", but we'll use
`toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })` inline for
a more readable "28 de mar. de 2026" style.

## Plan

### Step 1 — Redesign `ChatPageHeader`
Add optional props to `ChatPageHeaderProps`:
- `criadaEm?: string` — ISO datetime for start date
- `preview?: string` — nutshell message text
- `paginaLabel?: string` — human-readable page context

Render structure:
```tsx
<header>
  {/* Action row — unchanged */}
  <div className="flex items-center px-4 py-2">
    [menu] [title — now hidden when editorial data present] [⋯] [←]
  </div>

  {/* Editorial section — only when criadaEm is present */}
  {criadaEm && (
    <div className="px-5 pb-5 pt-1 border-b border-border/30">
      {/* Metadata row */}
      <p className="text-xs text-muted-foreground/70 mb-2">
        {paginaLabel}  ·  {formattedDate}
      </p>
      {/* Title */}
      <h2 className="text-xl font-semibold tracking-tight leading-tight">
        {title}
      </h2>
      {/* Nutshell preview */}
      {preview && (
        <p className="text-sm text-muted-foreground italic mt-1.5 line-clamp-2">
          "{preview}"
        </p>
      )}
    </div>
  )}
</header>
```

When editorial section is present, hide the inline title in the action row (avoid duplication).

### Step 2 — Pass editorial data from the page
In `src/app/chat/[id]/page.tsx`, derive and pass the new props:
```typescript
const paginaLabel = PAGE_LABELS[conversaAtual?.identificadorPagina ?? ""] ?? undefined;
```
Pass to `headerSlot`:
```tsx
headerSlot={
  <ChatPageHeader
    ...
    criadaEm={conversaAtual?.criadaEm}
    preview={conversaAtual?.previewMensagem}
    paginaLabel={paginaLabel}
  />
}
```

## Verification
- Open an existing `/chat/[id]` — editorial section visible with title, date, nutshell
- New/empty conversation — editorial section not shown (no `criadaEm` yet or no preview)
- Scroll down through messages — header scrolls away cleanly
- Inline title in action row hidden when editorial section is shown
- No TypeScript errors: `tsc --noEmit`
