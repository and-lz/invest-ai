"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { GLOSSARIO_RETORNOS_MENSAIS, GLOSSARIO_PERCENTUAL_CDI } from "@/lib/glossario-financeiro";
import { TakeawayBox, type Conclusao } from "@/components/ui/takeaway-box";
import { Calendar } from "lucide-react";
import { formatarPercentualSimples } from "@/domain/value-objects/percentage";
import type { RetornoAnual } from "@/schemas/report-extraction.schema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NOMES_MESES_ABREVIADOS = [
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

interface MonthlyReturnsHeatmapProps {
  retornosMensais: RetornoAnual[];
}

function obterClasseCor(valor: number | null): string {
  if (valor === null) return "bg-muted/30 text-muted-foreground/50";
  if (valor >= 3) return "bg-success/20 text-success";
  if (valor >= 1.5) return "bg-success/15 text-success";
  if (valor > 0) return "bg-success/10 text-success";
  if (valor === 0) return "text-muted-foreground";
  if (valor > -1.5) return "bg-destructive/10 text-destructive";
  if (valor > -3) return "bg-destructive/15 text-destructive";
  return "bg-destructive/20 text-destructive";
}

export function gerarConclusaoRetornosMensais(retornos: RetornoAnual[]): Conclusao[] {
  const conclusoes: Conclusao[] = [];
  if (retornos.length === 0) return conclusoes;

  let totalMesesPositivos = 0;
  let totalMesesNegativos = 0;
  let totalMesesComDados = 0;

  const primeiroRetorno = retornos[0];
  if (!primeiroRetorno) return conclusoes;

  let melhorAno: RetornoAnual = primeiroRetorno;
  let piorAno: RetornoAnual = primeiroRetorno;

  for (const ano of retornos) {
    for (const mes of ano.meses) {
      if (mes.rentabilidadeCarteira !== null) {
        totalMesesComDados++;
        if (mes.rentabilidadeCarteira.valor > 0) {
          totalMesesPositivos++;
        } else if (mes.rentabilidadeCarteira.valor < 0) {
          totalMesesNegativos++;
        }
      }
    }

    if (
      ano.rentabilidadeAnual !== null &&
      melhorAno.rentabilidadeAnual !== null &&
      ano.rentabilidadeAnual.valor > melhorAno.rentabilidadeAnual.valor
    ) {
      melhorAno = ano;
    }

    if (
      ano.rentabilidadeAnual !== null &&
      piorAno.rentabilidadeAnual !== null &&
      ano.rentabilidadeAnual.valor < piorAno.rentabilidadeAnual.valor
    ) {
      piorAno = ano;
    }
  }

  if (totalMesesComDados > 0) {
    const taxaConsistencia = Math.round((totalMesesPositivos / totalMesesComDados) * 100);
    conclusoes.push({
      texto: `Você teve ${totalMesesPositivos} meses positivos de ${totalMesesComDados} no total (${taxaConsistencia}% de consistência). ${totalMesesNegativos} meses foram negativos.`,
      tipo: taxaConsistencia >= 60 ? "positivo" : taxaConsistencia >= 40 ? "neutro" : "atencao",
    });
  }

  if (
    melhorAno.rentabilidadeAnual !== null &&
    piorAno.rentabilidadeAnual !== null &&
    melhorAno.ano !== piorAno.ano
  ) {
    conclusoes.push({
      texto: `Melhor ano: ${melhorAno.ano} (${formatarPercentualSimples(melhorAno.rentabilidadeAnual.valor)}). Pior ano: ${piorAno.ano} (${formatarPercentualSimples(piorAno.rentabilidadeAnual.valor)}).`,
      tipo: "neutro",
    });
  }

  return conclusoes;
}

export function MonthlyReturnsHeatmap({ retornosMensais }: MonthlyReturnsHeatmapProps) {
  if (retornosMensais.length === 0) return null;

  const retornosOrdenados = [...retornosMensais].sort((anoA, anoB) => anoA.ano - anoB.ano);

  const conclusoes = gerarConclusaoRetornosMensais(retornosOrdenados);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1">
          <Calendar className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          Retornos Mensais
          <InfoTooltip conteudo={GLOSSARIO_RETORNOS_MENSAIS.explicacao} />
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Cada célula mostra o retorno da sua carteira naquele mês. Verde indica ganho, vermelho
          indica perda. Passe o mouse para ver o percentual do CDI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-175">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Ano</TableHead>
                {NOMES_MESES_ABREVIADOS.map((nomeMes) => (
                  <TableHead key={nomeMes} className="text-center text-xs">
                    {nomeMes}
                  </TableHead>
                ))}
                <TableHead className="text-center text-xs font-semibold">Ano</TableHead>
                <TableHead className="text-center text-xs font-semibold">
                  <span className="flex items-center justify-center gap-1">
                    Acum.
                    <InfoTooltip
                      conteudo={GLOSSARIO_PERCENTUAL_CDI.explicacao}
                      tamanhoIcone="h-3 w-3"
                    />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TooltipProvider>
                {retornosOrdenados.map((retornoAnual) => (
                  <TableRow key={retornoAnual.ano}>
                    <TableCell className="font-medium">{retornoAnual.ano}</TableCell>
                    {NOMES_MESES_ABREVIADOS.map((_, indiceMes) => {
                      const dadosMes = retornoAnual.meses.find((mes) => mes.mes === indiceMes + 1);
                      const valorRetorno = dadosMes?.rentabilidadeCarteira?.valor ?? null;
                      const percentualCdi = dadosMes?.percentualDoCDI?.valor ?? null;

                      return (
                        <TableCell
                          key={indiceMes}
                          className={cn(
                            "text-center text-xs tabular-nums",
                            obterClasseCor(valorRetorno),
                          )}
                        >
                          {valorRetorno !== null ? (
                            percentualCdi !== null ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="cursor-default">{valorRetorno.toFixed(2)}%</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{formatarPercentualSimples(percentualCdi)} do CDI</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              <span>{valorRetorno.toFixed(2)}%</span>
                            )
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell
                      className={cn(
                        "text-center text-xs font-semibold tabular-nums",
                        obterClasseCor(retornoAnual.rentabilidadeAnual?.valor ?? null),
                      )}
                    >
                      {retornoAnual.rentabilidadeAnual
                        ? `${retornoAnual.rentabilidadeAnual.valor.toFixed(2)}%`
                        : "—"}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-center text-xs font-semibold tabular-nums",
                        obterClasseCor(retornoAnual.rentabilidadeAcumulada?.valor ?? null),
                      )}
                    >
                      {retornoAnual.rentabilidadeAcumulada
                        ? `${retornoAnual.rentabilidadeAcumulada.valor.toFixed(2)}%`
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TooltipProvider>
            </TableBody>
          </Table>
        </div>
        <TakeawayBox conclusoes={conclusoes} />
      </CardContent>
    </Card>
  );
}
