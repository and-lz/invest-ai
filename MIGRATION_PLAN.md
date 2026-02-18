# English Migration Plan

Worktree: `/Users/andreluiz/workspace/invest-ai-english-migration`
Branch: `migrate-to-english`
Strategy: phase by phase, `npm run build` after each phase to catch type errors early.

---

## Phase 1 — Zod Schemas (`src/schemas/`)

Source of truth. Renames cascade everywhere. Do schemas first so TypeScript catches all consumers.

### report-extraction.schema.ts
Schema renames: `PercentualSchema`→`PercentageSchema`, `ResumoSchema`→`SummarySchema`, `CategoriaAlocacaoEnum`→`AllocationCategoryEnum`, `CategoriaAlocacaoSchema`→`AllocationCategorySchema`, `AlocacaoMensalSchema`→`MonthlyAllocationSchema`, `PontoEvolucaoPatrimonialSchema`→`WealthEvolutionPointSchema`, `ComparacaoPeriodoSchema`→`PeriodComparisonSchema`, `AnaliseRiscoRetornoSchema`→`RiskReturnAnalysisSchema`, `RetornoMensalDetalheSchema`→`MonthlyReturnDetailSchema`, `RetornoAnualSchema`→`AnnualReturnSchema`, `ComparacaoBenchmarksSchema`→`BenchmarkComparisonSchema`, `RentabilidadePorCategoriaSchema`→`CategoryReturnSchema`, `TipoEventoFinanceiroEnum`→`FinancialEventTypeEnum`, `EventoFinanceiroSchema`→`FinancialEventSchema`, `GanhosPorEstrategiaSchema`→`StrategyGainsSchema`, `FaixaLiquidezSchema`→`LiquidityBracketSchema`, `PosicaoAtivoSchema`→`AssetPositionSchema`, `TipoMovimentacaoEnum`→`TransactionTypeEnum`, `MovimentacaoSchema`→`TransactionSchema`, `RelatorioExtraidoSchema`→`ExtractedReportSchema`

