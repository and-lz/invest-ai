"use client";

import { useState, useMemo, useCallback } from "react";
import { useNativeDialog } from "@/hooks/use-native-dialog";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  typography,
  icon,
  layout,
  dialog,
} from "@/lib/design-system";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { agruparAtivosPorPerformance } from "./portfolio-assets-utils";
import type { AtivoDaCarteira } from "./portfolio-assets-utils";
import { PortfolioAssetsGroup } from "./portfolio-assets-group";

interface GridAtivosCarteiraProps {
  readonly ativosCarteira: AtivoDaCarteira[];
  readonly tickerSelecionado: string | null;
  readonly aoSelecionarTicker: (ticker: string) => void;
  readonly estaCarregando?: boolean;
}

export function GridAtivosCarteira({
  ativosCarteira,
  tickerSelecionado,
  aoSelecionarTicker,
  estaCarregando,
}: GridAtivosCarteiraProps) {
  const [termoBusca, setTermoBusca] = useState("");
  const [gruposAbertos, setGruposAbertos] = useState<Record<string, boolean>>({});

  const {
    dialogRef,
    open: abrirDialog,
    close: fecharDialog,
    handleBackdropClick,
  } = useNativeDialog();

  const gruposAtivos = useMemo(() => agruparAtivosPorPerformance(ativosCarteira), [ativosCarteira]);

  const estaGrupoAberto = (grupoId: string): boolean => {
    return gruposAbertos[grupoId] ?? true;
  };

  const toggleGrupo = (grupoId: string) => {
    setGruposAbertos((anterior) => ({
      ...anterior,
      [grupoId]: !estaGrupoAberto(grupoId),
    }));
  };

  const handleSelecionarAtivo = useCallback(
    (ticker: string) => {
      aoSelecionarTicker(ticker);
      fecharDialog();
    },
    [aoSelecionarTicker, fecharDialog],
  );

  const handleBuscarExterno = () => {
    const termoNormalizado = termoBusca.trim().toUpperCase();
    if (termoNormalizado.length >= 2) {
      handleSelecionarAtivo(termoNormalizado);
      setTermoBusca("");
    }
  };

  const handleKeyDown = (evento: React.KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === "Enter") {
      handleBuscarExterno();
    }
  };

  const ativoSelecionadoInfo = useMemo(
    () =>
      tickerSelecionado
        ? ativosCarteira.find(
            (ativo) => ativo.codigoAtivo.toUpperCase() === tickerSelecionado.toUpperCase(),
          )
        : null,
    [ativosCarteira, tickerSelecionado],
  );

  if (estaCarregando) {
    return (
      <div className="space-y-4">
        <div className="bg-muted h-10 w-full animate-pulse rounded-md" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, indice) => (
            <div key={indice} className="bg-muted h-24 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Resumo do ativo selecionado ou botao para selecionar */}
      {tickerSelecionado && ativoSelecionadoInfo ? (
        <Card>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold">{ativoSelecionadoInfo.codigoAtivo}</h3>
                <p className={cn(typography.body, "text-muted-foreground truncate")}>
                  {ativoSelecionadoInfo.nomeAtivo !== ativoSelecionadoInfo.codigoAtivo
                    ? ativoSelecionadoInfo.nomeAtivo
                    : ativoSelecionadoInfo.estrategia}
                </p>
              </div>
              {ativoSelecionadoInfo.rentabilidade12Meses !== null && (
                <Badge
                  variant={
                    ativoSelecionadoInfo.rentabilidade12Meses >= 0 ? "default" : "destructive"
                  }
                >
                  {ativoSelecionadoInfo.rentabilidade12Meses > 0 ? "+" : ""}
                  {ativoSelecionadoInfo.rentabilidade12Meses.toFixed(1)}% (12m)
                </Badge>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={abrirDialog} className="shrink-0">
              Trocar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="hover:bg-accent cursor-pointer transition-colors" onClick={abrirDialog}>
          <CardContent className="flex items-center justify-center gap-2 p-4">
            <Search className={icon.button} />
            <span className="font-medium">Selecionar Ativo</span>
          </CardContent>
        </Card>
      )}

      {/* Dialog de selecao de ativo */}
      <dialog
        ref={dialogRef}
        onClick={handleBackdropClick}
        aria-label="Selecionar ativo da carteira"
        className={cn(
          "bg-background fixed inset-0 m-0 h-screen w-screen overflow-y-auto border-0 p-0",
          dialog.backdrop,
          dialog.fullscreen,
        )}
      >
        <div className="border-b px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <h2 className={typography.h2}>Selecionar Ativo</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={fecharDialog}
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
            >
              <X className={icon.button} />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
          {/* Busca externa */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className={cn(icon.button, "text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2")} />
              <Input
                placeholder="Buscar ativo no mercado (ex: PETR4, ITUB4)..."
                value={termoBusca}
                onChange={(evento) => setTermoBusca(evento.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            <Button
              onClick={handleBuscarExterno}
              disabled={termoBusca.trim().length < 2}
              variant="secondary"
            >
              Buscar
            </Button>
          </div>

          {/* Estado vazio */}
          {ativosCarteira.length === 0 && (
            <Card>
              <CardContent className={layout.emptyStateCard}>
                <Search className={icon.emptyState} />
                <p className="text-muted-foreground text-center">
                  Nenhum ativo na carteira. Use a busca acima para explorar ativos do mercado.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Grid de grupos */}
          {gruposAtivos.length > 0 && (
            <div className="space-y-3">
              {gruposAtivos.map((grupo) => (
                <PortfolioAssetsGroup
                  key={grupo.id}
                  grupo={grupo}
                  isOpen={estaGrupoAberto(grupo.id)}
                  onToggle={() => toggleGrupo(grupo.id)}
                  tickerSelecionado={tickerSelecionado}
                  onSelecionarAtivo={handleSelecionarAtivo}
                />
              ))}
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
