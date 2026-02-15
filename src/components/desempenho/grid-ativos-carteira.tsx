"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { Search, TrendingUp, TrendingDown, Minus, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AtivoDaCarteira {
  codigoAtivo: string;
  nomeAtivo: string;
  estrategia: string;
  rentabilidade12Meses: number | null;
}

interface GrupoAtivos {
  id: string;
  rotulo: string;
  emoji: string;
  ativos: AtivoDaCarteira[];
  mediaRentabilidade: number | null;
}

interface GridAtivosCarteiraProps {
  readonly ativosCarteira: AtivoDaCarteira[];
  readonly tickerSelecionado: string | null;
  readonly aoSelecionarTicker: (ticker: string) => void;
  readonly estaCarregando?: boolean;
}

function calcularMediaRentabilidade(ativos: AtivoDaCarteira[]): number | null {
  const ativosComDados = ativos.filter((ativo) => ativo.rentabilidade12Meses !== null);
  if (ativosComDados.length === 0) return null;

  const soma = ativosComDados.reduce(
    (acumulado, ativo) => acumulado + ativo.rentabilidade12Meses!,
    0,
  );
  return soma / ativosComDados.length;
}

function agruparAtivosPorPerformance(ativos: AtivoDaCarteira[]): GrupoAtivos[] {
  const excelentes: AtivoDaCarteira[] = [];
  const bons: AtivoDaCarteira[] = [];
  const moderados: AtivoDaCarteira[] = [];
  const negativos: AtivoDaCarteira[] = [];
  const semDados: AtivoDaCarteira[] = [];

  for (const ativo of ativos) {
    if (ativo.rentabilidade12Meses === null) {
      semDados.push(ativo);
    } else if (ativo.rentabilidade12Meses >= 15) {
      excelentes.push(ativo);
    } else if (ativo.rentabilidade12Meses >= 5) {
      bons.push(ativo);
    } else if (ativo.rentabilidade12Meses >= 0) {
      moderados.push(ativo);
    } else {
      negativos.push(ativo);
    }
  }

  const grupos: GrupoAtivos[] = [];

  if (excelentes.length > 0) {
    grupos.push({
      id: "excelentes",
      rotulo: "Excelentes (12m ≥ +15%)",
      emoji: "🔥",
      ativos: excelentes,
      mediaRentabilidade: calcularMediaRentabilidade(excelentes),
    });
  }
  if (bons.length > 0) {
    grupos.push({
      id: "bons",
      rotulo: "Bons (12m +5% a +15%)",
      emoji: "📈",
      ativos: bons,
      mediaRentabilidade: calcularMediaRentabilidade(bons),
    });
  }
  if (moderados.length > 0) {
    grupos.push({
      id: "moderados",
      rotulo: "Moderados (12m 0% a +5%)",
      emoji: "📊",
      ativos: moderados,
      mediaRentabilidade: calcularMediaRentabilidade(moderados),
    });
  }
  if (negativos.length > 0) {
    grupos.push({
      id: "negativos",
      rotulo: "Negativos (12m < 0%)",
      emoji: "📉",
      ativos: negativos,
      mediaRentabilidade: calcularMediaRentabilidade(negativos),
    });
  }
  if (semDados.length > 0) {
    grupos.push({
      id: "sem-dados",
      rotulo: "Sem Dados (12m)",
      emoji: "❓",
      ativos: semDados,
      mediaRentabilidade: null,
    });
  }

  return grupos;
}