Field renames (key ones — apply all):
- `valorEmCentavos`→`amountInCents`, `moeda`→`currency` (Money)
- `patrimonioTotal`→`totalWealth`, `patrimonioMesAnterior`→`previousMonthWealth`, `ganhosFinanceirosNoMes`→`monthlyFinancialGains`, `ganhosFinanceirosMesAnterior`→`previousMonthFinancialGains`, `aplicacoesNoMes`→`monthlyDeposits`, `resgatesNoMes`→`monthlyWithdrawals`, `eventosFinanceirosNoMes`→`monthlyFinancialEvents`, `eventosFinanceirosMesAnterior`→`previousMonthFinancialEvents`, `rentabilidadeMensal`→`monthlyReturn`, `rentabilidadeMensalAnterior`→`previousMonthReturn`, `rentabilidadeAnual`→`annualReturn`, `rentabilidadeAnoAnterior`→`previousYearReturn`, `rentabilidadeDesdeInicio`→`returnSinceInception`, `dataInicioCarteira`→`portfolioStartDate` (Summary)
- `nomeCategoria`→`categoryName`, `percentualDaCarteira`→`portfolioPercentage` (AllocationCategory)
- `mesAno`→`monthYear`, `categorias`→`categories` (MonthlyAllocation)
- `totalAportado`→`totalDeposited` (WealthEvolutionPoint)
- `rentabilidadeCarteira`→`portfolioReturn`, `rentabilidadeCDI`→`cdiReturn`, `percentualDoCDI`→`cdiPercentage`, `volatilidade`→`volatility` (PeriodComparison)
- `mesesAcimaBenchmark`→`monthsAboveBenchmark`, `mesesAbaixoBenchmark`→`monthsBelowBenchmark`, `maiorRentabilidade`→`highestReturn`, `menorRentabilidade`→`lowestReturn` (RiskReturn)
- `mes`→`month`, `rentabilidadeCarteira`→`portfolioReturn` (MonthlyReturnDetail)
- `ano`→`year`, `meses`→`months`, `rentabilidadeAnual`→`annualReturn`, `rentabilidadeAcumulada`→`accumulatedReturn` (AnnualReturn)
- `carteira`→`portfolio` (BenchmarkComparison)
- `rentabilidade12Meses`→`return12Months` (CategoryReturn)
- `tipoEvento`→`eventType`, `nomeAtivo`→`assetName`, `codigoAtivo`→`assetCode`, `valor`→`amount`, `dataEvento`→`eventDate` (FinancialEvent)
- `nomeEstrategia`→`strategyName`, `ganhoNoMes`→`monthlyGain`, `ganhoNoAno`→`yearlyGain`, `ganho3Meses`→`gain3Months`, `ganho6Meses`→`gain6Months`, `ganho12Meses`→`gain12Months`, `ganhoDesdeInicio`→`gainSinceInception` (StrategyGains)
- `descricaoPeriodo`→`periodDescription`, `diasMinimo`→`minDays`, `diasMaximo`→`maxDays`, `valorAcumulado`→`accumulatedAmount`, `percentualAcumulado`→`accumulatedPercentage` (LiquidityBracket)
- `nomeAtivo`→`assetName`, `codigoAtivo`→`assetCode`, `estrategia`→`strategy`, `saldoAnterior`→`previousBalance`, `aplicacoes`→`deposits`, `resgates`→`withdrawals`, `eventosFinanceiros`→`financialEvents`, `saldoBruto`→`grossBalance`, `rentabilidadeMes`→`monthlyReturn`, `participacaoNaCarteira`→`portfolioWeight` (AssetPosition)
- `tipoMovimentacao`→`transactionType` (Transaction)
- `metadados`→`metadata`, `resumo`→`summary`, `evolucaoAlocacao`→`allocationHistory`, `evolucaoPatrimonial`→`wealthHistory`, `comparacaoPeriodos`→`periodComparisons`, `analiseRiscoRetorno`→`riskReturnAnalysis`, `retornosMensais`→`monthlyReturns`, `comparacaoBenchmarks`→`benchmarkComparisons`, `rentabilidadePorCategoria`→`categoryReturns`, `eventosFinanceiros`→`financialEvents`, `ganhosPorEstrategia`→`strategyGains`, `faixasLiquidez`→`liquidityBrackets`, `posicoesDetalhadas`→`assetPositions`, `movimentacoes`→`transactions`, `mesReferencia`→`referenceMonth`, `dataGeracao`→`generationDate`, `instituicao`→`institution` (ExtractedReport)
- Enum values: `"Dividendo"`→`"Dividend"`, `"Rendimento"`→`"Income"`, `"Amortizacao"`→`"Amortization"`, `"Aluguel"`→`"Rental"`, `"Outro"`→`"Other"`, `"Aplicacao"`→`"Deposit"`, `"Resgate"`→`"Withdrawal"`

Type aliases: `RelatorioExtraido`→`ExtractedReport`, `Resumo`→`Summary`, `AlocacaoMensal`→`MonthlyAllocation`, `PontoEvolucaoPatrimonial`→`WealthEvolutionPoint`, `ComparacaoPeriodo`→`PeriodComparison`, `AnaliseRiscoRetorno`→`RiskReturnAnalysis`, `RetornoAnual`→`AnnualReturn`, `ComparacaoBenchmarks`→`BenchmarkComparison`, `RentabilidadePorCategoria`→`CategoryReturn`, `EventoFinanceiro`→`FinancialEvent`, `GanhosPorEstrategia`→`StrategyGains`, `FaixaLiquidez`→`LiquidityBracket`, `PosicaoAtivo`→`AssetPosition`, `Movimentacao`→`Transaction`, `Percentual`→`Percentage`

### report-metadata.schema.ts
- `StatusExtracaoEnum`→`ExtractionStatusEnum`, `OrigemDadosEnum`→`DataOriginEnum`
- Fields: `mesReferencia`→`referenceMonth`, `nomeArquivoOriginal`→`originalFileName`, `caminhoArquivoPdf`→`pdfFilePath`, `caminhoArquivoExtraido`→`extractedFilePath`, `caminhoArquivoInsights`→`insightsFilePath`, `dataUpload`→`uploadDate`, `statusExtracao`→`extractionStatus`, `origemDados`→`dataOrigin`, `erroExtracao`→`extractionError`
- Enum values: `"importacao-manual"`→`"manual-import"`, `"upload-automatico"`→`"automatic-upload"`, `"concluido"`→`"completed"`, `"processando"`→`"processing"`, `"pendente"`→`"pending"`, `"erro"`→`"error"`
- Types: `StatusExtracao`→`ExtractionStatus`, `OrigemDados`→`DataOrigin`

