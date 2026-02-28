import { describe, it, expect } from "vitest";
import { ehErroTransienteDeAi, isQuotaExhaustedError } from "@/lib/classify-ai-error";

describe("ehErroTransienteDeAi", () => {
  describe("erros transientes (retornam true)", () => {
    const casosTransientes = [
      "429 Too Many Requests",
      "Rate limit exceeded",
      "quota exceeded for model",
      "503 Service Unavailable",
      "500 Internal Server Error",
      "502 Bad Gateway",
      "Request timeout",
      "ECONNRESET",
      "ETIMEDOUT",
      "ECONNREFUSED",
      "fetch failed",
      "network error",
      "socket hang up",
      "ENOTFOUND",
      "Error: 429 rate limit",
      "Falha na API Gemini: 503 service unavailable",
    ];

    it.each(casosTransientes)("detecta '%s' como transiente", (mensagem) => {
      expect(ehErroTransienteDeAi(mensagem)).toBe(true);
    });
  });

  describe("erros permanentes (retornam false)", () => {
    const casosPermanentes = [
      "API key invalid",
      "401 Unauthorized",
      "403 Forbidden",
      "400 Bad Request",
      "JSON parse error",
      "Schema validation failed",
      "Dados extraidos nao correspondem ao schema",
      "",
      "Erro desconhecido",
    ];

    it.each(casosPermanentes)(
      "nao detecta '%s' como transiente",
      (mensagem) => {
        expect(ehErroTransienteDeAi(mensagem)).toBe(false);
      },
    );
  });
});

describe("isQuotaExhaustedError", () => {
  describe("Given messages indicating quota/credit exhaustion, When checked, Then returns true", () => {
    const quotaCases = [
      "Resource has been exhausted (e.g. check quota).",
      "Quota exceeded for aiplatform.googleapis.com",
      "exceeded quota for model",
      "billing account not active",
      "insufficient quota remaining",
      "out of quota for this billing period",
      "402 Payment Required",
      "payment required to continue",
    ];

    it.each(quotaCases)("detects '%s' as quota exhausted", (message) => {
      expect(isQuotaExhaustedError(message)).toBe(true);
    });
  });

  describe("Given messages NOT about quota exhaustion, When checked, Then returns false", () => {
    const nonQuotaCases = [
      "429 Too Many Requests",
      "Rate limit exceeded",
      "API key invalid",
      "401 Unauthorized",
      "503 Service Unavailable",
      "network error",
      "timeout",
      "",
      "Generic error message",
    ];

    it.each(nonQuotaCases)("does not detect '%s' as quota exhausted", (message) => {
      expect(isQuotaExhaustedError(message)).toBe(false);
    });
  });
});
