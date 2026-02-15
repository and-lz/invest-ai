import { describe, it, expect, vi, beforeEach } from "vitest";
import type { TarefaBackground } from "@/lib/tarefa-background";
import { AppError, AiApiTransientError } from "@/domain/errors/app-errors";

// Mock tarefa-background
vi.mock("@/lib/tarefa-background", () => ({
  salvarTarefa: vi.fn(),
  lerTarefa: vi.fn().mockResolvedValue(null), // Retorna null por padrão (tarefa não cancelada)
  descreverTarefa: vi.fn((tarefa: TarefaBackground) => `Mock: ${tarefa.tipo}`),
  TarefaBackgroundSchema: {},
  StatusTarefaEnum: {},
  TipoTarefaEnum: {},
  LABELS_TIPO_TAREFA: {},
}));

// Mock notificacao
vi.mock("@/lib/notificacao", () => ({
  adicionarNotificacao: vi.fn(),
  NotificacaoSchema: {},
  TipoNotificacaoEnum: {},
}));

// Importar apos os mocks
import { executarTarefaEmBackground } from "@/lib/executor-tarefa-background";
import { salvarTarefa } from "@/lib/tarefa-background";
import { adicionarNotificacao } from "@/lib/notificacao";

const mockSalvarTarefa = vi.mocked(salvarTarefa);
const mockAdicionarNotificacao = vi.mocked(adicionarNotificacao);

function criarTarefaBase(overrides?: Partial<TarefaBackground>): TarefaBackground {
  return {
    identificador: "test-uuid-123",
    tipo: "gerar-insights",
    status: "processando",
    iniciadoEm: new Date().toISOString(),
    ...overrides,
  };
}

