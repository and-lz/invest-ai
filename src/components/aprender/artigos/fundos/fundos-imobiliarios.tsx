import { SecaoArtigo, Paragrafo, Lista, Destaque } from "../../template-artigo";
import { TakeawayBox } from "@/components/ui/takeaway-box";
import type { ArtigoMetadata } from "@/schemas/artigo-educacional.schema";

export const metadata: ArtigoMetadata = {
  slug: "fundos-imobiliarios",
  titulo: "Fundos Imobiliários (FIIs): renda passiva com imóveis",
  descricao:
    "Aprenda como investir em imóveis sem comprar um. Entenda FIIs, dividendos mensais e isenção de IR.",
  categoria: "fundos",
  tags: ["iniciante", "fiis", "fundos-imobiliarios", "renda-passiva", "dividendos"],
  tempoLeituraMinutos: 7,
  nivelDificuldade: "iniciante",
  requerDadosUsuario: false,
  ordem: 1,
  publicadoEm: "2026-02-15",
};

export default function FundosImobiliariosArtigo() {
  return (
    <>
      <SecaoArtigo titulo="O que são Fundos Imobiliários?">
        <Paragrafo>
          Fundos Imobiliários (FIIs) são fundos que investem em imóveis ou em títulos ligados ao
          setor imobiliário. Quando você compra cotas de um FII, você se torna dono de uma fração de
          shoppings, galpões, hospitais, escritórios e outros imóveis.
        </Paragrafo>

        <Paragrafo>
          A principal vantagem é que você ganha renda passiva mensal: os aluguéis recebidos pelos
          imóveis são distribuídos aos cotistas todo mês, como dividendos.
        </Paragrafo>

        <Destaque tipo="success">
          <p className="text-sm">
            <strong>Vantagem fiscal:</strong> Os dividendos de FIIs são isentos de Imposto de Renda
            para pessoa física, desde que você cumpra alguns requisitos básicos.
          </p>
        </Destaque>
      </SecaoArtigo>

      <SecaoArtigo titulo="Como funcionam os dividendos">
        <Paragrafo>
          Os FIIs são obrigados por lei a distribuir 95% do lucro semestral para os cotistas. Na
          prática, isso significa que você recebe dinheiro todo mês na sua conta.
        </Paragrafo>

        <Paragrafo>
          Por exemplo: se você tem 100 cotas de um FII que paga R$ 1 por cota por mês, você recebe
          R$ 100 de renda passiva mensal. É como receber aluguel de um imóvel, mas sem ter que lidar
          com inquilinos, reformas ou manutenção.
        </Paragrafo>

        <TakeawayBox
          conclusoes={[
            {
              texto:
                "FIIs são ideais para quem quer renda passiva mensal sem as dores de cabeça de ser proprietário de imóveis físicos.",
              tipo: "positivo",
            },
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Tipos de FIIs">
        <Lista
          items={[
            "FIIs de tijolo: investem em imóveis físicos (shoppings, galpões, lajes corporativas)",
            "FIIs de papel: investem em títulos imobiliários (CRIs, LCIs)",
            "FIIs de fundos: investem em cotas de outros FIIs",
          ]}
        />
      </SecaoArtigo>

      <SecaoArtigo titulo="Riscos dos FIIs">
        <Paragrafo>
          FIIs têm riscos: vacância (imóveis vazios), inadimplência de inquilinos, desvalorização
          das cotas. O preço das cotas varia na bolsa, e você pode ter prejuízo se precisar vender
          em um momento ruim.
        </Paragrafo>

        <Destaque tipo="atencao">
          <p className="text-sm">
            FIIs são para renda passiva de longo prazo. Não compre esperando vender rápido com lucro
            — foque nos dividendos mensais.
          </p>
        </Destaque>
      </SecaoArtigo>
    </>
  );
}
