"use client";

import { useCallback, useState } from "react";
import { useNativeDialog } from "@/hooks/use-native-dialog";
import {
  Inbox,
  Bell,
  Loader2,
  Trash2,
  CheckCheck,
  X,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { useActiveTasks } from "@/hooks/use-active-tasks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { cn } from "@/lib/utils";
import { typography, icon, layout, dialog } from "@/lib/design-system";
import { TaskCard } from "./activity-center-task-card";
import { ItemNotificacao } from "./activity-center-notification-item";

type AbaAtiva = "notificacoes" | "tarefas";

export function ActivityCenter() {
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>("notificacoes");

  const {
    notificacoes,
    contagemNaoVisualizadas,
    estaCarregando,
    marcarComoLida,
    marcarTodasComoLidas,
    limparTodas,
  } = useNotifications();

  const { tarefasAtivas, estaCarregando: tarefasCarregando } = useActiveTasks();

  const {
    dialogRef,
    open: abrir,
    close: fechar,
    handleBackdropClick,
  } = useNativeDialog();

  const handleLimparTodas = useCallback(async () => {
    await limparTodas();
  }, [limparTodas]);

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
        onClick={handleBackdropClick}
        aria-label="Central de atividades"
        className={cn("bg-background relative z-60 flex h-full flex-col border-l p-0 shadow-lg", dialog.backdrop, dialog.drawerRight)}
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
            <h2 className={typography.h2}>Atividades</h2>
            <InfoTooltip conteudo="Central de atividades: acompanhe tarefas em andamento e historico de notificacoes do sistema." />
          </div>
          <Button variant="ghost" size="icon" onClick={fechar} className="text-muted-foreground">
            <X className={icon.button} />
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
              <Bell className={icon.button} />
              Notificacoes
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
              <Loader2 className={cn(icon.button, temTarefasAtivas && "animate-spin")} />
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
              <p className={typography.helper}>
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
                    className={cn(typography.helper, "gap-1.5")}
                  >
                    <CheckCheck className={icon.button} />
                    Ler todas
                  </Button>
                )}
                {notificacoes.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLimparTodas}
                    className={cn(typography.helper, "gap-1.5")}
                  >
                    <Trash2 className={icon.button} />
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
                <div className={layout.emptyState}>
                  <Bell className={icon.emptyState} />
                  <p className="text-muted-foreground text-center text-sm">Nenhuma notificacao</p>
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
              <div className={layout.emptyState}>
                <Inbox className={icon.emptyState} />
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
