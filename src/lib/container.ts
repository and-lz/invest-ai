import { DbReportRepository } from "@/infrastructure/repositories/db-report-repository";
import { DbConversaRepository } from "@/infrastructure/repositories/db-conversa-repository";
import { DbPlanoAcaoRepository } from "@/infrastructure/repositories/db-plano-acao-repository";
import { GeminiPdfExtractionService } from "@/infrastructure/services/gemini-pdf-extraction-service";
import { GeminiInsightsService } from "@/infrastructure/services/gemini-insights-service";
import { UploadReportUseCase } from "@/application/use-cases/upload-report";
import { ListReportsUseCase } from "@/application/use-cases/list-reports";
import { GetReportDetailUseCase } from "@/application/use-cases/get-report-detail";
import { GetDashboardDataUseCase } from "@/application/use-cases/get-dashboard-data";
import { GenerateInsightsUseCase } from "@/application/use-cases/generate-insights";
import { DeleteReportUseCase } from "@/application/use-cases/delete-report";
import { SalvarRelatorioManualUseCase } from "@/application/use-cases/salvar-relatorio-manual";
import { SalvarInsightsManualUseCase } from "@/application/use-cases/salvar-insights-manual";
import { AtualizarConclusaoInsightUseCase } from "@/application/use-cases/atualizar-conclusao-insight";
import { GenerateInsightsConsolidadosUseCase } from "@/application/use-cases/generate-insights-consolidados";
import { AnalyzeAssetPerformanceUseCase } from "@/application/use-cases/analyze-asset-performance";
import { ListInsightsUseCase } from "@/application/use-cases/list-insights";
import { DeleteInsightsUseCase } from "@/application/use-cases/delete-insights";
import type { ExtractionService, InsightsService } from "@/domain/interfaces/extraction-service";
import type { ProvedorAi } from "@/domain/interfaces/provedor-ai";
import type { MarketDataService, MacroDataService } from "@/domain/interfaces/market-data-service";
import type { ConversaRepository } from "@/domain/interfaces/conversa-repository";
import type { PlanoAcaoRepository } from "@/domain/interfaces/plano-acao-repository";
import { GeminiProvedorAi } from "@/infrastructure/ai/gemini-provedor-ai";
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

export async function obterSalvarRelatorioManualUseCase() {
  const repository = await criarRepositorio();
  return new SalvarRelatorioManualUseCase(repository);
}

export async function obterSalvarInsightsManualUseCase() {
  const repository = await criarRepositorio();
  return new SalvarInsightsManualUseCase(repository);
}

export async function obterAtualizarConclusaoInsightUseCase() {
  const repository = await criarRepositorio();
  return new AtualizarConclusaoInsightUseCase(repository);
}

export async function obterGenerateInsightsConsolidadosUseCase() {
  const repository = await criarRepositorio();
  return new GenerateInsightsConsolidadosUseCase(repository, criarServicoInsights());
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
