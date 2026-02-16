"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TakeawayBox } from "@/components/ui/takeaway-box";
import type { Conclusao } from "@/components/ui/takeaway-box";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  GLOSSARIO_SELIC_META,
  GLOSSARIO_IPCA_INDICE,
  GLOSSARIO_IGPM,
} from "@/lib/glossario-financeiro";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IndicadorMacro } from "@/schemas/trends.schema";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface GraficoIndicadoresMacroProps {
  indicadoresMacro: IndicadorMacro[];
}

const CORES_INDICADOR: Record<number, string> = {
  432: "var(--chart-1)", // SELIC - navy
  433: "var(--chart-2)", // IPCA - teal
  189: "var(--chart-4)", // IGPM - purpura
};

const GLOSSARIOS: Record<number, string> = {
  432: GLOSSARIO_SELIC_META.explicacao,
  433: GLOSSARIO_IPCA_INDICE.explicacao,
  189: GLOSSARIO_IGPM.explicacao,
};

function formatarMesAbreviado(dataIso: string): string {
  const [ano, mes] = dataIso.split("-");
  const meses = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const indice = parseInt(mes ?? "0", 10) - 1;
  return `${meses[indice] ?? mes}/${ano?.slice(2)}`;
}

function gerarConclusoesMacro(indicadores: IndicadorMacro[]): Conclusao[] {
  const conclusoes: Conclusao[] = [];

  const selic = indicadores.find((i) => i.codigo === 432);
  if (selic && selic.historico.length >= 2) {
    const penultimo = selic.historico[selic.historico.length - 2];
    if (penultimo) {
      const diferenca = selic.valorAtual - penultimo.valor;
      if (diferenca > 0) {
        conclusoes.push({
          texto: `SELIC subiu para ${selic.valorAtual}% a.a. (era ${penultimo.valor}%).`,
          tipo: "atencao",
        });
      } else if (diferenca < 0) {
        conclusoes.push({
          texto: `SELIC caiu para ${selic.valorAtual}% a.a. (era ${penultimo.valor}%).`,
          tipo: "positivo",
        });
      } else {
        conclusoes.push({
          texto: `SELIC estavel em ${selic.valorAtual}% a.a.`,
          tipo: "neutro",
        });
      }
    }
  }

  const ipca = indicadores.find((i) => i.codigo === 433);
  if (ipca) {
    conclusoes.push({
      texto: `IPCA do ultimo mes: ${ipca.valorAtual.toFixed(2)}% a.m.`,
      tipo: ipca.valorAtual > 0.5 ? "atencao" : "positivo",
    });
  }

  return conclusoes;
}

// Indicadores com historico mensal (excluir USD-BRL e CDI que sao pontuais)
const INDICADORES_COM_GRAFICO = [432, 433, 189];

export function GraficoIndicadoresMacro({ indicadoresMacro }: GraficoIndicadoresMacroProps) {
  const indicadoresParaGrafico = indicadoresMacro.filter((indicador) =>
    INDICADORES_COM_GRAFICO.includes(indicador.codigo),
  );
  const conclusoes = gerarConclusoesMacro(indicadoresMacro);

  // Montar dados para o grafico unificando por data
  const mapaDatasPontos = new Map<string, Record<string, number>>();

  for (const indicador of indicadoresParaGrafico) {
    for (const ponto of indicador.historico) {
      const dataChave = ponto.data.slice(0, 7); // YYYY-MM
      const existente = mapaDatasPontos.get(dataChave) ?? {};
      existente[indicador.nome] = ponto.valor;
      mapaDatasPontos.set(dataChave, existente);
    }
  }

  const dadosGrafico = Array.from(mapaDatasPontos.entries())
    .sort(([dataA], [dataB]) => dataA.localeCompare(dataB))
    .map(([data, valores]) => ({
      data: formatarMesAbreviado(data),
      ...valores,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="text-muted-foreground h-5 w-5" aria-hidden="true" />
          Indicadores Macroeconômicos
        </CardTitle>
        <CardDescription>SELIC, IPCA e IGP-M dos últimos 12 meses</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Cards com valores atuais */}
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          {indicadoresParaGrafico.map((indicador) => {
            const tendencia =
              indicador.historico.length >= 2
                ? indicador.valorAtual -
                  (indicador.historico[indicador.historico.length - 2]?.valor ?? 0)
                : 0;

            return (
              <div
                key={indicador.codigo}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="flex items-center gap-1 text-sm font-medium">
                    {indicador.nome}
                    <InfoTooltip
                      conteudo={GLOSSARIOS[indicador.codigo] ?? ""}
                      tamanhoIcone="h-3 w-3"
                    />
                  </p>
                  <p className="text-lg font-bold">
                    {indicador.valorAtual.toFixed(2)}
                    <span className="text-muted-foreground text-xs font-normal">
                      {" "}
                      {indicador.unidade}
                    </span>
                  </p>
                </div>
                <div
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-medium",
                    tendencia > 0
                      ? "text-destructive"
                      : tendencia < 0
                        ? "text-success"
                        : "text-muted-foreground",
                  )}
                >
                  {tendencia > 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : tendencia < 0 ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : null}
                  {tendencia !== 0 && `${tendencia > 0 ? "+" : ""}${tendencia.toFixed(2)}`}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grafico de linha */}
        {dadosGrafico.length > 0 && (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="data" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={45} />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--card)",
                  fontSize: "12px",
                }}
              />
              {indicadoresParaGrafico.map((indicador) => (
                <Line
                  key={indicador.codigo}
                  type="monotone"
                  dataKey={indicador.nome}
                  stroke={CORES_INDICADOR[indicador.codigo] ?? "var(--chart-1)"}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        <TakeawayBox conclusoes={conclusoes} />
      </CardContent>
    </Card>
  );
}
