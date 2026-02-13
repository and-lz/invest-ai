"use client";

import { CheckCircle2, AlertCircle, Info, type LucideIcon } from "lucide-react";
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

const ICONES_INDICADOR: Record<TipoConclusao, LucideIcon> = {
  positivo: CheckCircle2,
  atencao: AlertCircle,
  neutro: Info,
};

const CORES_ICONE: Record<TipoConclusao, string> = {
  positivo: "text-success",
  atencao: "text-warning",
  neutro: "text-muted-foreground",
};

export type { Conclusao, TipoConclusao };

export function TakeawayBox({ conclusoes, className }: TakeawayBoxProps) {
  if (conclusoes.length === 0) return null;

  return (
    <div className={cn("mt-4 space-y-2 rounded-lg p-3", className)}>
      <hr className="mb-5 opacity-50"/>
      {conclusoes.map((conclusao) => {
        const IconeConclusao = ICONES_INDICADOR[conclusao.tipo];
        return (
        <p
          key={conclusao.texto}
          className="text-muted-foreground flex items-start gap-2 text-sm leading-relaxed"
        >
          <IconeConclusao className={cn("mt-0.5 h-4 w-4 shrink-0", CORES_ICONE[conclusao.tipo])} aria-hidden="true" />
          {conclusao.texto}
        </p>
        );
      })}
    </div>
  );
}
