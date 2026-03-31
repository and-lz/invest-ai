"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BlocoCodigoChatProps {
  readonly children?: string;
  readonly className?: string;
  readonly fullscreen?: boolean;
}

export function BlocoCodigoChat({ children, className, fullscreen }: BlocoCodigoChatProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null);
  const code = typeof children === "string" ? children : String(children ?? "");
  const lang = className?.replace("language-", "") ?? "text";

  useEffect(() => {
    if (!code) return;

    let cancelled = false;

    async function highlight() {
      try {
        const { codeToHtml } = await import("shiki");
        const html = await codeToHtml(code, {
          lang,
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
          defaultColor: false,
        });
        if (!cancelled) {
          setHighlightedHtml(html);
        }
      } catch {
        // fallback to plain rendering on any error (unsupported lang, etc.)
      }
    }

    highlight();
    return () => {
      cancelled = true;
    };
  }, [code, lang]);

  const sizeClass = fullscreen ? "text-[0.85em]" : "text-[0.8em]";

  if (highlightedHtml) {
    return (
      <div
        className={cn(
          "shiki-wrapper my-3 overflow-x-auto rounded-lg border border-border/30",
          "[&>pre]:p-4 [&>pre]:overflow-x-auto [&>pre]:rounded-lg",
          "[&_code]:font-mono [&_code]:leading-relaxed",
          sizeClass,
        )}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    );
  }

  return (
    <pre className="bg-muted/60 border border-border/30 rounded-lg p-4 my-3 overflow-x-auto">
      <code className={cn("text-foreground font-mono leading-relaxed", sizeClass, className)}>
        {children}
      </code>
    </pre>
  );
}
