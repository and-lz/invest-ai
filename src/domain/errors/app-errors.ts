export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class PdfParsingError extends AppError {
  constructor(message: string) {
    super(message, "PDF_PARSING_ERROR");
    this.name = "PdfParsingError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class FileStorageError extends AppError {
  constructor(message: string) {
    super(message, "FILE_STORAGE_ERROR");
    this.name = "FileStorageError";
  }
}

export class ClaudeApiError extends AppError {
  constructor(message: string) {
    super(message, "CLAUDE_API_ERROR");
    this.name = "ClaudeApiError";
  }
}

export class ReportNotFoundError extends AppError {
  constructor(identificador: string) {
    super(`Relatorio nao encontrado: ${identificador}`, "REPORT_NOT_FOUND");
    this.name = "ReportNotFoundError";
  }
}
