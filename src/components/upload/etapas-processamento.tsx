"use client";

import { Check, Circle, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type StatusEtapa = "pendente" | "ativa" | "concluida";

interface Etapa {
  readonly id: string;
  readonly rotulo: string;
  readonly status: StatusEtapa;
  readonly detalhes?: readonly string[];
}

interface EtapasProcessamentoProps {
  readonly etapas: readonly Etapa[];
  readonly nomeArquivo: string;
  readonly segundosDecorridos: number;
  readonly tempoEstimadoSegundos?: number;
}

const TEMPO_ESTIMADO_PADRAO = 120;

function formatarTempoDecorrido(segundos: number): string {
  if (segundos < 60) {
    return `${segundos}s`;
  }
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = segundos % 60;
  return `${minutos}m ${segundosRestantes.toString().padStart(2, "0")}s`;
}

function formatarTempoEstimado(segundos: number): string {
  if (segundos < 60) {
    return `~${segundos}s`;
  }
  const minutos = Math.ceil(segundos / 60);
  return `~${minutos} min`;
}

function obterMensagemProgresso(segundosDecorridos: number, tempoEstimado: number): string {
  const proporcao = segundosDecorridos / tempoEstimado;
  if (proporcao < 0.5) {
    return `Tempo estimado: ${formatarTempoEstimado(tempoEstimado)}`;
  }
  if (proporcao < 0.9) {
    const restante = Math.max(tempoEstimado - segundosDecorridos, 10);
    return `Faltam aproximadamente ${formatarTempoEstimado(restante)}`;
  }
  if (proporcao < 1.3) {
    return "Quase la...";
  }
  return "Ainda processando — pode demorar um pouco mais";
}

function IconeEtapa({ status }: { readonly status: StatusEtapa }) {
  switch (status) {
    case "concluida":
      return <Check className="text-muted-foreground h-4 w-4" />;
    case "ativa":
      return <Loader2 className="text-primary h-4 w-4 animate-spin" />;
    case "pendente":
      return <Circle className="text-muted-foreground/40 h-4 w-4" />;
  }
}

export function EtapasProcessamento({
  etapas,
  nomeArquivo,
  segundosDecorridos,
  tempoEstimadoSegundos,
}: EtapasProcessamentoProps) {
  const tempoEstimado = tempoEstimadoSegundos ?? TEMPO_ESTIMADO_PADRAO;
  const mensagemProgresso = obterMensagemProgresso(segundosDecorridos, tempoEstimado);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="space-y-1 text-center">
        <h3 className="text-lg font-semibold">Processando seu relatorio</h3>
        <p className="text-muted-foreground text-sm">{nomeArquivo}</p>
      </div>

      {/* Indeterminate progress bar */}
      <div className="bg-muted h-1 w-full max-w-sm overflow-hidden rounded-full">
        <div className="bg-primary/60 h-full w-1/3 animate-pulse rounded-full" />
      </div>

      <div className="w-full max-w-sm space-y-3">
        {etapas.map((etapa) => (
          <div key={etapa.id} className="space-y-1">
            <div className="flex items-center gap-3">
              <IconeEtapa status={etapa.status} />
              <span
                className={cn(
                  "text-sm",
                  etapa.status === "ativa" && "font-medium",
                  etapa.status === "pendente" && "text-muted-foreground/60",
                  etapa.status === "concluida" && "text-muted-foreground",
                )}
              >
                {etapa.rotulo}
              </span>
            </div>
            {etapa.status === "ativa" && etapa.detalhes && (
              <div className="ml-7 space-y-0.5">
                {etapa.detalhes.map((detalhe) => (
                  <p key={detalhe} className="text-muted-foreground text-xs">
                    {detalhe}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center" aria-live="polite">
        <p className="text-muted-foreground font-mono text-xs">
          {formatarTempoDecorrido(segundosDecorridos)}
        </p>
        <p className="text-muted-foreground mt-0.5 text-xs">{mensagemProgresso}</p>
      </div>

      <div className="bg-muted/50 flex items-start gap-2 rounded-md border p-3">
        <Info className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-muted-foreground text-xs">
          Mantenha esta aba aberta enquanto processamos seu relatorio.
        </p>
      </div>
    </div>
  );
}
