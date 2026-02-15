import { describe, it, expect, vi, beforeEach } from "vitest";
import { PdfDecryptionError } from "@/domain/errors/app-errors";

vi.mock("@neslinesli93/qpdf-wasm", () => ({
  default: vi.fn(),
}));

function criarModuloSimulado(opcoes?: {
  codigoSaida?: number;
  dadosSaida?: Uint8Array;
  erroNoCallMain?: Error;
}) {
  const codigoSaida = opcoes?.codigoSaida ?? 0;
  const dadosSaida = opcoes?.dadosSaida ?? new Uint8Array([1, 2, 3, 4]);

  return {
    callMain: vi.fn().mockImplementation(() => {
      if (opcoes?.erroNoCallMain) {
        throw opcoes.erroNoCallMain;
      }
      return codigoSaida;
    }),
    FS: {
      writeFile: vi.fn(),
      readFile: vi.fn().mockReturnValue(dadosSaida),
      unlink: vi.fn(),
      mkdir: vi.fn(),
      mount: vi.fn(),
      unmount: vi.fn(),
    },
    WORKERFS: {},
  };
}

describe("descriptografarPdf", () => {
  let criarModuloQpdfMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const modulo = await import("@neslinesli93/qpdf-wasm");
    criarModuloQpdfMock = modulo.default as unknown as ReturnType<typeof vi.fn>;
  });

  it("retorna buffer original quando nao ha senha", async () => {
    const { descriptografarPdf } = await import("@/lib/pdf-decrypt");
    const bufferOriginal = Buffer.from("conteudo-pdf");

    const resultado = await descriptografarPdf(bufferOriginal);

    expect(resultado).toBe(bufferOriginal);
    expect(criarModuloQpdfMock).not.toHaveBeenCalled();
  });

  it("retorna buffer original quando senha e undefined", async () => {
    const { descriptografarPdf } = await import("@/lib/pdf-decrypt");
    const bufferOriginal = Buffer.from("conteudo-pdf");

    const resultado = await descriptografarPdf(bufferOriginal, undefined);

    expect(resultado).toBe(bufferOriginal);
    expect(criarModuloQpdfMock).not.toHaveBeenCalled();
  });

  it("retorna buffer original quando senha e string vazia", async () => {
    const { descriptografarPdf } = await import("@/lib/pdf-decrypt");
    const bufferOriginal = Buffer.from("conteudo-pdf");

    const resultado = await descriptografarPdf(bufferOriginal, "");

    expect(resultado).toBe(bufferOriginal);
    expect(criarModuloQpdfMock).not.toHaveBeenCalled();
  });

  it("descriptografa PDF com senha correta", async () => {
    const { descriptografarPdf } = await import("@/lib/pdf-decrypt");
    const pdfDescriptografadoSimulado = new Uint8Array([10, 20, 30, 40]);
    const moduloSimulado = criarModuloSimulado({
      dadosSaida: pdfDescriptografadoSimulado,
    });
    criarModuloQpdfMock.mockResolvedValue(moduloSimulado);

    const resultado = await descriptografarPdf(
      Buffer.from("pdf-encriptado"),
      "senha123",
    );

    expect(resultado).toEqual(Buffer.from(pdfDescriptografadoSimulado));
    expect(moduloSimulado.callMain).toHaveBeenCalledWith([
      "--password=senha123",
      "--decrypt",
      "/entrada.pdf",
      "/saida.pdf",
    ]);
  });

  it("escreve o buffer de entrada no filesystem virtual", async () => {
    const { descriptografarPdf } = await import("@/lib/pdf-decrypt");
    const moduloSimulado = criarModuloSimulado();
    criarModuloQpdfMock.mockResolvedValue(moduloSimulado);

    const bufferEntrada = Buffer.from("dados-pdf");
    await descriptografarPdf(bufferEntrada, "senha");

    expect(moduloSimulado.FS.writeFile).toHaveBeenCalledWith(
      "/entrada.pdf",
      expect.any(Uint8Array),
    );
    const primeiraChamada = moduloSimulado.FS.writeFile.mock.calls[0];
    expect(primeiraChamada).toBeDefined();
    const uint8Escrito = primeiraChamada![1] as Uint8Array;
    expect(Buffer.from(uint8Escrito)).toEqual(bufferEntrada);
  });

  it("lanca PdfDecryptionError para senha incorreta via codigo de saida", async () => {
    const { descriptografarPdf } = await import("@/lib/pdf-decrypt");
    const moduloSimulado = criarModuloSimulado({ codigoSaida: 2 });
    criarModuloQpdfMock.mockResolvedValue(moduloSimulado);

    // Simula stderr do qpdf com mensagem de senha invalida
    criarModuloQpdfMock.mockImplementation(async (opcoes: { printErr?: (texto: string) => void }) => {
      opcoes?.printErr?.("qpdf: invalid password");
      return moduloSimulado;
    });

    await expect(
      descriptografarPdf(Buffer.from("pdf-encriptado"), "senhaErrada"),
    ).rejects.toThrow(PdfDecryptionError);

    await expect(
      descriptografarPdf(Buffer.from("pdf-encriptado"), "senhaErrada"),
    ).rejects.toThrow("Senha incorreta");
  });

  it("lanca PdfDecryptionError para senha incorreta via excecao", async () => {
    const { descriptografarPdf } = await import("@/lib/pdf-decrypt");
    const moduloSimulado = criarModuloSimulado({
      erroNoCallMain: new Error("invalid password supplied"),
    });
    criarModuloQpdfMock.mockResolvedValue(moduloSimulado);

    await expect(
      descriptografarPdf(Buffer.from("pdf-encriptado"), "senhaErrada"),
    ).rejects.toThrow("Senha incorreta");
  });

  it("lanca PdfDecryptionError com detalhes para erro generico", async () => {
    const { descriptografarPdf } = await import("@/lib/pdf-decrypt");
    const moduloSimulado = criarModuloSimulado({
      erroNoCallMain: new Error("unexpected internal error"),
    });
    criarModuloQpdfMock.mockResolvedValue(moduloSimulado);

    await expect(
      descriptografarPdf(Buffer.from("pdf-encriptado"), "senha"),
    ).rejects.toThrow("Erro ao descriptografar PDF: unexpected internal error");
  });

  it("lanca PdfDecryptionError para codigo de saida nao-zero sem stderr", async () => {
    const { descriptografarPdf } = await import("@/lib/pdf-decrypt");
    const moduloSimulado = criarModuloSimulado({ codigoSaida: 3 });
    criarModuloQpdfMock.mockResolvedValue(moduloSimulado);

    await expect(
      descriptografarPdf(Buffer.from("pdf-encriptado"), "senha"),
    ).rejects.toThrow("codigo de saida 3");
  });

  it("limpa filesystem virtual apos sucesso", async () => {
    const { descriptografarPdf } = await import("@/lib/pdf-decrypt");
    const moduloSimulado = criarModuloSimulado();
    criarModuloQpdfMock.mockResolvedValue(moduloSimulado);

    await descriptografarPdf(Buffer.from("pdf-encriptado"), "senha");

    expect(moduloSimulado.FS.unlink).toHaveBeenCalledWith("/entrada.pdf");
    expect(moduloSimulado.FS.unlink).toHaveBeenCalledWith("/saida.pdf");
  });

  it("limpa filesystem virtual apos erro", async () => {
    const { descriptografarPdf } = await import("@/lib/pdf-decrypt");
    const moduloSimulado = criarModuloSimulado({
      erroNoCallMain: new Error("falha generica"),
    });
    criarModuloQpdfMock.mockResolvedValue(moduloSimulado);

    await expect(
      descriptografarPdf(Buffer.from("pdf-encriptado"), "senha"),
    ).rejects.toThrow();

    expect(moduloSimulado.FS.unlink).toHaveBeenCalledWith("/entrada.pdf");
    expect(moduloSimulado.FS.unlink).toHaveBeenCalledWith("/saida.pdf");
  });

  it("inicializa modulo WASM com noInitialRun", async () => {
    const { descriptografarPdf } = await import("@/lib/pdf-decrypt");
    const moduloSimulado = criarModuloSimulado();
    criarModuloQpdfMock.mockResolvedValue(moduloSimulado);

    await descriptografarPdf(Buffer.from("pdf"), "senha");

    expect(criarModuloQpdfMock).toHaveBeenCalledWith(
      expect.objectContaining({ noInitialRun: true }),
    );
  });
});
