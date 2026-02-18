/**
 * Static prompts for the "Ask AI to explain" button on each chart/table card.
 * Keys match the card identifier (used for both prompt routing and chat-highlight).
 * Values are the user message auto-sent to the chat.
 */
export const PROMPTS_EXPLICACAO_CARD: Record<string, string> = {
  // Dashboard
  "patrimonio-total":
    "Explique de forma simples o gráfico de Evolução Patrimonial. O que significa a diferença entre as duas áreas? Meus investimentos estão indo bem?",
  benchmark:
    "Me ajude a entender o gráfico de Carteira vs Benchmarks. O que são CDI, Ibovespa e IPCA? Minha carteira está indo bem comparada a eles?",
  "alocacao-ativos":
    "Explique o gráfico de Alocação por Estratégia. Meu dinheiro está bem distribuído? O que significa diversificação?",
  "evolucao-alocacao":
    "Explique o gráfico de Evolução da Alocação. Como a distribuição dos meus investimentos mudou ao longo do tempo?",
  "rentabilidade-categoria":
    "Explique o gráfico de Rentabilidade por Categoria. Quais tipos de investimento renderam mais? O que isso significa?",
  "retornos-mensais":
    "Explique a tabela de Retornos Mensais. Como devo interpretar as cores e os percentuais? O que é % CDI?",
  "escada-liquidez":
    "Explique o gráfico da Escada de Liquidez. O que é liquidez e por que é importante saber quando posso resgatar meu dinheiro?",
  "top-performers":
    "Explique a tabela dos Melhores e Piores ativos. O que significam rentabilidade e participação? Devo me preocupar com os piores?",
  "ganhos-estrategia":
    "Explique a tabela de Ganhos por Estratégia. O que significam os valores no mês, no ano e desde o início?",
  "eventos-financeiros":
    "Explique os Eventos Financeiros. O que são dividendos, JCP e rendimentos? Esse dinheiro já é meu?",
  "comparacao-periodos":
    "Explique a Comparação por Período. O que significam volatilidade e % CDI? Como devo interpretar esses números?",
  "risco-consistencia":
    "Explique o card de Risco e Consistência. O que significam os indicadores mostrados? Minha carteira é arriscada?",

  // Desempenho
  "evolucao-ativo":
    "Explique o gráfico de Evolução do Saldo deste ativo. O que a linha mostra e como interpretar a tendência?",
  "rendimentos-ativo":
    "Explique o gráfico de Proventos Recebidos deste ativo. O que são proventos e com que frequência recebo?",

  // Trends
  "indicadores-macro":
    "Explique o gráfico de Indicadores Macroeconômicos. O que são Selic, IPCA e IGP-M? Como eles afetam meus investimentos?",
  "heatmap-setores":
    "Explique o mapa de calor por Setor. O que significam as cores e os percentuais? Como os setores afetam minha carteira?",
};
