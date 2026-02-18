const FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function criarPercentual(valor: number) {
  return { valor };
}

export function formatarPercentual(valor: number): string {
  return FORMATTER.format(valor / 100);
}

export function formatSimplePercentage(valor: number): string {
  return `${valor.toFixed(2).replace(".", ",")}%`;
}

export function calculatePercentageChange(valorAnterior: number, valorAtual: number): number {
  if (valorAnterior === 0) return 0;
  return ((valorAtual - valorAnterior) / Math.abs(valorAnterior)) * 100;
}
