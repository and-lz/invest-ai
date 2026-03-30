import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Globe,
  AlertTriangle,
  Eye,
  BarChart3,
} from "lucide-react";
import { formatarMoeda } from "@/domain/value-objects/money";
import { formatSimplePercentage } from "@/domain/value-objects/percentage";
import type { AnaliseAtivoResponse } from "@/schemas/asset-analysis.schema";
import { cn } from "@/lib/utils";
import { icon } from "@/lib/design-system";
import { ROTULOS_SEVERIDADE, CORES_SEVERIDADE } from "./asset-ai-analysis-constants";

interface SectionProps {
  readonly analise: AnaliseAtivoResponse;
}

export function FundamentalsSection({ analise }: SectionProps) {
  if (!analise.avaliacaoFundamentalista) return null;

  return (
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
  );
}

export function RiskFactorsSection({ analise }: SectionProps) {
  if (analise.fatoresRisco.length === 0) return null;

  return (
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
  );
}

export function MacroTimingSection({ analise }: SectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
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
  );
}

export function AttentionPointsSection({ analise }: SectionProps) {
  if (analise.pontosDeAtencao.length === 0) return null;

  return (
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
  );
}
