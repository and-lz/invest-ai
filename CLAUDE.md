# Investimentos Dashboard - Convencoes do Projeto

## Stack
- Next.js 15 (App Router) + TypeScript strict
- shadcn/ui + Tailwind CSS v4 + Recharts
- Zod para validacao + types inferidos
- Vitest + Testing Library para testes
- Claude API (Anthropic SDK) para parsing PDF e insights

## Arquitetura (DDD Simplificado)
- `src/schemas/` - Zod schemas (fonte unica dos tipos)
- `src/domain/` - Value objects, interfaces, erros
- `src/infrastructure/` - Implementacoes (filesystem, Claude API)
- `src/application/use-cases/` - Orquestracao de logica
- `src/app/api/` - API Routes
- `src/components/` - UI (dashboard, layout, upload, insights)
- `src/hooks/` - React hooks customizados
- `src/lib/` - Utilitarios e configuracao

## Padroes
- Valores monetarios em centavos (inteiros) para evitar float
- Nomes de variaveis verbosos em portugues
- NUNCA usar `any` - usar tipos Zod inferidos
- Schemas Zod sao a fonte unica de verdade dos tipos TypeScript
- Use cases recebem interfaces (inversao de dependencia)
- Componentes de UI recebem dados via props tipadas

## Comandos
- `npm run dev` - desenvolvimento
- `npm run build` - build producao
- `npm run test` - rodar testes
- `npm run lint` - verificar lint
- `npm run format` - formatar codigo

## Storage
- PDFs em `data/reports/`
- JSON extraido em `data/extracted/`
- Insights em `data/insights/`
