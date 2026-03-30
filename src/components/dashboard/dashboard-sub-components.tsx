"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CollapsibleTrigger } from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Upload, ChevronDown } from "lucide-react";
import { isAiEnabled } from "@/lib/ai-features";
import { abrirChatComPergunta } from "@/components/ui/ai-explain-button";
import { formatarMoeda } from "@/domain/value-objects/money";
import Image from "next/image";
import Link from "next/link";
import type { ComparacaoBenchmarks } from "@/schemas/report-extraction.schema";

export function gerarTextoHeadline(
  variacaoCentavos: number | null,
  benchmarks: ComparacaoBenchmarks[],
): string {
  if (variacaoCentavos === null) {
    return "Confira o resumo dos seus investimentos abaixo.";
  }

  const mensal = benchmarks.find((b) => b.periodo === "No mes");
  const acimaIpca = mensal ? mensal.carteira.valor > mensal.ipca.valor : false;
  const abaixoCdi = mensal ? mensal.carteira.valor < mensal.cdi.valor : false;
  const absValue = formatarMoeda(Math.abs(variacaoCentavos));

  if (variacaoCentavos >= 0 && acimaIpca) {
    return `Seu patrimônio cresceu ${absValue} — acima da inflação.`;
  }
  if (variacaoCentavos >= 0 && abaixoCdi) {
    return `Seu patrimônio cresceu ${absValue}. Ficou abaixo da renda fixa, mas cresceu.`;
  }
  if (variacaoCentavos >= 0) {
    return `Seu patrimônio cresceu ${absValue} este mês.`;
  }
  if (variacaoCentavos > -500_00) {
    return `Seu patrimônio recuou ${absValue} este mês — variações pequenas são normais.`;
  }
  return `Seu patrimônio recuou ${absValue}. Quer entender o que aconteceu?`;
}

export function DashboardHeadline({
  variacaoCentavos,
  benchmarks,
}: {
  variacaoCentavos: number | null;
  benchmarks: ComparacaoBenchmarks[];
}) {
  const texto = gerarTextoHeadline(variacaoCentavos, benchmarks);
  const aiEnabled = isAiEnabled();

  return (
    <Card className="bg-muted/30 border-muted">
      <CardContent className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm">{texto}</p>
        {aiEnabled && (
          <button
            type="button"
            onClick={() =>
              abrirChatComPergunta("Resuma como meus investimentos estão indo este mês.")
            }
            className="text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1.5 text-sm underline transition-colors"
          >
            <Image src="/fortuna-minimal.png" alt="Fortuna" width={16} height={16} className="h-4 w-4" />
            Perguntar à Fortuna
          </button>
        )}
      </CardContent>
    </Card>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
        {children}
      </span>
      <div className="bg-border h-px flex-1" />
    </div>
  );
}

export function CollapsibleSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-3 [&[data-state=open]>svg]:rotate-180">
      <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
        {children}
      </span>
      <div className="bg-border h-px flex-1" />
      <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200" />
    </CollapsibleTrigger>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, indice) => (
          <Skeleton key={indice} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export function EstadoVazio() {
  return (
    <Card className="flex flex-col items-center justify-center p-12">
      <CardContent className="space-y-6 text-center">
        <div>
          <Upload className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">Bem-vindo ao Fortuna!</h3>
          <p className="text-muted-foreground">
            Veja como seus investimentos estão indo:
          </p>
        </div>

        <ul className="text-muted-foreground mx-auto max-w-sm space-y-1 text-left text-sm">
          <li>✓ Patrimônio total e crescimento mensal</li>
          <li>✓ Comparação com inflação e renda fixa</li>
          <li>✓ Análises automáticas em linguagem simples</li>
          {isAiEnabled() && <li>✓ Fortuna AI responde suas dúvidas sobre investimentos</li>}
        </ul>

        <div className="text-muted-foreground text-xs">
          1. Faça upload do seu relatório → 2. Aguarde ~30s → 3. Pronto!
        </div>

        <div className="flex flex-col items-center gap-2">
          <Link href="/reports">
            <Button>Fazer Upload do Relatório</Button>
          </Link>
          {isAiEnabled() && (
            <button
              type="button"
              onClick={() => abrirChatComPergunta("O que é o Fortuna e como ele pode me ajudar?")}
              className="text-muted-foreground hover:text-foreground text-sm underline transition-colors"
            >
              Tem dúvidas? Pergunte à Fortuna
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