### insights.schema.ts
- `InsightPrioridadeEnum`→`InsightPriorityEnum`, `StatusAcaoEnum`→`ActionStatusEnum`
- Fields: `titulo`→`title`, `descricao`→`description`, `categoria`→`category`, `prioridade`→`priority`, `ativosRelacionados`→`relatedAssets`, `acaoSugerida`→`suggestedAction`, `impactoEstimado`→`estimatedImpact`, `concluida`→`completed`, `statusAcao`→`actionStatus`, `mensagem`→`message`, `mesReferencia`→`referenceMonth`, `dataGeracao`→`generationDate`, `resumoExecutivo`→`executiveSummary`, `alertas`→`alerts`, `recomendacoesLongoPrazo`→`longTermRecommendations`, `identificador`→`id`, `totalAlertas`→`totalAlerts`, `atualizadoEm`→`updatedAt`
- Enum values: `"alta"`→`"high"`, `"media"`→`"medium"`, `"baixa"`→`"low"`, `"pendente"`→`"pending"`, `"concluida"`→`"completed"`, `"ignorada"`→`"ignored"`
- Types: `Alerta`→`Alert`, `StatusAcao`→`ActionStatus`

### conversa.schema.ts
- `ConversaSchema`→`ConversationSchema`, `IndiceConversasSchema`→`ConversationIndexSchema`, `CriarConversaSchema`→`CreateConversationSchema`, `AtualizarConversaSchema`→`UpdateConversationSchema`
- Fields: `identificador`→`id`, `usuarioId`→`userId`, `titulo`→`title`, `identificadorPagina`→`pageId`, `mensagens`→`messages`, `criadaEm`→`createdAt`, `atualizadaEm`→`updatedAt`, `conversas`→`conversations`
- Types: `Conversa`→`Conversation`, `IndiceConversas`→`ConversationIndex`, `CriarConversa`→`CreateConversation`, `AtualizarConversa`→`UpdateConversation`

### chat.schema.ts
- `PapelMensagemChatEnum`→`ChatMessageRoleEnum`, `MensagemChatSchema`→`ChatMessageSchema`, `MensagemParaServidorSchema`→`ServerMessageSchema`, `RequisicaoChatSchema`→`ChatRequestSchema`, `IdentificadorPaginaEnum`→`PageIdEnum`
- Fields: `identificador`→`id`, `papel`→`role`, `conteudo`→`content`, `criadaEm`→`createdAt`, `contextoPagina`→`pageContext`, `identificadorPagina`→`pageId`, `mensagens`→`messages`
- Enum values: `"usuario"`→`"user"`, `"assistente"`→`"assistant"`
- Page ID values: `"desempenho"`→`"performance"`, `"aprender"`→`"learning"`
- Types: `MensagemChat`→`ChatMessage`, `IdentificadorPagina`→`PageId`, `MensagemParaServidor`→`ServerMessage`, `RequisicaoChat`→`ChatRequest`

### plano-acao.schema.ts
- `OrigemItemPlanoEnum`→`ActionPlanItemOriginEnum`, `TipoConclusaoPlanoEnum`→`ConclusionTypeEnum`, `StatusItemPlanoEnum`→`ActionItemStatusEnum`, `ItemPlanoAcaoSchema`→`ActionPlanItemSchema`, `CriarItemPlanoSchema`→`CreateActionItemSchema`, `AtualizarItemPlanoSchema`→`UpdateActionItemSchema`, `EnriquecimentoAiSchema`→`AiEnrichmentSchema`
- Fields: `identificador`→`id`, `usuarioId`→`userId`, `textoOriginal`→`originalText`, `tipoConclusao`→`conclusionType`, `origem`→`origin`, `recomendacaoEnriquecida`→`enrichedRecommendation`, `fundamentacao`→`rationale`, `ativosRelacionados`→`relatedAssets`, `criadoEm`→`createdAt`, `atualizadoEm`→`updatedAt`, `concluidoEm`→`completedAt`
- Enum values: `"positivo"`→`"positive"`, `"neutro"`→`"neutral"`, `"atencao"`→`"attention"`, `"pendente"`→`"pending"`, `"concluida"`→`"completed"`, `"ignorada"`→`"ignored"`, `"takeaway-dashboard"`→`"takeaway-dashboard"` (keep slug), `"insight-acao-sugerida"`→`"insight-suggested-action"`
- Types: `ItemPlanoAcao`→`ActionPlanItem`, `CriarItemPlano`→`CreateActionItem`, `AtualizarItemPlano`→`UpdateActionItem`, `EnriquecimentoAi`→`AiEnrichment`, `OrigemItemPlano`→`ActionPlanItemOrigin`, `StatusItemPlano`→`ActionItemStatus`, `TipoConclusaoPlano`→`ConclusionType`

