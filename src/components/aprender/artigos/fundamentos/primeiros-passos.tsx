import { SecaoArtigo, Paragrafo, Lista, Destaque } from "../../article-template";
import { TakeawayBox } from "@/components/ui/takeaway-box";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import {
  GLOSSARY_PATRIMONIO_TOTAL,
  GLOSSARY_RENTABILIDADE_MENSAL,
} from "@/lib/financial-glossary";
import type { ArtigoMetadata } from "@/schemas/educational-article.schema";

export const metadata: ArtigoMetadata = {
  slug: "primeiros-passos",
  titulo: "Primeiros passos: por onde começar a investir",
  descricao:
    "Guia completo para quem está começando do zero no mundo dos investimentos. Aprenda a ordem correta de prioridades financeiras antes de investir.",
  categoria: "fundamentos",
  tags: ["iniciante", "fundamentos", "reserva-emergencia", "primeiros-passos"],
  tempoLeituraMinutos: 8,
  nivelDificuldade: "iniciante",
  requerDadosUsuario: false,
  ordem: 1,
  publicadoEm: "2026-02-15",
};

export default function PrimeirosPassosArtigo() {
  return (
    <>
      <SecaoArtigo titulo="Antes de investir um centavo">
        <Paragrafo>
          Se você está lendo isto, provavelmente já ouviu que &quot;investir é importante&quot;. E é
          verdade. Mas investir <strong>não é a primeira coisa</strong> que você deve fazer com seu
          dinheiro.
        </Paragrafo>

        <Paragrafo>
          Muitas pessoas cometem o erro de começar a investir sem ter uma base financeira sólida. É
          como construir uma casa sem alicerce: na primeira dificuldade, tudo desmorona.
        </Paragrafo>

        <Destaque tipo="warning">
          <p className="mb-2 font-semibold">Atenção!</p>
          <p className="text-sm">
            Nunca invista dinheiro que você pode precisar nos próximos 6 meses. Investimentos levam
            tempo para render, e você pode precisar vender na hora errada se surgir uma emergência.
          </p>
        </Destaque>
      </SecaoArtigo>

      <SecaoArtigo titulo="A ordem correta para organizar suas finanças">
        <Paragrafo>
          Existe uma ordem lógica de prioridades financeiras que funciona para a maioria das
          pessoas. Seguir essa ordem evita erros caros e garante que você está construindo riqueza
          da forma certa.
        </Paragrafo>

        <Lista
          items={[
            "Quite dívidas com juros altos (cartão de crédito, cheque especial, empréstimos pessoais)",
            "Monte uma reserva de emergência de 6 a 12 meses de despesas",
            "Defina seus objetivos financeiros (aposentadoria, casa própria, viagem, etc.)",
            "Conheça seu perfil de investidor (conservador, moderado ou agressivo)",
            "Comece a investir gradualmente, começando com investimentos mais seguros",
          ]}
        />

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "Investir sem reserva de emergência é como dirigir sem seguro: qualquer imprevisto pode destruir todo o seu patrimônio acumulado.",
              tipo: "atencao",
            },
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Por que quitar dívidas primeiro?">
        <Paragrafo>
          Dívidas de cartão de crédito e cheque especial costumam ter juros acima de 10% ao mês.
          Nenhum investimento consegue render tanto de forma consistente. Então, matematicamente,
          você ganha mais quitando dívidas caras do que investindo.
        </Paragrafo>

        <Paragrafo>
          Pense assim: se sua dívida do cartão cobra 12% ao mês e você investe em algo que rende 1%
          ao mês, você está perdendo 11% ao mês nessa conta. Não faz sentido, certo?
        </Paragrafo>

        <Destaque tipo="success">
          <p className="text-sm">
            <strong>Exceção:</strong> Se sua empresa oferece contrapartida em previdência privada
            (como dobrar seu aporte), pode valer a pena contribuir minimamente mesmo com dívidas,
            pois é dinheiro grátis.
          </p>
        </Destaque>
      </SecaoArtigo>

      <SecaoArtigo titulo="O que é e por que ter reserva de emergência?">
        <Paragrafo>
          Reserva de emergência é um dinheiro guardado especificamente para imprevistos: perda de
          emprego, doença, conserto do carro, problema na casa. É seu colchão de segurança
          financeira.
        </Paragrafo>

        <Paragrafo>
          O ideal é ter de 6 a 12 meses das suas despesas mensais guardados em um investimento de
          liquidez diária (que você consiga resgatar no mesmo dia, sem perder dinheiro). Isso te dá
          tranquilidade para enfrentar qualquer imprevisto sem se endividar.
        </Paragrafo>

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "Com reserva de emergência, você dorme tranquilo sabendo que consegue sobreviver financeiramente por meses mesmo sem renda.",
              tipo: "positivo",
            },
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Definindo objetivos financeiros">
        <Paragrafo>
          Antes de investir, pergunte-se: <strong>por que estou investindo?</strong> Objetivos
          claros ajudam a escolher os investimentos certos e a manter a disciplina nos momentos
          difíceis.
        </Paragrafo>

        <Paragrafo>Objetivos comuns incluem:</Paragrafo>

        <Lista
          items={[
            "Curto prazo (até 2 anos): viagem, carro, casamento",
            "Médio prazo (2-10 anos): casa própria, educação dos filhos",
            "Longo prazo (10+ anos): aposentadoria, independência financeira",
          ]}
        />

        <Paragrafo>
          Cada objetivo tem um prazo diferente e, portanto, precisa de uma estratégia de
          investimento diferente. Não existe investimento perfeito para tudo — existe o investimento
          certo para cada objetivo.
        </Paragrafo>
      </SecaoArtigo>

      <SecaoArtigo titulo="Conhecendo seu perfil de investidor">
        <Paragrafo>
          Seu perfil de investidor define quanto risco você consegue tolerar. Existem três perfis
          principais:
        </Paragrafo>

        <Lista
          items={[
            "Conservador: prioriza segurança, aceita retornos menores mas estáveis",
            "Moderado: equilibra segurança e retorno, aceita alguma volatilidade",
            "Agressivo: busca máximo retorno, aceita perdas temporárias e alta volatilidade",
          ]}
        />

        <Paragrafo>
          Não existe perfil melhor ou pior. O importante é conhecer o seu e investir de acordo com
          ele. Investir de forma muito agressiva quando você é conservador vai te fazer vender tudo
          no primeiro susto do mercado, perdendo dinheiro.
        </Paragrafo>

        <Destaque tipo="info">
          <p className="text-sm">
            Muitas corretoras oferecem questionários gratuitos de perfil de investidor. Vale a pena
            fazer para se conhecer melhor.
          </p>
        </Destaque>
      </SecaoArtigo>

      <SecaoArtigo titulo="Começando a investir: os primeiros passos">
        <Paragrafo>
          Agora sim, com dívidas quitadas e reserva de emergência pronta, você pode começar a
          investir para construir <InfoTooltip conteudo={GLOSSARY_PATRIMONIO_TOTAL.explicacao} />{" "}
          patrimônio de longo prazo.
        </Paragrafo>

        <Paragrafo>Para iniciantes absolutos, recomenda-se começar com:</Paragrafo>

        <Lista
          items={[
            "Tesouro Selic: investimento federal, seguro, com liquidez diária",
            "CDB de liquidez diária: investimento de banco, rende próximo ao CDI",
            "Fundos DI: fundos que investem em renda fixa atrelada ao CDI",
          ]}
        />

        <Paragrafo>
          Esses investimentos são simples, seguros e te ajudam a pegar prática sem correr grandes
          riscos. Com o tempo, você pode diversificar para{" "}
          <InfoTooltip conteudo={GLOSSARY_RENTABILIDADE_MENSAL.explicacao} /> investimentos que
          rendem mais, mas que também têm mais risco.
        </Paragrafo>

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "O primeiro investimento não precisa ser perfeito. O importante é começar, aprender e ajustar com o tempo.",
              tipo: "neutro",
            },
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Próximos passos">
        <Paragrafo>
          Agora que você entendeu as bases, explore os outros artigos desta seção de Fundamentos
          para aprofundar seu conhecimento. Em seguida, conheça os artigos sobre Renda Fixa para
          entender melhor onde investir seu dinheiro com segurança.
        </Paragrafo>

        <Paragrafo>
          Lembre-se: investir é uma jornada, não uma corrida. Cada passo conta, e você está no
          caminho certo!
        </Paragrafo>
      </SecaoArtigo>
    </>
  );
}
