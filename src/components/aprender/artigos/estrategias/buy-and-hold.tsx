import { SecaoArtigo, Paragrafo, Lista, Destaque } from "../../template-artigo";
import { TakeawayBox } from "@/components/ui/takeaway-box";
import type { ArtigoMetadata } from "@/schemas/artigo-educacional.schema";

export const metadata: ArtigoMetadata = {
  slug: "buy-and-hold",
  titulo: "Buy and Hold: a estratégia de longo prazo",
  descricao:
    "Aprenda por que tempo no mercado supera timing de mercado. Entenda a estratégia de comprar e segurar para acumular riqueza.",
  categoria: "estrategias",
  tags: ["iniciante", "buy-and-hold", "longo-prazo", "estrategia"],
  tempoLeituraMinutos: 8,
  nivelDificuldade: "iniciante",
  requerDadosUsuario: false,
  ordem: 1,
  publicadoEm: "2026-02-15",
};

export default function BuyAndHoldArtigo() {
  return (
    <>
      <SecaoArtigo titulo="O que é Buy and Hold?">
        <Paragrafo>
          Buy and Hold significa &quot;comprar e segurar&quot;: você compra bons ativos e os mantém
          por muitos anos, independente das oscilações de curto prazo.
        </Paragrafo>

        <Paragrafo>
          A ideia é que, no longo prazo, boas empresas e bons investimentos tendem a crescer.
          Tentativas de adivinhar o momento certo de comprar e vender (market timing) geralmente
          falham e geram prejuízo.
        </Paragrafo>

        <Destaque tipo="success">
          <p className="text-sm">
            <strong>Warren Buffett:</strong> &quot;Nossa ação preferida é aquela que mantemos para
            sempre.&quot;
          </p>
        </Destaque>
      </SecaoArtigo>

      <SecaoArtigo titulo="Por que funciona?">
        <Paragrafo>Buy and Hold funciona por alguns motivos:</Paragrafo>

        <Lista
          items={[
            "Juros compostos: seus rendimentos geram mais rendimentos ao longo do tempo",
            "Redução de custos: menos compra e venda significa menos taxas e impostos",
            "Menos erros emocionais: você não vende no pânico nem compra na euforia",
            "Tempo no mercado > timing: é impossível prever altas e baixas consistentemente",
          ]}
        />

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "Estudos mostram que investidores que tentam adivinhar o melhor momento geralmente perdem para aqueles que simplesmente ficam investidos.",
              tipo: "positivo",
            },
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Como aplicar Buy and Hold">
        <Lista
          items={[
            "Escolha empresas ou fundos de qualidade com fundamentos sólidos",
            "Invista regularmente (aportes mensais) independente do preço",
            "Ignore oscilações de curto prazo — não fique checando preços todo dia",
            "Rebalanceie anualmente para manter sua alocação desejada",
            "Pense em décadas, não em meses",
          ]}
        />

        <Paragrafo>
          Buy and Hold não significa nunca vender. Significa vender apenas quando os fundamentos da
          empresa ou do ativo mudaram, não porque o preço caiu 10% em uma semana.
        </Paragrafo>
      </SecaoArtigo>

      <SecaoArtigo titulo="Desafios do Buy and Hold">
        <Paragrafo>
          A maior dificuldade do Buy and Hold é emocional. Quando o mercado cai 30%, o instinto é
          vender tudo. Mas é exatamente nesses momentos que você deve manter a calma e continuar
          investindo.
        </Paragrafo>

        <Destaque tipo="atencao">
          <p className="text-sm">
            Crises são temporárias. Empresas boas se recuperam. Vender no fundo da crise é
            transformar prejuízo temporário em prejuízo permanente.
          </p>
        </Destaque>

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "Buy and Hold é simples, mas não é fácil. Exige disciplina, paciência e estômago para aguentar os altos e baixos sem desistir.",
              tipo: "neutro",
            },
          ]}
        />
      </SecaoArtigo>
    </>
  );
}
