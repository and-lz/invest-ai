"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { icon, typography } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export function ApiKeyInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className={cn(icon.cardTitle, "text-primary")} />
          Recursos que usam a API Gemini
        </CardTitle>
        <CardDescription>
          Esses recursos precisam de uma chave de API Gemini válida para funcionar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className={cn(typography.label, "font-semibold mb-1")}>Extração de Relatórios PDF</h4>
            <p className={cn(typography.body, "text-muted-foreground")}>
              Extrai automaticamente os dados dos seus relatórios de investimento em PDF pela Fortuna
            </p>
          </div>

          <div className="h-px bg-border" />

          <div>
            <h4 className={cn(typography.label, "font-semibold mb-1")}>Geração de Insights</h4>
            <p className={cn(typography.body, "text-muted-foreground")}>
              Gera insights mensais e análise de desempenho da sua carteira de investimentos
            </p>
          </div>

          <div className="h-px bg-border" />

          <div>
            <h4 className={cn(typography.label, "font-semibold mb-1")}>Análise de Ativos</h4>
            <p className={cn(typography.body, "text-muted-foreground")}>
              Análise detalhada dos seus investimentos e tendências de mercado
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