### trends.schema.ts
- `AtivoListaBrapiSchema`→`BrapiStockListSchema`, `RespostaListaBrapiSchema`→`BrapiListResponseSchema`, `CotacaoIndiceBrapiSchema`→`BrapiIndexQuoteSchema`, `RespostaCotacaoBrapiSchema`→`BrapiQuoteResponseSchema`, `PontoDadoBcbSchema`→`BcbDataPointSchema`, `AtivoRankingSchema`→`AssetRankingSchema`, `IndiceMercadoSchema`→`MarketIndexSchema`, `PontoHistoricoMacroSchema`→`MacroHistoryPointSchema`, `IndicadorMacroSchema`→`MacroIndicatorSchema`, `SetorPerformanceSchema`→`SectorPerformanceSchema`, `DadosTendenciasSchema`→`TrendsDataSchema`
- Fields: `nome`→`name`, `preco`→`price`, `variacao`→`change`, `setor`→`sector`, `simbolo`→`symbol`, `valor`→`value`, `atualizadoEm`→`updatedAt`, `data`→`date`, `codigo`→`code`, `valorAtual`→`currentValue`, `unidade`→`unit`, `historico`→`history`, `setorTraduzido`→`sectorTranslated`, `variacaoMedia`→`averageChange`, `quantidadeAtivos`→`assetCount`, `maioresAltas`→`topGainers`, `maioresBaixas`→`topLosers`, `maisNegociados`→`mostTraded`, `maioresAltasFundos`→`topFundGainers`, `indicesMercado`→`marketIndices`, `indicadoresMacro`→`macroIndicators`, `setoresPerformance`→`sectorPerformance`
- Types: all Portuguese type aliases → English equivalents

### analise-ativo.schema.ts
- `ComparacaoRetornoSchema`→`ReturnComparisonSchema`, `AnaliseRendaPassivaSchema`→`PassiveIncomeAnalysisSchema`, `FatorRiscoSchema`→`RiskFactorSchema`, `AvaliacaoFundamentalistaSchema`→`FundamentalAnalysisSchema`, `AvaliacaoTimingSchema`→`TimingAnalysisSchema`
- Fields: `retornoAtivo`→`assetReturn`, `retornoCDI`→`cdiReturn`, `retornoIbovespa`→`ibovespaReturn`, `retornoIPCA`→`ipcaReturn`, `veredictoPeriodo`→`periodVerdict`, `totalRecebidoCentavos`→`totalReceivedInCents`, `consistencia`→`consistency`, `comparacaoComSelic`→`selicComparison`, `descricao`→`description`, `severidade`→`severity`, `impactoPotencial`→`potentialImpact`, `precoLucro`→`priceEarnings`, `precoValorPatrimonial`→`priceToBook`, `retornoSobrePatrimonio`→`returnOnEquity`, `dividaPatrimonio`→`debtToEquity`, `resumoAvaliacao`→`evaluationSummary`, `comparacaoSetorial`→`sectorComparison`

