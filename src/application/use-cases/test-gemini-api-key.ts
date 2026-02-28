import { TestGeminiApiKeySchema, TestGeminiKeyResponseSchema } from "@/schemas/user-settings.schema";
import type { TestGeminiKeyResponse } from "@/schemas/user-settings.schema";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
        message: "API key is valid",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      // Diferencia entre erro de autenticacao e outros erros
      if (message.includes("401") || message.includes("Invalid API Key") || message.includes("authentication")) {
        return TestGeminiKeyResponseSchema.parse({
          valid: false,
          message: "Invalid API key. Please check and try again.",
        });
      }

      return TestGeminiKeyResponseSchema.parse({
        valid: false,
        message: `Error testing API key: ${message}`,
      });
    }
  }
}
