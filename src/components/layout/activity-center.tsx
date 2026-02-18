"use client";

import { useCallback, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Inbox,
  Bell,
  Loader2,
  Trash2,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle,
  OctagonX,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useNotificacoes } from "@/hooks/use-notificacoes";
import { useTarefasAtivas, revalidarTarefasAtivas } from "@/hooks/use-tarefas-ativas";
import { descreverTarefa } from "@/lib/tarefa-descricao";
import type { TarefaBackground } from "@/lib/tarefa-descricao";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { cn } from "@/lib/utils";
import { tipografia, icone, layout, dialog as dialogDs } from "@/lib/design-system";
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

// Internal component that renders a single active task card
function TaskCard({ tarefa }: { tarefa: TarefaBackground }) {
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
        description: "Erro de conexão",
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
          <p className={cn(tipografia.rotulo, "leading-snug")}>{descricao}</p>
          <p className={tipografia.auxiliar}>
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
          <XCircle className={cn(icone.botao, "text-muted-foreground")} />
        </Button>
      </div>
    </div>
  );
}

function ehAcaoDeRetry(url: string): boolean {
  return url.includes("/retry");
}

interface ItemNotificacaoProps {
  notificacao: Notificacao;
  onMarcarComoLida: (identificador: string) => void;
  onFecharDialog: () => void;
}

function ItemNotificacao({ notificacao, onMarcarComoLida, onFecharDialog }: ItemNotificacaoProps) {
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
          description: "Erro de conexão",
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
          <p className={cn(tipografia.rotulo, "leading-snug")}>{notificacao.titulo}</p>
          {notificacao.descricao && (
            <p className={cn(tipografia.auxiliar, "leading-relaxed")}>{notificacao.descricao}</p>
          )}
          <p className={tipografia.auxiliar}>
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
          className={cn(tipografia.auxiliar, "mt-3 w-full gap-1.5")}
        >
          {ehRetry && <RotateCcw className="h-4 w-4" />}
          {retryEmAndamento ? "Retentando..." : notificacao.acao.rotulo}
        </Button>
      )}
    </div>
  );
}

type AbaAtiva = "notificacoes" | "tarefas";

