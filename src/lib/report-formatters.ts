import { formatarMoeda, formatCompactCurrency } from "@/domain/value-objects/money";
import { formatarPercentual } from "@/domain/value-objects/percentage";
import type { Money, Percentual } from "@/schemas/report-extraction.schema";

export const MESES_ABREVIADOS = [
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
] as const;

export function formatarDinheiro(money: Money | null): string {
  if (!money) return "N/D";
  return formatarMoeda(money.valorEmCentavos);
}

export function formatarDinheiroCompacto(money: Money | null): string {
  if (!money) return "N/D";
  return formatCompactCurrency(money.valorEmCentavos);
}

export function formatarPercent(percentual: Percentual | null): string {
  if (!percentual) return "N/D";
  return formatarPercentual(percentual.valor);
}
