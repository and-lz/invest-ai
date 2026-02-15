"use client";

import { useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Trash2,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle,
  OctagonX,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useNotificacoes } from "@/hooks/use-notificacoes";
import { adicionarTarefaAtivaNoStorage } from "@/components/layout/activity-center";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { cn } from "@/lib/utils";
import type { Notificacao } from "@/lib/notificacao";

const ICONES_TIPO = {
  success: CheckCircle,
  error: OctagonX,
  warning: AlertTriangle,
  info: Info,
} as const;

const CORES_TIPO = {
  success: "text-success",
  error: "text-destructive",
  warning: "text-warning",
  info: "text-muted-foreground",
} as const;

interface ItemNotificacaoProps {
  notificacao: Notificacao;
  onMarcarComoLida: (identificador: string) => void;
  onFecharSheet: () => void;
}

function ehAcaoDeRetry(url: string): boolean {
  return url.includes("/retry");
}

function extrairTaskIdDeUrlRetry(url: string): string | null {
  const partes = url.split("/tasks/");
  if (partes.length < 2) return null;
  const restante = partes[1];
  if (!restante) return null;
  return restante.split("/")[0] ?? null;
}

function ItemNotificacao({
  notificacao,
  onMarcarComoLida,
  onFecharSheet,
}: ItemNotificacaoProps) {
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
          const taskId = extrairTaskIdDeUrlRetry(notificacao.acao.url);
          if (taskId) {
            adicionarTarefaAtivaNoStorage(taskId);
          }
          onMarcarComoLida(notificacao.identificador);
          onFecharSheet();
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
      onFecharSheet();
      router.push(notificacao.acao.url);
    }
  }, [notificacao, onMarcarComoLida, onFecharSheet, router]);

  const ehRetry = notificacao.acao?.url
    ? ehAcaoDeRetry(notificacao.acao.url)
    : false;

  return (
    <div
      className={cn(
        "group rounded-lg border p-6 transition-all",
        notificacao.visualizada ? "opacity-60" : "bg-accent/30",
      )}
    >
      <div className="flex items-start gap-3">
        <Icone className={cn("mt-0.5 h-5 w-5 shrink-0", corIcone)} />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-snug">{notificacao.titulo}</p>
          {notificacao.descricao && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {notificacao.descricao}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
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
            <Check className="h-3 w-3 text-muted-foreground" />
          </Button>
        )}
      </div>
      {notificacao.acao && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAcao}
          disabled={retryEmAndamento}
          className="mt-3 w-full gap-1.5 text-xs text-muted-foreground"
        >
          {ehRetry && <RotateCcw className="h-3 w-3" />}
          {retryEmAndamento ? "Retentando..." : notificacao.acao.rotulo}
        </Button>
      )}
    </div>
  );
}

export function CentralNotificacoes() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {
    notificacoes,
    contagemNaoVisualizadas,
    estaCarregando,
    marcarComoLida,
    marcarTodasComoLidas,
    limparTodas,
  } = useNotificacoes();

  const abrir = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const fechar = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const handleLimparTodas = useCallback(async () => {
    await limparTodas();
    fechar();
  }, [limparTodas, fechar]);

  // Fechar ao clicar no backdrop
  const handleClickDialog = useCallback(
    (evento: React.MouseEvent<HTMLDialogElement>) => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      // Se clicou diretamente no dialog (backdrop), fecha
      if (evento.target === dialog) {
        fechar();
      }
    },
    [fechar],
  );

  return (
    <>
      <Button variant="ghost" size="icon" className="relative" onClick={abrir}>
        <Bell className="h-5 w-5" />
        {contagemNaoVisualizadas > 0 && (
          <Badge
            className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-xs leading-none"
            variant="destructive"
          >
            {contagemNaoVisualizadas > 99 ? "99+" : contagemNaoVisualizadas}
          </Badge>
        )}
      </Button>

      <dialog
        ref={dialogRef}
        onClick={handleClickDialog}
        className="flex h-full flex-col border-l bg-background p-0 shadow-lg"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(448px, 100vw)",
          margin: 0,
          padding: 0,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6 pb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-xl font-semibold tracking-tight">
              Notificacoes
            </h2>
            <InfoTooltip conteudo="Historico de notificacoes do sistema. Notificacoes nao lidas aparecem destacadas. Clique em uma notificacao para marca-la como lida ou use os botoes de acao." />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={fechar}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>

        {/* Status e acoes */}
        <div className="flex items-center justify-between border-b px-6 py-3">
          <p className="text-xs text-muted-foreground">
            {contagemNaoVisualizadas > 0
              ? `${contagemNaoVisualizadas} nao lida${contagemNaoVisualizadas > 1 ? "s" : ""}`
              : "Todas lidas"}
          </p>
          <div className="flex items-center gap-1">
            {contagemNaoVisualizadas > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={marcarTodasComoLidas}
                className="gap-1.5 text-xs text-muted-foreground"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Ler todas
              </Button>
            )}
            {notificacoes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLimparTodas}
                className="gap-1.5 text-xs text-muted-foreground"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Conteudo */}
        <div className="flex-1 overflow-y-auto">
          {estaCarregando && (
            <div className="flex items-center justify-center p-6">
              <p className="text-sm text-muted-foreground">Carregando...</p>
            </div>
          )}

          {!estaCarregando && notificacoes.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 p-6">
              <Bell className="h-12 w-12 text-muted-foreground" />
              <p className="text-center text-sm text-muted-foreground">
                Nenhuma notificacao
              </p>
            </div>
          )}

          {!estaCarregando && notificacoes.length > 0 && (
            <div className="space-y-4 p-6">
              {notificacoes.map((notificacao) => (
                <ItemNotificacao
                  key={notificacao.identificador}
                  notificacao={notificacao}
                  onMarcarComoLida={marcarComoLida}
                  onFecharSheet={fechar}
                />
              ))}
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
