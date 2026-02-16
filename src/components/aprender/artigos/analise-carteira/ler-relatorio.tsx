import { SecaoArtigo, Paragrafo, Lista, Destaque } from "../../template-artigo";
import { TakeawayBox } from "@/components/ui/takeaway-box";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  GLOSSARIO_PATRIMONIO_TOTAL,
  GLOSSARIO_RENTABILIDADE_MENSAL,
  GLOSSARIO_ALOCACAO_POR_ESTRATEGIA,
} from "@/lib/glossario-financeiro";
import type { ArtigoMetadata } from "@/schemas/artigo-educacional.schema";

export const metadata: ArtigoMetadata = {
  slug: "ler-relatorio",
  titulo: "Como ler seu relatório de investimentos",
  descricao:
    "Guia prático para entender cada número e gráfico do seu dashboard. Aprenda a interpretar rentabilidade, alocação e eventos financeiros.",
  categoria: "analise-carteira",
  tags: ["iniciante", "relatorio", "dashboard", "analise-carteira"],
  tempoLeituraMinutos: 10,
  nivelDificuldade: "iniciante",
  requerDadosUsuario: false,
  ordem: 1,
  publicadoEm: "2026-02-15",
};

export default function LerRelatorioArtigo() {
  return (
    <>
      <SecaoArtigo titulo="Seu dashboard: um panorama completo">
        <Paragrafo>
          O dashboard de investimentos mostra tudo que você precisa saber sobre sua carteira em um
          único lugar: quanto você tem, quanto ganhou, como está alocado e muito mais.
        </Paragrafo>

        <Paragrafo>
          Vamos passar por cada seção e entender o que cada número significa e como usar essas
          informações para tomar melhores decisões.
        </Paragrafo>
      </SecaoArtigo>

      <SecaoArtigo titulo="Patrimônio Total e Variação">
        <Paragrafo>
          O <InfoTooltip conteudo={GLOSSARIO_PATRIMONIO_TOTAL.explicacao} /> é o valor total de
          todos os seus investimentos neste momento. Inclui ações, fundos, renda fixa — tudo.
        </Paragrafo>

        <Paragrafo>
          A variação patrimonial mostra quanto seu patrimônio cresceu ou diminuiu em relação ao mês
          anterior. Se está verde e positivo, sua carteira cresceu. Se está vermelho e negativo,
          diminuiu.
        </Paragrafo>

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "Foque no crescimento de longo prazo, não em oscilações mensais. É normal ter meses negativos — o importante é a tendência geral.",
              tipo: "neutro",
            },
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Rentabilidade: entendendo os percentuais">
        <Paragrafo>
          A <InfoTooltip conteudo={GLOSSARIO_RENTABILIDADE_MENSAL.explicacao} /> rentabilidade
          mostra quanto seus investimentos renderam em percentual.
        </Paragrafo>

        <Lista
          items={[
            "Rentabilidade Mensal: ganho ou perda só neste mês",
            "Rentabilidade Anual: acumulado desde janeiro do ano atual",
            "Rentabilidade Desde o Início: total desde que você começou a investir",
          ]}
        />

        <Paragrafo>
          Compare sua rentabilidade com benchmarks (CDI, Ibovespa, IPCA) para entender se está indo
          bem. Se você superou o CDI no ano, parabéns — você bateu a renda fixa!
        </Paragrafo>
      </SecaoArtigo>

      <SecaoArtigo titulo="Alocação de Ativos: como seu dinheiro está distribuído">
        <Paragrafo>
          O gráfico de <InfoTooltip conteudo={GLOSSARIO_ALOCACAO_POR_ESTRATEGIA.explicacao} />{" "}
          alocação mostra quanto do seu patrimônio está em cada tipo de investimento: renda fixa,
          ações, fundos, etc.
        </Paragrafo>

        <Paragrafo>
          Diversificação é fundamental. Se mais de 50% do seu dinheiro está em um único tipo de
          investimento ou empresa, você está concentrado demais — qualquer problema naquele ativo
          afeta muito sua carteira.
        </Paragrafo>

        <Destaque tipo="atencao">
          <p className="text-sm">
            <strong>Regra prática:</strong> Não concentre mais de 30% em um único ativo. Espalhe o
            risco.
          </p>
        </Destaque>
      </SecaoArtigo>

      <SecaoArtigo titulo="Eventos Financeiros: sua renda passiva">
        <Paragrafo>
          Eventos financeiros são dividendos, JCP, aluguéis e rendimentos que você recebeu. É o
          dinheiro que seus investimentos geraram sem você precisar vender nada.
        </Paragrafo>

        <Paragrafo>
          Acompanhar os eventos financeiros ajuda a entender quais ativos estão gerando renda
          passiva regular. Se seu objetivo é viver de renda, essa seção é crucial.
        </Paragrafo>
      </SecaoArtigo>

      <SecaoArtigo titulo="Usando o relatório para tomar decisões">
        <Paragrafo>Use seu dashboard para:</Paragrafo>

        <Lista
          items={[
            "Identificar se precisa rebalancear (reajustar alocação)",
            "Ver quais ativos estão performando bem ou mal",
            "Acompanhar se está batendo suas metas de rentabilidade",
            "Detectar concentrações excessivas em um único ativo",
            "Planejar aportes futuros em categorias sub-representadas",
          ]}
        />

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "Revise seu dashboard mensalmente, mas evite tomar decisões impulsivas. Investir é uma maratona, não uma corrida de 100 metros.",
              tipo: "positivo",
            },
          ]}
        />
      </SecaoArtigo>
    </>
  );
}
