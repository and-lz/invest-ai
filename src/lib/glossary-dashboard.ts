// ============================================================
// Glossary entries for dashboard components.
// ============================================================

export interface EntradaGlossario {
  readonly termo: string;
  readonly explicacao: string;
}

// ---------- Cards de Resumo (summary-cards.tsx) ----------

export const GLOSSARY_PATRIMONIO_TOTAL: EntradaGlossario = {
  termo: "Patrimônio Total",
  explicacao:
    "É a soma de todo o dinheiro que você tem investido neste momento. " +
    "Inclui tudo: ações, fundos, renda fixa e qualquer outro investimento.",
};

export const GLOSSARY_VARIACAO_PATRIMONIAL: EntradaGlossario = {
  termo: "Variação Patrimonial",
  explicacao:
    "Mostra quanto o seu patrimônio subiu ou desceu em relação ao mês anterior. " +
    "Se está verde, seu patrimônio cresceu. Se está vermelho, diminuiu.",
};

export const GLOSSARY_GANHOS_NO_MES: EntradaGlossario = {
  termo: "Ganhos no Mês",
  explicacao:
    "É quanto dinheiro seus investimentos geraram de lucro neste mês, " +
    "sem contar o dinheiro que você aplicou ou resgatou. " +
    "São os rendimentos puros dos seus investimentos.",
};

export const GLOSSARY_RENTABILIDADE_MENSAL: EntradaGlossario = {
  termo: "Rentabilidade Mensal",
  explicacao:
    "É o percentual de retorno dos seus investimentos neste mês. " +
    "Por exemplo, se você tinha R$ 100 e agora tem R$ 101, a rentabilidade foi de 1%.",
};

export const GLOSSARY_RENTABILIDADE_ANUAL: EntradaGlossario = {
  termo: "Rentabilidade Anual",
  explicacao:
    "É o percentual de retorno acumulado dos seus investimentos no ano inteiro. " +
    "Soma todos os ganhos e perdas desde janeiro até o mês atual.",
};

export const GLOSSARY_DESDE_INICIO: EntradaGlossario = {
  termo: "Desde o Início",
  explicacao:
    "É o retorno total desde o primeiro dia que você começou a investir. " +
    "Quanto maior esse número, melhor foi o desempenho ao longo do tempo.",
};

// ---------- Gráfico Evolução Patrimonial (wealth-evolution-chart.tsx) ----------

export const GLOSSARY_EVOLUCAO_PATRIMONIAL: EntradaGlossario = {
  termo: "Evolução Patrimonial",
  explicacao:
    "Este gráfico mostra como o seu dinheiro cresceu ao longo do tempo. " +
    "A área de cima é quanto você tem hoje. A área de baixo é quanto você colocou do bolso. " +
    "A diferença entre as duas é o que seus investimentos geraram para você.",
};

export const GLOSSARY_TOTAL_APORTADO: EntradaGlossario = {
  termo: "Total Aportado",
  explicacao:
    "É o total de dinheiro que saiu do seu bolso para investir. " +
    "Não inclui rendimentos — é só o que você colocou.",
};

export const GLOSSARY_RENDIMENTOS: EntradaGlossario = {
  termo: "Rendimentos",
  explicacao:
    "É o lucro gerado pelos seus investimentos. " +
    "É a diferença entre o que você tem hoje e o que você investiu do próprio bolso. " +
    "Rendimentos positivos significam que seu dinheiro está trabalhando para você.",
};

// ---------- Alocação (asset-allocation-chart.tsx) ----------

export const GLOSSARY_ALOCACAO_POR_ESTRATEGIA: EntradaGlossario = {
  termo: "Alocação por Estratégia",
  explicacao:
    "Mostra como seu dinheiro está dividido entre diferentes tipos de investimento. " +
    "Diversificar (espalhar o dinheiro) é importante para reduzir riscos. " +
    "É como não colocar todos os ovos na mesma cesta.",
};

