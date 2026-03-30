"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  Wallet,
  Target,
} from "lucide-react";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatSimplePercentage } from "@/domain/value-objects/percentage";
import type { AnaliseAtivoResponse } from "@/schemas/asset-analysis.schema";
import { cn } from "@/lib/utils";
import { icon, valueColor } from "@/lib/design-system";
import { ROTULOS_RECOMENDACAO, CORES_RECOMENDACAO } from "./asset-ai-analysis-constants";
import {
  FundamentalsSection,
  RiskFactorsSection,
  MacroTimingSection,
  AttentionPointsSection,
} from "./asset-ai-analysis-sections";

interface AnaliseIaAtivoProps {
  readonly analise: AnaliseAtivoResponse;
}

export function AnaliseIaAtivo({ analise }: AnaliseIaAtivoProps) {
  return (
    <div className="space-y-4">
      {/* Resumo Geral + Veredicto */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/fortuna-minimal.png" alt="Fortuna" width={20} height={20} className={cn(icon.cardTitle)} />
              <CardTitle>Analise Fortuna</CardTitle>
            </div>
            <Badge
              variant="outline"
              className={`text-sm font-semibold ${CORES_RECOMENDACAO[analise.veredicto.recomendacao]}`}
            >
              {ROTULOS_RECOMENDACAO[analise.veredicto.recomendacao]}
            </Badge>
          </div>
          <CardDescription>Analise gerada em {analise.dataAnalise}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">{analise.resumoGeral}</p>

          <Separator />

          {/* Veredicto */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="text-muted-foreground h-4 w-4" />
              <h4 className="text-sm font-semibold">Veredicto</h4>
            </div>
            <p className="text-muted-foreground text-sm">{analise.veredicto.justificativa}</p>
            <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
              <span>Horizonte: {analise.veredicto.horizonteTemporal}</span>
              <span>Revisar se: {analise.veredicto.condicoesRevisao}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className={cn(icon.cardTitle, "text-muted-foreground")} />
            <CardTitle>Performance</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {analise.analisePerformance.comparacoes.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left">
                    <th className="pr-4 pb-2 font-medium">Periodo</th>
                    <th className="pr-4 pb-2 font-medium">Ativo</th>
                    <th className="pr-4 pb-2 font-medium">CDI</th>
                    <th className="pr-4 pb-2 font-medium">Ibovespa</th>
                    <th className="pb-2 font-medium">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {analise.analisePerformance.comparacoes.map((comparacao) => (
                    <tr key={comparacao.periodo} className="border-b last:border-0">
                      <td className="py-2 pr-4">{comparacao.periodo}</td>
                      <td
                        className={cn("py-2 pr-4 font-medium", valueColor(comparacao.retornoAtivo))}
                      >
                        {formatSimplePercentage(comparacao.retornoAtivo)}
                      </td>
                      <td className="text-muted-foreground py-2 pr-4">
                        {comparacao.retornoCDI !== null
                          ? formatSimplePercentage(comparacao.retornoCDI)
                          : "N/D"}
                      </td>
                      <td className="text-muted-foreground py-2 pr-4">
                        {comparacao.retornoIbovespa !== null
                          ? formatSimplePercentage(comparacao.retornoIbovespa)
                          : "N/D"}
                      </td>
                      <td className="text-muted-foreground py-2 text-xs">
                        {comparacao.veredictoPeriodo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-muted-foreground text-sm">
            {analise.analisePerformance.tendenciaRecente}
          </p>
          <p className="text-muted-foreground text-sm">
            {analise.analisePerformance.posicaoNaCarteira}
          </p>
        </CardContent>
      </Card>

      {/* Renda Passiva (se disponivel) */}
      {analise.analiseRendaPassiva && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className={cn(icon.cardTitle, "text-muted-foreground")} />
              <CardTitle>Renda Passiva</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              {analise.analiseRendaPassiva.yieldMedioMensal !== null && (
                <div>
                  <p className="text-muted-foreground text-xs">Yield Mensal</p>
                  <p className="text-lg font-semibold">
                    {formatSimplePercentage(analise.analiseRendaPassiva.yieldMedioMensal)}
                  </p>
                </div>
              )}
              {analise.analiseRendaPassiva.yieldAnualizado !== null && (
                <div>
                  <p className="text-muted-foreground text-xs">Yield Anualizado</p>
                  <p className="text-lg font-semibold">
                    {formatSimplePercentage(analise.analiseRendaPassiva.yieldAnualizado)}
                  </p>
                </div>
              )}
              {analise.analiseRendaPassiva.yieldOnCost !== null && (
                <div>
                  <p className="text-muted-foreground text-xs">Yield on Cost</p>
                  <p className="text-lg font-semibold">
                    {formatSimplePercentage(analise.analiseRendaPassiva.yieldOnCost)}
                  </p>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              Total recebido: {formatarMoeda(analise.analiseRendaPassiva.totalRecebidoCentavos)}
            </p>
            <p className="text-muted-foreground text-sm">
              {analise.analiseRendaPassiva.consistencia}
            </p>
            {analise.analiseRendaPassiva.comparacaoComSelic && (
              <p className="text-muted-foreground text-sm">
                {analise.analiseRendaPassiva.comparacaoComSelic}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <FundamentalsSection analise={analise} />
      <RiskFactorsSection analise={analise} />
      <MacroTimingSection analise={analise} />
      <AttentionPointsSection analise={analise} />
    </div>
  );
}
