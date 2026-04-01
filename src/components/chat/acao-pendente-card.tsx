"use client";

import { useCallback } from "react";
import { Lightbulb } from "lucide-react";
import { notificar } from "@/lib/notifier";
import type { AcaoPendente } from "@/lib/chat-stream-utils";

interface AcaoPendenteCardProps {
  readonly acao: AcaoPendente;
  readonly onConcluir: () => void;
}

export function AcaoPendenteCard({ acao, onConcluir }: AcaoPendenteCardProps) {
  const handleCriar = useCallback(async () => {
    try {
      const resposta = await fetch("/api/action-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textoOriginal: acao.texto,
          tipoConclusao: acao.tipo,
          origem: "insight-acao-sugerida",
          ativosRelacionados: acao.ativos,
        }),
      });
      if (resposta.ok) {
        notificar.success("Adicionado ao Plano de Ação", {
          description: acao.texto,
          actionUrl: "/plano-acao",
          actionLabel: "Ver plano",
        });
      } else {
        notificar.error("Erro ao criar tarefa");
      }
    } catch {
      notificar.error("Erro ao criar tarefa");
    } finally {
      onConcluir();
    }
  }, [acao, onConcluir]);

  return (
    <div className="border-t px-3 py-2">
      <div className="bg-muted/40 rounded-xl p-3">
        <div className="mb-2 flex items-center gap-2">
          <Lightbulb className="text-warning h-3.5 w-3.5 shrink-0" />
          <span className="text-xs font-medium">Registrar no Plano de Ação?</span>
        </div>
        <p className="text-muted-foreground mb-3 text-xs leading-snug">{acao.texto}</p>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onConcluir}
            className="text-muted-foreground hover:text-foreground rounded px-2 py-1 text-xs transition-colors"
          >
            Ignorar
          </button>
          <button
            type="button"
            onClick={() => { void handleCriar(); }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded px-3 py-1 text-xs font-medium transition-colors"
          >
            Criar tarefa →
          </button>
        </div>
      </div>
    </div>
  );
}
