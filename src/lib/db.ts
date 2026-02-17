import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function obterDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL nao configurada. Adicione no .env.local ou nas variaveis de ambiente do Vercel.",
    );
  }
  return url;
}

// Cliente Neon HTTP — compativel com serverless (sem connection pool persistente)
const sql = neon(obterDatabaseUrl());

export const db = drizzle(sql, { schema });
