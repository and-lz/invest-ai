# Plan: Chat Fullscreen Redesign

**Context**: [chat-fullscreen-redesign-context.md](./chat-fullscreen-redesign-context.md)

## Strategy

Hybrid approach: extend `.chat-fullscreen` CSS selectors in `globals.css` for typography/spacing, and add conditional Tailwind classes in components for structural changes (sidebar width, layout spacing). The `chat-fullscreen` class is already on the parent div — no new mechanism needed.

## Steps

### Step 1: Extend CSS fullscreen overrides for typography and spacing
**Files**: `src/app/globals.css` (modify)
**Pattern**: Following existing `.chat-fullscreen` block at lines 430-453
**Changes**:
- Scale up message bubbles: `text-base` → keep, add `px-6 py-3.5` (more generous padding)
- Scale up markdown headings: h1 `text-2xl`, h2 `text-xl`, h3 `text-lg`
- Scale up markdown body/lists: `text-base` (already set, keep)
- Scale up table cells (th, td): `text-sm` (from `text-xs`)
- Scale up inline code: `text-sm` (from `text-xs`)
- Scale up suggestion chips: `text-sm px-4 py-2` (from `text-xs px-3 py-1.5`)
- Scale up textarea: `text-base` (already set), add `py-3 px-4` for taller input
- Scale up input container: `p-4 gap-3` (from `p-3 gap-2`)
- Scale up avatars: `h-10 w-10` (from `h-8 w-8`)
- Scale up message area spacing: `space-y-6 p-6` (from `space-y-4 p-4`)
- Scale up header: `px-5 py-4` with larger title `text-base` and icon `h-6 w-6`
- Scale up header buttons: `h-9 w-9` with `h-5 w-5` icons
- Scale up empty state: icon `h-14 w-14`, text `text-base`/`text-sm`
- Scale up error banner: `text-sm` (from `text-xs`)
**Verify**: `npm run build` succeeds. Open chat in fullscreen — all text and spacing visibly larger. Toggle back to widget mode — nothing changed.

### Step 2: Wider sidebar in fullscreen mode
**Files**: `src/components/chat/chat-widget.tsx` (modify)
**Pattern**: Using `cn()` with `telaCheia` state (already in scope at line 237)
**Changes**:
- Sidebar div (line 224): `w-64` → `cn("w-64", telaCheia && "w-80")` (320px in fullscreen)
- Sidebar content scales via CSS from Step 1 (`.chat-fullscreen` targets sidebar descendants)
- Add CSS rules for sidebar text scaling: conversation titles `text-sm` → `text-base`, timestamps `text-xs` → `text-sm`
**Verify**: Open fullscreen, toggle sidebar — wider with larger text. Close fullscreen — sidebar back to 256px.

### Step 3: Center message column in fullscreen for wide screens
**Files**: `src/components/chat/chat-widget.tsx` (modify)
**Pattern**: Using `cn()` with `telaCheia`
**Changes**:
- Message area container: add `mx-auto max-w-4xl` in fullscreen to center content and prevent messages from stretching edge-to-edge on ultra-wide screens
- This keeps the "proper app" feel (like ChatGPT/Claude web UI centering)
**Verify**: On a wide monitor, messages are centered with comfortable margins. On smaller screens, still fills available width.

## New Files
None.

## Verification Plan
- Build: `npm run build` → succeeds
- Lint: `npm run lint` → no errors
- Manual checks:
  1. Open chat widget (non-fullscreen) → unchanged appearance
  2. Click maximize → all text larger, more spacing, sidebar wider
  3. Send a message → streaming works, auto-scroll works
  4. Toggle sidebar → wider sidebar with larger text
  5. Check markdown rendering (bold, lists, tables, code blocks) → all scaled up
  6. Check empty state → larger icon and text
  7. Check suggestion chips → larger, more padding
  8. Click minimize → back to widget size, everything normal
  9. On mobile viewport → unchanged behavior

## Risks
- Visual regression in widget mode (Low) — all CSS scoped under `.chat-fullscreen`
- Sidebar width on 768px screens (Low) — fullscreen is viewport-wide, 320px fits easily
- No logic changes → streaming, TTS, suggestions unaffected
