"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusPasso = "pendente" | "ativo" | "concluido";

interface Passo {
  readonly numero: number;
  readonly rotulo: string;
  readonly status: StatusPasso;
}

interface IndicadorPassosProps {
  readonly passos: readonly Passo[];
  readonly className?: string;
}

export function IndicadorPassos({ passos, className }: IndicadorPassosProps) {
  return (
    <nav aria-label="Progresso da importacao" className={cn("mb-4", className)}>
      <ol className="flex items-center gap-2">
        {passos.map((passo, indice) => (
          <li key={passo.numero} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  passo.status === "concluido" &&
                    "bg-muted border-muted-foreground/25 text-muted-foreground",
                  passo.status === "ativo" && "border-primary bg-primary/10 text-primary",
                  passo.status === "pendente" &&
                    "border-muted-foreground/25 text-muted-foreground/50",
                )}
                aria-current={passo.status === "ativo" ? "step" : undefined}
              >
                {passo.status === "concluido" ? <Check className="h-3.5 w-3.5" /> : passo.numero}
              </div>
              <span
                className={cn(
                  "text-sm",
                  passo.status === "ativo" && "font-medium",
                  passo.status === "pendente" && "text-muted-foreground/50",
                  passo.status === "concluido" && "text-muted-foreground",
                )}
              >
                {passo.rotulo}
              </span>
            </div>
            {indice < passos.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-px w-8",
                  passos[indice + 1]?.status !== "pendente"
                    ? "bg-muted-foreground/25"
                    : "bg-muted-foreground/10",
                )}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
