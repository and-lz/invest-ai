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
import { useTarefaBackground } from "@/hooks/use-tarefa-background";
import { LABELS_TIPO_TAREFA } from "@/lib/tarefa-descricao";
import type { TipoTarefa } from "@/lib/tarefa-descricao";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { cn } from "@/lib/utils";
import type { Notificacao } from "@/lib/notificacao";
import { useEffect } from "react";

const CHAVE_LOCAL_STORAGE = "tarefasAtivas";
const TIMEOUT_MINUTOS = 5;

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

function obterTarefasAtivasDoStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CHAVE_LOCAL_STORAGE) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function salvarTarefasAtivasNoStorage(identificadores: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAVE_LOCAL_STORAGE, JSON.stringify(identificadores));
}

function removerTarefaAtivaDoStorage(identificadorTarefa: string): void {
  const atuais = obterTarefasAtivasDoStorage();
  const filtradas = atuais.filter((id) => id !== identificadorTarefa);
  salvarTarefasAtivasNoStorage(filtradas);
}

export function adicionarTarefaAtivaNoStorage(identificadorTarefa: string): void {
  const atuais = obterTarefasAtivasDoStorage();
  if (!atuais.includes(identificadorTarefa)) {
    atuais.push(identificadorTarefa);
    salvarTarefasAtivasNoStorage(atuais);
  }
  // Dispara evento para que o componente reaja imediatamente
  window.dispatchEvent(new CustomEvent("tarefa-ativa-adicionada"));
}

