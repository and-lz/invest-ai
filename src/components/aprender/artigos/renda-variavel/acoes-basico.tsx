import { SecaoArtigo, Paragrafo, Lista, Destaque } from "../../template-artigo";
import { TakeawayBox } from "@/components/ui/takeaway-box";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { GLOSSARIO_IBOVESPA, GLOSSARIO_VOLATILIDADE } from "@/lib/glossario-financeiro";
import type { ArtigoMetadata } from "@/schemas/artigo-educacional.schema";

export const metadata: ArtigoMetadata = {
  slug: "acoes-basico",
  titulo: "Ações: o que são e como funcionam",
  descricao:
    "Entenda o que são ações, como funcionam na bolsa de valores, e por que investir em empresas pode ser uma boa ideia para o longo prazo.",
  categoria: "renda-variavel",
  tags: ["iniciante", "acoes", "bolsa-valores", "renda-variavel"],
  tempoLeituraMinutos: 9,
  nivelDificuldade: "iniciante",
  requerDadosUsuario: false,
  ordem: 1,
  publicadoEm: "2026-02-15",
};

export default function AcoesBasicoArtigo() {
  return (
    <>
      <SecaoArtigo titulo="O que são ações?">
        <Paragrafo>
          Ações são pequenos pedaços de uma empresa. Quando você compra uma ação, você se torna
          sócio (acionista) dessa empresa, mesmo que seja uma participação minúscula.
        </Paragrafo>

        <Paragrafo>
          Por exemplo: se você compra 10 ações da Petrobras, você é dono de uma fração microscópica
          da empresa. Se a Petrobras lucrar e crescer, suas ações tendem a valer mais. Se a empresa
          tiver prejuízo, suas ações podem desvalorizar.
        </Paragrafo>

        <Destaque tipo="info">
          <p className="text-sm">
            <strong>Analogia:</strong> É como ser dono de uma fatia de pizza. Se a pizza crescer,
            sua fatia cresce junto. Se a pizza encolher, sua fatia também encolhe.
          </p>
        </Destaque>
      </SecaoArtigo>

      <SecaoArtigo titulo="Como funcionam as ações na bolsa de valores?">
        <Paragrafo>
          As ações são negociadas na B3 (bolsa de valores brasileira). O preço de uma ação sobe e
          desce ao longo do dia conforme a oferta e a demanda: se muita gente quer comprar, o preço
          sobe. Se muita gente quer vender, o preço cai.
        </Paragrafo>

        <Paragrafo>
          O <InfoTooltip conteudo={GLOSSARIO_IBOVESPA.explicacao} /> Ibovespa é o índice que mede o
          desempenho médio das ações mais negociadas. Se o Ibovespa subiu 2%, significa que em média
          as principais ações subiram 2% naquele dia.
        </Paragrafo>

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "O preço de uma ação muda a cada segundo durante o horário de funcionamento da bolsa (10h às 17h em dias úteis).",
              tipo: "neutro",
            },
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Por que investir em ações?">
        <Paragrafo>
          Ações são a classe de investimento que historicamente mais gerou riqueza no longo prazo.
        </Paragrafo>

        <Lista
          items={[
            "Potencial de retorno alto: empresas crescem e suas ações valorizam",
            "Dividendos: você recebe parte dos lucros regularmente",
            "Proteção contra inflação: empresas reajustam preços, ações acompanham",
            "Liquidez: você pode vender suas ações a qualquer momento",
          ]}
        />

        <Paragrafo>
          Mas atenção: ações têm <InfoTooltip conteudo={GLOSSARIO_VOLATILIDADE.explicacao} /> alta
          volatilidade. Isso significa que o preço sobe e desce bastante. É normal ver sua carteira
          cair 10% ou 20% em crises — mas também subir muito em anos bons.
        </Paragrafo>
      </SecaoArtigo>

      <SecaoArtigo titulo="Ações ON e PN: qual a diferença?">
        <Paragrafo>
          No Brasil, existem dois tipos principais de ações: ON (Ordinárias) e PN (Preferenciais).
        </Paragrafo>

        <Lista
          items={[
            "ON (Ordinária): Dá direito a voto em assembleias da empresa. Código termina em 3 (ex: PETR3)",
            "PN (Preferencial): Dá preferência no recebimento de dividendos, mas não dá voto. Código termina em 4 (ex: PETR4)",
          ]}
        />

        <Paragrafo>
          Para investidores pequenos, a diferença prática é pouca. O importante é olhar a liquidez
          (facilidade de comprar/vender) e os dividendos históricos.
        </Paragrafo>
      </SecaoArtigo>

      <SecaoArtigo titulo="Riscos de investir em ações">
        <Paragrafo>
          Ações são arriscadas porque o preço varia muito. Em um único dia, uma ação pode cair 5%,
          10% ou até mais. Em crises, ações podem ficar anos abaixo do preço de compra.
        </Paragrafo>

        <Destaque tipo="atencao">
          <p className="text-sm">
            <strong>Regra de ouro:</strong> Só invista em ações dinheiro que você não vai precisar
            nos próximos 5 anos. No curto prazo, ações são imprevisíveis. No longo prazo, tendem a
            crescer.
          </p>
        </Destaque>

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "Investir em ações é para quem tem paciência e estômago para aguentar altos e baixos. Não é loteria, mas exige visão de longo prazo.",
              tipo: "atencao",
            },
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Como começar a investir em ações">
        <Paragrafo>Para começar, você precisa:</Paragrafo>

        <Lista
          items={[
            "Abrir conta em uma corretora de valores",
            "Transferir dinheiro para a corretora",
            "Estudar as empresas antes de comprar (ler relatórios, entender o negócio)",
            "Começar com pequenas quantias enquanto aprende",
            "Diversificar: não colocar todo o dinheiro em uma única ação",
          ]}
        />

        <Paragrafo>
          Uma estratégia comum para iniciantes é começar com ETFs (fundos que replicam o Ibovespa),
          que já dão exposição a várias empresas de uma vez. Isso reduz o risco de apostar em uma
          empresa errada.
        </Paragrafo>
      </SecaoArtigo>
    </>
  );
}
