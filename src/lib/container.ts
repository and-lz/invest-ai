import { FilesystemReportRepository } from "@/infrastructure/repositories/filesystem-report-repository";
import { ClaudePdfExtractionService } from "@/infrastructure/services/claude-pdf-extraction-service";
import { ClaudeInsightsService } from "@/infrastructure/services/claude-insights-service";
import { UploadReportUseCase } from "@/application/use-cases/upload-report";
import { ListReportsUseCase } from "@/application/use-cases/list-reports";
import { GetReportDetailUseCase } from "@/application/use-cases/get-report-detail";
import { GetDashboardDataUseCase } from "@/application/use-cases/get-dashboard-data";
import { GenerateInsightsUseCase } from "@/application/use-cases/generate-insights";
import { DeleteReportUseCase } from "@/application/use-cases/delete-report";
import { SalvarRelatorioManualUseCase } from "@/application/use-cases/salvar-relatorio-manual";
import { obterClienteAnthropic } from "@/lib/anthropic-client";
import path from "path";

const diretorioDados = path.resolve(process.env.DATA_DIRECTORY ?? "./data");

function criarRepositorio() {
  return new FilesystemReportRepository(diretorioDados);
}

function criarServicoExtracao() {
  return new ClaudePdfExtractionService(obterClienteAnthropic());
}

function criarServicoInsights() {
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
