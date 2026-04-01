# Fix: Render Markdown in Thinking/Reasoning Block

## Context

**Problem:** The "Raciocínio" collapsible block in chat messages renders the AI's thinking
content as raw text. When the LLM uses markdown in its reasoning (e.g., `**bold**`, tables,
bullet points), the syntax appears literally instead of being rendered.

**Root cause:** `chat-message.tsx` line 119 renders `{mensagem.pensamento}` directly inside a
`div` with `whitespace-pre-wrap italic`, bypassing `ConteudoMarkdownChat`.

**Affected file:** `src/components/chat/chat-message.tsx` — CollapsibleContent block (lines 112–123)

## Plan

1. Replace the raw `{mensagem.pensamento}` div with `<ConteudoMarkdownChat>`.
2. Remove `whitespace-pre-wrap` (markdown renderer handles spacing) and `italic` (too stylistically heavy once content is rendered).
3. Keep `text-muted-foreground`, `border-l-2`, `pl-3`, and size classes for visual consistency.

## Verification

- Read updated file and confirm `ConteudoMarkdownChat` is used in the thinking block.
- `tsc --noEmit` passes.
