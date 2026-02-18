const FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function criarMoney(valorEmCentavos: number, moeda = "BRL") {
  return { valorEmCentavos, moeda };
}

export function formatarMoeda(valorEmCentavos: number): string {
  return FORMATTER.format(valorEmCentavos / 100);
}

export function formatCompactCurrency(valorEmCentavos: number): string {
  const valorAbsoluto = Math.abs(valorEmCentavos / 100);
  const sinal = valorEmCentavos < 0 ? "-" : "";

  if (valorAbsoluto >= 1_000_000) {
    return `${sinal}R$ ${(valorAbsoluto / 1_000_000).toFixed(1)}M`;
  }
  if (valorAbsoluto >= 1_000) {
    return `${sinal}R$ ${(valorAbsoluto / 1_000).toFixed(1)}k`;
  }
  return formatarMoeda(valorEmCentavos);
}

export function somarMoney(valorACentavos: number, valorBCentavos: number): number {
  return valorACentavos + valorBCentavos;
}

export function subtrairMoney(valorACentavos: number, valorBCentavos: number): number {
  return valorACentavos - valorBCentavos;
}

export function centavosParaReais(valorEmCentavos: number): number {
  return valorEmCentavos / 100;
}

export function reaisParaCentavos(valorEmReais: number): number {
  return Math.round(valorEmReais * 100);
}
