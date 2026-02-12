// ============================================================
// Glossário de termos financeiros para tooltips educacionais.
// Todas as explicações assumem que o usuário não tem nenhum
// conhecimento prévio sobre investimentos.
// ============================================================

export interface EntradaGlossario {
  readonly termo: string;
  readonly explicacao: string;
}

// ---------- Cards de Resumo (summary-cards.tsx) ----------

export const GLOSSARIO_PATRIMONIO_TOTAL: EntradaGlossario = {
  termo: "Patrimônio Total",
  explicacao:
    "É a soma de todo o dinheiro que você tem investido neste momento. " +
    "Inclui tudo: ações, fundos, renda fixa e qualquer outro investimento.",
};

export const GLOSSARIO_VARIACAO_PATRIMONIAL: EntradaGlossario = {
  termo: "Variação Patrimonial",
  explicacao:
    "Mostra quanto o seu patrimônio subiu ou desceu em relação ao mês anterior. " +
    "Se está verde, seu patrimônio cresceu. Se está vermelho, diminuiu.",
};

export const GLOSSARIO_GANHOS_NO_MES: EntradaGlossario = {
  termo: "Ganhos no Mês",
  explicacao:
    "É quanto dinheiro seus investimentos geraram de lucro neste mês, " +
    "sem contar o dinheiro que você aplicou ou resgatou. " +
    "São os rendimentos puros dos seus investimentos.",
};

export const GLOSSARIO_RENTABILIDADE_MENSAL: EntradaGlossario = {
  termo: "Rentabilidade Mensal",
  explicacao:
    "É o percentual de retorno dos seus investimentos neste mês. " +
    "Por exemplo, se você tinha R$ 100 e agora tem R$ 101, a rentabilidade foi de 1%.",
};

export const GLOSSARIO_RENTABILIDADE_ANUAL: EntradaGlossario = {
  termo: "Rentabilidade Anual",
  explicacao:
    "É o percentual de retorno acumulado dos seus investimentos no ano inteiro. " +
    "Soma todos os ganhos e perdas desde janeiro até o mês atual.",
};

export const GLOSSARIO_DESDE_INICIO: EntradaGlossario = {
  termo: "Desde o Início",
  explicacao:
    "É o retorno total desde o primeiro dia que você começou a investir. " +
    "Quanto maior esse número, melhor foi o desempenho ao longo do tempo.",
};

// ---------- Gráfico Evolução Patrimonial (wealth-evolution-chart.tsx) ----------

export const GLOSSARIO_EVOLUCAO_PATRIMONIAL: EntradaGlossario = {
  termo: "Evolução Patrimonial",
  explicacao:
    "Este gráfico mostra como o seu dinheiro cresceu ao longo do tempo. " +
    "A área de cima é quanto você tem hoje. A área de baixo é quanto você colocou do bolso. " +
    "A diferença entre as duas é o que seus investimentos geraram para você.",
};

export const GLOSSARIO_TOTAL_APORTADO: EntradaGlossario = {
  termo: "Total Aportado",
  explicacao:
    "É o total de dinheiro que saiu do seu bolso para investir. " +
    "Não inclui rendimentos — é só o que você colocou.",
};

export const GLOSSARIO_RENDIMENTOS: EntradaGlossario = {
  termo: "Rendimentos",
  explicacao:
    "É o lucro gerado pelos seus investimentos. " +
    "É a diferença entre o que você tem hoje e o que você investiu do próprio bolso. " +
    "Rendimentos positivos significam que seu dinheiro está trabalhando para você.",
};

// ---------- Alocação (asset-allocation-chart.tsx) ----------

export const GLOSSARIO_ALOCACAO_POR_ESTRATEGIA: EntradaGlossario = {
  termo: "Alocação por Estratégia",
  explicacao:
    "Mostra como seu dinheiro está dividido entre diferentes tipos de investimento. " +
    "Diversificar (espalhar o dinheiro) é importante para reduzir riscos. " +
    "É como não colocar todos os ovos na mesma cesta.",
};

