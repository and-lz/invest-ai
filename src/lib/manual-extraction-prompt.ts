import { toJSONSchema } from "zod/v4";
import { RelatorioExtraidoSchema } from "@/schemas/report-extraction.schema";

// ============================================================
// Prompts compartilhados entre extracao via API e manual.
// Fonte unica de verdade para instrucoes de extracao.
// ============================================================

export const SYSTEM_PROMPT_EXTRACAO = `Você é um especialista em análise de relatórios financeiros de investimentos brasileiros.

Sua tarefa é extrair todos os dados estruturados do relatório consolidado de rentabilidade do Inter Prime.

INSTRUÇÕES:
1. Extraia todos os valores numéricos com precisão. Valores monetários devem ser convertidos para centavos (inteiros). Ex: R$ 415.332,91 = 41533291
2. Percentuais devem ser números decimais. Ex: 14,56% = 14.56
3. Para o campo mesReferencia, identifique o mês/ano de referência do relatório no formato YYYY-MM
4. Extraia todos os ativos listados na posição detalhada, não pule nenhum
5. Para eventos financeiros (dividendos, JCP), extraia cada um individualmente
6. Se um campo não existir no relatório, use null
7. Mantenha a precisão dos nomes de ativos e códigos exatamente como aparecem no relatório
8. Para a evolução de alocação, extraia os dados dos últimos meses mostrados no gráfico
9. Para rentabilidades mensais, extraia a tabela completa com todos os anos e meses disponíveis
10. Categorize as estratégias exatamente como aparecem: Liquidez, Pós-fixado, Inflação, Multimercado, Alternativos, Renda Variável, Global, Fundos Listados, Outros
11. Para movimentações, extraia cada transação individual com data, tipo, ativo e valor
12. Moeda padrão é BRL

Retorne os dados no formato JSON seguindo exatamente o schema fornecido.`;

export const INSTRUCAO_USUARIO_EXTRACAO =
  "Extraia todos os dados estruturados deste relatório consolidado de rentabilidade de investimentos. Retorne apenas o JSON válido, sem texto adicional. Siga o schema com extrema precisão.";

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
