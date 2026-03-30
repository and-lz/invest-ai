"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { revalidarTarefasAtivas } from "@/hooks/use-active-tasks";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/design-system";
import { ICONES_TIPO, CORES_TIPO, ehAcaoDeRetry } from "./activity-center-constants";

import type { Notificacao } from "@/lib/notification";

export interface ItemNotificacaoProps {
  notificacao: Notificacao;
  onMarcarComoLida: (identificador: string) => void;
  onFecharDialog: () => void;
}

export function ItemNotificacao({ notificacao, onMarcarComoLida, onFecharDialog }: ItemNotificacaoProps) {
  const router = useRouter();
  const [retryEmAndamento, setRetryEmAndamento] = useState(false);
  const Icone = ICONES_TIPO[notificacao.tipo];
  const corIcone = CORES_TIPO[notificacao.tipo];

  const handleAcao = useCallback(async () => {
    if (!notificacao.acao?.url) return;

    if (ehAcaoDeRetry(notificacao.acao.url)) {
      setRetryEmAndamento(true);
      try {
        const resposta = await fetch(notificacao.acao.url, { method: "POST" });
        if (resposta.ok) {
          revalidarTarefasAtivas();
          onMarcarComoLida(notificacao.identificador);
          onFecharDialog();
          toast.info("Retentando tarefa...");
        } else {
          const corpo = (await resposta.json()) as { erro?: string };
          toast.error("Falha ao retentar", {
            description: corpo.erro ?? "Erro desconhecido",
          });
        }
      } catch {
        toast.error("Falha ao retentar", {
          description: "Erro de conexao",
        });
      } finally {
        setRetryEmAndamento(false);
      }
    } else {
      onMarcarComoLida(notificacao.identificador);
      onFecharDialog();
      router.push(notificacao.acao.url);
    }
  }, [notificacao, onMarcarComoLida, onFecharDialog, router]);

  const ehRetry = notificacao.acao?.url ? ehAcaoDeRetry(notificacao.acao.url) : false;

  return (
    <div
      className={cn(
        "group rounded-lg border p-4 transition-all",
        notificacao.visualizada ? "opacity-60" : "bg-accent/30",
      )}
    >
      <div className="flex items-start gap-3">
        <Icone className={cn("mt-0.5 h-5 w-5 shrink-0", corIcone)} />
        <div className="flex-1 space-y-1">
          <p className={cn(typography.label, "leading-snug")}>{notificacao.titulo}</p>
          {notificacao.descricao && (
            <p className={cn(typography.helper, "leading-relaxed")}>{notificacao.descricao}</p>
          )}
          <p className={typography.helper}>
            {new Date(notificacao.criadaEm).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        {!notificacao.visualizada && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMarcarComoLida(notificacao.identificador)}
            className="opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Check className="text-muted-foreground h-4 w-4" />
          </Button>
        )}
      </div>
      {notificacao.acao && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAcao}
          disabled={retryEmAndamento}
          className={cn(typography.helper, "mt-3 w-full gap-1.5")}
        >
          {ehRetry && <RotateCcw className="h-4 w-4" />}
          {retryEmAndamento ? "Retentando..." : notificacao.acao.label}
        </Button>
      )}
    </div>
  );
}