### artigo-educacional.schema.ts
- `NivelDificuldadeEnum`→`DifficultyLevelEnum`, `ArtigoMetadataSchema`→`ArticleMetadataSchema`
- Fields: `titulo`→`title`, `descricao`→`description`, `categoria`→`category`, `tempoLeituraMinutos`→`readingTimeMinutes`, `nivelDificuldade`→`difficultyLevel`, `requerDadosUsuario`→`requiresUserData`, `ordem`→`order`, `publicadoEm`→`publishedAt`, `atualizadoEm`→`updatedAt`
- Interface `ArtigoEducacional`→`EducationalArticle`, `InformacaoCategoria`→`CategoryInfo`, `INFORMACOES_CATEGORIAS`→`CATEGORY_INFO`
- Enum values: `"iniciante"`→`"beginner"`, `"intermediario"`→`"intermediate"`, `"avancado"`→`"advanced"`
- Types: `CategoriaArtigo`→`ArticleCategory`, `NivelDificuldade`→`DifficultyLevel`, `ArtigoMetadata`→`ArticleMetadata`

---

## Phase 2 — Domain Layer (`src/domain/`)

### Value objects
**money.ts:** `criarMoney`→`createMoney`, `formatarMoeda`→`formatCurrency`, `formatarMoedaCompacta`→`formatCompactCurrency`, `somarMoney`→`addMoney`, `subtrairMoney`→`subtractMoney`, `centavosParaReais`→`centsToReais`, `reaisParaCentavos`→`reaisToCents`

**percentage.ts:** `criarPercentual`→`createPercentage`, `formatarPercentual`→`formatPercentage`, `formatarPercentualSimples`→`formatSimplePercentage`, `calcularVariacaoPercentual`→`calculatePercentageChange`

### Interfaces
**report-repository.ts:** `salvarPdf`→`savePdf`, `salvarDadosExtraidos`→`saveExtractedData`, `salvarMetadados`→`saveMetadata`, `salvarInsights`→`saveInsights`, `obterMetadados`→`getMetadata`, `obterDadosExtraidos`→`getExtractedData`, `obterInsights`→`getInsights`, `obterPdfComoBase64`→`getPdfAsBase64`, `listarTodosMetadados`→`listAllMetadata`, `listarInsightsMetadados`→`listInsightsMetadata`, `removerRelatorio`→`deleteReport`, `removerInsights`→`deleteInsights`

**conversa-repository.ts:** interface `ConversaRepository`→`ConversationRepository`, `salvarConversa`→`saveConversation`, `obterConversaPorUsuario`→`getConversationByUser`, `listarConversasDoUsuario`→`listUserConversations`, `atualizarConversa`→`updateConversation`, `removerConversa`→`deleteConversation`

**provedor-ai.ts (rename→ai-provider.ts):** `ParteConteudoTexto`→`TextContentPart`, `ParteConteudoPdf`→`PdfContentPart`, `ParteConteudoImagem`→`ImageContentPart`, `ParteConteudo`→`ContentPart`, `MensagemAi`→`AiMessage`, `ConfiguracaoGeracao`→`GenerationConfig`, `RespostaAi`→`AiResponse`, `ProvedorAi`→`AiProvider`. Fields: `tipo`→`type`, `dados`→`data`, `papel`→`role`, `partes`→`parts`, `instrucaoSistema`→`systemInstruction`, `mensagens`→`messages`, `temperatura`→`temperature`, `formatoResposta`→`responseFormat`, `pesquisaWeb`→`webSearch`, `texto`→`text`, `tokensEntrada`→`inputTokens`, `tokensSaida`→`outputTokens`. Method: `gerar`→`generate`, `transmitir`→`stream`. Enum values: `"usuario"`→`"user"`, `"modelo"`→`"model"`

**plano-acao-repository.ts:** rename methods to match `ActionPlanRepository` interface

### Error classes
**app-errors.ts:** `recuperavel`→`recoverable`, Portuguese error message strings → English

---

## Phase 3 — Lib Utilities (`src/lib/`)

