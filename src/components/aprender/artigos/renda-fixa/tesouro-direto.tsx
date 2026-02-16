import { SecaoArtigo, Paragrafo, Lista, Destaque, TabelaSimples } from "../../template-artigo";
import { TakeawayBox } from "@/components/ui/takeaway-box";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { GLOSSARIO_IPCA } from "@/lib/glossario-financeiro";
import type { ArtigoMetadata } from "@/schemas/artigo-educacional.schema";

export const metadata: ArtigoMetadata = {
  slug: "tesouro-direto",
  titulo: "O que é Tesouro Direto e como funciona",
  descricao:
    "Entenda o investimento mais seguro do Brasil. Aprenda sobre Tesouro Selic, IPCA+ e Prefixado de forma simples.",
  categoria: "renda-fixa",
  tags: ["iniciante", "renda-fixa", "tesouro-direto", "tesouro-selic", "ipca"],
  tempoLeituraMinutos: 10,
  nivelDificuldade: "iniciante",
  requerDadosUsuario: false,
  ordem: 1,
  publicadoEm: "2026-02-15",
};

export default function TesouroDiretoArtigo() {
  return (
    <>
      <SecaoArtigo titulo="O que é o Tesouro Direto?">
        <Paragrafo>
          Tesouro Direto é um programa do governo federal que permite que qualquer pessoa compre
          títulos públicos pela internet. Quando você investe no Tesouro, está{" "}
          <strong>emprestando dinheiro para o governo</strong> em troca de juros.
        </Paragrafo>

        <Paragrafo>
          É considerado o investimento mais seguro do Brasil, porque quem garante o pagamento é o
          próprio governo federal. Para o governo não pagar, o Brasil teria que quebrar — o que é
          extremamente improvável.
        </Paragrafo>

        <Destaque tipo="success">
          <p className="text-sm">
            <strong>Segurança máxima:</strong> O Tesouro Direto é garantido pelo Tesouro Nacional. É
            mais seguro que deixar dinheiro no banco.
          </p>
        </Destaque>
      </SecaoArtigo>

      <SecaoArtigo titulo="Os 3 tipos principais de Tesouro">
        <Paragrafo>
          Existem três grandes famílias de títulos públicos, cada uma com uma forma diferente de
          pagar juros:
        </Paragrafo>

        <TabelaSimples
          cabecalhos={["Tipo", "Como rende", "Para quem é ideal"]}
          linhas={[
            [
              "Tesouro Selic",
              "Acompanha a taxa Selic (juros básicos)",
              "Reserva de emergência, curto prazo",
            ],
            [
              "Tesouro IPCA+",
              "Inflação (IPCA) + juros fixos",
              "Longo prazo, proteção contra inflação",
            ],
            [
              "Tesouro Prefixado",
              "Taxa de juros fixa definida na compra",
              "Quando você acredita que os juros vão cair",
            ],
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Tesouro Selic: a escolha mais simples">
        <Paragrafo>
          O Tesouro Selic é o título mais indicado para iniciantes e para reserva de emergência. Ele
          rende de acordo com a taxa Selic, que é a taxa básica de juros da economia.
        </Paragrafo>

        <Paragrafo>Vantagens do Tesouro Selic:</Paragrafo>

        <Lista
          items={[
            "Liquidez diária: você pode resgatar a qualquer momento sem perder dinheiro",
            "Baixo risco: garantido pelo governo federal",
            "Rentabilidade previsível: acompanha a Selic",
            "Não tem pegadinhas: o valor sempre sobe, nunca desce",
          ]}
        />

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "Para reserva de emergência, o Tesouro Selic é a escolha mais inteligente: seguro, líquido e rentável.",
              tipo: "positivo",
            },
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Tesouro IPCA+: proteção contra a inflação">
        <Paragrafo>
          O Tesouro IPCA+ é ideal para objetivos de longo prazo, como aposentadoria. Ele garante que
          seu dinheiro sempre vai render <InfoTooltip conteudo={GLOSSARIO_IPCA.explicacao} /> mais
          que a inflação.
        </Paragrafo>

        <Paragrafo>
          Por exemplo: se você compra um Tesouro IPCA+ 2035 que paga IPCA + 5% ao ano, você tem a
          garantia de que seu dinheiro vai render a inflação (seja ela qual for) mais 5% ao ano.
          Isso protege seu poder de compra.
        </Paragrafo>

        <Destaque tipo="info">
          <p className="text-sm">
            Se a inflação for de 4% ao ano e seu título paga IPCA + 5%, você ganha 9% no total (4% +
            5%).
          </p>
        </Destaque>
      </SecaoArtigo>

      <SecaoArtigo titulo="Tesouro Prefixado: apostando na queda dos juros">
        <Paragrafo>
          No Tesouro Prefixado, você já sabe exatamente quanto vai receber no vencimento. Por
          exemplo: Tesouro Prefixado 2028 a 12% ao ano significa que você vai ganhar 12% ao ano até
          2028, não importa o que aconteça com a economia.
        </Paragrafo>

        <Paragrafo>
          É uma boa opção quando você acredita que os juros vão cair, porque você trava uma taxa
          alta hoje. Mas se você precisar resgatar antes do vencimento e os juros tiverem subido,
          pode ter prejuízo.
        </Paragrafo>

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "Tesouro Prefixado é para quem pode esperar até o vencimento. Se resgatar antes, pode ganhar menos ou até perder.",
              tipo: "atencao",
            },
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Como começar a investir no Tesouro">
        <Paragrafo>Investir no Tesouro Direto é simples:</Paragrafo>

        <Lista
          items={[
            "Abra uma conta em uma corretora (muitas são gratuitas)",
            "Transfira dinheiro da sua conta bancária para a corretora",
            "Acesse a área de Tesouro Direto na plataforma da corretora",
            "Escolha o título que se encaixa no seu objetivo",
            "Defina o valor e confirme a compra",
          ]}
        />

        <Paragrafo>
          Você pode investir a partir de R$ 30, e os títulos ficam guardados em seu nome na B3 (a
          bolsa de valores brasileira), então são 100% seguros.
        </Paragrafo>
      </SecaoArtigo>
    </>
  );
}
