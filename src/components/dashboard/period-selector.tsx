"use client";

import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatarMesAno } from "@/lib/format-date";

interface PeriodSelectorProps {
  periodosDisponiveis: string[]; // Array de mesAno no formato "YYYY-MM"
  periodoSelecionado: string; // mesAno selecionado no formato "YYYY-MM"
  onPeriodoChange: (novoPeriodo: string) => void; // Callback ao selecionar novo período
}

/**
 * Componente de seleção de período para o dashboard
 * Permite ao usuário selecionar um mês específico para visualizar os dados
 */
export function PeriodSelector({
  periodosDisponiveis,
  periodoSelecionado,
  onPeriodoChange,
}: PeriodSelectorProps) {
  // Separar períodos normais (YYYY-MM) do especial "consolidado"
  const periodosNormais = periodosDisponiveis.filter((periodo) => periodo !== "consolidado");
  const temConsolidado = periodosDisponiveis.includes("consolidado");

  // Ordenar períodos do mais recente para o mais antigo
  const periodosOrdenados = [...periodosNormais].sort((a, b) => b.localeCompare(a));

  // Determinar se o período selecionado é o mais recente
  const periodoMaisRecente = periodosOrdenados[0];
  const ehPeriodoMaisRecente = periodoSelecionado === periodoMaisRecente;

  // Label do botão
  const labelBotao =
    periodoSelecionado === "consolidado"
      ? "Todos os meses"
      : ehPeriodoMaisRecente
        ? "Último mês"
        : formatarMesAno(periodoSelecionado, "abreviado");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <CalendarIcon className="h-4 w-4" />
          <span>{labelBotao}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Selecionar Período</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={periodoSelecionado} onValueChange={onPeriodoChange}>
          {temConsolidado && (
            <DropdownMenuRadioItem value="consolidado">
              <div className="flex flex-col">
                <span className="font-medium">Todos os meses</span>
                <span className="text-muted-foreground text-xs">Análise consolidada</span>
              </div>
            </DropdownMenuRadioItem>
          )}
          {temConsolidado && <DropdownMenuSeparator />}
          {periodosOrdenados.map((periodo, index) => {
            const ehMaisRecente = index === 0;
            const label = ehMaisRecente
              ? `${formatarMesAno(periodo, "extenso")} (Último)`
              : formatarMesAno(periodo, "extenso");

            return (
              <DropdownMenuRadioItem key={periodo} value={periodo}>
                <div className="flex flex-col">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatarMesAno(periodo, "compacto")}
                  </span>
                </div>
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
