import { describe, it, expect } from "vitest";
import {
  AppError,
  PdfParsingError,
  ValidationError,
  FileStorageError,
  AiApiError,
  AiApiTransientError,
  AiApiQuotaError,
  PdfDecryptionError,
  ReportNotFoundError,
  InsightsNotFoundError,
} from "@/domain/errors/app-errors";

describe("AppError hierarchy", () => {
  describe("Given AppError base class", () => {
    it("When created, Then has correct code and message", () => {
      const error = new AppError("test error", "TEST_CODE", true);

      expect(error.message).toBe("test error");
      expect(error.code).toBe("TEST_CODE");
      expect(error.recuperavel).toBe(true);
      expect(error.name).toBe("AppError");
      expect(error).toBeInstanceOf(Error);
    });

    it("When recuperavel is not specified, Then defaults to false", () => {
      const error = new AppError("msg", "CODE");

      expect(error.recuperavel).toBe(false);
    });
  });

  describe("Given PdfParsingError", () => {
    it("When created, Then has PDF_PARSING_ERROR code", () => {
      const error = new PdfParsingError("Could not parse PDF");

      expect(error.code).toBe("PDF_PARSING_ERROR");
      expect(error.name).toBe("PdfParsingError");
      expect(error).toBeInstanceOf(AppError);
    });
  });

  describe("Given ValidationError", () => {
    it("When created, Then has VALIDATION_ERROR code", () => {
      const error = new ValidationError("Invalid field");

      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.name).toBe("ValidationError");
    });
  });

  describe("Given FileStorageError", () => {
    it("When created, Then has FILE_STORAGE_ERROR code", () => {
      const error = new FileStorageError("Disk full");

      expect(error.code).toBe("FILE_STORAGE_ERROR");
      expect(error.name).toBe("FileStorageError");
    });
  });

  describe("Given AiApiError", () => {
    it("When created with recuperavel=true, Then is recoverable", () => {
      const error = new AiApiError("Rate limited", true);

      expect(error.code).toBe("AI_API_ERROR");
      expect(error.recuperavel).toBe(true);
    });

    it("When created without recuperavel, Then defaults to false", () => {
      const error = new AiApiError("Fatal");

      expect(error.recuperavel).toBe(false);
    });
  });

  describe("Given AiApiTransientError", () => {
    it("When created, Then is always recoverable", () => {
      const error = new AiApiTransientError("503 Service Unavailable");

      expect(error.recuperavel).toBe(true);
      expect(error.name).toBe("AiApiTransientError");
      expect(error).toBeInstanceOf(AiApiError);
    });
  });

  describe("Given AiApiQuotaError", () => {
    it("When created, Then is NOT recoverable", () => {
      const error = new AiApiQuotaError("Quota exhausted");

      expect(error.recuperavel).toBe(false);
      expect(error.name).toBe("AiApiQuotaError");
      expect(error).toBeInstanceOf(AiApiError);
    });
  });

  describe("Given PdfDecryptionError", () => {
    it("When created, Then has PDF_DECRYPTION_ERROR code", () => {
      const error = new PdfDecryptionError("Cannot decrypt");

      expect(error.code).toBe("PDF_DECRYPTION_ERROR");
      expect(error.name).toBe("PdfDecryptionError");
    });
  });

  describe("Given ReportNotFoundError", () => {
    it("When created, Then includes the identifier in the message", () => {
      const error = new ReportNotFoundError("report-xyz");

      expect(error.message).toContain("report-xyz");
      expect(error.code).toBe("REPORT_NOT_FOUND");
      expect(error.name).toBe("ReportNotFoundError");
    });
  });

  describe("Given InsightsNotFoundError", () => {
    it("When created, Then includes the identifier in the message", () => {
      const error = new InsightsNotFoundError("insight-abc");

      expect(error.message).toContain("insight-abc");
      expect(error.code).toBe("INSIGHTS_NOT_FOUND");
      expect(error.name).toBe("InsightsNotFoundError");
    });
  });
});
