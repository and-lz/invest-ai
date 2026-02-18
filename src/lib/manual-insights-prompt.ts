import { toJSONSchema } from "zod/v4";
import type { RelatorioExtraido } from "@/schemas/report-extraction.schema";
import { InsightsResponseSchema } from "@/schemas/insights.schema";
import {
  serializarRelatorioMarkdown,
  serializarRelatoriosConsolidadoMarkdown,
} from "@/lib/serialize-report-markdown";

// ============================================================
// Prompts compartilhados entre geracao de insights via API e manual.
// Fonte unica de verdade para instrucoes de insights.
// ============================================================

// ---- Constante de exemplo de saida ----

const EXEMPLO_SAIDA_INSIGHTS = `EXEMPLO MINIMO DE RESPOSTA VALIDA:

\`\`\`json
{
  "mesReferencia": "2026-01",
  "dataGeracao": "YYYY-MM-DD (data atual)",
  "resumoExecutivo": "Carteira de R$ 445.700 apresentou rentabilidade de 3,14% no mes, superando CDI (1,16%). Diversificacao adequada entre renda fixa e variavel.",
  "insights": [
    {
      "titulo": "Rentabilidade acima do CDI no mes",
      "descricao": "A carteira rendeu 3,14% contra 1,16% do CDI, impulsionada por fundos de acoes.",
      "categoria": "performance_positiva",
      "prioridade": "alta",
      "ativosRelacionados": ["FUNDO ABC FIC FIA"],
      "acaoSugerida": "Manter alocacao atual em fundos de acoes.",
      "impactoEstimado": "Potencial de ganho adicional de R$ 12.000 em 12 meses.",
      "concluida": false,
      "statusAcao": "pendente"
    },
    {
      "titulo": "Ativo com performance negativa persistente",
      "descricao": "Fundo XYZ caiu -5,24% em 12 meses.",
      "categoria": "performance_negativa",
      "prioridade": "media",
      "ativosRelacionados": ["FUNDO XYZ FIA BDR"],
      "acaoSugerida": null,
      "impactoEstimado": null,
      "concluida": false,
      "statusAcao": "pendente"
    }
  ],
  "alertas": [
    {
      "tipo": "atencao",
      "mensagem": "Concentracao de 33% em FIIs com rendimento abaixo do CDI."
    },
    {
      "tipo": "informativo",
      "mensagem": "Rentabilidade mensal foi a melhor dos ultimos 6 meses."
    }
  ],
  "recomendacoesLongoPrazo": [
    "Aumentar gradualmente exposicao a renda variavel para 30-35% nos proximos 12 meses.",
    "Reduzir posicoes em FIIs enquanto Selic permanecer acima de 10%."
  ]
}
\`\`\`

VALORES VALIDOS PARA ENUMS:
- "categoria": "performance_positiva" | "performance_negativa" | "acao_recomendada" | "risco" | "oportunidade" | "diversificacao" | "custos"
- "prioridade": "alta" | "media" | "baixa"
- "tipo" (alertas): "urgente" | "atencao" | "informativo"
- "acaoSugerida" e "impactoEstimado" podem ser null quando nao aplicavel
- "concluida" DEVE ser false e "statusAcao" DEVE ser "pendente" para TODOS os insights
- "ativosRelacionados" pode ser array vazio [] quando o insight e sobre a carteira em geral`;

// ---- System prompts ----

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
13. IMPORTANTE: Os campos "concluida" e "statusAcao" sao de controle do usuario. SEMPRE retorne concluida=false e statusAcao="pendente" para TODOS os insights.

Os dados da carteira estao em markdown com valores monetarios em BRL e percentuais ja formatados.

Retorne os dados no formato JSON seguindo exatamente o schema fornecido.`;

export const INSTRUCAO_USUARIO_INSIGHTS =
  "Analise a seguinte carteira de investimentos e gere insights detalhados. Retorne APENAS JSON valido:";

export function gerarPromptInsightsManual(
  relatorioAtual: RelatorioExtraido,
  relatorioAnterior: RelatorioExtraido | null,
): string {
  const jsonSchema = toJSONSchema(InsightsResponseSchema);
  const schemaFormatado = JSON.stringify(jsonSchema, null, 2);

  const dadosAtualMarkdown = serializarRelatorioMarkdown(relatorioAtual);
  const dadosAnteriorMarkdown = relatorioAnterior
    ? serializarRelatorioMarkdown(relatorioAnterior)
    : "Nao disponivel (primeiro relatorio)";

  return `${SYSTEM_PROMPT_INSIGHTS}

---

JSON Schema esperado para a resposta:

\`\`\`json
${schemaFormatado}
\`\`\`

---

${EXEMPLO_SAIDA_INSIGHTS}

---

${INSTRUCAO_USUARIO_INSIGHTS}

## Relatorio Atual:

${dadosAtualMarkdown}

## Relatorio Anterior:

${dadosAnteriorMarkdown}`;
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
15. IMPORTANTE: Os campos "concluida" e "statusAcao" sao de controle do usuario. SEMPRE retorne concluida=false e statusAcao="pendente" para TODOS os insights.

Os dados da carteira estao em markdown com valores monetarios em BRL e percentuais ja formatados.

Retorne os dados no formato JSON seguindo exatamente o schema fornecido.`;

export const INSTRUCAO_USUARIO_INSIGHTS_CONSOLIDADO =
  "Analise o HISTORICO COMPLETO da seguinte carteira de investimentos (todos os meses disponiveis) e gere insights detalhados sobre evolucao, tendencias e decisoes. Retorne APENAS JSON valido:";

export function gerarPromptInsightsConsolidadoManual(todosRelatorios: RelatorioExtraido[]): string {
  const jsonSchema = toJSONSchema(InsightsResponseSchema);
  const schemaFormatado = JSON.stringify(jsonSchema, null, 2);

  const dadosMarkdown = serializarRelatoriosConsolidadoMarkdown(todosRelatorios);

  return `${SYSTEM_PROMPT_INSIGHTS_CONSOLIDADO}

---

JSON Schema esperado para a resposta:

\`\`\`json
${schemaFormatado}
\`\`\`

---

${EXEMPLO_SAIDA_INSIGHTS}

---

${INSTRUCAO_USUARIO_INSIGHTS_CONSOLIDADO}

${dadosMarkdown}`;
}
