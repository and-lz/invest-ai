"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { typography, icon } from "@/lib/design-system";
import type { ExplanationState } from "./takeaway-box-types";

interface TakeawayExplanationProps {
  readonly state: ExplanationState;
  readonly isOpen: boolean;
  readonly explanation: string | undefined;
  readonly onRetry: () => void;
}

export function TakeawayExplanation({ state, isOpen, explanation, onRetry }: TakeawayExplanationProps) {
  return (
    <div className="ml-6 mt-1.5 border-l-2 border-primary/30 pl-3">
      {state.status === "loading" && (
        <div className="flex items-center gap-2 py-1">
          <Loader2
            className={cn(icon.micro, "text-muted-foreground animate-spin")}
          />
          <span className={typography.helper}>Gerando explicacao...</span>
        </div>
      )}

      {state.status === "error" && isOpen && (
        <div className="flex items-center gap-2 py-1">
          <span className={cn(typography.helper, "text-destructive")}>
            {state.errorMessage}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRetry();
            }}
            className={cn(
              typography.helper,
              "text-primary inline-flex cursor-pointer items-center gap-1 hover:underline",
            )}
          >
            <RefreshCw className={icon.button} />
            Tentar novamente
          </button>
        </div>
      )}

      {state.status === "success" && explanation && (
        <p className={cn(typography.body, "text-muted-foreground py-1 leading-relaxed")}>
          {explanation}
        </p>
      )}
    </div>
  );
}