### File renames (use `git mv`)
| Old | New |
|-----|-----|
| `tarefa-background.ts` | `background-task.ts` |
| `tarefa-descricao.ts` | `task-description.ts` |
| `notificacao.ts` | `notification.ts` |
| `notificar.ts` | `notify.ts` |
| `glossario-financeiro.ts` | `financial-glossary.ts` |
| `glossario-navegavel.ts` | `navigable-glossary.ts` |
| `construir-instrucao-sistema-chat.ts` | `build-chat-system-instruction.ts` |
| `serializar-relatorio-markdown.ts` | `serialize-report-markdown.ts` |
| `serializar-contexto-chat.ts` | `serialize-chat-context.ts` |
| `serializar-dados-ativo-markdown.ts` | `serialize-asset-data-markdown.ts` |
| `despachar-tarefa.ts` | `dispatch-task.ts` |
| `executor-tarefa-background.ts` | `background-task-executor.ts` |
| `agregar-dados-ativo.ts` | `aggregate-asset-data.ts` |
| `analise-ativo-storage.ts` | `asset-analysis-storage.ts` |
| `cabecalhos-cache.ts` | `cache-headers.ts` |
| `cache-em-memoria.ts` | `memory-cache.ts` |
| `classificar-erro-ai.ts` | `classify-ai-error.ts` |
| `formatar-fontes-grounding.ts` | `format-grounding-sources.ts` |
| `prompt-analise-ativo.ts` | `prompt-asset-analysis.ts` |
| `prompt-extracao-manual.ts` | `prompt-manual-extraction.ts` |
| `prompt-insights-manual.ts` | `prompt-manual-insights.ts` |
| `prompts-explicacao-card.ts` | `prompt-card-explanation.ts` |

### Key identifier renames per file

**background-task.ts:** `salvarTarefa`→`saveTask`, `lerTarefa`→`getTask`, `cancelarTarefa`→`cancelTask`, `listarTarefasAtivasPorUsuario`→`listActiveTasksByUser`

**task-description.ts:** `TipoTarefaEnum`→`TaskTypeEnum`, `StatusTarefaEnum`→`TaskStatusEnum`, `TarefaBackgroundSchema`→`BackgroundTaskSchema`, `LABELS_TIPO_TAREFA`→`TASK_TYPE_LABELS`, `descreverTarefa`→`describeTask`. Type `TarefaBackground`→`BackgroundTask`, `TipoTarefa`→`TaskType`, `StatusTarefa`→`TaskStatus`. Fields: `identificador`→`id`, `usuarioId`→`userId`, `tipo`→`type`, `iniciadoEm`→`startedAt`, `concluidoEm`→`completedAt`, `erro`→`error`, `descricaoResultado`→`resultDescription`, `urlRedirecionamento`→`redirectUrl`, `tentativaAtual`→`currentAttempt`, `maximoTentativas`→`maxAttempts`, `erroRecuperavel`→`recoverableError`, `proximaTentativaEm`→`nextAttemptAt`, `parametros`→`params`, `canceladaEm`→`canceledAt`, `canceladaPor`→`canceledBy`. Enum values: `"processando"`→`"processing"`, `"concluido"`→`"completed"`, `"cancelada"`→`"canceled"`

**notification.ts:** `TipoNotificacaoEnum`→`NotificationTypeEnum`, `NotificacaoSchema`→`NotificationSchema`, `CriarNotificacaoSchema`→`CreateNotificationSchema`, `IndiceNotificacoesSchema`→`NotificationIndexSchema`. Functions: `listarNotificacoes`→`listNotifications`, `adicionarNotificacao`→`addNotification`, `marcarComoVisualizada`→`markAsRead`, `marcarTodasComoVisualizadas`→`markAllAsRead`, `limparTodasNotificacoes`→`clearAllNotifications`. Fields: `identificador`→`id`, `titulo`→`title`, `descricao`→`description`, `criadaEm`→`createdAt`, `visualizada`→`read`, `notificacoes`→`notifications`. Types: `Notificacao`→`Notification`, `CriarNotificacao`→`CreateNotification`

**notify.ts:** `notificar`→`notify` export, `notificar.success/error/warning/info`→`notify.success/error/warning/info`

**financial-glossary.ts:** `EntradaGlossario`→`GlossaryEntry`, fields `termo`→`term`, `explicacao`→`explanation`. All `GLOSSARIO_*`→`GLOSSARY_*` constants.

**format-date.ts:** `MESES_EXTENSO`→`MONTHS_FULL`, `MESES_ABREVIADO`→`MONTHS_SHORT`. Functions: `formatarMesAno`→`formatMonthYear`, `formatarDataBrasileira`→`formatBrazilianDate`, `formatarTimestampBrasileiro`→`formatBrazilianTimestamp`, `converterParaISO`→`convertToISO`, `obterMesAnterior`→`getPreviousMonth`, `validarMesAno`→`validateMonthYear`. Format values: `"extenso"`→`"full"`, `"abreviado"`→`"short"`, `"compacto"`→`"compact"`

