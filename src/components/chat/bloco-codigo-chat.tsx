"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BlocoCodigoChatProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function BlocoCodigoChat({ children, className }: BlocoCodigoChatProps) {
  return (
    <pre className="my-2 overflow-x-auto rounded-lg bg-muted/50 p-3">
      <code className={cn("text-xs font-mono text-foreground", className)}>
        {children}
      </code>
    </pre>
  );
}
