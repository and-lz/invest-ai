/**
 * Static prompts for the "Ask AI to explain" button on each chart/table card.
 * Keys match the card identifier (used for both prompt routing and chat-highlight).
 * Values are the user message auto-sent to the chat.
 *
 * Focus: analyze the user's ACTUAL RESULTS, not explain what the chart is.
 */
export const PROMPTS_EXPLICACAO_CARD: Record<string, string> = {
  // Dashboard
  "patrimonio-total":
    "Analise minha evolução patrimonial. Meu patrimônio está crescendo bem? Como estão meus rendimentos em relação ao que eu aportei?",
  benchmark:
    "Analise meus resultados comparados aos benchmarks. Estou superando o CDI, Ibovespa e IPCA? O que isso diz sobre minha carteira?",
  "alocacao-ativos":
    "Analise a distribuição atual da minha carteira por estratégia. Meu dinheiro está bem diversificado ou concentrado demais em algo?",
  "evolucao-alocacao":
    "Analise como a distribuição da minha carteira mudou ao longo do tempo. Alguma estratégia cresceu ou encolheu de forma relevante?",
  "rentabilidade-categoria":
    "Analise a rentabilidade das minhas categorias de investimento. Quais renderam mais e quais ficaram abaixo do esperado?",
  "retornos-mensais":
    "Analise meus retornos mensais. Em quais meses fui melhor e pior? Estou sendo consistente ao longo do tempo?",
  "escada-liquidez":
    "Analise minha liquidez. Tenho dinheiro suficiente disponível para emergências ou está tudo preso em investimentos de longo prazo?",
  "top-performers":
    "Analise meus melhores e piores ativos. Quais se destacaram positivamente e quais merecem atenção? Devo me preocupar?",
  "ganhos-estrategia":
    "Analise os ganhos das minhas estratégias. Quais estão performando melhor no mês, no ano e desde o início?",
  "eventos-financeiros":
    "Analise meus eventos financeiros recentes. Estou recebendo bons dividendos e proventos? Como está minha renda passiva?",
  "comparacao-periodos":
    "Analise meu desempenho em diferentes períodos. Estou batendo o CDI consistentemente? Minha volatilidade está aceitável?",
  "risco-consistencia":
    "Analise meu perfil de risco e consistência. Minha carteira está arriscada demais? Com que frequência supero o CDI?",

  // Desempenho
  "evolucao-ativo":
    "Analise a evolução do saldo deste ativo. A tendência é de alta ou queda? Como ele se comportou nos últimos meses?",
  "rendimentos-ativo":
    "Analise os proventos que recebi deste ativo. A frequência e os valores estão bons? A tendência é de aumento ou queda?",

  // Trends
  "indicadores-macro":
    "Analise os indicadores macroeconômicos atuais. Como Selic, IPCA e IGP-M estão se comportando e o que isso pode significar para meus investimentos?",
  "heatmap-setores":
    "Analise o desempenho dos setores do mercado. Quais setores estão indo bem e quais estão em queda? Algum impacta minha carteira?",
};
