import { z } from "zod/v4";

// ============================================================
// Zod schemas para artigos educacionais do centro de aprendizado.
// Define a estrutura de metadata e tipos para artigos.
// ============================================================

// ---- Categorias de Artigos ----

export const CategoriaArtigoEnum = z.enum([
  "fundamentos",
  "renda-fixa",
  "renda-variavel",
  "fundos",
  "analise-carteira",
  "estrategias",
  "impostos",
  "planejamento",
]);

export type CategoriaArtigo = z.infer<typeof CategoriaArtigoEnum>;

// ---- Nível de Dificuldade ----

export const NivelDificuldadeEnum = z.enum(["iniciante", "intermediario", "avancado"]);

export type NivelDificuldade = z.infer<typeof NivelDificuldadeEnum>;

// ---- Metadata de Artigo ----

export const ArtigoMetadataSchema = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens")
    .describe("Identificador único do artigo na URL. Ex: 'primeiros-passos'"),

  titulo: z
    .string()
    .min(5)
    .max(100)
    .describe("Título do artigo exibido na interface. Ex: 'Primeiros passos: por onde começar a investir'"),

  descricao: z
    .string()
    .min(50)
    .max(300)
    .describe("Descrição curta do artigo exibida em cards e metadata SEO"),

  categoria: CategoriaArtigoEnum.describe("Categoria temática do artigo"),

  tags: z
    .array(z.string())
    .min(1)
    .max(10)
    .describe("Tags para busca e filtragem. Ex: ['iniciante', 'tesouro-direto', 'renda-fixa']"),

  tempoLeituraMinutos: z
    .number()
    .int()
    .min(1)
    .max(60)
    .describe("Tempo estimado de leitura em minutos"),

  nivelDificuldade: NivelDificuldadeEnum.describe("Nível de conhecimento necessário para compreender o artigo"),

  requerDadosUsuario: z
    .boolean()
    .describe("Se o artigo usa dados reais da carteira do usuário para exemplos personalizados"),

  ordem: z
    .number()
    .int()
    .min(1)
    .describe("Ordem de exibição do artigo dentro da categoria (menor = aparece primeiro)"),

  publicadoEm: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .describe("Data de publicação do artigo no formato ISO. Ex: '2026-02-15'"),

  atualizadoEm: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD")
    .optional()
    .describe("Data da última atualização do artigo, se houver"),
});

export type ArtigoMetadata = z.infer<typeof ArtigoMetadataSchema>;

// ---- Interface de Artigo Educacional ----

export interface ArtigoEducacional {
  readonly metadata: ArtigoMetadata;
  readonly Component: React.ComponentType;
}

// ---- Informações de Categoria ----

export interface InformacaoCategoria {
  readonly slug: CategoriaArtigo;
  readonly titulo: string;
  readonly descricao: string;
  readonly ordem: number;
}

export const INFORMACOES_CATEGORIAS: readonly InformacaoCategoria[] = [
  {
    slug: "fundamentos",
    titulo: "Fundamentos",
    descricao: "Conceitos básicos para quem está começando do zero no mundo dos investimentos",
    ordem: 1,
  },
  {
    slug: "renda-fixa",
    titulo: "Renda Fixa",
    descricao: "Tesouro Direto, CDB, LCI/LCA e outros investimentos de renda fixa",
    ordem: 2,
  },
  {
    slug: "renda-variavel",
    titulo: "Renda Variável",
    descricao: "Ações, dividendos e o mercado de bolsa de valores",
    ordem: 3,
  },
  {
    slug: "fundos",
    titulo: "Fundos de Investimento",
    descricao: "Fundos Imobiliários (FIIs), ETFs e fundos multimercado",
    ordem: 4,
  },
  {
    slug: "analise-carteira",
    titulo: "Análise de Carteira",
    descricao: "Como ler relatórios, diversificar e rebalancear sua carteira",
    ordem: 5,
  },
  {
    slug: "estrategias",
    titulo: "Estratégias de Investimento",
    descricao: "Buy and hold, dividendos, proteção e outras abordagens de longo prazo",
    ordem: 6,
  },
  {
    slug: "impostos",
    titulo: "Impostos e Tributação",
    descricao: "Como funciona o Imposto de Renda em diferentes tipos de investimento",
    ordem: 7,
  },
  {
    slug: "planejamento",
    titulo: "Planejamento Financeiro",
    descricao: "Reserva de emergência, objetivos financeiros e aposentadoria",
    ordem: 8,
  },
] as const;
