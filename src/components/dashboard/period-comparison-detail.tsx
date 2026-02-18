"use client";

import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BotaoExplicarIA } from "@/components/ui/ai-explain-button";
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
import {
  GLOSSARY_COMPARACAO_PERIODOS,
  GLOSSARY_VOLATILIDADE,
  GLOSSARY_PERCENTUAL_CDI,
} from "@/lib/financial-glossary";
import { TakeawayBox, type Conclusao } from "@/components/ui/takeaway-box";
import { formatSimplePercentage } from "@/domain/value-objects/percentage";
import type { ComparacaoPeriodo } from "@/schemas/report-extraction.schema";
import { Scale } from "lucide-react";

interface PeriodComparisonDetailProps {
  comparacaoPeriodos: ComparacaoPeriodo[];
}

export function gerarConclusaoComparacaoPeriodos(periodos: ComparacaoPeriodo[]): Conclusao[] {
  const conclusoes: Conclusao[] = [];
  if (periodos.length === 0) return conclusoes;

  const periodosAcimaCdi = periodos.filter(
    (periodo) => periodo.rentabilidadeCarteira.valor > periodo.rentabilidadeCDI.valor,
  );

  conclusoes.push({
    texto: `Você bateu o CDI em ${periodosAcimaCdi.length} de ${periodos.length} períodos analisados.`,
    tipo:
      periodosAcimaCdi.length > periodos.length / 2
        ? "positivo"
        : periodosAcimaCdi.length > 0
          ? "neutro"
          : "atencao",
  });

  const periodosComVolatilidade = periodos.filter((periodo) => periodo.volatilidade !== null);
  if (periodosComVolatilidade.length > 0) {
    const somaVolatilidade = periodosComVolatilidade.reduce(
      (acumulador, periodo) => acumulador + (periodo.volatilidade?.valor ?? 0),
      0,
    );
    const mediaVolatilidade = somaVolatilidade / periodosComVolatilidade.length;

    conclusoes.push({
      texto: `Sua volatilidade média é de ${formatSimplePercentage(mediaVolatilidade)}. ${mediaVolatilidade > 5 ? "Isso indica variações significativas — seu patrimônio oscila bastante." : "Nível moderado de oscilação no patrimônio."}`,
      tipo: mediaVolatilidade > 5 ? "atencao" : "neutro",
    });
  }

  return conclusoes;
}

export function PeriodComparisonDetail({ comparacaoPeriodos }: PeriodComparisonDetailProps) {
  if (comparacaoPeriodos.length === 0) return null;

  const conclusoes = gerarConclusaoComparacaoPeriodos(comparacaoPeriodos);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="text-muted-foreground h-5 w-5" aria-hidden="true" />
          Comparação por Período
          <InfoTooltip conteudo={GLOSSARY_COMPARACAO_PERIODOS.explicacao} />
        </CardTitle>
        <CardDescription className="leading-relaxed">
          Veja o retorno da sua carteira em diferentes janelas de tempo comparado ao CDI. Verde
          indica que você superou a renda fixa naquele período.
        </CardDescription>
        <CardAction>
          <BotaoExplicarIA identificadorCard="comparacao-periodos" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Período</TableHead>
              <TableHead className="text-right">Carteira</TableHead>
              <TableHead className="text-right">CDI</TableHead>
              <TableHead className="text-right">
                <span className="flex items-center justify-end gap-1">
                  % CDI
                  <InfoTooltip
                    conteudo={GLOSSARY_PERCENTUAL_CDI.explicacao}
                    tamanhoIcone="h-3 w-3"
                  />
                </span>
              </TableHead>
              <TableHead className="text-right">
                <span className="flex items-center justify-end gap-1">
                  Volatilidade
                  <InfoTooltip
                    conteudo={GLOSSARY_VOLATILIDADE.explicacao}
                    tamanhoIcone="h-3 w-3"
                  />
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparacaoPeriodos.map((periodo) => {
              const superouCdi =
                periodo.rentabilidadeCarteira.valor > periodo.rentabilidadeCDI.valor;

              return (
                <TableRow key={periodo.periodo}>
                  <TableCell className="font-medium">{periodo.periodo}</TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium tabular-nums",
                      superouCdi ? "text-success" : "text-destructive",
                    )}
                  >
                    {formatSimplePercentage(periodo.rentabilidadeCarteira.valor)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right tabular-nums">
                    {formatSimplePercentage(periodo.rentabilidadeCDI.valor)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right tabular-nums",
                      periodo.percentualDoCDI.valor >= 100 ? "text-success" : "text-destructive",
                    )}
                  >
                    {formatSimplePercentage(periodo.percentualDoCDI.valor)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right tabular-nums">
                    {periodo.volatilidade
                      ? formatSimplePercentage(periodo.volatilidade.valor)
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TakeawayBox conclusoes={conclusoes} />
      </CardContent>
    </Card>
  );
}
