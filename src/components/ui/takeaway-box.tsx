"use client";

import { cn } from "@/lib/utils";

type TipoConclusao = "positivo" | "neutro" | "atencao";

interface Conclusao {
  readonly texto: string;
  readonly tipo: TipoConclusao;
}

interface TakeawayBoxProps {
  readonly conclusoes: Conclusao[];
  readonly className?: string;
}

const CORES_INDICADOR: Record<TipoConclusao, string> = {
  positivo: "bg-green-500",
  atencao: "bg-amber-500",
  neutro: "bg-muted-foreground/40",
};

export type { Conclusao, TipoConclusao };

export function TakeawayBox({ conclusoes, className }: TakeawayBoxProps) {
  if (conclusoes.length === 0) return null;

  return (
    <div className={cn("mt-4 space-y-2 rounded-lg border p-3", className)}>
      <p className="text-muted-foreground text-xs font-medium">Resumo para você:</p>
      {conclusoes.map((conclusao) => (
        <p
          key={conclusao.texto}
          className="text-muted-foreground flex items-start gap-2 text-sm leading-relaxed"
        >
          <span
            className={cn(
              "mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full",
              CORES_INDICADOR[conclusao.tipo],
            )}
          />
          {conclusao.texto}
        </p>
      ))}
    </div>
  );
}
