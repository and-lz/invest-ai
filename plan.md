# Plano: Insights Consolidados (Todos os Meses)

## Objetivo
Adicionar opção de gerar insights usando TODOS os relatórios disponíveis (não apenas mês atual + anterior), permitindo análise de tendências de longo prazo e evolução da carteira.

## Arquitetura da Solução

### Identificador especial: `consolidado`
- Insights consolidados serão salvos em `data/insights/consolidado.json`
- O `mesReferencia` no InsightsResponse será `"consolidado"`
- O period selector ganha a opção "Todos os meses"

---

## Etapas de Implementação

### 1. Domain Interface (`src/domain/interfaces/extraction-service.ts`)
Adicionar novo método à interface `InsightsService`:
```typescript
gerarInsightsConsolidados(
  todosRelatorios: RelatorioExtraido[],
): Promise<InsightsResponse>;
```

### 2. Prompt consolidado (`src/lib/prompt-insights-manual.ts`)
Criar `SYSTEM_PROMPT_INSIGHTS_CONSOLIDADO` com diretrizes específicas para análise multi-mês:
- Identificar tendências ao longo do tempo
- Evolução da alocação e rentabilidade
- Padrões de rebalanceamento
- Crescimento patrimonial acumulado
- Decisões passadas que deram certo/errado

Criar `gerarPromptInsightsManualConsolidado(todosRelatorios)`.

### 3. GeminiInsightsService (`src/infrastructure/services/gemini-insights-service.ts`)
Implementar `gerarInsightsConsolidados()`:
- Recebe array de `RelatorioExtraido` ordenados cronologicamente
- Usa o prompt consolidado
- Retorna `InsightsResponse` com `mesReferencia: "consolidado"`

### 4. ClaudeInsightsService (`src/infrastructure/services/claude-insights-service.ts`)
Implementar `gerarInsightsConsolidados()` de forma análoga ao Gemini.

### 5. Use Case (`src/application/use-cases/generate-insights-consolidados.ts`)
Criar novo use case `GenerateInsightsConsolidadosUseCase`:
- Busca TODOS os metadados via `repository.listarTodosMetadados()`
- Carrega dados extraídos de cada relatório
- Ordena cronologicamente
- Chama `insightsService.gerarInsightsConsolidados(todosRelatorios)`
- Salva com identificador `"consolidado"`

### 6. Container (`src/lib/container.ts`)
Registrar factory `obterGenerateInsightsConsolidadosUseCase()`.

### 7. API Route POST (`src/app/api/insights/route.ts`)
Aceitar novo campo no schema de request:
```typescript
const InsightsRequestSchema = z.object({
  identificadorRelatorio: z.string().min(1),
  identificadorRelatorioAnterior: z.string().optional(),
  consolidado: z.boolean().optional(),
});
```
Quando `consolidado = true`, usar `GenerateInsightsConsolidadosUseCase`.

### 8. API Route GET (`src/app/api/insights/route.ts`)
Suportar `mesAno=consolidado` para buscar insights consolidados.

### 9. API Route Manual POST (`src/app/api/insights/manual/route.ts`)
Suportar geração de prompt consolidado e salvamento com identificador `"consolidado"`.

### 10. UI - Insights Page (`src/app/insights/page.tsx`)
- Adicionar botão "Gerar com todos os meses" ao lado dos existentes
- Quando `periodoSelecionado === "consolidado"`:
  - Buscar insights com `mesAno=consolidado`
  - No POST, enviar `consolidado: true`
  - Ajustar header editorial (ex: "Análise Consolidada" em vez de mês)
- Funcionar com os mesmos componentes de exibição (InsightCard, alertas, etc.)

### 11. UI - PeriodSelector
Adicionar "Todos os meses" como opção especial no dropdown (valor: `"consolidado"`).

### 12. Stepper manual
- `InsightsManualStepper` aceita prop `consolidado?: boolean`
- Passa flag para a chamada de `gerar-prompt` na API manual

### 13. Testes
Verificar testes existentes continuam passando e oferecer testes para lógica nova.

---

## Pontos de Atenção
- **Tokens**: Enviar todos os relatórios pode ser grande, mas Gemini 2.5 Flash tem 1M tokens de contexto
- **Backward compatibility**: `consolidado` é opcional em tudo; fluxo existente não muda
- **Schema**: Reutiliza `InsightsResponseSchema` sem alterações (mesReferencia aceita qualquer string)
