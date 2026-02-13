import { z } from "zod/v4";
import { LocalFileManager } from "@/infrastructure/storage/local-file-manager";
import path from "path";

export const TipoNotificacaoEnum = z.enum(["success", "error", "warning", "info"]);

export const NotificacaoSchema = z.object({
  identificador: z.string().uuid(),
  tipo: TipoNotificacaoEnum,
  titulo: z.string(),
  descricao: z.string().optional(),
  acao: z
    .object({
      rotulo: z.string(),
      url: z.string(),
    })
    .optional(),
  criadaEm: z.string().datetime(),
  visualizada: z.boolean().default(false),
});

export const IndiceNotificacoesSchema = z.object({
  notificacoes: z.array(NotificacaoSchema),
});

// Schema para criação (omite campos gerados automaticamente)
export const CriarNotificacaoSchema = NotificacaoSchema.omit({
  identificador: true,
  criadaEm: true,
  visualizada: true,
});

export type Notificacao = z.infer<typeof NotificacaoSchema>;
export type CriarNotificacao = z.infer<typeof CriarNotificacaoSchema>;
export type TipoNotificacao = z.infer<typeof TipoNotificacaoEnum>;
export type IndiceNotificacoes = z.infer<typeof IndiceNotificacoesSchema>;

const SUBDIRETORIO_NOTIFICACOES = "notifications";
const NOME_ARQUIVO_INDICE = "index.json";
const LIMITE_NOTIFICACOES = 50;

function obterFileManager(): LocalFileManager {
  const diretorioDados = path.resolve(process.env.DATA_DIRECTORY ?? "./data");
  return new LocalFileManager(diretorioDados);
}

export async function listarNotificacoes(): Promise<Notificacao[]> {
  const fileManager = obterFileManager();
  const caminhoRelativo = `${SUBDIRETORIO_NOTIFICACOES}/${NOME_ARQUIVO_INDICE}`;
  const existe = await fileManager.arquivoExiste(caminhoRelativo);

  if (!existe) {
    return [];
  }

  try {
    const dadosBrutos = await fileManager.lerJson<unknown>(caminhoRelativo);
    const resultado = IndiceNotificacoesSchema.safeParse(dadosBrutos);

    if (!resultado.success) {
      console.warn(
        `[Notificacoes] JSON invalido em ${caminhoRelativo}, recreando arquivo`,
        resultado.error,
      );
      return [];
    }

    // Retorna ordenado por mais recente primeiro
    return resultado.data.notificacoes.sort(
      (a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime(),
    );
  } catch (erro) {
    console.error("[Notificacoes] Erro ao ler indice:", erro);
    return [];
  }
}

export async function adicionarNotificacao(
  novaNotificacao: CriarNotificacao,
): Promise<Notificacao> {
  const notificacoesExistentes = await listarNotificacoes();

  const notificacaoCompleta: Notificacao = {
    ...novaNotificacao,
    identificador: crypto.randomUUID(),
    criadaEm: new Date().toISOString(),
    visualizada: false,
  };

  // FIFO queue: adiciona no início, remove do final se exceder limite
  const notificacoesAtualizadas = [notificacaoCompleta, ...notificacoesExistentes].slice(
    0,
    LIMITE_NOTIFICACOES,
  );

  await salvarIndice({ notificacoes: notificacoesAtualizadas });
  return notificacaoCompleta;
}

export async function marcarComoVisualizada(identificador: string): Promise<void> {
  const notificacoes = await listarNotificacoes();
  const notificacoesAtualizadas = notificacoes.map((notificacao) =>
    notificacao.identificador === identificador
      ? { ...notificacao, visualizada: true }
      : notificacao,
  );

  await salvarIndice({ notificacoes: notificacoesAtualizadas });
}

export async function marcarTodasComoVisualizadas(): Promise<void> {
  const notificacoes = await listarNotificacoes();
  const notificacoesAtualizadas = notificacoes.map((notificacao) => ({
    ...notificacao,
    visualizada: true,
  }));

  await salvarIndice({ notificacoes: notificacoesAtualizadas });
}

export async function limparTodasNotificacoes(): Promise<void> {
  await salvarIndice({ notificacoes: [] });
}

async function salvarIndice(indice: IndiceNotificacoes): Promise<void> {
  const fileManager = obterFileManager();
  const caminhoRelativo = `${SUBDIRETORIO_NOTIFICACOES}/${NOME_ARQUIVO_INDICE}`;
  await fileManager.salvarJson(caminhoRelativo, indice);
}
