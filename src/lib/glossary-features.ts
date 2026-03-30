import type { EntradaGlossario } from "@/lib/glossary-dashboard";

// ---------- Risco e Consistência (risk-consistency-card.tsx) ----------

export const GLOSSARY_RISCO_CONSISTENCIA: EntradaGlossario = {
  termo: "Risco e Consistência",
  explicacao:
    "Mostra com que frequência seus investimentos batem o CDI (referência de renda fixa). " +
    "Quanto maior a taxa de acerto, mais consistente é sua carteira. " +
    "Também mostra o melhor e o pior mês da história da carteira.",
};

export const GLOSSARY_VOLATILIDADE: EntradaGlossario = {
  termo: "Volatilidade",
  explicacao:
    "Mede quanto seus investimentos sobem e descem ao longo do tempo. " +
    "Volatilidade alta significa variações grandes (pode ganhar muito ou perder muito). " +
    "Volatilidade baixa significa retornos mais estáveis e previsíveis.",
};

// ---------- Liquidez (liquidity-ladder.tsx) ----------

export const GLOSSARY_LIQUIDEZ: EntradaGlossario = {
  termo: "Escada de Liquidez",
  explicacao:
    "Mostra quanto tempo leva para você resgatar seu dinheiro. " +
    "Investimentos com liquidez de 0-1 dia podem ser resgatados imediatamente. " +
    "É importante ter parte do dinheiro acessível para emergências.",
};

// ---------- Todas as Posições (all-positions-table.tsx) ----------

export const GLOSSARY_TODAS_POSICOES: EntradaGlossario = {
  termo: "Todas as Posições",
  explicacao:
    "Lista completa de todos os seus investimentos, com detalhes de rentabilidade " +
    "no mês, em 12 meses e desde o início. Permite ver o panorama completo da carteira.",
};

export const GLOSSARY_RENTABILIDADE_12M: EntradaGlossario = {
  termo: "Rentabilidade 12 Meses",
  explicacao:
    "Retorno acumulado nos últimos 12 meses (1 ano). " +
    "É uma boa medida para avaliar o desempenho de médio prazo de um investimento.",
};

export const GLOSSARY_RENTABILIDADE_DESDE_INICIO_ATIVO: EntradaGlossario = {
  termo: "Rentabilidade Desde o Início",
  explicacao:
    "Retorno total desde que você comprou aquele investimento. " +
    "Mostra o resultado completo da sua decisão de investir naquele ativo.",
};

// ---------- Rentabilidade por Categoria (category-performance-chart.tsx) ----------

export const GLOSSARY_RENTABILIDADE_POR_CATEGORIA: EntradaGlossario = {
  termo: "Rentabilidade por Categoria",
  explicacao:
    "Compara o desempenho de cada tipo de investimento nos últimos 12 meses. " +
    "Ajuda a entender quais categorias estão gerando mais retorno " +
    "e quais estão ficando atrás do CDI.",
};

// ---------- Movimentações (transactions-table.tsx) ----------

export const GLOSSARY_MOVIMENTACOES: EntradaGlossario = {
  termo: "Movimentações",
  explicacao:
    "Histórico de todas as operações de compra (aplicação), venda (resgate) " +
    "e eventos financeiros do mês. Mostra para onde seu dinheiro foi " +
    "e de onde veio.",
};

// ---------- Evolução da Alocação (allocation-evolution-chart.tsx) ----------

export const GLOSSARY_EVOLUCAO_ALOCACAO: EntradaGlossario = {
  termo: "Evolução da Alocação",
  explicacao:
    "Mostra como a distribuição da sua carteira mudou ao longo dos meses. " +
    "Permite visualizar se você está concentrando mais em um tipo de investimento " +
    "ou diversificando ao longo do tempo.",
};

// ---------- Comparação por Período (period-comparison-detail.tsx) ----------

export const GLOSSARY_COMPARACAO_PERIODOS: EntradaGlossario = {
  termo: "Comparação por Período",
  explicacao:
    "Mostra o retorno da sua carteira em diferentes janelas de tempo " +
    "(3 meses, 6 meses, 12 meses, etc.) comparado ao CDI. " +
    "Ajuda a entender se a carteira melhora ou piora no longo prazo.",
};