export const GLOSSARIO_ESTRATEGIAS: Record<string, EntradaGlossario> = {
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

export const GLOSSARIO_CARTEIRA_VS_BENCHMARKS: EntradaGlossario = {
  termo: "Carteira vs Benchmarks",
  explicacao:
    "Benchmarks são 'réguas' usadas para medir se seus investimentos estão indo bem. " +
    "Aqui comparamos sua carteira com 3 réguas: CDI (renda fixa), Ibovespa (bolsa) e IPCA (inflação). " +
    "Sua meta mínima é superar o IPCA — assim seu dinheiro não perde valor.",
};

export const GLOSSARIO_CDI: EntradaGlossario = {
  termo: "CDI",
  explicacao:
    "Certificado de Depósito Interbancário. É a taxa de referência mais usada no Brasil " +
    "para investimentos de renda fixa. Quando dizem que um investimento rende '100% do CDI', " +
    "significa que ele acompanha essa taxa.",
};

export const GLOSSARIO_IBOVESPA: EntradaGlossario = {
  termo: "Ibovespa",
  explicacao:
    "É o principal índice da bolsa de valores brasileira (B3). " +
    "Mede o desempenho médio das ações mais negociadas. " +
    "Se sua carteira rendeu mais que o Ibovespa, você superou a média do mercado de ações.",
};

export const GLOSSARIO_IPCA: EntradaGlossario = {
  termo: "IPCA",
  explicacao:
    "Índice de Preços ao Consumidor Amplo — é a inflação oficial do Brasil. " +
    "Se seus investimentos rendem menos que o IPCA, você está perdendo poder de compra. " +
    "Seu objetivo mínimo deve ser sempre superar a inflação.",
};

// ---------- Tabela Top Performers (top-performers-table.tsx) ----------

export const GLOSSARIO_MELHORES_PERFORMERS: EntradaGlossario = {
  termo: "Melhores do Mês",
  explicacao:
    "Os 5 investimentos que mais renderam neste mês. " +
    "São os seus campeões de rentabilidade no período.",
};

export const GLOSSARIO_PIORES_PERFORMERS: EntradaGlossario = {
  termo: "Piores do Mês",
  explicacao:
    "Os 5 investimentos que menos renderam (ou que tiveram prejuízo) neste mês. " +
    "Fique de olho neles, mas lembre-se: perdas no curto prazo são normais.",
};

export const GLOSSARIO_ATIVO: EntradaGlossario = {
  termo: "Ativo",
  explicacao:
    "É qualquer investimento individual que você possui. " +
    "Pode ser uma ação, um fundo, um título de renda fixa, etc.",
};

export const GLOSSARIO_SALDO: EntradaGlossario = {
  termo: "Saldo",
  explicacao:
    "É quanto dinheiro você tem investido naquele ativo específico neste momento.",
};

export const GLOSSARIO_RENTABILIDADE_MES: EntradaGlossario = {
  termo: "Rentabilidade do Mês",
  explicacao:
    "É o percentual de ganho ou perda daquele ativo neste mês. " +
    "Verde significa lucro, vermelho significa prejuízo.",
};

export const GLOSSARIO_PARTICIPACAO: EntradaGlossario = {
  termo: "Participação na Carteira",
  explicacao:
    "É o peso daquele ativo na sua carteira total. " +
    "Por exemplo, se um ativo tem 10% de participação, ele representa 10% de todo o seu patrimônio.",
};

// ---------- Ganhos por Estratégia (strategy-gains-table.tsx) ----------

export const GLOSSARIO_GANHOS_POR_ESTRATEGIA: EntradaGlossario = {
  termo: "Ganhos por Estratégia",
  explicacao:
    "Mostra quanto cada tipo de investimento gerou de lucro ou prejuízo em diferentes períodos. " +
    "Ajuda a entender quais estratégias estão funcionando melhor para você.",
};

export const GLOSSARIO_PERIODO_NO_MES: EntradaGlossario = {
  termo: "No Mês",
  explicacao: "Ganhos ou perdas apenas no mês atual.",
};

export const GLOSSARIO_PERIODO_NO_ANO: EntradaGlossario = {
  termo: "No Ano",
  explicacao: "Ganhos ou perdas acumulados desde janeiro deste ano.",
};

export const GLOSSARIO_PERIODO_12_MESES: EntradaGlossario = {
  termo: "12 Meses",
  explicacao: "Ganhos ou perdas nos últimos 12 meses (1 ano completo).",
};

export const GLOSSARIO_PERIODO_DESDE_INICIO: EntradaGlossario = {
  termo: "Desde Início",
  explicacao: "Ganhos ou perdas totais desde que você começou a investir.",
};

// ---------- Eventos Financeiros (financial-events-list.tsx) ----------

export const GLOSSARIO_EVENTO_FINANCEIRO: EntradaGlossario = {
  termo: "Eventos Financeiros",
  explicacao:
    "São pagamentos que seus investimentos geram automaticamente para você. " +
    "É como receber um 'salário' dos seus investimentos, sem precisar vender nada.",
};

export const GLOSSARIO_TIPOS_EVENTO: Record<string, EntradaGlossario> = {
  Dividendo: {
    termo: "Dividendo",
    explicacao:
      "Parte do lucro de uma empresa que é distribuída aos acionistas. " +
      "Se você tem ações de uma empresa lucrativa, recebe dividendos periodicamente.",
  },
  JCP: {
    termo: "JCP (Juros sobre Capital Próprio)",
    explicacao:
      "Similar ao dividendo, mas com tratamento fiscal diferente. " +
      "É outra forma das empresas distribuírem lucro aos acionistas. " +
      "Tem desconto de imposto de renda na fonte.",
  },
  Rendimento: {
    termo: "Rendimento",
    explicacao:
      "Ganho gerado por um investimento de renda fixa, como juros de um CDB ou título público.",
  },
  Amortizacao: {
    termo: "Amortização",
    explicacao:
      "Devolução parcial do valor que você investiu. " +
      "Não é lucro — é o próprio dinheiro investido voltando para você aos poucos.",
  },
  Aluguel: {
    termo: "Aluguel",
    explicacao:
      "Renda recebida de fundos imobiliários (FIIs). " +
      "Os FIIs compram imóveis e distribuem o aluguel recebido aos cotistas.",
  },
  Outro: {
    termo: "Outro",
    explicacao: "Outros tipos de eventos financeiros não classificados nas categorias anteriores.",
  },
};
