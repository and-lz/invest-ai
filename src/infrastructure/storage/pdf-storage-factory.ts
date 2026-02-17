import type { PdfStorage } from "./pdf-storage";
import { VercelBlobPdfStorage } from "./vercel-blob-pdf-storage";
import { LocalPdfStorage } from "./local-pdf-storage";
import path from "path";

const diretorioDados = path.resolve(process.env.DATA_DIRECTORY ?? "./data");

/**
 * Retorna a implementacao correta de PdfStorage baseada no ambiente:
 * - Com BLOB_READ_WRITE_TOKEN: usa Vercel Blob (producao e dev com token)
 * - Sem token: usa filesystem local (desenvolvimento)
 */
export function obterPdfStorage(): PdfStorage {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return new VercelBlobPdfStorage();
  }
  return new LocalPdfStorage(diretorioDados);
}
