export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recuperavel: boolean = false,
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

export class AiApiError extends AppError {
  constructor(message: string, recuperavel: boolean = false) {
    super(message, "AI_API_ERROR", recuperavel);
    this.name = "AiApiError";
  }
}

export class AiApiTransientError extends AiApiError {
  constructor(message: string) {
    super(message, /* recuperavel */ true);
    this.name = "AiApiTransientError";
  }
}

export class PdfDecryptionError extends AppError {
  constructor(message: string) {
    super(message, "PDF_DECRYPTION_ERROR");
    this.name = "PdfDecryptionError";
  }
}

export class ReportNotFoundError extends AppError {
  constructor(identificador: string) {
    super(`Relatorio nao encontrado: ${identificador}`, "REPORT_NOT_FOUND");
    this.name = "ReportNotFoundError";
  }
}
