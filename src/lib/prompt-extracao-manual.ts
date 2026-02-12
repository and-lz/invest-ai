import { toJSONSchema } from "zod/v4";
import { RelatorioExtraidoSchema } from "@/schemas/report-extraction.schema";

// ============================================================
// Prompts compartilhados entre extracao via API e manual.
// Fonte unica de verdade para instrucoes de extracao.
// ============================================================

export const SYSTEM_PROMPT_EXTRACAO = `Voce e um especialista em analise de relatorios financeiros de investimentos brasileiros.

Sua tarefa e extrair TODOS os dados estruturados do relatorio consolidado de rentabilidade do Inter Prime.

INSTRUCOES IMPORTANTES:
1. Extraia TODOS os valores numericos com precisao. Valores monetarios devem ser convertidos para centavos (inteiros). Ex: R$ 415.332,91 = 41533291
2. Percentuais devem ser numeros decimais. Ex: 14,56% = 14.56
3. Para o campo mesReferencia, identifique o mes/ano de referencia do relatorio no formato YYYY-MM
4. Extraia TODOS os ativos listados na posicao detalhada, nao pule nenhum
5. Para eventos financeiros (dividendos, JCP), extraia cada um individualmente
6. Se um campo nao existir no relatorio, use null
7. Mantenha a precisao dos nomes de ativos e codigos exatamente como aparecem no relatorio
8. Para a evolucao de alocacao, extraia os dados dos ultimos meses mostrados no grafico
9. Para rentabilidades mensais, extraia a tabela completa com todos os anos e meses disponiveis
10. Categorize as estrategias exatamente como aparecem: Liquidez, Pos-fixado, Inflacao, Multimercado, Alternativos, Renda Variavel, Global, Fundos Listados, Outros
11. Para movimentacoes, extraia cada transacao individual com data, tipo, ativo e valor
12. Moeda padrao e BRL

Retorne os dados no formato JSON seguindo exatamente o schema fornecido.`;

export const INSTRUCAO_USUARIO_EXTRACAO =
  "Extraia todos os dados estruturados deste relatorio consolidado de rentabilidade de investimentos. Retorne APENAS o JSON valido, sem texto adicional. Siga o schema com extrema precisao.";

export function gerarPromptCompletoParaExtracaoManual(): string {
  const jsonSchema = toJSONSchema(RelatorioExtraidoSchema);
  const schemaFormatado = JSON.stringify(jsonSchema, null, 2);

  return `${SYSTEM_PROMPT_EXTRACAO}

---

JSON Schema esperado para a resposta:

\`\`\`json
${schemaFormatado}
\`\`\`

---

${INSTRUCAO_USUARIO_EXTRACAO}`;
}