export function GridAtivosCarteira({
  ativosCarteira,
  tickerSelecionado,
  aoSelecionarTicker,
  estaCarregando,
}: GridAtivosCarteiraProps) {
  const [termoBusca, setTermoBusca] = useState("");
  const [gruposAbertos, setGruposAbertos] = useState<Record<string, boolean>>({});
  const dialogRef = useRef<HTMLDialogElement>(null);

  const abrirDialog = useCallback(() => {
    dialogRef.current?.showModal();
  }, []);

  const fecharDialog = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const gruposAtivos = useMemo(
    () => agruparAtivosPorPerformance(ativosCarteira),
    [ativosCarteira],
  );

  // Controlar abertura/fechamento dos grupos - todos abertos por padrão no dialog
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

  // Encontrar o ativo selecionado para exibir resumo compacto
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
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, indice) => (
            <div key={indice} className="h-24 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Resumo do ativo selecionado ou botão para selecionar */}
      {tickerSelecionado && ativoSelecionadoInfo ? (
        <Card>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold">{ativoSelecionadoInfo.codigoAtivo}</h3>
                <p className="text-muted-foreground truncate text-sm">
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
            <Button
              size="sm"
              variant="outline"
              onClick={abrirDialog}
              className="shrink-0"
            >
              Trocar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="cursor-pointer transition-colors hover:bg-accent" onClick={abrirDialog}>
          <CardContent className="flex items-center justify-center gap-2 p-4">
            <Search className="h-4 w-4" />
            <span className="font-medium">Selecionar Ativo</span>
          </CardContent>
        </Card>
      )}

      {/* Dialog de seleção de ativo */}
      <dialog
        ref={dialogRef}
        aria-label="Selecionar ativo da carteira"
        className="bg-background fixed inset-0 m-0 h-screen w-screen overflow-y-auto border-0 p-0 backdrop:bg-background/80 backdrop:backdrop-blur-sm"
      >
        <div className="border-b px-6 py-4">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <h2 className="text-xl font-semibold">Selecionar Ativo</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={fecharDialog}
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Fechar</span>
            </Button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl space-y-6 p-6">
          {/* Busca externa */}
          <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
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
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Search className="h-12 w-12 text-muted-foreground" />
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
            <Collapsible
              key={grupo.id}
              open={estaGrupoAberto(grupo.id)}
              onOpenChange={() => toggleGrupo(grupo.id)}
            >
              <Card>
                <CardContent className="p-4">
                  <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 [&[data-state=open]>svg]:rotate-180">
                    <div className="flex flex-1 items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{grupo.emoji}</span>
                        <span className="text-sm font-semibold">{grupo.rotulo}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs">
                          {grupo.ativos.length} {grupo.ativos.length === 1 ? "ativo" : "ativos"}
                        </span>
                        {grupo.mediaRentabilidade !== null && (
                          <Badge
                            variant={grupo.mediaRentabilidade >= 0 ? "default" : "destructive"}
                            className="text-xs"
                          >
                            Média: {grupo.mediaRentabilidade > 0 ? "+" : ""}
                            {grupo.mediaRentabilidade.toFixed(1)}%
                          </Badge>
                        )}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                <div className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {grupo.ativos.map((ativo) => {
                    const ativoTemTicker = ativo.codigoAtivo !== ativo.nomeAtivo;
                    const estaAtivo =
                      tickerSelecionado?.toUpperCase() === ativo.codigoAtivo.toUpperCase();

                    return (
                      <Card
                        key={ativo.codigoAtivo}
                        className={cn(
                          "hover:border-primary cursor-pointer transition-all hover:shadow-md",
                          estaAtivo && "border-primary ring-1 ring-primary/20",
                        )}
                        onClick={() => handleSelecionarAtivo(ativo.codigoAtivo)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <h4 className="truncate text-sm font-semibold">
                                {ativo.codigoAtivo}
                              </h4>
                              {ativoTemTicker && (
                                <p className="text-muted-foreground truncate text-xs">
                                  {ativo.nomeAtivo}
                                </p>
                              )}
                              <p className="text-muted-foreground mt-1 text-xs">
                                {ativo.estrategia}
                              </p>
                            </div>
                            {ativo.rentabilidade12Meses !== null && (
                              <div className="flex flex-col items-end gap-1">
                                {ativo.rentabilidade12Meses > 0 ? (
                                  <TrendingUp className="h-4 w-4 text-success" />
                                ) : ativo.rentabilidade12Meses < 0 ? (
                                  <TrendingDown className="h-4 w-4 text-destructive" />
                                ) : (
                                  <Minus className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span
                                  className={cn(
                                    "text-xs font-semibold",
                                    ativo.rentabilidade12Meses >= 0
                                      ? "text-success"
                                      : "text-destructive",
                                  )}
                                >
                                  {ativo.rentabilidade12Meses > 0 ? "+" : ""}
                                  {ativo.rentabilidade12Meses.toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      )}
        </div>
      </dialog>
    </>
  );
}