describe("executarTarefaEmBackground", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("salva tarefa como concluido e cria notificacao de sucesso", async () => {
    const tarefa = criarTarefaBase();

    await executarTarefaEmBackground({
      tarefa,
      rotuloLog: "Test",
      executarOperacao: async () => ({
        descricaoResultado: "Operacao concluida",
        urlRedirecionamento: "/resultado",
      }),
    });

    expect(mockSalvarTarefa).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "concluido",
        descricaoResultado: "Operacao concluida",
        urlRedirecionamento: "/resultado",
        tentativaAtual: 0,
      }),
    );

    expect(mockAdicionarNotificacao).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: "success",
        titulo: expect.stringContaining("concluida"),
        descricao: "Operacao concluida",
        acao: { rotulo: "Ver resultado", url: "/resultado" },
      }),
    );
  });

  it("salva tarefa como erro e cria notificacao de erro para erros nao recuperaveis", async () => {
    const tarefa = criarTarefaBase();

    await executarTarefaEmBackground({
      tarefa,
      rotuloLog: "Test",
      executarOperacao: async () => {
        throw new AppError("API key invalida", "AI_API_ERROR");
      },
    });

    expect(mockSalvarTarefa).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "erro",
        erro: "API key invalida",
        erroRecuperavel: false,
      }),
    );

    expect(mockAdicionarNotificacao).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: "error",
        titulo: expect.stringContaining("erro"),
        descricao: "API key invalida",
      }),
    );
  });

  it("nao retenta para erros nao recuperaveis", async () => {
    const tarefa = criarTarefaBase({ maximoTentativas: 3 });
    const operacaoMock = vi.fn().mockRejectedValue(
      new AppError("Erro permanente", "AI_API_ERROR"),
    );

    await executarTarefaEmBackground({
      tarefa,
      rotuloLog: "Test",
      executarOperacao: operacaoMock,
    });

    // Operacao chamada apenas 1 vez (sem retry)
    expect(operacaoMock).toHaveBeenCalledTimes(1);
  });

  it("retenta para erros transientes e sucede na segunda tentativa", async () => {
    const tarefa = criarTarefaBase({ maximoTentativas: 3 });
    let chamada = 0;

    await executarTarefaEmBackground({
      tarefa,
      rotuloLog: "Test",
      executarOperacao: async () => {
        chamada++;
        if (chamada === 1) {
          throw new AiApiTransientError("429 Too Many Requests");
        }
        return {
          descricaoResultado: "Concluido na segunda tentativa",
        };
      },
    });

    // Operacao chamada 2 vezes
    expect(chamada).toBe(2);

    // Status final: concluido
    const ultimaChamadaSalvar = mockSalvarTarefa.mock.calls.at(-1)?.[0];
    expect(ultimaChamadaSalvar).toMatchObject({
      status: "concluido",
      descricaoResultado: "Concluido na segunda tentativa",
      tentativaAtual: 1,
    });
  });

  it("esgota tentativas para erros transientes persistentes", async () => {
    const tarefa = criarTarefaBase({ maximoTentativas: 2 });
    const operacaoMock = vi.fn().mockRejectedValue(
      new AiApiTransientError("503 Service Unavailable"),
    );

    await executarTarefaEmBackground({
      tarefa,
      rotuloLog: "Test",
      executarOperacao: operacaoMock,
    });

    // Chamada 2 vezes (tentativa 0 falha, tentativa 1 falha, esgotou 2 tentativas)
    expect(operacaoMock).toHaveBeenCalledTimes(2);

    // Status final: erro com flag recuperavel
    const ultimaChamadaSalvar = mockSalvarTarefa.mock.calls.at(-1)?.[0];
    expect(ultimaChamadaSalvar).toMatchObject({
      status: "erro",
      erro: "503 Service Unavailable",
      erroRecuperavel: true,
      tentativaAtual: 2,
    });

    // Notificacao de erro com link de retry
    expect(mockAdicionarNotificacao).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: "error",
        acao: expect.objectContaining({
          rotulo: "Tentar novamente",
          url: `/api/tasks/${tarefa.identificador}/retry`,
        }),
      }),
    );
  });

  it("cria notificacao sem acao quando nao ha urlRedirecionamento", async () => {
    const tarefa = criarTarefaBase();

    await executarTarefaEmBackground({
      tarefa,
      rotuloLog: "Test",
      executarOperacao: async () => ({
        descricaoResultado: "Concluido sem redirect",
      }),
    });

    expect(mockAdicionarNotificacao).toHaveBeenCalledWith(
      expect.objectContaining({
        acao: undefined,
      }),
    );
  });

  it("notificacao de erro sem acao de retry para erros nao recuperaveis", async () => {
    const tarefa = criarTarefaBase();

    await executarTarefaEmBackground({
      tarefa,
      rotuloLog: "Test",
      executarOperacao: async () => {
        throw new Error("Erro generico");
      },
    });

    expect(mockAdicionarNotificacao).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: "error",
        acao: undefined,
      }),
    );
  });

  it("nao lanca excecao se adicionarNotificacao falhar", async () => {
    const tarefa = criarTarefaBase();
    mockAdicionarNotificacao.mockRejectedValueOnce(new Error("Filesystem error"));

    // Nao deve lancar excecao
    await expect(
      executarTarefaEmBackground({
        tarefa,
        rotuloLog: "Test",
        executarOperacao: async () => ({
          descricaoResultado: "OK",
        }),
      }),
    ).resolves.toBeUndefined();

    // Tarefa salva mesmo assim
    expect(mockSalvarTarefa).toHaveBeenCalledWith(
      expect.objectContaining({ status: "concluido" }),
    );
  });

  it("usa maximoTentativas padrao de 2 quando nao especificado", async () => {
    const tarefa = criarTarefaBase(); // sem maximoTentativas
    const operacaoMock = vi.fn().mockRejectedValue(
      new AiApiTransientError("timeout"),
    );

    await executarTarefaEmBackground({
      tarefa,
      rotuloLog: "Test",
      executarOperacao: operacaoMock,
    });

    // Padrao: 2 tentativas
    expect(operacaoMock).toHaveBeenCalledTimes(2);
  });
});
