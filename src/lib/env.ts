import { z } from "zod/v4";

const EnvironmentSchema = z.object({
  GOOGLE_API_KEY: z.string().min(1, "GOOGLE_API_KEY e obrigatoria"),
  DATA_DIRECTORY: z.string().default("./data"),
});

export function obterConfiguracaoAmbiente() {
  const resultado = EnvironmentSchema.safeParse({
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    DATA_DIRECTORY: process.env.DATA_DIRECTORY,
  });

  if (!resultado.success) {
    throw new Error(`Configuracao de ambiente invalida: ${JSON.stringify(resultado.error.issues)}`);
  }

  return resultado.data;
}

export type EnvironmentConfig = z.infer<typeof EnvironmentSchema>;
