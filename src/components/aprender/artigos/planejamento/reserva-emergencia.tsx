import { SecaoArtigo, Paragrafo, Lista, Destaque } from "../../article-template";
import { TakeawayBox } from "@/components/ui/takeaway-box";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { GLOSSARY_LIQUIDEZ } from "@/lib/financial-glossary";
import type { ArtigoMetadata } from "@/schemas/educational-article.schema";

export const metadata: ArtigoMetadata = {
  slug: "reserva-emergencia",
  titulo: "Reserva de emergência: sua rede de segurança",
  descricao:
    "Aprenda quanto guardar, onde investir sua reserva e por que ela é o primeiro passo antes de qualquer outro investimento.",
  categoria: "planejamento",
  tags: ["iniciante", "reserva-emergencia", "planejamento", "seguranca-financeira"],
  tempoLeituraMinutos: 9,
  nivelDificuldade: "iniciante",
  requerDadosUsuario: false,
  ordem: 1,
  publicadoEm: "2026-02-15",
};

export default function ReservaEmergenciaArtigo() {
  return (
    <>
      <SecaoArtigo titulo="O que é reserva de emergência?">
        <Paragrafo>
          Reserva de emergência é um dinheiro separado exclusivamente para imprevistos: perda de
          emprego, problema de saúde, conserto urgente do carro, reforma emergencial da casa, etc.
        </Paragrafo>

        <Paragrafo>
          É seu colchão de segurança financeira. Com ela, você não precisa vender investimentos na
          hora errada, nem se endividar em cartão de crédito ou empréstimos caros quando algo
          inesperado acontece.
        </Paragrafo>

        <Destaque tipo="warning">
          <p className="text-sm">
            <strong>Regra de ouro:</strong> Construir reserva de emergência é a prioridade número 1
            antes de qualquer outro investimento. Não pule esta etapa!
          </p>
        </Destaque>
      </SecaoArtigo>

      <SecaoArtigo titulo="Quanto guardar na reserva de emergência?">
        <Paragrafo>
          O tamanho ideal da reserva depende da sua situação, mas a regra geral é ter de{" "}
          <strong>6 a 12 meses</strong> das suas despesas mensais guardadas.
        </Paragrafo>

        <Lista
          items={[
            "CLT com estabilidade: 6 meses de despesas",
            "Autônomo ou renda variável: 12 meses de despesas",
            "Casal com duas rendas: 6 meses pode ser suficiente",
            "Único provedor da casa: 12 meses é mais seguro",
          ]}
        />

        <Paragrafo>
          Para calcular, some todas as suas despesas obrigatórias mensais: aluguel, condomínio,
          alimentação, contas, transporte, escola, etc. Multiplique por 6 ou 12 meses.
        </Paragrafo>

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "Se você gasta R$ 3.000 por mês, sua reserva ideal é entre R$ 18.000 (6 meses) e R$ 36.000 (12 meses).",
              tipo: "neutro",
            },
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Onde investir a reserva de emergência?">
        <Paragrafo>
          A reserva de emergência precisa ter duas características essenciais:{" "}
          <InfoTooltip conteudo={GLOSSARY_LIQUIDEZ.explicacao} /> liquidez diária e segurança
          total.
        </Paragrafo>

        <Paragrafo>Melhores opções:</Paragrafo>

        <Lista
          items={[
            "Tesouro Selic: investimento mais seguro do Brasil, liquidez diária, sem perder valor",
            "CDB de liquidez diária (100% CDI ou mais): oferecido por bancos, garantido pelo FGC até R$ 250 mil",
            "Fundos DI com baixa taxa de administração: liquidez D+1, rende próximo ao CDI",
          ]}
        />

        <Destaque tipo="atencao">
          <p className="text-sm">
            <strong>Evite:</strong> Deixar reserva na poupança (rende menos), em ações ou FIIs
            (podem cair quando você precisar), ou em investimentos de longo prazo (sem liquidez).
          </p>
        </Destaque>
      </SecaoArtigo>

      <SecaoArtigo titulo="Como montar sua reserva">
        <Paragrafo>
          Construir uma reserva de 6-12 meses leva tempo. Não desanime se parecer muito dinheiro —
          você vai chegar lá gradualmente.
        </Paragrafo>

        <Lista
          items={[
            "Defina uma meta mensal de poupança (ex: 20% da sua renda)",
            "Automatize: configure transferência automática todo mês para a reserva",
            "Comece pequeno: mesmo R$ 100/mês já é um começo",
            "Use bônus e 13º: coloque parte do dinheiro extra na reserva",
            "Celebre marcos: quando completar 3 meses, 6 meses, etc.",
          ]}
        />

        <Paragrafo>
          Se você consegue guardar R$ 500 por mês, em 1 ano terá R$ 6.000 guardados. Em 3 anos, R$
          18.000 — uma reserva respeitável!
        </Paragrafo>

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "Montar reserva de emergência é chato, mas é o que separa quem tem estabilidade financeira de quem vive no fio da navalha.",
              tipo: "positivo",
            },
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Quando usar a reserva de emergência?">
        <Paragrafo>
          Use a reserva apenas para emergências reais, não para oportunidades ou desejos.
          Emergências são:
        </Paragrafo>

        <Lista
          items={[
            "Perda de emprego ou redução brusca de renda",
            "Problemas de saúde não cobertos por plano",
            "Consertos urgentes (carro, casa) que impedem sua rotina",
            "Situações familiares graves e inesperadas",
          ]}
        />

        <Paragrafo>
          Não são emergências: Black Friday, promoção de viagem, celular novo, presente caro. Para
          isso, crie uma poupança separada para objetivos de curto prazo.
        </Paragrafo>
      </SecaoArtigo>

      <SecaoArtigo titulo="E depois de montar a reserva?">
        <Paragrafo>
          Uma vez que sua reserva esteja completa (6-12 meses de despesas), você pode começar a
          investir o restante do seu dinheiro em ativos de maior rentabilidade: ações, FIIs, Tesouro
          IPCA+, etc.
        </Paragrafo>

        <Paragrafo>
          Lembre-se de reajustar o valor da reserva se suas despesas aumentarem (mudança de casa,
          nascimento de filho, etc.). Revise anualmente.
        </Paragrafo>

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "Reserva de emergência é o alicerce da sua vida financeira. Sem ela, você está sempre a um imprevisto de distância do desastre financeiro.",
              tipo: "atencao",
            },
          ]}
        />
      </SecaoArtigo>
    </>
  );
}
