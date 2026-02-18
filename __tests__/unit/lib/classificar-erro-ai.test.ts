import { describe, it, expect } from "vitest";
import { ehErroTransienteDeAi } from "@/lib/classify-ai-error";

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
