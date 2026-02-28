"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BotIcon,
  Shield,
  TrendingUp,
  Wallet,
  BarChart3,
  Globe,
  Target,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatSimplePercentage } from "@/domain/value-objects/percentage";
import type { AnaliseAtivoResponse, VeredictoRecomendacao } from "@/schemas/asset-analysis.schema";
import { cn } from "@/lib/utils";
import { icon, valueColor } from "@/lib/design-system";

interface AnaliseIaAtivoProps {
  readonly analise: AnaliseAtivoResponse;
}

const ROTULOS_RECOMENDACAO: Record<VeredictoRecomendacao, string> = {
  manter: "Manter",
  aumentar_posicao: "Aumentar Posicao",
  reduzir_posicao: "Reduzir Posicao",
  realizar_lucro: "Realizar Lucro",
  sair_da_posicao: "Sair da Posicao",
  aguardar: "Aguardar",
};

const CORES_RECOMENDACAO: Record<VeredictoRecomendacao, string> = {
  manter: "bg-secondary text-secondary-foreground",
  aumentar_posicao: "bg-success/15 text-success border-success/30",
  reduzir_posicao: "bg-warning/15 text-warning border-warning/30",
  realizar_lucro: "bg-success/15 text-success border-success/30",
  sair_da_posicao: "bg-destructive/15 text-destructive border-destructive/30",
  aguardar: "bg-secondary text-secondary-foreground",
};

const ROTULOS_SEVERIDADE: Record<string, string> = {
  alta: "Alta",
  media: "Media",
  baixa: "Baixa",
};

const CORES_SEVERIDADE: Record<string, string> = {
  alta: "bg-destructive/15 text-destructive border-destructive/30",
  media: "bg-warning/15 text-warning border-warning/30",
  baixa: "bg-secondary text-secondary-foreground",
};

export function AnaliseIaAtivo({ analise }: AnaliseIaAtivoProps) {
  return (
    <div className="space-y-4">
      {/* Resumo Geral + Veredicto */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BotIcon className={cn(icon.cardTitle, "text-muted-foreground")} />
              <CardTitle>Análise Fortuna</CardTitle>
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

      {/* Fundamentos (se disponivel) */}
      {analise.avaliacaoFundamentalista && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className={cn(icon.cardTitle, "text-muted-foreground")} />
              <CardTitle>Fundamentos</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
              {analise.avaliacaoFundamentalista.precoLucro !== null && (
                <div>
                  <p className="text-muted-foreground text-xs">P/L</p>
                  <p className="text-lg font-semibold">
                    {analise.avaliacaoFundamentalista.precoLucro.toFixed(1)}x
                  </p>
                </div>
              )}
              {analise.avaliacaoFundamentalista.precoValorPatrimonial !== null && (
                <div>
                  <p className="text-muted-foreground text-xs">P/VP</p>
                  <p className="text-lg font-semibold">
                    {analise.avaliacaoFundamentalista.precoValorPatrimonial.toFixed(1)}x
                  </p>
                </div>
              )}
              {analise.avaliacaoFundamentalista.retornoSobrePatrimonio !== null && (
                <div>
                  <p className="text-muted-foreground text-xs">ROE</p>
                  <p className="text-lg font-semibold">
                    {formatSimplePercentage(
                      analise.avaliacaoFundamentalista.retornoSobrePatrimonio,
                    )}
                  </p>
                </div>
              )}
              {analise.avaliacaoFundamentalista.dividendYield !== null && (
                <div>
                  <p className="text-muted-foreground text-xs">Div. Yield</p>
                  <p className="text-lg font-semibold">
                    {formatSimplePercentage(analise.avaliacaoFundamentalista.dividendYield)}
                  </p>
                </div>
              )}
              {analise.avaliacaoFundamentalista.dividaPatrimonio !== null && (
                <div>
                  <p className="text-muted-foreground text-xs">Div/PL</p>
                  <p className="text-lg font-semibold">
                    {analise.avaliacaoFundamentalista.dividaPatrimonio.toFixed(1)}x
                  </p>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              {analise.avaliacaoFundamentalista.resumoAvaliacao}
            </p>
            {analise.avaliacaoFundamentalista.comparacaoSetorial && (
              <p className="text-muted-foreground text-sm">
                {analise.avaliacaoFundamentalista.comparacaoSetorial}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Riscos */}
      {analise.fatoresRisco.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className={cn(icon.cardTitle, "text-muted-foreground")} />
              <CardTitle>Riscos</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analise.fatoresRisco.map((risco, indice) => (
                <div key={indice} className="flex items-start gap-3">
                  <Badge
                    variant="outline"
                    className={`shrink-0 text-xs ${CORES_SEVERIDADE[risco.severidade] ?? ""}`}
                  >
                    {ROTULOS_SEVERIDADE[risco.severidade] ?? risco.severidade}
                  </Badge>
                  <div>
                    <p className="text-sm">{risco.descricao}</p>
                    <p className="text-muted-foreground text-xs">{risco.impactoPotencial}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cenario Macro + Timing + Pontos de Atencao */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Cenario Macro */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className={cn(icon.cardTitle, "text-muted-foreground")} />
              <CardTitle>Cenario Macro</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {analise.cenarioMacroImpacto}
            </p>
          </CardContent>
        </Card>

        {/* Timing (se disponivel) */}
        {analise.avaliacaoTimingUsuario && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className={cn(icon.cardTitle, "text-muted-foreground")} />
                <CardTitle>Timing</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-muted-foreground text-sm">
                {analise.avaliacaoTimingUsuario.resumo}
              </p>
              {analise.avaliacaoTimingUsuario.precoMedioEstimadoCentavos !== null && (
                <p className="text-muted-foreground text-xs">
                  Preco medio estimado:{" "}
                  {formatarMoeda(analise.avaliacaoTimingUsuario.precoMedioEstimadoCentavos)}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pontos de Atencao */}
      {analise.pontosDeAtencao.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className={cn(icon.cardTitle, "text-muted-foreground")} />
              <CardTitle>Pontos de Atencao</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="text-muted-foreground space-y-1 text-sm">
              {analise.pontosDeAtencao.map((ponto, indice) => (
                <li key={indice} className="flex items-start gap-2">
                  <span className="text-warning mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                  {ponto}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
