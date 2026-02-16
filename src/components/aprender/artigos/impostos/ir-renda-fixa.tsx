import { SecaoArtigo, Paragrafo, Lista, Destaque, TabelaSimples } from "../../template-artigo";
import { TakeawayBox } from "@/components/ui/takeaway-box";
import type { ArtigoMetadata } from "@/schemas/artigo-educacional.schema";

export const metadata: ArtigoMetadata = {
  slug: "ir-renda-fixa",
  titulo: "Imposto de renda em renda fixa",
  descricao:
    "Entenda a tabela regressiva do IR, isenções em LCI/LCA e come-cotas. Saiba quanto você realmente ganha após impostos.",
  categoria: "impostos",
  tags: ["iniciante", "imposto-renda", "renda-fixa", "come-cotas", "lci-lca"],
  tempoLeituraMinutos: 7,
  nivelDificuldade: "iniciante",
  requerDadosUsuario: false,
  ordem: 1,
  publicadoEm: "2026-02-15",
};

export default function IRRendaFixaArtigo() {
  return (
    <>
      <SecaoArtigo titulo="Como funciona o IR em renda fixa?">
        <Paragrafo>
          A maioria dos investimentos de renda fixa (CDB, Tesouro, LC, etc.) tem desconto de Imposto
          de Renda sobre os rendimentos. O valor do IR depende de quanto tempo você deixou o
          dinheiro investido.
        </Paragrafo>

        <Paragrafo>
          Existe uma tabela regressiva: quanto mais tempo você mantém o investimento, menos imposto
          paga.
        </Paragrafo>
      </SecaoArtigo>

      <SecaoArtigo titulo="Tabela Regressiva do IR">
        <TabelaSimples
          cabecalhos={["Prazo de aplicação", "Alíquota de IR"]}
          linhas={[
            ["Até 180 dias", "22,5%"],
            ["De 181 a 360 dias", "20%"],
            ["De 361 a 720 dias", "17,5%"],
            ["Acima de 720 dias (2 anos)", "15%"],
          ]}
        />

        <Paragrafo>
          Por exemplo: se você investiu R$ 10.000 e ganhou R$ 1.000 de juros em 1 ano, vai pagar 20%
          de IR sobre os R$ 1.000 = R$ 200. Seu ganho líquido será R$ 800.
        </Paragrafo>

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "O IR é cobrado automaticamente no resgate ou vencimento. A corretora desconta e repassa para a Receita — você não precisa fazer nada.",
              tipo: "neutro",
            },
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Investimentos isentos de IR">
        <Paragrafo>
          Alguns investimentos de renda fixa são isentos de Imposto de Renda para pessoa física:
        </Paragrafo>

        <Lista
          items={[
            "LCI (Letra de Crédito Imobiliário)",
            "LCA (Letra de Crédito do Agronegócio)",
            "CRI e CRA (Certificados de Recebíveis)",
            "Debêntures incentivadas (infraestrutura)",
            "Poupança (mas rende muito pouco)",
          ]}
        />

        <Paragrafo>
          Mesmo que esses investimentos rendam um pouco menos que um CDB, a isenção de IR pode
          compensar. Sempre compare a rentabilidade líquida (após impostos).
        </Paragrafo>

        <Destaque tipo="success">
          <p className="text-sm">
            <strong>Dica:</strong> LCI e LCA costumam ser boas opções para quem quer rentabilidade
            de renda fixa sem pagar IR.
          </p>
        </Destaque>
      </SecaoArtigo>

      <SecaoArtigo titulo="Come-cotas: o IR antecipado dos fundos">
        <Paragrafo>
          Fundos de renda fixa têm uma particularidade: o come-cotas. É uma cobrança antecipada de
          IR que acontece duas vezes por ano (maio e novembro), mesmo sem você resgatar.
        </Paragrafo>

        <Paragrafo>
          O come-cotas cobra 15% sobre os rendimentos acumulados. Quando você resgatar, o IR final é
          acertado conforme a tabela regressiva. Se você ficou menos de 2 anos, pode haver cobrança
          adicional. Se ficou mais, você já pagou e não paga mais nada.
        </Paragrafo>

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "Come-cotas reduz o efeito dos juros compostos nos fundos. Por isso, para longo prazo, investimentos diretos (Tesouro, CDB) podem ser mais vantajosos.",
              tipo: "atencao",
            },
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Como otimizar impostos em renda fixa">
        <Lista
          items={[
            "Prefira LCI/LCA quando a rentabilidade líquida for competitiva",
            "Evite resgatar antes de 2 anos se puder (alíquota mínima de 15%)",
            "Compare sempre rentabilidade líquida, não bruta",
            "Para reserva de emergência, escolha Tesouro Selic (IR baixo com liquidez)",
          ]}
        />
      </SecaoArtigo>
    </>
  );
}