**build-chat-system-instruction.ts:** `construirInstrucaoSistemaChat`→`buildChatSystemInstruction`

**background-task-executor.ts:** `ResultadoTarefaSucesso`→`TaskSuccessResult`, `ConfiguracaoExecutorTarefa`→`TaskExecutorConfig`, `executarTarefaEmBackground`→`executeBackgroundTask`. Fields: `tarefa`→`task`, `rotuloLog`→`logLabel`, `usuarioId`→`userId`, `executarOperacao`→`runOperation`, `aoFalharDefinitivo`→`onPermanentFailure`, `descricaoResultado`→`resultDescription`, `urlRedirecionamento`→`redirectUrl`

**container.ts:** All `obter*`→`get*`, `criar*`→`create*` factory functions

**dispatch-task.ts:** `despacharTarefaPorTipo`→`dispatchTaskByType`

---

## Phase 4 — Hooks (`src/hooks/`)

### File renames (git mv)
| Old | New |
|-----|-----|
| `use-importacao-manual.ts` | `use-manual-import.ts` |
| `use-ordenacao-tabela.ts` | `use-table-sorting.ts` |
| `use-notificacoes.ts` | `use-notifications.ts` |
| `use-dados-tendencias.ts` | `use-trends-data.ts` |
| `use-analise-ia-ativo.ts` | `use-ai-asset-analysis.ts` |
| `use-conversas.ts` | `use-conversations.ts` |
| `use-dados-ativo.ts` | `use-asset-data.ts` |
| `use-tarefas-ativas.ts` | `use-active-tasks.ts` |
| `use-chat-assistente.ts` | `use-chat-assistant.ts` |
| `use-plano-acao.ts` | `use-action-plan.ts` |

Key function renames: `useImportacaoManual`→`useManualImport`, `useOrdenacaoTabela`→`useTableSorting`, `useNotificacoes`→`useNotifications`, `useDadosTendencias`→`useTrendsData`, `useAnaliseIaAtivo`→`useAiAssetAnalysis`, `useConversas`→`useConversations`, `useDadosAtivo`→`useAssetData`, `useTarefasAtivas`→`useActiveTasks`, `useChatAssistente`→`useChatAssistant`, `usePlanoAcao`→`useActionPlan`

Internal state/return vars: `carregando`→`loading`, `erro`→`error`, `mensagens`→`messages`, `estaTransmitindo`→`isStreaming`, `conversas`→`conversations`, `tarefas`→`tasks`, `notificacoes`→`notifications`, `dados`→`data`

Event name: `EVENTO_NOTIFICACAO_CRIADA`→`NOTIFICATION_CREATED_EVENT`, `dispararEventoNotificacaoCriada`→`fireNotificationCreatedEvent`

---

## Phase 5 — Components + Contexts + App Pages

### Context rename
`src/contexts/contexto-pagina-chat.tsx`→`page-chat-context.tsx`: `useContextoPaginaChat`→`usePageChatContext`, `ContextoPaginaChat`→`PageChatContext`, `ProvedorContextoPaginaChat`→`PageChatProvider`

### Component file renames (git mv)
Key renames (Portuguese-named → English-named):
- `mensagem-chat.tsx`→`chat-message.tsx`
- `grafico-evolucao-ativo.tsx`→`asset-evolution-chart.tsx`
- `tabela-movimentacoes.tsx`→`transactions-table.tsx`
- `cards-resumo-ativo.tsx`→`asset-summary-cards.tsx`
- `seletor-ativo.tsx`→`asset-selector.tsx`
- `analise-ia-ativo.tsx`→`ai-asset-analysis.tsx`
- `grid-ativos-carteira.tsx`→`portfolio-assets-grid.tsx`
- `indicadores-resumo.tsx`→`macro-indicators-summary.tsx`
- `tabela-ranking-ativos.tsx`→`asset-ranking-table.tsx`
- `tabela-ranking-fundos.tsx`→`fund-ranking-table.tsx`
- `etapas-processamento.tsx`→`processing-steps.tsx`
- `formulario-json-manual.tsx`→`manual-json-form.tsx`
- `indicador-passos.tsx`→`step-indicator.tsx`
- `prompt-extracao-copiavel.tsx`→`copyable-extraction-prompt.tsx`
- `resultado-upload.tsx`→`upload-result.tsx`
- `formulario-insights-manual.tsx`→`manual-insights-form.tsx`
- `prompt-insights-copiavel.tsx`→`copyable-insights-prompt.tsx`
- `breadcrumbs-educacional.tsx`→`educational-breadcrumbs.tsx`
- `glossario-conteudo.tsx`→`glossary-content.tsx`
- `layout-artigo.tsx`→`article-layout.tsx`
- `template-artigo.tsx`→`article-template.tsx`

