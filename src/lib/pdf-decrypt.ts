import { decrypt } from "node-qpdf";
import { writeFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import type { Readable } from "stream";

/**
 * Descriptografa um PDF protegido por senha usando qpdf.
 * Se o PDF não estiver protegido, retorna o buffer original.
 * Se estiver protegido e a senha estiver incorreta, lança erro.
 *
 * @param pdfBuffer - Buffer do PDF (potencialmente protegido)
 * @param senha - Senha do PDF (opcional)
 * @returns Buffer do PDF descriptografado
 */
export async function descriptografarPdf(pdfBuffer: Buffer, senha?: string): Promise<Buffer> {
  // Se não tem senha, retorna o buffer original
  // (assume que não está protegido ou que a Claude API vai lidar com isso)
  if (!senha) {
    return pdfBuffer;
  }

  const arquivoEntradaTemp = join(tmpdir(), `input-${Date.now()}-${Math.random()}.pdf`);

  try {
    // Escreve o PDF de entrada em arquivo temporário
    writeFileSync(arquivoEntradaTemp, pdfBuffer);

    // Usa qpdf para remover a senha do PDF
    // O decrypt retorna um stream que precisamos coletar
    const pdfDescriptografado = await new Promise<Buffer>((resolve, reject) => {
      const stream = decrypt(arquivoEntradaTemp, senha) as Readable;
      const chunks: Buffer[] = [];
      let houveErroFatal = false;

      stream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      stream.on("end", () => {
        // Se não houve erro fatal e temos chunks, sucesso
        if (!houveErroFatal && chunks.length > 0) {
          resolve(Buffer.concat(chunks));
        } else if (chunks.length === 0) {
          reject(new Error("PDF vazio ou senha incorreta"));
        } else {
          reject(new Error("Erro ao processar PDF"));
        }
      });

      stream.on("error", (erro: Error) => {
        const mensagem = erro.message || String(erro);

        // WARNINGs do qpdf são apenas avisos, não erros fatais
        if (mensagem.includes("WARNING:")) {
          // Continua processando
          return;
        }

        // Erro real
        houveErroFatal = true;
        reject(erro);
      });
    });

    return pdfDescriptografado;
  } catch (erro) {
    const mensagemErro = erro instanceof Error ? erro.message : String(erro);

    // Ignora WARNINGs do qpdf (são apenas avisos, não erros)
    if (mensagemErro.includes("WARNING:")) {
      // Se for só um warning, retorna o buffer original
      return pdfBuffer;
    }

    // Verifica se é erro de comando não encontrado
    if (
      mensagemErro.toLowerCase().includes("spawn qpdf enoent") ||
      mensagemErro.toLowerCase().includes("command not found") ||
      mensagemErro.toLowerCase().includes("no such file")
    ) {
      throw new Error("qpdf não está instalado no sistema. Instale com: brew install qpdf");
    }

    // Verifica se o erro é de senha incorreta
    if (
      mensagemErro.toLowerCase().includes("invalid password") ||
      mensagemErro.toLowerCase().includes("incorrect password") ||
      mensagemErro.toLowerCase().includes("password is invalid")
    ) {
      throw new Error("Senha incorreta. Por favor, verifique a senha do PDF.");
    }

    // Retorna o erro original para debug
    throw new Error(`Erro ao descriptografar PDF: ${mensagemErro}`);
  } finally {
    // Limpa arquivo temporário de entrada
    try {
      unlinkSync(arquivoEntradaTemp);
    } catch {
      // Ignora erros ao limpar arquivo
    }
  }
}