export function ActivityCenter() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>("notificacoes");

  const {
    notificacoes,
    contagemNaoVisualizadas,
    estaCarregando,
    marcarComoLida,
    marcarTodasComoLidas,
    limparTodas,
  } = useNotificacoes();

  const { tarefasAtivas, estaCarregando: tarefasCarregando } = useTarefasAtivas();

  const abrir = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const fechar = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const handleLimparTodas = useCallback(async () => {
    await limparTodas();
  }, [limparTodas]);

  // Close on backdrop click
  const handleClickDialog = useCallback(
    (evento: React.MouseEvent<HTMLDialogElement>) => {
      const dialog = dialogRef.current;
      if (!dialog) return;

      if (evento.target === dialog) {
        fechar();
      }
    },
    [fechar],
  );

  const temTarefasAtivas = tarefasAtivas.length > 0;
  const temAtividade = contagemNaoVisualizadas > 0 || temTarefasAtivas;

  return (
    <>
      <Button variant="ghost" size="icon" className="relative" onClick={abrir}>
        <Inbox className="h-5 w-5" />
        {temAtividade && (
          <Badge
            className={cn(
              "absolute -top-1 -right-1 flex h-5 min-w-5 items-center gap-0.5 px-1 text-xs leading-none",
              temTarefasAtivas
                ? "bg-primary text-primary-foreground"
                : "bg-destructive text-destructive-foreground",
            )}
          >
            {temTarefasAtivas && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
            {contagemNaoVisualizadas > 0 && (
              <span>{contagemNaoVisualizadas > 99 ? "99+" : contagemNaoVisualizadas}</span>
            )}
          </Badge>
        )}
      </Button>

      <dialog
        ref={dialogRef}
        onClick={handleClickDialog}
        aria-label="Central de atividades"
        className={cn(
          "bg-background flex h-full flex-col border-l p-0 shadow-lg",
          dialogDs.backdrop,
        )}
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
            <h2 className={tipografia.h2}>Atividades</h2>
            <InfoTooltip conteudo="Central de atividades: acompanhe tarefas em andamento e histórico de notificações do sistema." />
          </div>
          <Button variant="ghost" size="icon" onClick={fechar} className="text-muted-foreground">
            <X className={icone.botao} />
            <span className="sr-only">Fechar</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setAbaAtiva("notificacoes")}
            className={cn(
              "relative flex-1 px-6 py-3 text-sm font-medium transition-colors",
              abaAtiva === "notificacoes"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Bell className={icone.botao} />
              Notificações
              {contagemNaoVisualizadas > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs">
                  {contagemNaoVisualizadas}
                </Badge>
              )}
            </div>
            {abaAtiva === "notificacoes" && (
              <span className="bg-foreground absolute right-0 bottom-0 left-0 h-0.5" />
            )}
          </button>
          <button
            onClick={() => setAbaAtiva("tarefas")}
            className={cn(
              "relative flex-1 px-6 py-3 text-sm font-medium transition-colors",
              abaAtiva === "tarefas"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Loader2 className={cn(icone.botao, temTarefasAtivas && "animate-spin")} />
              Tarefas
              {temTarefasAtivas && (
                <Badge className="bg-primary text-primary-foreground h-5 min-w-5 px-1 text-xs">
                  {tarefasAtivas.length}
                </Badge>
              )}
            </div>
            {abaAtiva === "tarefas" && (
              <span className="bg-foreground absolute right-0 bottom-0 left-0 h-0.5" />
            )}
          </button>
        </div>

        {/* Content - Notifications */}
        {abaAtiva === "notificacoes" && (
          <>
            {/* Status and actions */}
            <div className="flex items-center justify-between border-b px-6 py-3">
              <p className={tipografia.auxiliar}>
                {contagemNaoVisualizadas > 0
                  ? `${contagemNaoVisualizadas} não lida${contagemNaoVisualizadas > 1 ? "s" : ""}`
                  : "Todas lidas"}
              </p>
              <div className="flex items-center gap-1">
                {contagemNaoVisualizadas > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={marcarTodasComoLidas}
                    className={cn(tipografia.auxiliar, "gap-1.5")}
                  >
                    <CheckCheck className={icone.botao} />
                    Ler todas
                  </Button>
                )}
                {notificacoes.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLimparTodas}
                    className={cn(tipografia.auxiliar, "gap-1.5")}
                  >
                    <Trash2 className={icone.botao} />
                    Limpar
                  </Button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {estaCarregando && (
                <div className="flex items-center justify-center p-6">
                  <p className="text-muted-foreground text-sm">Carregando...</p>
                </div>
              )}

              {!estaCarregando && notificacoes.length === 0 && (
                <div className={layout.estadoVazio}>
                  <Bell className={icone.estadoVazio} />
                  <p className="text-muted-foreground text-center text-sm">Nenhuma notificação</p>
                </div>
              )}

              {!estaCarregando && notificacoes.length > 0 && (
                <div className="space-y-3 p-6">
                  {notificacoes.map((notificacao) => (
                    <ItemNotificacao
                      key={notificacao.identificador}
                      notificacao={notificacao}
                      onMarcarComoLida={marcarComoLida}
                      onFecharDialog={fechar}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Content - Tasks */}
        {abaAtiva === "tarefas" && (
          <div className="flex-1 overflow-y-auto">
            {tarefasCarregando && (
              <div className="flex items-center justify-center p-6">
                <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
              </div>
            )}

            {!tarefasCarregando && tarefasAtivas.length === 0 && (
              <div className={layout.estadoVazio}>
                <Inbox className={icone.estadoVazio} />
                <p className="text-muted-foreground text-center text-sm">
                  Nenhuma tarefa em andamento
                </p>
              </div>
            )}

            {!tarefasCarregando && tarefasAtivas.length > 0 && (
              <div className="space-y-3 p-6">
                {tarefasAtivas.map((tarefa) => (
                  <TaskCard key={tarefa.identificador} tarefa={tarefa} />
                ))}
              </div>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
