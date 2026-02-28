import { DbReportRepository } from "@/infrastructure/repositories/db-report-repository";
import { DbConversaRepository } from "@/infrastructure/repositories/db-conversation-repository";
import { DbPlanoAcaoRepository } from "@/infrastructure/repositories/db-action-plan-repository";
import { DbUserSettingsRepository } from "@/infrastructure/repositories/user-settings-repository";
import { GeminiPdfExtractionService } from "@/infrastructure/services/gemini-pdf-extraction-service";
import { GeminiInsightsService } from "@/infrastructure/services/gemini-insights-service";
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
import { TestGeminiApiKeyUseCase } from "@/application/use-cases/test-gemini-api-key";
import type { ExtractionService, InsightsService } from "@/domain/interfaces/extraction-service";
import type { ProvedorAi } from "@/domain/interfaces/ai-provider";
import type { MarketDataService, MacroDataService } from "@/domain/interfaces/market-data-service";
import type { ConversaRepository } from "@/domain/interfaces/conversation-repository";
import type { PlanoAcaoRepository } from "@/domain/interfaces/action-plan-repository";
import type { UserSettingsRepository } from "@/domain/interfaces/user-settings-repository";
import { GeminiProvedorAi } from "@/infrastructure/ai/gemini-ai-provider";
import { GeminiAssetAnalysisService } from "@/infrastructure/services/gemini-asset-analysis-service";
import { BrapiMarketDataService } from "@/infrastructure/services/brapi-market-data-service";
import { BrapiAssetDetailService } from "@/infrastructure/services/brapi-asset-detail-service";
import { BcbMacroDataService } from "@/infrastructure/services/bcb-macro-data-service";
import { obterPdfStorage } from "@/infrastructure/storage/pdf-storage-factory";
import { auth } from "@/auth";

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

function obterGoogleApiKey(): string {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_API_KEY não configurada. Obtenha em https://aistudio.google.com/apikey",
    );
  }
  return apiKey;
}

export function criarProvedorAi(): ProvedorAi {
  return new GeminiProvedorAi(obterGoogleApiKey());
}

function criarServicoExtracao(): ExtractionService {
  return new GeminiPdfExtractionService(criarProvedorAi());
}

function criarServicoInsights(): InsightsService {
  return new GeminiInsightsService(criarProvedorAi());
}

export async function obterUploadReportUseCase() {
  const repository = await criarRepositorio();
  return new UploadReportUseCase(repository, criarServicoExtracao());
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

export async function obterGenerateInsightsUseCase() {
  const repository = await criarRepositorio();
  return new GenerateInsightsUseCase(repository, criarServicoInsights());
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

export async function obterGenerateConsolidatedInsightsUseCase() {
  const repository = await criarRepositorio();
  return new GenerateConsolidatedInsightsUseCase(repository, criarServicoInsights());
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

export async function obterAnalyzeAssetPerformanceUseCase() {
  const repository = await criarRepositorio();
  return new AnalyzeAssetPerformanceUseCase(
    repository,
    new GeminiAssetAnalysisService(criarProvedorAi()),
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
 * Obtem o repository de configuracoes de usuario (DB-backed).
 */
function obterUserSettingsRepository(): UserSettingsRepository {
  return new DbUserSettingsRepository();
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
 * Obtem o use case para testar chave de API Gemini.
 */
export function obterTestGeminiApiKeyUseCase(): TestGeminiApiKeyUseCase {
  return new TestGeminiApiKeyUseCase();
}