// ---------- Tendências de Mercado (trends page) ----------

export const GLOSSARY_IBOVESPA_INDICE: EntradaGlossario = {
  termo: "Ibovespa",
  explicacao:
    "Principal índice da bolsa brasileira (B3). Mede o desempenho médio das ações " +
    "mais negociadas do mercado. Se o Ibovespa subiu, em média as ações subiram.",
};

export const GLOSSARY_SELIC_META: EntradaGlossario = {
  termo: "SELIC Meta",
  explicacao:
    "Taxa básica de juros definida pelo Banco Central a cada 45 dias. " +
    "É a referência para todas as outras taxas de juros no Brasil. " +
    "Quando a SELIC sobe, investimentos de renda fixa rendem mais.",
};

export const GLOSSARY_IPCA_INDICE: EntradaGlossario = {
  termo: "IPCA",
  explicacao:
    "Índice oficial de inflação do Brasil, calculado pelo IBGE. " +
    "Mede o aumento médio dos preços de produtos e serviços. " +
    "Se o IPCA está alto, seu dinheiro está perdendo poder de compra mais rápido.",
};

export const GLOSSARY_CDI_TAXA: EntradaGlossario = {
  termo: "CDI",
  explicacao:
    "Taxa de referência para investimentos de renda fixa. " +
    "Quando dizem que um CDB rende '100% do CDI', ele acompanha essa taxa. " +
    "O CDI anda muito próximo da SELIC.",
};

export const GLOSSARY_IGPM: EntradaGlossario = {
  termo: "IGP-M",
  explicacao:
    "Índice Geral de Preços do Mercado, calculado pela FGV. " +
    "Muito usado para reajuste de aluguéis e contratos. " +
    "Diferente do IPCA, inclui preços no atacado e construção civil.",
};

export const GLOSSARY_DOLAR: EntradaGlossario = {
  termo: "Dólar (PTAX)",
  explicacao:
    "Cotação oficial do dólar americano em reais, calculada pelo Banco Central. " +
    "Quando o dólar sobe, importações ficam mais caras e investimentos " +
    "internacionais valem mais em reais.",
};

export const GLOSSARY_VOLUME_NEGOCIACAO: EntradaGlossario = {
  termo: "Volume de Negociação",
  explicacao:
    "Quantidade de dinheiro movimentada na compra e venda de um ativo no dia. " +
    "Volume alto indica que muita gente está negociando, o que geralmente " +
    "significa maior liquidez e interesse do mercado.",
};

export const GLOSSARY_HEATMAP_SETORES: EntradaGlossario = {
  termo: "Performance por Setor",
  explicacao:
    "Mostra como cada setor da economia está se comportando na bolsa hoje. " +
    "Setores em alta aparecem em verde e em queda aparecem em vermelho. " +
    "Ajuda a identificar quais áreas da economia estão aquecidas.",
};

export const GLOSSARY_MAIORES_ALTAS: EntradaGlossario = {
  termo: "Maiores Altas",
  explicacao:
    "Ações que mais subiram de preço hoje na bolsa. " +
    "Aparecem ordenadas pela variação percentual, da maior para a menor.",
};

export const GLOSSARY_MAIORES_BAIXAS: EntradaGlossario = {
  termo: "Maiores Baixas",
  explicacao:
    "Ações que mais caíram de preço hoje na bolsa. " +
    "Aparecem ordenadas pela variação percentual, da mais negativa para a menos negativa.",
};

export const GLOSSARY_MAIS_NEGOCIADAS: EntradaGlossario = {
  termo: "Mais Negociadas",
  explicacao:
    "Ações com maior volume de negociação hoje. " +
    "São os ativos que mais estão chamando a atenção do mercado.",
};

export const GLOSSARY_FUNDOS_EM_ALTA: EntradaGlossario = {
  termo: "Fundos em Alta",
  explicacao:
    "Fundos imobiliários (FIIs) e ETFs que mais subiram de preço hoje. " +
    "FIIs são fundos que investem em imóveis e distribuem aluguéis aos cotistas.",
};
