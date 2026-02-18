"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  GLOSSARIO_IBOVESPA_INDICE,
  GLOSSARIO_SELIC_META,
  GLOSSARIO_IPCA_INDICE,
  GLOSSARIO_DOLAR,
} from "@/lib/glossario-financeiro";
import { cn } from "@/lib/utils";
import { typography, valueColor } from "@/lib/design-system";
import type { IndiceMercado, IndicadorMacro } from "@/schemas/trends.schema";

interface IndicadoresResumoProps {
  indicesMercado: IndiceMercado[];
  indicadoresMacro: IndicadorMacro[];
}

function formatarNumeroCompacto(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatarVariacao(variacao: number): string {
  const sinal = variacao >= 0 ? "+" : "";
  return `${sinal}${variacao.toFixed(2)}%`;
}

function encontrarIndicadorPorCodigo(
  indicadores: IndicadorMacro[],
  codigo: number,
): IndicadorMacro | undefined {
  return indicadores.find((indicador) => indicador.codigo === codigo);
}

function encontrarIndicePorSimbolo(
  indices: IndiceMercado[],
  simbolo: string,
): IndiceMercado | undefined {
  return indices.find((indice) => indice.simbolo === simbolo);
}

interface CardIndicadorProps {
  titulo: string;
  valor: string;
  subtitulo?: string;
  variacao?: number;
  icon: React.ReactNode;
  glossario: string;
}

function CardIndicador({
  titulo,
  valor,
  subtitulo,
  variacao,
  icon,
  glossario,
}: CardIndicadorProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-1 text-sm font-medium">
          {icon}
          {titulo}
          <InfoTooltip conteudo={glossario} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={typography.mainValue}>{valor}</div>
        {variacao !== undefined && (
          <p
            className={cn(
              "flex items-center gap-1 text-xs",
              valueColor(variacao),
            )}
          >
            {variacao >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {formatarVariacao(variacao)}
          </p>
        )}
        {subtitulo && !variacao && <p className="text-muted-foreground text-xs">{subtitulo}</p>}
      </CardContent>
    </Card>
  );
}

export function IndicadoresResumo({ indicesMercado, indicadoresMacro }: IndicadoresResumoProps) {
  const ibovespa = encontrarIndicePorSimbolo(indicesMercado, "^BVSP");
  const selic = encontrarIndicadorPorCodigo(indicadoresMacro, 432);
  const ipca = encontrarIndicadorPorCodigo(indicadoresMacro, 433);
  const dolar = encontrarIndicadorPorCodigo(indicadoresMacro, 1);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <CardIndicador
        titulo="Ibovespa"
        valor={ibovespa ? formatarNumeroCompacto(ibovespa.valor) : "—"}
        variacao={ibovespa?.variacao}
        icon={<TrendingUp className="text-muted-foreground h-5 w-5" aria-hidden="true" />}
        glossario={GLOSSARIO_IBOVESPA_INDICE.explicacao}
      />

      <CardIndicador
        titulo="Dolar (PTAX)"
        valor={
          dolar
            ? `R$ ${dolar.valorAtual.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`
            : "—"
        }
        subtitulo={dolar?.unidade}
        icon={<DollarSign className="text-muted-foreground h-5 w-5" aria-hidden="true" />}
        glossario={GLOSSARIO_DOLAR.explicacao}
      />

      <CardIndicador
        titulo="SELIC Meta"
        valor={selic ? `${formatarNumeroCompacto(selic.valorAtual)}%` : "—"}
        subtitulo={selic?.unidade}
        icon={<Percent className="text-muted-foreground h-5 w-5" aria-hidden="true" />}
        glossario={GLOSSARIO_SELIC_META.explicacao}
      />

      <CardIndicador
        titulo="IPCA"
        valor={ipca ? `${formatarNumeroCompacto(ipca.valorAtual)}%` : "—"}
        subtitulo={ipca?.unidade}
        icon={<Percent className="text-muted-foreground h-5 w-5" aria-hidden="true" />}
        glossario={GLOSSARIO_IPCA_INDICE.explicacao}
      />
    </div>
  );
}
