import { DbReportRepository } from "@/infrastructure/repositories/db-report-repository";
import { DbConversaRepository } from "@/infrastructure/repositories/db-conversation-repository";
import { DbPlanoAcaoRepository } from "@/infrastructure/repositories/db-action-plan-repository";
import { DbUserSettingsRepository } from "@/infrastructure/repositories/user-settings-repository";
import { AiPdfExtractionService } from "@/infrastructure/services/ai-pdf-extraction-service";
import { AiTextPdfExtractionService } from "@/infrastructure/services/ai-text-pdf-extraction-service";
import { AiInsightsService } from "@/infrastructure/services/ai-insights-service";
import { UploadReportUseCase } from "@/application/use-cases/upload-report";
import { ListReportsUseCase } from "@/application/use-cases/list-reports";
import { GetReportDetailUseCase } from "@/application/use-cases/get-report-detail";
import { GetDashboardDataUseCase } from "@/application/use-cases/get-dashboard-data";
import { GenerateInsightsUseCase } from "@/application/use-cases/generate-insights";
import { DeleteReportUseCase } from "@/application/use-cases/delete-report";
import { SaveManualReportUseCase } from "@/application/use-cases/save-manual-report";
import { SaveManualInsightsUseCase } from "@/application/use-cases/save-manual-insights";
import { UpdateInsightConclusionUseCase } from "@/application/use-cases/update-insight-conclusion";
import { GenerateConsolidatedInsightsUseCase } from "@/application/use-cases/generate-consolidated-insights";
import { AnalyzeAssetPerformanceUseCase } from "@/application/use-cases/analyze-asset-performance";
import { ListInsightsUseCase } from "@/application/use-cases/list-insights";
import { DeleteInsightsUseCase } from "@/application/use-cases/delete-insights";
import { GetUserSettingsUseCase } from "@/application/use-cases/get-user-settings";
import { UpdateGeminiApiKeyUseCase } from "@/application/use-cases/update-gemini-api-key";
import { UpdateModelTierUseCase } from "@/application/use-cases/update-model-tier";
import { UpdateAiProviderUseCase } from "@/application/use-cases/update-ai-provider";
import { TestGeminiApiKeyUseCase } from "@/application/use-cases/test-gemini-api-key";
import { CheckKeyHealthUseCase } from "@/application/use-cases/check-key-health";
import type { ExtractionService, InsightsService } from "@/domain/interfaces/extraction-service";
import type { ProvedorAi } from "@/domain/interfaces/ai-provider";
import type { MarketDataService, MacroDataService } from "@/domain/interfaces/market-data-service";
import type { ConversaRepository } from "@/domain/interfaces/conversation-repository";
import type { PlanoAcaoRepository } from "@/domain/interfaces/action-plan-repository";
import type { UserSettingsRepository } from "@/domain/interfaces/user-settings-repository";
import { GeminiProvedorAi } from "@/infrastructure/ai/gemini-ai-provider";
import { AnthropicProvedorAi } from "@/infrastructure/ai/anthropic-ai-provider";
import { FallbackProvedorAi } from "@/infrastructure/ai/fallback-ai-provider";
import { resolveModelId, resolveClaudeModelId, DEFAULT_AI_PROVIDER, DEFAULT_CLAUDE_MODEL_TIER } from "@/lib/model-tiers";
import type { AiProvider } from "@/lib/model-tiers";
import { AiAssetAnalysisService } from "@/infrastructure/services/ai-asset-analysis-service";
import { BrapiMarketDataService } from "@/infrastructure/services/brapi-market-data-service";
import { BrapiAssetDetailService } from "@/infrastructure/services/brapi-asset-detail-service";
import { BcbMacroDataService } from "@/infrastructure/services/bcb-macro-data-service";
import { obterPdfStorage } from "@/infrastructure/storage/pdf-storage-factory";
import { auth } from "@/auth";

// ---- AI config type ----

export interface AiConfig {
  provider: AiProvider;
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

// ---- AI provider factories ----

export function isAiConfigured(): boolean {
  return !!process.env.GOOGLE_API_KEY;
}

function obterGoogleApiKey(): string {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "AI features are not available. Set the GOOGLE_API_KEY environment variable to enable them.",
    );
  }
  return apiKey;
}