export const GLOSSARY_ESTRATEGIAS: Record<string, EntradaGlossario> = {
  Liquidez: {
    termo: "Liquidez",
    explicacao:
      "Investimentos que você pode resgatar rapidamente, geralmente no mesmo dia. " +
      "Exemplos: CDB de liquidez diária, Tesouro Selic. São os mais seguros, mas rendem menos.",
  },
  "Fundos Listados": {
    termo: "Fundos Listados",
    explicacao:
      "Fundos de investimento negociados na bolsa, como ETFs e fundos imobiliários (FIIs). " +
      "Você compra e vende como se fossem ações.",
  },
  "Renda Variavel": {
    termo: "Renda Variável",
    explicacao:
      "Investimentos cujo retorno não é previsível, como ações de empresas. " +
      "Podem render muito, mas também podem perder valor. São os mais arriscados.",
  },
  Global: {
    termo: "Global",
    explicacao:
      "Investimentos em mercados internacionais, fora do Brasil. " +
      "Ajudam a proteger seu dinheiro caso a economia brasileira vá mal.",
  },
  Outros: {
    termo: "Outros",
    explicacao: "Investimentos que não se encaixam nas categorias principais.",
  },
  Alternativos: {
    termo: "Alternativos",
    explicacao:
      "Investimentos menos tradicionais, como private equity ou hedge funds. " +
      "Geralmente têm menor liquidez e são para perfis mais arrojados.",
  },
  "Pos-fixado": {
    termo: "Pós-fixado",
    explicacao:
      "Investimentos de renda fixa que rendem de acordo com um índice, geralmente o CDI. " +
      "O retorno só é conhecido no final. Exemplos: CDB pós-fixado, LCI, LCA.",
  },
  Inflacao: {
    termo: "Inflação",
    explicacao:
      "Investimentos que protegem seu dinheiro da inflação, como Tesouro IPCA+. " +
      "Garantem um retorno acima da inflação, preservando o poder de compra.",
  },
  Multimercado: {
    termo: "Multimercado",
    explicacao:
      "Fundos que investem em vários tipos de ativos ao mesmo tempo: ações, renda fixa, moedas, etc. " +
      "O gestor do fundo decide onde alocar para buscar o melhor retorno.",
  },
};

// ---------- Benchmarks (benchmark-comparison-chart.tsx) ----------

export const GLOSSARY_CARTEIRA_VS_BENCHMARKS: EntradaGlossario = {
  termo: "Carteira vs Benchmarks",
  explicacao:
    "Benchmarks são 'réguas' usadas para medir se seus investimentos estão indo bem. " +
    "Aqui comparamos sua carteira com 3 réguas: CDI (renda fixa), Ibovespa (bolsa) e IPCA (inflação). " +
    "Sua meta mínima é superar o IPCA — assim seu dinheiro não perde valor.",
};

export const GLOSSARY_CDI: EntradaGlossario = {
  termo: "CDI",
  explicacao:
    "Certificado de Depósito Interbancário. É a taxa de referência mais usada no Brasil " +
    "para investimentos de renda fixa. Quando dizem que um investimento rende '100% do CDI', " +
    "significa que ele acompanha essa taxa.",
};

export const GLOSSARY_IBOVESPA: EntradaGlossario = {
  termo: "Ibovespa",
  explicacao:
    "É o principal índice da bolsa de valores brasileira (B3). " +
    "Mede o desempenho médio das ações mais negociadas. " +
    "Se sua carteira rendeu mais que o Ibovespa, você superou a média do mercado de ações.",
};

export const GLOSSARY_IPCA: EntradaGlossario = {
  termo: "IPCA",
  explicacao:
    "Índice de Preços ao Consumidor Amplo — é a inflação oficial do Brasil. " +
    "Se seus investimentos rendem menos que o IPCA, você está perdendo poder de compra. " +
    "Seu objetivo mínimo deve ser sempre superar a inflação.",
};

// Re-export table/event glossary entries so existing importers don't break
export {
  GLOSSARY_MELHORES_PERFORMERS,
  GLOSSARY_PIORES_PERFORMERS,
  GLOSSARY_ATIVO,
  GLOSSARY_SALDO,
  GLOSSARY_RENTABILIDADE_MES,
  GLOSSARY_PARTICIPACAO,
  GLOSSARY_GANHOS_POR_ESTRATEGIA,
  GLOSSARY_PERIODO_NO_MES,
  GLOSSARY_PERIODO_NO_ANO,
  GLOSSARY_PERIODO_12_MESES,
  GLOSSARY_PERIODO_DESDE_INICIO,
  GLOSSARY_EVENTO_FINANCEIRO,
  GLOSSARY_TIPOS_EVENTO,
  GLOSSARY_RETORNOS_MENSAIS,
  GLOSSARY_PERCENTUAL_CDI,
} from "./glossary-tables";
