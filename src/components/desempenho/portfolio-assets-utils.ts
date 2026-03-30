export interface AtivoDaCarteira {
  codigoAtivo: string;
  nomeAtivo: string;
  estrategia: string;
  rentabilidade12Meses: number | null;
}

export interface GrupoAtivos {
  id: string;
  label: string;
  emoji: string;
  ativos: AtivoDaCarteira[];
  mediaRentabilidade: number | null;
}

export function calcularMediaRentabilidade(ativos: AtivoDaCarteira[]): number | null {
  const ativosComDados = ativos.filter((ativo) => ativo.rentabilidade12Meses !== null);
  if (ativosComDados.length === 0) return null;

  const soma = ativosComDados.reduce(
    (acumulado, ativo) => acumulado + ativo.rentabilidade12Meses!,
    0,
  );
  return soma / ativosComDados.length;
}

export function agruparAtivosPorPerformance(ativos: AtivoDaCarteira[]): GrupoAtivos[] {
  const excelentes: AtivoDaCarteira[] = [];
  const bons: AtivoDaCarteira[] = [];
  const moderados: AtivoDaCarteira[] = [];
  const negativos: AtivoDaCarteira[] = [];
  const semDados: AtivoDaCarteira[] = [];

  for (const ativo of ativos) {
    if (ativo.rentabilidade12Meses === null) {
      semDados.push(ativo);
    } else if (ativo.rentabilidade12Meses >= 15) {
      excelentes.push(ativo);
    } else if (ativo.rentabilidade12Meses >= 5) {
      bons.push(ativo);
    } else if (ativo.rentabilidade12Meses >= 0) {
      moderados.push(ativo);
    } else {
      negativos.push(ativo);
    }
  }

  const grupos: GrupoAtivos[] = [];

  if (excelentes.length > 0) {
    grupos.push({
      id: "excelentes",
      label: "Excelentes (12m >= +15%)",
      emoji: "🔥",
      ativos: excelentes,
      mediaRentabilidade: calcularMediaRentabilidade(excelentes),
    });
  }
  if (bons.length > 0) {
    grupos.push({
      id: "bons",
      label: "Bons (12m +5% a +15%)",
      emoji: "📈",
      ativos: bons,
      mediaRentabilidade: calcularMediaRentabilidade(bons),
    });
  }
  if (moderados.length > 0) {
    grupos.push({
      id: "moderados",
      label: "Moderados (12m 0% a +5%)",
      emoji: "📊",
      ativos: moderados,
      mediaRentabilidade: calcularMediaRentabilidade(moderados),
    });
  }
  if (negativos.length > 0) {
    grupos.push({
      id: "negativos",
      label: "Negativos (12m < 0%)",
      emoji: "📉",
      ativos: negativos,
      mediaRentabilidade: calcularMediaRentabilidade(negativos),
    });
  }
  if (semDados.length > 0) {
    grupos.push({
      id: "sem-dados",
      label: "Sem Dados (12m)",
      emoji: "❓",
      ativos: semDados,
      mediaRentabilidade: null,
    });
  }

  return grupos;
}
