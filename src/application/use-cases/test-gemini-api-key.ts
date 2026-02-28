import { TestGeminiApiKeySchema, TestGeminiKeyResponseSchema } from "@/schemas/user-settings.schema";
import type { TestGeminiKeyResponse } from "@/schemas/user-settings.schema";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { isQuotaExhaustedError } from "@/lib/classify-ai-error";

export class TestGeminiApiKeyUseCase {
  async executar(geminiApiKey: string): Promise<TestGeminiKeyResponse> {
    // Valida o formato da chave
    TestGeminiApiKeySchema.parse({ geminiApiKey });

    try {
      // Tenta criar um cliente Gemini e fazer uma requisicao simples
      const client = new GoogleGenerativeAI(geminiApiKey);
      const model = client.getGenerativeModel({ model: "models/gemini-2.5-flash" });

      // Faz uma chamada simples para testar a chave
      await model.generateContent("test");

      return TestGeminiKeyResponseSchema.parse({
        valid: true,
        message: "Chave de API válida",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";

      // Diferencia entre erro de autenticacao e outros erros
      if (message.includes("401") || message.includes("Invalid API Key") || message.includes("authentication")) {
        return TestGeminiKeyResponseSchema.parse({
          valid: false,
          message: "Chave de API inválida. Verifique e tente novamente.",
        });
      }

      if (isQuotaExhaustedError(message)) {
        return TestGeminiKeyResponseSchema.parse({
          valid: false,
          message: "Esta chave está sem créditos. Adicione créditos no Google AI Studio.",
        });
      }

      return TestGeminiKeyResponseSchema.parse({
        valid: false,
        message: `Erro ao testar chave de API: ${message}`,
      });
    }
  }
}
