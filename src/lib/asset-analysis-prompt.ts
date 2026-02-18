import { toJSONSchema } from "zod/v4";
import { AnaliseAtivoResponseSchema } from "@/schemas/asset-analysis.schema";
import type { DadosAtivoParaPrompt } from "@/lib/serialize-asset-data-markdown";
import { serializarDadosAtivoMarkdown } from "@/lib/serialize-asset-data-markdown";

// ============================================================
// Prompts para analise de desempenho de ativo individual via IA.
// Fonte unica de verdade para instrucoes de analise de ativo.
// ============================================================

export const SYSTEM_PROMPT_ANALISE_ATIVO = `Voce e um analista de investimentos especializado no mercado brasileiro, com profundo conhecimento em acoes, fundos imobiliarios (FIIs), fundos de investimento, BDRs e renda fixa.

O usuario quer entender o desempenho de um ativo especifico. Voce recebera dados reais da carteira dele (quando disponivel) e dados de mercado atualizados (quando disponivel).

DIRETRIZES DE ANALISE:
1. PERFORMANCE: Analise a rentabilidade nos periodos disponiveis. Compare com CDI, Ibovespa e IPCA quando aplicavel.
2. TIMING: Se o ativo esta na carteira, avalie as decisoes de compra/venda. Foram em momentos favoraveis? Qual o preco medio estimado de entrada?
3. RENDA PASSIVA: Se gera proventos, calcule yield medio mensal e yield-on-cost. Compare com a taxa SELIC vigente.
4. RISCO: Identifique riscos especificos (concentracao na carteira, volatilidade, setor em declinio, fundamentos deteriorando). Se o ativo esta na carteira, avalie a participacao % em relacao ao total.
5. FUNDAMENTOS: Se dados fundamentalistas disponiveis, avalie P/L, P/VP, ROE, dividend yield, divida/patrimonio. Compare com pares do setor quando possivel.
6. CENARIO MACRO: Considere o cenario macroeconomico atual (SELIC, inflacao) e como impacta este tipo de ativo especificamente.
7. VEREDICTO: De uma avaliacao clara — manter, aumentar, reduzir ou sair — com justificativa baseada nos dados fornecidos. Nao seja generico. Use os dados reais.

REGRAS:
- Linguagem acessivel, explicando termos tecnicos na primeira vez que aparecem
- Valores monetarios em BRL formatados (R$ X.XXX,XX)
- Percentuais com 2 casas decimais
- Seja direto e opinativo. O usuario quer conclusoes, nao relatorios neutros
- Se dados fundamentalistas nao disponiveis (fundos, renda fixa), foque na performance relativa e renda passiva
- Se o ativo NAO esta na carteira do usuario (sem historico pessoal), foque em: fundamentos, dados de mercado, cenario macro, e se vale a pena entrar. Nesse caso, avaliacaoTimingUsuario e analiseRendaPassiva devem ser null.
- Portugues brasileiro
- Retorne APENAS JSON valido seguindo o schema fornecido`;

export const INSTRUCAO_USUARIO_ANALISE_ATIVO =
  "Analise o desempenho do seguinte ativo e gere uma analise detalhada. Retorne APENAS JSON valido:";

