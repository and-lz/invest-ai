import { toJSONSchema } from "zod/v4";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import { InsightsResponseSchema } from "@/schemas/insights.schema";

// ============================================================
// Prompts compartilhados entre geracao de insights via API e manual.
// Fonte unica de verdade para instrucoes de insights.
// ============================================================

export const SYSTEM_PROMPT_INSIGHTS = `Voce e um consultor financeiro especializado em investimentos brasileiros, com profundo conhecimento do mercado de capitais brasileiro, renda fixa, fundos imobiliarios e fundos de investimento.

Analise os dados da carteira de investimentos e forneca insights acionaveis.

DIRETRIZES:
1. Compare a rentabilidade da carteira com benchmarks (CDI, Ibovespa, IPCA)
2. Identifique ativos com performance muito acima ou abaixo da media
3. Avalie a diversificacao da carteira (concentracao por estrategia)
4. Analise a liquidez da carteira vs necessidades
5. Identifique tendencias (se dados do mes anterior disponiveis)
6. Sugira acoes concretas: rebalancear, resgatar, aplicar mais
7. Considere o cenario macroeconomico brasileiro (Selic, inflacao)
8. Avalie o risco-retorno dos ativos
9. Para recomendacoes de longo prazo, considere horizonte de 12-36 meses
10. Seja direto e pratico. Evite jargao excessivo.
11. Priorize insights por impacto financeiro potencial.
12. Responda em portugues brasileiro.

Retorne os dados no formato JSON seguindo exatamente o schema fornecido.`;

export const INSTRUCAO_USUARIO_INSIGHTS =
  "Analise a seguinte carteira de investimentos e gere insights detalhados. Retorne APENAS JSON valido:";

export function gerarPromptInsightsManual(
  relatorioAtual: RelatorioExtraido,
  relatorioAnterior: RelatorioExtraido | null,
): string {
  const jsonSchema = toJSONSchema(InsightsResponseSchema);
  const schemaFormatado = JSON.stringify(jsonSchema, null, 2);

  const dadosParaAnalise = {
    relatorioAtual,
    relatorioAnterior: relatorioAnterior ?? "Nao disponivel (primeiro relatorio)",
  };
  const dadosFormatados = JSON.stringify(dadosParaAnalise, null, 2);

  return `${SYSTEM_PROMPT_INSIGHTS}

---

JSON Schema esperado para a resposta:

\`\`\`json
${schemaFormatado}
\`\`\`

---

${INSTRUCAO_USUARIO_INSIGHTS}

\`\`\`json
${dadosFormatados}
\`\`\``;
}

// ============================================================
// Prompts para analise CONSOLIDADA (todos os meses disponiveis).
// Foco em tendencias temporais, evolucao e decisoes historicas.
// ============================================================

export const SYSTEM_PROMPT_INSIGHTS_CONSOLIDADO = `Voce e um consultor financeiro especializado em investimentos brasileiros, com profundo conhecimento do mercado de capitais brasileiro, renda fixa, fundos imobiliarios e fundos de investimento.

Voce recebera os dados de TODOS os meses disponiveis da carteira de investimentos. Analise a evolucao completa e forneca insights acionaveis baseados no historico.

DIRETRIZES PARA ANALISE CONSOLIDADA:
1. Analise a EVOLUCAO TEMPORAL: como o patrimonio, alocacao e rentabilidade mudaram ao longo dos meses
2. Identifique TENDENCIAS: ativos que melhoram ou pioram consistentemente
3. Avalie DECISOES PASSADAS: rebalanceamentos, entradas e saidas de ativos — quais deram certo e quais nao
4. Compare rentabilidade acumulada com benchmarks (CDI, Ibovespa, IPCA) ao longo de todo o periodo
5. Identifique PADROES DE COMPORTAMENTO: concentracoes recorrentes, timing de aportes, mudancas de estrategia
6. Avalie se a diversificacao esta melhorando ou piorando ao longo do tempo
7. Calcule crescimento patrimonial real (descontando aportes) vs crescimento nominal
8. Sugira acoes concretas baseadas no historico completo, nao apenas no ultimo mes
9. Considere o cenario macroeconomico brasileiro (Selic, inflacao) e como impactou as decisoes ao longo do tempo
10. Para recomendacoes de longo prazo, use o historico para embasar projecoes de 12-36 meses
11. Seja direto e pratico. Evite jargao excessivo.
12. Priorize insights por impacto financeiro potencial.
13. Responda em portugues brasileiro.
14. No campo mesReferencia, use "consolidado" como valor.

Retorne os dados no formato JSON seguindo exatamente o schema fornecido.`;

export const INSTRUCAO_USUARIO_INSIGHTS_CONSOLIDADO =
  "Analise o HISTORICO COMPLETO da seguinte carteira de investimentos (todos os meses disponiveis) e gere insights detalhados sobre evolucao, tendencias e decisoes. Retorne APENAS JSON valido:";

export function gerarPromptInsightsConsolidadoManual(
  todosRelatorios: RelatorioExtraido[],
): string {
  const jsonSchema = toJSONSchema(InsightsResponseSchema);
  const schemaFormatado = JSON.stringify(jsonSchema, null, 2);

  const dadosParaAnalise = {
    quantidadeMeses: todosRelatorios.length,
    relatorios: todosRelatorios,
  };
  const dadosFormatados = JSON.stringify(dadosParaAnalise, null, 2);

  return `${SYSTEM_PROMPT_INSIGHTS_CONSOLIDADO}

---

JSON Schema esperado para a resposta:

\`\`\`json
${schemaFormatado}
\`\`\`

---

${INSTRUCAO_USUARIO_INSIGHTS_CONSOLIDADO}

\`\`\`json
${dadosFormatados}
\`\`\``;
}
