import { FilesystemReportRepository } from "@/infrastructure/repositories/filesystem-report-repository";
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
import type { ExtractionService, InsightsService } from "@/domain/interfaces/extraction-service";
import type { ProvedorAi } from "@/domain/interfaces/provedor-ai";
import type { MarketDataService, MacroDataService } from "@/domain/interfaces/market-data-service";
import { GeminiProvedorAi } from "@/infrastructure/ai/gemini-provedor-ai";
import { BrapiMarketDataService } from "@/infrastructure/services/brapi-market-data-service";
import { BcbMacroDataService } from "@/infrastructure/services/bcb-macro-data-service";
import path from "path";

const diretorioDados = path.resolve(process.env.DATA_DIRECTORY ?? "./data");

function criarRepositorio() {
  return new FilesystemReportRepository(diretorioDados);
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

export function obterUploadReportUseCase() {
  return new UploadReportUseCase(criarRepositorio(), criarServicoExtracao());
}

export function obterListReportsUseCase() {
  return new ListReportsUseCase(criarRepositorio());
}

export function obterGetReportDetailUseCase() {
  return new GetReportDetailUseCase(criarRepositorio());
}

export function obterGetDashboardDataUseCase() {
  return new GetDashboardDataUseCase(criarRepositorio());
}

export function obterGenerateInsightsUseCase() {
  return new GenerateInsightsUseCase(criarRepositorio(), criarServicoInsights());
}

export function obterDeleteReportUseCase() {
  return new DeleteReportUseCase(criarRepositorio());
}

export function obterSalvarRelatorioManualUseCase() {
  return new SalvarRelatorioManualUseCase(criarRepositorio());
}

export function obterSalvarInsightsManualUseCase() {
  return new SalvarInsightsManualUseCase(criarRepositorio());
}

export function obterAtualizarConclusaoInsightUseCase() {
  return new AtualizarConclusaoInsightUseCase(criarRepositorio());
}

export function obterGenerateInsightsConsolidadosUseCase() {
  return new GenerateInsightsConsolidadosUseCase(criarRepositorio(), criarServicoInsights());
}

export function obterFilesystemReportRepository() {
  return criarRepositorio();
}

function obterBrapiToken(): string {
  const token = process.env.BRAPI_TOKEN;
  if (!token) {
    throw new Error(
      "BRAPI_TOKEN não configurado. Obtenha em https://brapi.dev/dashboard",
    );
  }
  return token;
}

export function obterBrapiMarketDataService(): MarketDataService {
  return new BrapiMarketDataService(obterBrapiToken());
}

export function obterBcbMacroDataService(): MacroDataService {
  return new BcbMacroDataService();
}
