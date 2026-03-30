"use client";

import { useState, useCallback } from "react";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { revalidarTarefasAtivas } from "@/hooks/use-active-tasks";
import { descreverTarefa } from "@/lib/task-description";
import type { TarefaBackground } from "@/lib/task-description";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { typography, icon } from "@/lib/design-system";

export function TaskCard({ tarefa }: { tarefa: TarefaBackground }) {
  const [cancelando, setCancelando] = useState(false);
  const descricao = descreverTarefa(tarefa);

  const handleCancelar = useCallback(async () => {
    setCancelando(true);
    try {
      const resposta = await fetch(`/api/tasks/${tarefa.identificador}/cancel`, {
        method: "POST",
      });

      if (resposta.ok) {
        toast.info("Tarefa cancelada");
        revalidarTarefasAtivas();
      } else {
        const corpo = (await resposta.json()) as { erro?: string };
        toast.error("Falha ao cancelar", {
          description: corpo.erro ?? "Erro desconhecido",
        });
      }
    } catch {
      toast.error("Falha ao cancelar", {
        description: "Erro de conexao",
      });
    } finally {
      setCancelando(false);
    }
  }, [tarefa.identificador]);

  return (
    <div className="group rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <Loader2 className="text-muted-foreground mt-0.5 h-5 w-5 shrink-0 animate-spin" />
        <div className="flex-1 space-y-1">
          <p className={cn(typography.label, "leading-snug")}>{descricao}</p>
          <p className={typography.helper}>
            Iniciado{" "}
            {new Date(tarefa.iniciadoEm).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCancelar}
          disabled={cancelando}
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          title="Cancelar tarefa"
        >
          <XCircle className={cn(icon.button, "text-muted-foreground")} />
        </Button>
      </div>
    </div>
  );
}
