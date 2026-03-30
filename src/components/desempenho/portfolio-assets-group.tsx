"use client";

import { TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  typography,
  icon,
  valueColor,
  trendIconColor,
} from "@/lib/design-system";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import type { GrupoAtivos } from "./portfolio-assets-utils";

interface PortfolioAssetsGroupProps {
  readonly grupo: GrupoAtivos;
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly tickerSelecionado: string | null;
  readonly onSelecionarAtivo: (ticker: string) => void;
}

export function PortfolioAssetsGroup({
  grupo,
  isOpen,
  onToggle,
  tickerSelecionado,
  onSelecionarAtivo,
}: PortfolioAssetsGroupProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card>
        <CardContent className="p-4">
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 [&[data-state=open]>svg]:rotate-180">
            <div className="flex flex-1 items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">{grupo.emoji}</span>
                <span className="text-sm font-semibold">{grupo.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={typography.helper}>
                  {grupo.ativos.length} {grupo.ativos.length === 1 ? "ativo" : "ativos"}
                </span>
                {grupo.mediaRentabilidade !== null && (
                  <Badge
                    variant={grupo.mediaRentabilidade >= 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    Media: {grupo.mediaRentabilidade > 0 ? "+" : ""}
                    {grupo.mediaRentabilidade.toFixed(1)}%
                  </Badge>
                )}
              </div>
            </div>
            <ChevronDown className={cn(icon.button, "shrink-0 transition-transform duration-200")} />
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
                      estaAtivo && "border-primary ring-primary/20 ring-1",
                    )}
                    onClick={() => onSelecionarAtivo(ativo.codigoAtivo)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-semibold">
                            {ativo.codigoAtivo}
                          </h4>
                          {ativoTemTicker && (
                            <p className={cn(typography.helper, "truncate")}>
                              {ativo.nomeAtivo}
                            </p>
                          )}
                          <p className={cn(typography.helper, "mt-1")}>
                            {ativo.estrategia}
                          </p>
                        </div>
                        {ativo.rentabilidade12Meses !== null && (
                          <div className="flex flex-col items-end gap-1">
                            {ativo.rentabilidade12Meses > 0 ? (
                              <TrendingUp className={cn(icon.button, trendIconColor(ativo.rentabilidade12Meses))} />
                            ) : ativo.rentabilidade12Meses < 0 ? (
                              <TrendingDown className={cn(icon.button, trendIconColor(ativo.rentabilidade12Meses))} />
                            ) : (
                              <Minus className={cn(icon.button, trendIconColor(null))} />
                            )}
                            <span
                              className={cn(
                                "text-xs font-semibold",
                                valueColor(ativo.rentabilidade12Meses),
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
  );
}
