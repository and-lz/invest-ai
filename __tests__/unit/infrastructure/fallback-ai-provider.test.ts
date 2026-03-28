import { describe, it, expect, vi } from "vitest";
import { FallbackProvedorAi } from "@/infrastructure/ai/fallback-ai-provider";
import type { ProvedorAi, ConfiguracaoGeracao, RespostaAi } from "@/domain/interfaces/ai-provider";
import { AiApiError, AiApiTransientError, AiApiQuotaError } from "@/domain/errors/app-errors";

// ---- Helpers ----

function createMockConfig(): ConfiguracaoGeracao {
  return {
    instrucaoSistema: "You are a test assistant",
    mensagens: [{ papel: "usuario", partes: [{ tipo: "texto", dados: "Hello" }] }],
  };
}

function createMockResponse(text: string): RespostaAi {
  return { texto: text, tokensEntrada: 10, tokensSaida: 20 };
}

function createMockProvider(overrides: Partial<ProvedorAi> = {}): ProvedorAi {
  return {
    gerar: vi.fn().mockResolvedValue(createMockResponse("primary response")),
    transmitir: vi.fn().mockImplementation(async function* () {
      yield "primary ";
      yield "stream";
    }),
    ...overrides,
  };
}

// ---- Tests ----

describe("FallbackProvedorAi", () => {
  describe("gerar()", () => {
    it("Given primary succeeds, When gerar is called, Then returns primary result without calling fallback", async () => {
      const primary = createMockProvider();
      const fallback = createMockProvider({
        gerar: vi.fn().mockResolvedValue(createMockResponse("fallback response")),
      });

      const provider = new FallbackProvedorAi(primary, fallback);
      const result = await provider.gerar(createMockConfig());

      expect(result.texto).toBe("primary response");
      expect(fallback.gerar).not.toHaveBeenCalled();
    });

    it("Given primary fails with transient error AND fallback exists, When gerar is called, Then returns fallback result", async () => {
      const primary = createMockProvider({
        gerar: vi.fn().mockRejectedValue(new AiApiTransientError("proxy down")),
      });
      const fallback = createMockProvider({
        gerar: vi.fn().mockResolvedValue(createMockResponse("fallback response")),
      });

      const provider = new FallbackProvedorAi(primary, fallback);
      const result = await provider.gerar(createMockConfig());

      expect(result.texto).toBe("fallback response");
    });

    it("Given primary fails with generic error AND fallback exists, When gerar is called, Then returns fallback result", async () => {
      const primary = createMockProvider({
        gerar: vi.fn().mockRejectedValue(new AiApiError("some error")),
      });
      const fallback = createMockProvider({
        gerar: vi.fn().mockResolvedValue(createMockResponse("fallback response")),
      });

      const provider = new FallbackProvedorAi(primary, fallback);
      const result = await provider.gerar(createMockConfig());

      expect(result.texto).toBe("fallback response");
    });

    it("Given primary fails AND no fallback, When gerar is called, Then throws original error", async () => {
      const originalError = new AiApiTransientError("proxy down");
      const primary = createMockProvider({
        gerar: vi.fn().mockRejectedValue(originalError),
      });

      const provider = new FallbackProvedorAi(primary, null);

      await expect(provider.gerar(createMockConfig())).rejects.toThrow(originalError);
    });

    it("Given primary fails AND fallback also fails, When gerar is called, Then throws fallback error", async () => {
      const primary = createMockProvider({
        gerar: vi.fn().mockRejectedValue(new AiApiTransientError("proxy down")),
      });
      const fallbackError = new AiApiError("gemini failed too");
      const fallback = createMockProvider({
        gerar: vi.fn().mockRejectedValue(fallbackError),
      });

      const provider = new FallbackProvedorAi(primary, fallback);

      await expect(provider.gerar(createMockConfig())).rejects.toThrow(fallbackError);
    });

    it("Given primary fails with quota error, When gerar is called, Then does NOT fall back", async () => {
      const quotaError = new AiApiQuotaError("quota exceeded");
      const primary = createMockProvider({
        gerar: vi.fn().mockRejectedValue(quotaError),
      });
      const fallback = createMockProvider({
        gerar: vi.fn().mockResolvedValue(createMockResponse("fallback")),
      });

      const provider = new FallbackProvedorAi(primary, fallback);

      await expect(provider.gerar(createMockConfig())).rejects.toThrow(quotaError);
      expect(fallback.gerar).not.toHaveBeenCalled();
    });
  });

  describe("transmitir()", () => {
    it("Given primary stream succeeds, When transmitir is called, Then yields primary chunks", async () => {
      const primary = createMockProvider();
      const fallback = createMockProvider();

      const provider = new FallbackProvedorAi(primary, fallback);
      const chunks: string[] = [];

      for await (const chunk of provider.transmitir(createMockConfig())) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(["primary ", "stream"]);
    });

    it("Given primary stream fails before first chunk AND fallback exists, When transmitir is called, Then yields fallback chunks", async () => {
      const primary = createMockProvider({
        transmitir: vi.fn().mockImplementation(async function* () {
          throw new AiApiTransientError("connection refused");
        }),
      });
      const fallback = createMockProvider({
        transmitir: vi.fn().mockImplementation(async function* () {
          yield "fallback ";
          yield "stream";
        }),
      });

      const provider = new FallbackProvedorAi(primary, fallback);
      const chunks: string[] = [];

      for await (const chunk of provider.transmitir(createMockConfig())) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(["fallback ", "stream"]);
    });

    it("Given primary stream fails AND no fallback, When transmitir is called, Then throws original error", async () => {
      const primary = createMockProvider({
        transmitir: vi.fn().mockImplementation(async function* () {
          throw new AiApiTransientError("proxy down");
        }),
      });

      const provider = new FallbackProvedorAi(primary, null);
      const chunks: string[] = [];

      await expect(async () => {
        for await (const chunk of provider.transmitir(createMockConfig())) {
          chunks.push(chunk);
        }
      }).rejects.toThrow("proxy down");
    });

    it("Given primary stream fails with quota error, When transmitir is called, Then does NOT fall back", async () => {
      const primary = createMockProvider({
        transmitir: vi.fn().mockImplementation(async function* () {
          throw new AiApiQuotaError("quota exceeded");
        }),
      });
      const fallback = createMockProvider({
        transmitir: vi.fn().mockImplementation(async function* () {
          yield "fallback";
        }),
      });

      const provider = new FallbackProvedorAi(primary, fallback);

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const _chunk of provider.transmitir(createMockConfig())) {
          // consume
        }
      }).rejects.toThrow("quota exceeded");
    });
  });
});
