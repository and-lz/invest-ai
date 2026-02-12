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
  // Ordenar períodos do mais recente para o mais antigo
  const periodosOrdenados = [...periodosDisponiveis].sort((a, b) =>
    b.localeCompare(a)
  );

  // Determinar se o período selecionado é o mais recente
  const periodoMaisRecente = periodosOrdenados[0];
  const ehPeriodoMaisRecente = periodoSelecionado === periodoMaisRecente;

  // Label do botão: mostrar "Último mês" se for o mais recente, senão mostrar o mês formatado
  const labelBotao = ehPeriodoMaisRecente
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
        <DropdownMenuRadioGroup
          value={periodoSelecionado}
          onValueChange={onPeriodoChange}
        >
          {periodosOrdenados.map((periodo, index) => {
            const ehMaisRecente = index === 0;
            const label = ehMaisRecente
              ? `${formatarMesAno(periodo, "extenso")} (Último)`
              : formatarMesAno(periodo, "extenso");

            return (
              <DropdownMenuRadioItem key={periodo} value={periodo}>
                <div className="flex flex-col">
                  <span className="font-medium">{label}</span>
                  <span className="text-xs text-muted-foreground">
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
