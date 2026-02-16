import { PdfDecryptionError } from "@/domain/errors/app-errors";

const CAMINHO_ENTRADA = "/entrada.pdf";
const CAMINHO_SAIDA = "/saida.pdf";

/**
 * Descriptografa um PDF protegido por senha usando qpdf (compilado para WASM).
 * Se o PDF nao estiver protegido, retorna o buffer original.
 * Se estiver protegido e a senha estiver incorreta, lanca erro.
 *
 * Usa dynamic import para carregar o modulo WASM somente quando necessario,
 * evitando impacto no cold start para PDFs sem senha.
 *
 * @param pdfBuffer - Buffer do PDF (potencialmente protegido)
 * @param senha - Senha do PDF (opcional)
 * @returns Buffer do PDF descriptografado
 */
export async function descriptografarPdf(pdfBuffer: Buffer, senha?: string): Promise<Buffer> {
  if (!senha) {
    return pdfBuffer;
  }

  const criarModuloQpdf = (await import("@neslinesli93/qpdf-wasm")).default;

  let saidaErro = "";

  const moduloQpdf = await criarModuloQpdf({
    noInitialRun: true,
    print: () => {
      // suprime stdout do qpdf
    },
    printErr: (texto: string) => {
      saidaErro += texto + "\n";
    },
  });

  try {
    moduloQpdf.FS.writeFile(CAMINHO_ENTRADA, new Uint8Array(pdfBuffer));

    const codigoSaida = moduloQpdf.callMain([
      `--password=${senha}`,
      "--decrypt",
      CAMINHO_ENTRADA,
      CAMINHO_SAIDA,
    ]);

    if (codigoSaida !== 0) {
      const textoErroCompleto = saidaErro.toLowerCase();

      if (verificarErroSenhaIncorreta(textoErroCompleto)) {
        throw new PdfDecryptionError("Senha incorreta. Por favor, verifique a senha do PDF.");
      }

      throw new PdfDecryptionError(
        `Erro ao descriptografar PDF: ${saidaErro.trim() || `codigo de saida ${codigoSaida}`}`,
      );
    }

    const dadosDescriptografados = moduloQpdf.FS.readFile(CAMINHO_SAIDA);

    return Buffer.from(dadosDescriptografados);
  } catch (erro) {
    if (erro instanceof PdfDecryptionError) {
      throw erro;
    }

    const mensagemErro = erro instanceof Error ? erro.message : String(erro);
    const textoErroCompleto = `${mensagemErro} ${saidaErro}`.toLowerCase();

    if (verificarErroSenhaIncorreta(textoErroCompleto)) {
      throw new PdfDecryptionError("Senha incorreta. Por favor, verifique a senha do PDF.");
    }

    throw new PdfDecryptionError(`Erro ao descriptografar PDF: ${mensagemErro}`);
  } finally {
    limparFilesystemVirtual(moduloQpdf);
  }
}

function verificarErroSenhaIncorreta(textoErro: string): boolean {
  return (
    textoErro.includes("invalid password") ||
    textoErro.includes("incorrect password") ||
    textoErro.includes("password is invalid")
  );
}

function limparFilesystemVirtual(
  moduloQpdf: Awaited<ReturnType<(typeof import("@neslinesli93/qpdf-wasm"))["default"]>>,
): void {
  try {
    moduloQpdf.FS.unlink(CAMINHO_ENTRADA);
  } catch {
    // ignora erros de limpeza
  }
  try {
    moduloQpdf.FS.unlink(CAMINHO_SAIDA);
  } catch {
    // ignora erros de limpeza
  }
}
