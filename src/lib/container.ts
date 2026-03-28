import { DbReportRepository } from "@/infrastructure/repositories/db-report-repository";
import { DbConversaRepository } from "@/infrastructure/repositories/db-conversation-repository";
import { DbPlanoAcaoRepository } from "@/infrastructure/repositories/db-action-plan-repository";
import { AiTextPdfExtractionService } from "@/infrastructure/services/ai-text-pdf-extraction-service";
import { AiInsightsService } from "@/infrastructure/services/ai-insights-service";
import { UploadReportUseCase } from "@/application/use-cases/upload-report";
import { ListReportsUseCase } from "@/application/use-cases/list-reports";
import { GetReportDetailUseCase } from "@/application/use-cases/get-report-detail";
import { GetDashboardDataUseCase } from "@/application/use-cases/get-dashboard-data";
import { GenerateInsightsUseCase } from "@/application/use-cases/generate-insights";
import { DeleteReportUseCase } from "@/application/use-cases/delete-report";
import { UpdateInsightConclusionUseCase } from "@/application/use-cases/update-insight-conclusion";
import { GenerateConsolidatedInsightsUseCase } from "@/application/use-cases/generate-consolidated-insights";
import { AnalyzeAssetPerformanceUseCase } from "@/application/use-cases/analyze-asset-performance";
import { ListInsightsUseCase } from "@/application/use-cases/list-insights";
import { DeleteInsightsUseCase } from "@/application/use-cases/delete-insights";
import type { ExtractionService, InsightsService } from "@/domain/interfaces/extraction-service";
import type { ProvedorAi } from "@/domain/interfaces/ai-provider";
import type { MarketDataService, MacroDataService } from "@/domain/interfaces/market-data-service";
import type { ConversaRepository } from "@/domain/interfaces/conversation-repository";
import type { PlanoAcaoRepository } from "@/domain/interfaces/action-plan-repository";
import { AnthropicProvedorAi } from "@/infrastructure/ai/anthropic-ai-provider";
import { resolveClaudeModelId, DEFAULT_CLAUDE_MODEL_TIER } from "@/lib/model-tiers";
import { AiAssetAnalysisService } from "@/infrastructure/services/ai-asset-analysis-service";
import { BrapiMarketDataService } from "@/infrastructure/services/brapi-market-data-service";
import { BrapiAssetDetailService } from "@/infrastructure/services/brapi-asset-detail-service";
import { BcbMacroDataService } from "@/infrastructure/services/bcb-macro-data-service";
import { obterPdfStorage } from "@/infrastructure/storage/pdf-storage-factory";
import { auth } from "@/auth";

// ---- AI config type ----

export interface AiConfig {
  provider: "claude-proxy";
  modelId: string;
}

// ---- Auth / session helpers ----

async function obterUsuarioId(): Promise<string> {
  try {
    const session = await auth();
    if (session?.user?.userId) {
      return session.user.userId;
    }
  } catch {
    // Build time ou sem contexto de sessao
  }
  return "__anonimo__";
}

async function criarRepositorio() {
  const usuarioId = await obterUsuarioId();
  return new DbReportRepository(usuarioId, obterPdfStorage());
}

// ---- AI provider factory ----

/**
 * Returns the default AI config using the Claude local proxy.
 */
export function obterAiConfig(): AiConfig {
  return {
    provider: "claude-proxy",
    modelId: resolveClaudeModelId(DEFAULT_CLAUDE_MODEL_TIER),
  };
}

export function criarProvedorAi(config: AiConfig): ProvedorAi {
  const proxyUrl = process.env.CLAUDE_PROXY_URL ?? "http://localhost:3099";
  return new AnthropicProvedorAi(proxyUrl, config.modelId);
}

function criarServicoExtracao(config: AiConfig): ExtractionService {
  return new AiTextPdfExtractionService(criarProvedorAi(config));
}

function criarServicoInsights(config: AiConfig): InsightsService {
  return new AiInsightsService(criarProvedorAi(config));
}

// ---- Use case factories ----

export async function obterUploadReportUseCase(config: AiConfig) {
  const repository = await criarRepositorio();
  return new UploadReportUseCase(repository, criarServicoExtracao(config));
}

export async function obterListReportsUseCase() {
  const repository = await criarRepositorio();
  return new ListReportsUseCase(repository);
}

export async function obterGetReportDetailUseCase() {
  const repository = await criarRepositorio();
  return new GetReportDetailUseCase(repository);
}

export async function obterGetDashboardDataUseCase() {
  const repository = await criarRepositorio();
  return new GetDashboardDataUseCase(repository);
}

export async function obterGenerateInsightsUseCase(config: AiConfig) {
  const repository = await criarRepositorio();
  return new GenerateInsightsUseCase(repository, criarServicoInsights(config));
}

export async function obterDeleteReportUseCase() {
  const repository = await criarRepositorio();
  return new DeleteReportUseCase(repository);
}

export async function obterUpdateInsightConclusionUseCase() {
  const repository = await criarRepositorio();
  return new UpdateInsightConclusionUseCase(repository);
}

export async function obterGenerateConsolidatedInsightsUseCase(config: AiConfig) {
  const repository = await criarRepositorio();
  return new GenerateConsolidatedInsightsUseCase(repository, criarServicoInsights(config));
}

export async function obterListInsightsUseCase() {
  const repository = await criarRepositorio();
  return new ListInsightsUseCase(repository);
}

export async function obterDeleteInsightsUseCase() {
  const repository = await criarRepositorio();
  return new DeleteInsightsUseCase(repository);
}

export async function obterReportRepository() {
  return criarRepositorio();
}

function obterBrapiToken(): string {
  const token = process.env.BRAPI_TOKEN;
  if (!token) {
    throw new Error("BRAPI_TOKEN não configurado. Obtenha em https://brapi.dev/dashboard");
  }
  return token;
}

export function obterBrapiMarketDataService(): MarketDataService {
  return new BrapiMarketDataService(obterBrapiToken());
}

export function obterBcbMacroDataService(): MacroDataService {
  return new BcbMacroDataService();
}

export function obterBrapiAssetDetailService(): BrapiAssetDetailService {
  return new BrapiAssetDetailService(obterBrapiToken());
}

export async function obterAnalyzeAssetPerformanceUseCase(config: AiConfig) {
  const repository = await criarRepositorio();
  return new AnalyzeAssetPerformanceUseCase(
    repository,
    new AiAssetAnalysisService(criarProvedorAi(config)),
    obterBrapiAssetDetailService(),
    obterBcbMacroDataService(),
  );
}

/**
 * Obtem o repository de conversas do chat (DB-backed).
 */
export async function obterConversaRepository(): Promise<ConversaRepository> {
  return new DbConversaRepository();
}

/**
 * Obtem o repository de itens do plano de acao (DB-backed).
 */
export async function obterPlanoAcaoRepository(): Promise<PlanoAcaoRepository> {
  return new DbPlanoAcaoRepository();
}
