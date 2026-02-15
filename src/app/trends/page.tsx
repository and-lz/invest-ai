"use client";

import { useMemo, useEffect } from "react";
import { useContextoPaginaChat } from "@/contexts/contexto-pagina-chat";
import { serializarContextoTendencias } from "@/lib/serializar-contexto-chat";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, RefreshCw, AlertTriangle } from "lucide-react";
import { useDadosTendencias } from "@/hooks/use-dados-tendencias";
import { IndicadoresResumo } from "@/components/trends/indicadores-resumo";
import { TabelaRankingAtivos } from "@/components/trends/tabela-ranking-ativos";
import { GraficoIndicadoresMacro } from "@/components/trends/grafico-indicadores-macro";
import { MapaCalorSetores } from "@/components/trends/mapa-calor-setores";
import { TabelaRankingFundos } from "@/components/trends/tabela-ranking-fundos";

function formatarTimestampAtualizacao(isoString: string): string {
  return new Date(isoString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TrendsPage() {
  const { dadosTendencias, estaCarregando, erro, revalidar } = useDadosTendencias();

  // Registrar contexto da pagina para o chat
  const { definirContexto } = useContextoPaginaChat();
  const contextoSerializado = useMemo(
    () =>
      dadosTendencias
        ? serializarContextoTendencias(dadosTendencias)
        : undefined,
    [dadosTendencias],
  );
  useEffect(() => {
    definirContexto("trends", contextoSerializado);
  }, [definirContexto, contextoSerializado]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        <Header
          titulo="Tendencias de Mercado"
          descricao="Dados do mercado financeiro brasileiro"
        />
      </div>

      {/* Loading state */}
      {estaCarregando && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, indice) => (
              <Skeleton key={indice} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-96" />
          <Skeleton className="h-64" />
        </div>
      )}

      {/* Error state */}
      {erro && !estaCarregando && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground text-center">
              Erro ao carregar dados de mercado. Verifique se o BRAPI_TOKEN esta configurado.
            </p>
            <Button variant="outline" onClick={() => void revalidar()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data loaded */}
      {dadosTendencias && !estaCarregando && (
        <>
          {/* KPI Cards */}
          <IndicadoresResumo
            indicesMercado={dadosTendencias.indicesMercado}
            indicadoresMacro={dadosTendencias.indicadoresMacro}
          />

          {/* Stock Rankings + Macro Indicators side by side */}
          <div className="grid gap-4 lg:grid-cols-2">
            <TabelaRankingAtivos
              maioresAltas={dadosTendencias.maioresAltas}
              maioresBaixas={dadosTendencias.maioresBaixas}
              maisNegociados={dadosTendencias.maisNegociados}
            />

            <GraficoIndicadoresMacro
              indicadoresMacro={dadosTendencias.indicadoresMacro}
            />
          </div>

          {/* Sector Heatmap */}
          <MapaCalorSetores
            setoresPerformance={dadosTendencias.setoresPerformance}
          />

          {/* Fund Rankings */}
          <TabelaRankingFundos fundosEmAlta={dadosTendencias.maioresAltasFundos} />

          {/* Footer: last update + refresh */}
          <div className="flex items-center justify-center gap-3 pb-8">
            <p className="text-muted-foreground text-xs">
              Atualizado em{" "}
              {formatarTimestampAtualizacao(dadosTendencias.atualizadoEm)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void revalidar()}
              className="text-muted-foreground h-7 gap-1.5 text-xs"
            >
              <RefreshCw className="h-3 w-3" />
              Atualizar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