const EXEMPLO_SAIDA_ANALISE_ATIVO = `EXEMPLO MINIMO DE RESPOSTA VALIDA:

\`\`\`json
{
  "codigoAtivo": "PETR4",
  "nomeAtivo": "PETROBRAS PN",
  "dataAnalise": "2026-02-13",
  "resumoGeral": "PETR4 apresentou rentabilidade de 2.15% no mes, superando o CDI (0.92%). A posicao representa 5.3% da carteira, com dividendos consistentes. Ativo segue atrativo para renda passiva.",
  "analisePerformance": {
    "comparacoes": [
      {
        "periodo": "No mes",
        "retornoAtivo": 2.15,
        "retornoCDI": 0.92,
        "retornoIbovespa": 1.50,
        "retornoIPCA": 0.45,
        "veredictoPeriodo": "Superou CDI em 1.23 p.p. e Ibovespa em 0.65 p.p."
      }
    ],
    "tendenciaRecente": "Tendencia de alta nos ultimos 3 meses, com valorizacao acumulada de 8.5%.",
    "posicaoNaCarteira": "Representa 5.3% da carteira total, posicao moderada."
  },
  "analiseRendaPassiva": {
    "yieldMedioMensal": 0.85,
    "yieldAnualizado": 10.62,
    "yieldOnCost": 12.30,
    "totalRecebidoCentavos": 285000,
    "consistencia": "Pagamentos regulares mensais nos ultimos 12 meses.",
    "comparacaoComSelic": "Yield anualizado de 10.62% esta proximo da SELIC (14.75%), mas com potencial de valorizacao adicional."
  },
  "fatoresRisco": [
    {
      "descricao": "Exposicao a volatilidade do preco do petroleo",
      "severidade": "media",
      "impactoPotencial": "Queda de 20% no petroleo pode impactar -15% na cotacao"
    }
  ],
  "avaliacaoFundamentalista": {
    "precoLucro": 5.2,
    "precoValorPatrimonial": 1.1,
    "retornoSobrePatrimonio": 28.5,
    "dividendYield": 10.5,
    "dividaPatrimonio": 0.8,
    "resumoAvaliacao": "Multiplos atrativos: P/L de 5.2x abaixo da media do setor (8x). ROE de 28.5% indica boa rentabilidade.",
    "comparacaoSetorial": "Abaixo do P/L medio do setor de energia (8.2x), sugerindo desconto."
  },
  "avaliacaoTimingUsuario": {
    "resumo": "Compra em outubro/2025 foi oportuna, aproveitando queda temporaria.",
    "precoMedioEstimadoCentavos": 3250,
    "momentosFavoraveis": ["Compra em out/2025 a R$ 32.50, atualmente R$ 38.20 (+17.5%)"],
    "momentosDesfavoraveis": []
  },
  "cenarioMacroImpacto": "SELIC a 14.75% torna renda fixa mais competitiva, mas Petrobras oferece dividend yield de 10.5% + potencial de valorizacao. Preco do petroleo acima de US$ 70 sustenta dividendos robustos.",
  "veredicto": {
    "recomendacao": "manter",
    "justificativa": "Multiplos atrativos, dividendos consistentes e posicao moderada na carteira. Nao ha razao para alterar.",
    "horizonteTemporal": "12+ meses",
    "condicoesRevisao": "Revisar se preco do petroleo cair abaixo de US$ 60 ou se dividend yield cair abaixo de 6%."
  },
  "pontosDeAtencao": [
    "Monitorar preco do petroleo Brent",
    "Acompanhar politica de dividendos apos proximo balanco"
  ]
}
\`\`\`

VALORES VALIDOS PARA ENUMS:
- "recomendacao": "manter" | "aumentar_posicao" | "reduzir_posicao" | "realizar_lucro" | "sair_da_posicao" | "aguardar"
- "severidade": "alta" | "media" | "baixa"
- "analiseRendaPassiva" pode ser null se o ativo nao gera proventos
- "avaliacaoFundamentalista" pode ser null se dados nao disponiveis (fundos, renda fixa)
- "avaliacaoTimingUsuario" pode ser null se o ativo nao esta na carteira do usuario`;

/**
 * Constroi o prompt completo para analise de ativo pela IA.
 * Inclui schema JSON, dados serializados e instrucoes.
 */
export function construirPromptAnaliseAtivo(dadosAtivo: DadosAtivoParaPrompt): string {
  const esquemaJson = toJSONSchema(AnaliseAtivoResponseSchema);
  const dadosMarkdown = serializarDadosAtivoMarkdown(dadosAtivo);

  let prompt = INSTRUCAO_USUARIO_ANALISE_ATIVO;

  prompt += "\n\n📋 SCHEMA JSON DA RESPOSTA (OBRIGATORIO):\n";
  prompt += "```json\n";
  prompt += JSON.stringify(esquemaJson, null, 2);
  prompt += "\n```\n\n";

  prompt += "📊 DADOS DO ATIVO:\n\n";
  prompt += dadosMarkdown;
  prompt += "\n\n";

  prompt += EXEMPLO_SAIDA_ANALISE_ATIVO;
  prompt += "\n\n";

  prompt += "⚠️  REGRAS CRITICAS:\n";
  prompt += "- Retorne APENAS o JSON valido, sem texto adicional ou markdown\n";
  prompt += "- Siga EXATAMENTE o schema JSON fornecido acima\n";
  prompt += "- Use os dados fornecidos para embasar a analise — nao invente numeros\n";
  prompt += "- Se um campo nao pode ser calculado com os dados disponiveis, use null\n";
  prompt += "- Seja opinativo e direto no veredicto\n";

  return prompt;
}