### Internal variables in components
- All props mirroring renamed schema fields → match new English names
- `Conclusao` type: `texto`→`text`, `tipo`→`type`, values `"positivo"/"neutro"/"atencao"`→`"positive"/"neutral"/"attention"`
- Callbacks: `aoClicar`→`onClick`, `aoEnviar`→`onSubmit`, `aoFechar`→`onClose`, `aoMudar`→`onChange`
- State: `carregando`→`loading`, `erro`→`error`, `aberto`→`open`, `selecionado`→`selected`
- UI strings: `"Carregando..."` → `"Loading..."`, `"Salvar"` → `"Save"`, `"Cancelar"` → `"Cancel"`, etc.

---

## Phase 6 — Application Use Cases (`src/application/`)

### File renames
- `salvar-relatorio-manual.ts`→`save-manual-report.ts`
- `salvar-insights-manual.ts`→`save-manual-insights.ts`
- `atualizar-conclusao-insight.ts`→`update-insight-conclusion.ts`

### Class and method renames
- `SalvarRelatorioManualUseCase`→`SaveManualReportUseCase`, method `executar`→`execute`
- `SalvarInsightsManualUseCase`→`SaveManualInsightsUseCase`, `executar`→`execute`
- `AtualizarConclusaoInsightUseCase`→`UpdateInsightConclusionUseCase`, `executar`→`execute`
- All other use-cases: rename `executar`→`execute` and all internal Portuguese vars

---

## Phase 7 — Infrastructure (`src/infrastructure/`)

### File renames
- `gemini-provedor-ai.ts`→`gemini-ai-provider.ts`
- `db-conversa-repository.ts`→`db-conversation-repository.ts`
- `db-plano-acao-repository.ts`→`db-action-plan-repository.ts`

### Key renames
- `GeminiProvedorAi`→`GeminiAiProvider`, `DbConversaRepository`→`DbConversationRepository`
- Methods: `gerar`→`generate`, `transmitir`→`stream`
- All internal Portuguese variables → English

---

## Phase 8 — API Routes (`src/app/api/`)

Internal variable renames across all route files:
- `usuarioId`→`userId`, `relatorio`→`report`, `tarefa`→`task`, `resultado`→`result`, `resposta`→`response`, `identificador`→`id`, `mensagem`→`message`, `dados`→`data`
- Update all imports for renamed lib/hook/use-case files

---

## Phase 9 — Tests (`__tests__/`)

- `glossario-financeiro.test.ts`→`financial-glossary.test.ts`
- `executor-tarefa-background.test.ts`→`background-task-executor.test.ts`
- `salvar-relatorio-manual.test.ts`→`save-manual-report.test.ts`
- Update all function names, schema fields, and type names in test data factories
- Format values: `"extenso"/"abreviado"/"compacto"` → `"full"/"short"/"compact"`
- Run `npm run test` — all 181+ tests must pass

---

## Phase 10 — Docs

- Update `CLAUDE.md`: remove "Nomes de variaveis verbosos em portugues", add English-only rule
- Update any docs in `docs/` referencing Portuguese patterns

---

## Execution notes

- Work entirely in `/Users/andreluiz/workspace/invest-ai-english-migration`
- Use `git mv` for all file renames to preserve git history
- Run `npm run build` after each phase — TypeScript catches broken references
- Commit after each phase passes build
- **Do NOT translate**: LLM prompt content text, financial glossary entry text, educational article body, Brazilian financial domain terms ("Renda Fixa", "CDI", "IPCA", etc.)
- **localStorage key** `"tarefasAtivas"` → rename to `"activeTasks"` with backward-compat clear on app start