// Componente interno que monitora uma única tarefa
function MonitorTarefa({
  identificadorTarefa,
  onConcluida,
}: {
  identificadorTarefa: string;
  onConcluida: (identificador: string) => void;
}) {
  const router = useRouter();
  const { tarefa, estaConcluido, estaComErro, estaProcessando, estaCancelada } =
    useTarefaBackground(identificadorTarefa);
  const [jaNotificou, setJaNotificou] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const onConcluidaChamadaRef = useRef(false);

  // Função helper para notificar e remover tarefa (garante chamada única)
  const notificarERemover = useCallback(
    (tipoNotificacao: "sucesso" | "erro" | "timeout", mensagem?: string) => {
      if (onConcluidaChamadaRef.current) return;
      onConcluidaChamadaRef.current = true;

      if (tipoNotificacao === "sucesso" && tarefa) {
        toast.success("Tarefa concluída!", {
          description: tarefa.descricaoResultado,
          action: tarefa.urlRedirecionamento
            ? {
                label: "Ver resultado",
                onClick: () => router.push(tarefa.urlRedirecionamento!),
              }
            : undefined,
        });
      } else if (tipoNotificacao === "erro" && tarefa) {
        toast.error("Erro no processamento", {
          description: tarefa.erro ?? mensagem ?? "Erro desconhecido",
        });
      } else if (tipoNotificacao === "timeout") {
        toast.error("Tarefa parece ter falhado", {
          description:
            mensagem ?? "O processamento excedeu o tempo limite. Tente novamente.",
        });
      }

      window.dispatchEvent(new CustomEvent("tarefa-background-concluida"));
      onConcluida(identificadorTarefa);
    },
    [tarefa, identificadorTarefa, onConcluida, router],
  );

  useEffect(() => {
    if (jaNotificou) return;

    if (estaConcluido && tarefa) {
      setJaNotificou(true);
      notificarERemover("sucesso");
    }

    if (estaComErro && tarefa) {
      setJaNotificou(true);
      notificarERemover("erro");
    }

    if (estaCancelada) {
      setJaNotificou(true);
      onConcluida(identificadorTarefa);
    }

    // Timeout: se "processando" por mais de 5 minutos, considerar como erro
    if (estaProcessando && tarefa) {
      const iniciadoHaMinutos =
        (Date.now() - new Date(tarefa.iniciadoEm).getTime()) / 60000;
      if (iniciadoHaMinutos > TIMEOUT_MINUTOS) {
        setJaNotificou(true);
        notificarERemover("timeout");
      }
    }
  }, [
    estaConcluido,
    estaComErro,
    estaCancelada,
    estaProcessando,
    tarefa,
    jaNotificou,
    notificarERemover,
    identificadorTarefa,
    onConcluida,
  ]);

  // Cleanup no unmount: se tarefa estiver concluída/erro mas não foi removida, remove silenciosamente
  useEffect(() => {
    return () => {
      if ((estaConcluido || estaComErro || estaCancelada) && !onConcluidaChamadaRef.current) {
        // Remove silenciosamente (sem notificação pois componente já foi desmontado)
        onConcluida(identificadorTarefa);
      }
    };
  }, [estaConcluido, estaComErro, estaCancelada, identificadorTarefa, onConcluida]);

  const handleCancelar = useCallback(async () => {
    if (!tarefa) return;

    setCancelando(true);
    try {
      const resposta = await fetch(`/api/tasks/${identificadorTarefa}/cancel`, {
        method: "POST",
      });

      if (resposta.ok) {
        toast.info("Tarefa cancelada");
        onConcluida(identificadorTarefa);
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
  }, [tarefa, identificadorTarefa, onConcluida]);

  // Antes de renderizar null, garante que tarefa concluída/erro/cancelada seja removida
  if (!estaProcessando || !tarefa) {
    if ((estaConcluido || estaComErro) && !onConcluidaChamadaRef.current) {
      notificarERemover(estaConcluido ? "sucesso" : "erro");
    }
    return null;
  }

  const descricao = descreverTarefa(tarefa);

  return (
    <div className="group rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium leading-snug">{descricao}</p>
          <p className="text-xs text-muted-foreground">
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
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
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

interface ItemNotificacaoProps {
  notificacao: Notificacao;
  onMarcarComoLida: (identificador: string) => void;
  onFecharDialog: () => void;
}

function ItemNotificacao({
  notificacao,
  onMarcarComoLida,
  onFecharDialog,
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

  const ehRetry = notificacao.acao?.url
    ? ehAcaoDeRetry(notificacao.acao.url)
    : false;

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

type AbaAtiva = "notificacoes" | "tarefas";

export function ActivityCenter() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>("notificacoes");
  const [identificadoresTarefas, setIdentificadoresTarefas] = useState<string[]>([]);

  const {
    notificacoes,
    contagemNaoVisualizadas,
    estaCarregando,
    marcarComoLida,
    marcarTodasComoLidas,
    limparTodas,
  } = useNotificacoes();

  // Carregar tarefas do localStorage ao montar
  useEffect(() => {
    setIdentificadoresTarefas(obterTarefasAtivasDoStorage());

    // Reagir quando uma nova tarefa é adicionada
    const handleNovaTarefa = () => {
      setIdentificadoresTarefas(obterTarefasAtivasDoStorage());
      // Auto-abrir na aba de tarefas quando nova tarefa é adicionada
      setAbaAtiva("tarefas");
      dialogRef.current?.showModal();
    };

    window.addEventListener("tarefa-ativa-adicionada", handleNovaTarefa);
    return () => window.removeEventListener("tarefa-ativa-adicionada", handleNovaTarefa);
  }, []);

  const handleTarefaConcluida = useCallback((identificador: string) => {
    removerTarefaAtivaDoStorage(identificador);
    setIdentificadoresTarefas((anteriores) =>
      anteriores.filter((id) => id !== identificador),
    );
  }, []);

  const abrir = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const fechar = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const handleLimparTodas = useCallback(async () => {
    await limparTodas();
  }, [limparTodas]);

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

  const temTarefasAtivas = identificadoresTarefas.length > 0;
  const temAtividade = contagemNaoVisualizadas > 0 || temTarefasAtivas;

  return (
    <>
      <Button variant="ghost" size="icon" className="relative" onClick={abrir}>
        <Inbox className="h-5 w-5" />
        {temAtividade && (
          <Badge
            className={cn(
              "absolute -right-1 -top-1 flex h-5 min-w-5 items-center gap-0.5 px-1 text-xs leading-none",
              temTarefasAtivas ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
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
        className="flex h-full flex-col border-l bg-background p-0 shadow-lg backdrop:bg-background/80 backdrop:backdrop-blur-sm"
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
              Atividades
            </h2>
            <InfoTooltip conteudo="Central de atividades: acompanhe tarefas em andamento e histórico de notificações do sistema." />
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

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setAbaAtiva("notificacoes")}
            className={cn(
              "relative flex-1 px-6 py-3 text-sm font-medium transition-colors",
              abaAtiva === "notificacoes"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
              {contagemNaoVisualizadas > 0 && (
                <Badge variant="destructive" className="h-5 min-w-5 px-1 text-xs">
                  {contagemNaoVisualizadas}
                </Badge>
              )}
            </div>
            {abaAtiva === "notificacoes" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
          <button
            onClick={() => setAbaAtiva("tarefas")}
            className={cn(
              "relative flex-1 px-6 py-3 text-sm font-medium transition-colors",
              abaAtiva === "tarefas"
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Loader2 className={cn("h-4 w-4", temTarefasAtivas && "animate-spin")} />
              Tarefas
              {temTarefasAtivas && (
                <Badge className="h-5 min-w-5 bg-primary px-1 text-xs text-primary-foreground">
                  {identificadoresTarefas.length}
                </Badge>
              )}
            </div>
            {abaAtiva === "tarefas" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
        </div>

        {/* Conteúdo - Notificações */}
        {abaAtiva === "notificacoes" && (
          <>
            {/* Status e ações */}
            <div className="flex items-center justify-between border-b px-6 py-3">
              <p className="text-xs text-muted-foreground">
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
                    Nenhuma notificação
                  </p>
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

        {/* Conteúdo - Tarefas */}
        {abaAtiva === "tarefas" && (
          <div className="flex-1 overflow-y-auto">
            {identificadoresTarefas.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 p-6">
                <Loader2 className="h-12 w-12 text-muted-foreground" />
                <p className="text-center text-sm text-muted-foreground">
                  Nenhuma tarefa em andamento
                </p>
              </div>
            )}

            {identificadoresTarefas.length > 0 && (
              <div className="space-y-3 p-6">
                {identificadoresTarefas.map((identificador) => (
                  <MonitorTarefa
                    key={identificador}
                    identificadorTarefa={identificador}
                    onConcluida={handleTarefaConcluida}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
