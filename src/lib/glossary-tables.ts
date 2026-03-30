// ============================================================
// Glossary entries for table and event dashboard components.
// ============================================================

import type { EntradaGlossario } from "./glossary-dashboard";

// ---------- Tabela Top Performers (top-performers-table.tsx) ----------

export const GLOSSARY_MELHORES_PERFORMERS: EntradaGlossario = {
  termo: "Melhores do Mês",
  explicacao:
    "Os 5 investimentos que mais renderam neste mês. " +
    "São os seus campeões de rentabilidade no período.",
};

export const GLOSSARY_PIORES_PERFORMERS: EntradaGlossario = {
  termo: "Piores do Mês",
  explicacao:
    "Os 5 investimentos que menos renderam (ou que tiveram prejuízo) neste mês. " +
    "Fique de olho neles, mas lembre-se: perdas no curto prazo são normais.",
};

export const GLOSSARY_ATIVO: EntradaGlossario = {
  termo: "Ativo",
  explicacao:
    "É qualquer investimento individual que você possui. " +
    "Pode ser uma ação, um fundo, um título de renda fixa, etc.",
};

export const GLOSSARY_SALDO: EntradaGlossario = {
  termo: "Saldo",
  explicacao: "É quanto dinheiro você tem investido naquele ativo específico neste momento.",
};

export const GLOSSARY_RENTABILIDADE_MES: EntradaGlossario = {
  termo: "Rentabilidade do Mês",
  explicacao:
    "É o percentual de ganho ou perda daquele ativo neste mês. " +
    "Verde significa lucro, vermelho significa prejuízo.",
};

export const GLOSSARY_PARTICIPACAO: EntradaGlossario = {
  termo: "Participação na Carteira",
  explicacao:
    "É o peso daquele ativo na sua carteira total. " +
    "Por exemplo, se um ativo tem 10% de participação, ele representa 10% de todo o seu patrimônio.",
};

// ---------- Ganhos por Estratégia (strategy-gains-table.tsx) ----------

export const GLOSSARY_GANHOS_POR_ESTRATEGIA: EntradaGlossario = {
  termo: "Ganhos por Estratégia",
  explicacao:
    "Mostra quanto cada tipo de investimento gerou de lucro ou prejuízo em diferentes períodos. " +
    "Ajuda a entender quais estratégias estão funcionando melhor para você.",
};

export const GLOSSARY_PERIODO_NO_MES: EntradaGlossario = {
  termo: "No Mês",
  explicacao: "Ganhos ou perdas apenas no mês atual.",
};

export const GLOSSARY_PERIODO_NO_ANO: EntradaGlossario = {
  termo: "No Ano",
  explicacao: "Ganhos ou perdas acumulados desde janeiro deste ano.",
};

export const GLOSSARY_PERIODO_12_MESES: EntradaGlossario = {
  termo: "12 Meses",
  explicacao: "Ganhos ou perdas nos últimos 12 meses (1 ano completo).",
};

export const GLOSSARY_PERIODO_DESDE_INICIO: EntradaGlossario = {
  termo: "Desde Início",
  explicacao: "Ganhos ou perdas totais desde que você começou a investir.",
};

// ---------- Eventos Financeiros (financial-events-list.tsx) ----------

export const GLOSSARY_EVENTO_FINANCEIRO: EntradaGlossario = {
  termo: "Eventos Financeiros",
  explicacao:
    "São pagamentos que seus investimentos geram automaticamente para você. " +
    "É como receber um 'salário' dos seus investimentos, sem precisar vender nada.",
};

export const GLOSSARY_TIPOS_EVENTO: Record<string, EntradaGlossario> = {
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

// ---------- Retornos Mensais / Heatmap (monthly-returns-heatmap.tsx) ----------

export const GLOSSARY_RETORNOS_MENSAIS: EntradaGlossario = {
  termo: "Retornos Mensais",
  explicacao:
    "Mapa de calor mostrando o retorno da sua carteira em cada mês, ao longo dos anos. " +
    "Células verdes indicam meses positivos e vermelhas meses negativos. " +
    "Quanto mais intensa a cor, maior foi o ganho ou a perda.",
};

export const GLOSSARY_PERCENTUAL_CDI: EntradaGlossario = {
  termo: "% do CDI",
  explicacao:
    "Mostra quanto por cento do CDI sua carteira rendeu naquele período. " +
    "Se está acima de 100%, você superou a renda fixa. Abaixo de 100%, ficou atrás.",
};
