import { z } from "zod/v4";

const EnvironmentSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, "ANTHROPIC_API_KEY e obrigatoria"),
  DATA_DIRECTORY: z.string().default("./data"),
});

export function obterConfiguracaoAmbiente() {
  const resultado = EnvironmentSchema.safeParse({
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    DATA_DIRECTORY: process.env.DATA_DIRECTORY,
  });

  if (!resultado.success) {
    throw new Error(
      `Configuracao de ambiente invalida: ${JSON.stringify(resultado.error.issues)}`,
    );
  }

  return resultado.data;
}

export type EnvironmentConfig = z.infer<typeof EnvironmentSchema>;
