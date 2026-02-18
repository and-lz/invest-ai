/**
 * Sistema de highlighting de elementos da UI mencionados pelo chat.
 *
 * Quando o assistente menciona um elemento especifico da tela (ex: "vejo que seu patrimonio..."),
 * este sistema destaca visualmente o card correspondente com ring + pulse animation.
 */

/**
 * Aplica highlight visual em um elemento identificado por data-attribute.
 *
 * @param seletor - O valor do data-chat-highlight do elemento (ex: "patrimonio-total")
 * @param duracao - Duracao em milissegundos (padrao: 3000ms)
 *
 * @example
 * destacarElemento("patrimonio-total", 3000);
 * // Card com data-chat-highlight="patrimonio-total" pisca com ring azul
 */
export function destacarElemento(seletor: string, duracao: number = 3000): void {
  if (typeof window === "undefined") return;

  const elemento = document.querySelector(`[data-chat-highlight="${seletor}"]`);
  if (!elemento) {
    console.warn(`[Chat Highlight] Elemento nao encontrado: ${seletor}`);
    return;
  }

  elemento.classList.add("chat-highlight-active");
  elemento.scrollIntoView({ behavior: "smooth", block: "center" });

  setTimeout(() => {
    elemento.classList.remove("chat-highlight-active");
  }, duracao);
}

/**
 * Mapa de identificadores disponiveis por pagina.
 * Usado para instruir o LLM sobre quais elementos podem ser destacados.
 */
export const HIGHLIGHT_IDS_BY_PAGE: Record<string, string[]> = {
  dashboard: [
    "patrimonio-total - Evolucao patrimonial",
    "benchmark - Comparacao com benchmarks (CDI, Ibovespa, IPCA)",
    "alocacao-ativos - Alocacao de ativos por classe",
    "top-performers - Melhores e piores ativos do mes",
    "eventos-financeiros - Eventos financeiros (dividendos, rendimentos)",
    "ganhos-estrategia - Ganhos por estrategia de investimento",
  ],
  insights: ["insights-resumo", "insights-detalhes"],
  trends: ["indices-mercado", "setores", "maiores-altas"],
  desempenho: ["desempenho-ativo", "comparacao-benchmarks"],
  reports: ["lista-relatorios"],
  aprender: ["artigos-educacionais"],
};

/**
 * Obtem lista de identificadores disponiveis para uma pagina.
 * Retorna string formatada para instrucao do sistema do LLM.
 */
export function obterIdentificadoresDisponiveis(pagina: string): string {
  const identificadores = HIGHLIGHT_IDS_BY_PAGE[pagina] ?? [];
  return identificadores.length > 0
    ? identificadores.join("\n")
    : "Nenhum elemento disponivel para highlight nesta pagina.";
}
