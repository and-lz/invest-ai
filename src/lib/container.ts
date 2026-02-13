import { FilesystemReportRepository } from "@/infrastructure/repositories/filesystem-report-repository";
import { ClaudePdfExtractionService } from "@/infrastructure/services/claude-pdf-extraction-service";
import { ClaudeInsightsService } from "@/infrastructure/services/claude-insights-service";
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
import { obterClienteAnthropic } from "@/lib/anthropic-client";
import type { ExtractionService, InsightsService } from "@/domain/interfaces/extraction-service";
import path from "path";

const diretorioDados = path.resolve(process.env.DATA_DIRECTORY ?? "./data");

/**
 * Provider de IA a ser usado para extração e insights
 * Valores possíveis: "claude" (padrão) ou "gemini"
 *
 * Gemini é recomendado por ter rate limits muito mais generosos (1500 req/dia gratuito)
 * e custo menor que Claude (gratuito no tier free, depois $0.075/1M tokens)
 */
const AI_PROVIDER = (process.env.AI_PROVIDER || "gemini") as "claude" | "gemini";

function criarRepositorio() {
  return new FilesystemReportRepository(diretorioDados);
}

function criarServicoExtracao(): ExtractionService {
  if (AI_PROVIDER === "gemini") {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GOOGLE_API_KEY não configurada. Obtenha em https://aistudio.google.com/apikey",
      );
    }
    console.info("[Container] Usando Gemini para extração de PDFs");
    return new GeminiPdfExtractionService(apiKey);
  }

  console.info("[Container] Usando Claude para extração de PDFs");
  return new ClaudePdfExtractionService(obterClienteAnthropic());
}

function criarServicoInsights(): InsightsService {
  if (AI_PROVIDER === "gemini") {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GOOGLE_API_KEY não configurada. Obtenha em https://aistudio.google.com/apikey",
      );
    }
    console.info("[Container] Usando Gemini para geração de insights");
    return new GeminiInsightsService(apiKey);
  }

  console.info("[Container] Usando Claude para geração de insights");
  return new ClaudeInsightsService(obterClienteAnthropic());
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

export function obterFilesystemReportRepository() {
  return criarRepositorio();
}
