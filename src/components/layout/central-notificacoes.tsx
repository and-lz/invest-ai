"use client";

import { useCallback, useState } from "react";
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
} from "lucide-react";
import { useNotificacoes } from "@/hooks/use-notificacoes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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

function ItemNotificacao({
  notificacao,
  onMarcarComoLida,
  onFecharSheet,
}: ItemNotificacaoProps) {
  const router = useRouter();
  const Icone = ICONES_TIPO[notificacao.tipo];
  const corIcone = CORES_TIPO[notificacao.tipo];

  const handleVerResultado = useCallback(() => {
    if (notificacao.acao?.url) {
      onMarcarComoLida(notificacao.identificador);
      onFecharSheet();
      router.push(notificacao.acao.url);
    }
  }, [notificacao, onMarcarComoLida, onFecharSheet, router]);

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
            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Check className="h-3 w-3" />
          </Button>
        )}
      </div>
      {notificacao.acao && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleVerResultado}
          className="mt-3 h-7 w-full text-xs"
        >
          {notificacao.acao.rotulo}
        </Button>
      )}
    </div>
  );
}

export function CentralNotificacoes() {
  const [estaAberto, setEstaAberto] = useState(false);
  const {
    notificacoes,
    contagemNaoVisualizadas,
    estaCarregando,
    marcarComoLida,
    marcarTodasComoLidas,
    limparTodas,
  } = useNotificacoes();

  const fecharSheet = useCallback(() => {
    setEstaAberto(false);
  }, []);

  const handleLimparTodas = useCallback(async () => {
    await limparTodas();
    setEstaAberto(false);
  }, [limparTodas]);

  return (
    <Sheet open={estaAberto} onOpenChange={setEstaAberto}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
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
      </SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:w-96">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg">Notificacoes</SheetTitle>
              <SheetDescription className="text-xs">
                {contagemNaoVisualizadas > 0
                  ? `${contagemNaoVisualizadas} nao lida${contagemNaoVisualizadas > 1 ? "s" : ""}`
                  : "Todas lidas"}
              </SheetDescription>
            </div>
            <div className="flex items-center gap-1">
              {contagemNaoVisualizadas > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={marcarTodasComoLidas}
                  className="gap-1.5 text-xs"
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
        </SheetHeader>

        <Separator />

        {estaCarregando && (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        )}

        {!estaCarregando && notificacoes.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
            <Bell className="h-12 w-12 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground">Nenhuma notificacao</p>
          </div>
        )}

        {!estaCarregando && notificacoes.length > 0 && (
          <ScrollArea className="flex-1">
            <div className="space-y-2 p-4">
              {notificacoes.map((notificacao) => (
                <ItemNotificacao
                  key={notificacao.identificador}
                  notificacao={notificacao}
                  onMarcarComoLida={marcarComoLida}
                  onFecharSheet={fecharSheet}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
