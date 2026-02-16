"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BlocoCodigoChatProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function BlocoCodigoChat({ children, className }: BlocoCodigoChatProps) {
  return (
    <pre className="bg-muted/50 my-2 overflow-x-auto rounded-lg p-3">
      <code className={cn("text-foreground font-mono text-xs", className)}>{children}</code>
    </pre>
  );
}