function criarProvedorAiDireto(config: AiConfig): ProvedorAi {
  if (config.provider === "claude-proxy") {
    const proxyUrl = process.env.CLAUDE_PROXY_URL ?? "http://localhost:3099";
    return new AnthropicProvedorAi(proxyUrl, config.modelId);
  }
  return new GeminiProvedorAi(obterGoogleApiKey(), config.modelId);
}

/**
 * Creates the AI provider for the given config.
 * When Claude is primary and a Gemini API key is available,
 * wraps with FallbackProvedorAi for automatic failover.
 */
export function criarProvedorAi(config: AiConfig): ProvedorAi {
  const primary = criarProvedorAiDireto(config);

  if (config.provider === "claude-proxy" && process.env.GOOGLE_API_KEY) {
    const fallback = new GeminiProvedorAi(
      process.env.GOOGLE_API_KEY,
      resolveModelId(undefined),
    );
    return new FallbackProvedorAi(primary, fallback);
  }

  return primary;
}

function criarServicoExtracao(config: AiConfig): ExtractionService {
  if (config.provider === "claude-proxy") {
    return new AiTextPdfExtractionService(criarProvedorAi(config));
  }
  return new AiPdfExtractionService(criarProvedorAi(config));
}

function criarServicoInsights(config: AiConfig): InsightsService {
  return new AiInsightsService(criarProvedorAi(config));
}

// ---- User AI config resolution ----

function obterUserSettingsRepository(): UserSettingsRepository {
  return new DbUserSettingsRepository();
}

/**
 * Resolves the AI provider config for a given user based on their settings.
 * Falls back to Gemini defaults if the DB query fails.
 */
export async function resolverConfiguracaoAiDoUsuario(userId: string): Promise<AiConfig> {
  try {
    const repo = obterUserSettingsRepository();
    const settings = await repo.getUserSettings(userId);
    const provider = (settings?.aiProvider ?? DEFAULT_AI_PROVIDER) as AiProvider;

    if (provider === "claude-proxy") {
      const tier = settings?.claudeModelTier ?? DEFAULT_CLAUDE_MODEL_TIER;
      return { provider: "claude-proxy", modelId: resolveClaudeModelId(tier) };
    }

    return { provider: "gemini", modelId: resolveModelId(settings?.modelTier) };
  } catch {
    return { provider: DEFAULT_AI_PROVIDER, modelId: DEFAULT_AI_PROVIDER === "claude-proxy" ? resolveClaudeModelId(undefined) : resolveModelId(undefined) };
  }
}

/**
 * @deprecated Use resolverConfiguracaoAiDoUsuario instead.
 */
export async function resolverModeloDoUsuario(userId: string): Promise<string> {
  const config = await resolverConfiguracaoAiDoUsuario(userId);
  return config.modelId;
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

export async function obterSaveManualReportUseCase() {
  const repository = await criarRepositorio();
  return new SaveManualReportUseCase(repository);
}

export async function obterSaveManualInsightsUseCase() {
  const repository = await criarRepositorio();
  return new SaveManualInsightsUseCase(repository);
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

/**
 * Obtem o use case para obter configuracoes de usuario.
 */
export function obterGetUserSettingsUseCase(): GetUserSettingsUseCase {
  return new GetUserSettingsUseCase(obterUserSettingsRepository());
}

/**
 * Obtem o use case para atualizar chave de API Gemini.
 */
export function obterUpdateGeminiApiKeyUseCase(): UpdateGeminiApiKeyUseCase {
  return new UpdateGeminiApiKeyUseCase(obterUserSettingsRepository());
}

/**
 * Obtem o use case para atualizar o tier de modelo do usuario.
 */
export function obterUpdateModelTierUseCase(): UpdateModelTierUseCase {
  return new UpdateModelTierUseCase(obterUserSettingsRepository());
}

/**
 * Obtem o use case para atualizar o provedor de IA.
 */
export function obterUpdateAiProviderUseCase(): UpdateAiProviderUseCase {
  return new UpdateAiProviderUseCase(obterUserSettingsRepository());
}

/**
 * Obtem o use case para testar chave de API Gemini.
 */
export function obterTestGeminiApiKeyUseCase(): TestGeminiApiKeyUseCase {
  return new TestGeminiApiKeyUseCase();
}

/**
 * Obtem o use case para verificar a saude da chave de API armazenada.
 */
export function obterCheckKeyHealthUseCase(): CheckKeyHealthUseCase {
  return new CheckKeyHealthUseCase(obterUserSettingsRepository());
}
