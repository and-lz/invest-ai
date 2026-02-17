/**
 * Migration script: Vercel Blob → PostgreSQL (Neon)
 *
 * Reads all user data from Vercel Blob and inserts into the PostgreSQL database.
 * PDFs stay in Blob — only JSON data (metadata, extracted reports, insights, conversations) is migrated.
 *
 * Usage:
 *   npx tsx scripts/migrate-blob-to-db.ts              # dry-run (default)
 *   npx tsx scripts/migrate-blob-to-db.ts --execute     # actually write to DB
 *
 * Required env vars:
 *   BLOB_READ_WRITE_TOKEN — Vercel Blob access token
 *   DATABASE_URL           — Neon PostgreSQL connection string
 */

import { list } from "@vercel/blob";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/schema";
import { ReportMetadataSchema } from "../src/schemas/report-metadata.schema";
import { RelatorioExtraidoSchema } from "../src/schemas/report-extraction.schema";
import { InsightsResponseSchema } from "../src/schemas/insights.schema";
import { IndiceConversasSchema } from "../src/schemas/conversa.schema";

// ============================================================
// Config
// ============================================================

const isDryRun = !process.argv.includes("--execute");

const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(color: string, prefix: string, message: string) {
  console.log(`${color}[${prefix}]${COLORS.reset} ${message}`);
}

function logSuccess(msg: string) { log(COLORS.green, "OK", msg); }
function logWarn(msg: string) { log(COLORS.yellow, "WARN", msg); }
function logError(msg: string) { log(COLORS.red, "ERROR", msg); }
function logInfo(msg: string) { log(COLORS.cyan, "INFO", msg); }
function logStep(msg: string) { log(COLORS.magenta, "STEP", msg); }

// ============================================================
// DB setup (standalone — does not use src/lib/db.ts to avoid Next.js imports)
// ============================================================

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL not set. Export it before running.");
  }
  const sql = neon(url);
  return drizzle(sql, { schema });
}

// ============================================================
// Blob reading helpers
// ============================================================

async function listAllBlobs(): Promise<{ pathname: string; url: string }[]> {
  const allBlobs: { pathname: string; url: string }[] = [];
  let cursor: string | undefined;
  let page = 0;

  do {
    const result = await list({ cursor, limit: 1000 });
    allBlobs.push(...result.blobs.map((b) => ({ pathname: b.pathname, url: b.url })));
    cursor = result.hasMore ? result.cursor : undefined;
    page++;
    logInfo(`  Listed page ${page}: ${result.blobs.length} blobs (total: ${allBlobs.length})`);
  } while (cursor);

  return allBlobs;
}

async function fetchBlobJson<T>(blobUrl: string): Promise<T> {
  const urlWithCacheBust = `${blobUrl}?t=${Date.now()}`;
  const response = await fetch(urlWithCacheBust, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${blobUrl}: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}


// ============================================================
// User discovery
// ============================================================

function discoverUsers(blobs: { pathname: string }[]): string[] {
  const userIds = new Set<string>();
  for (const blob of blobs) {
    const firstSegment = blob.pathname.split("/")[0];
    if (firstSegment && firstSegment.startsWith("google_")) {
      userIds.add(firstSegment);
    }
  }
  return Array.from(userIds).sort();
}

// ============================================================
// Migration counters
// ============================================================

interface MigrationStats {
  metadata: { success: number; skipped: number; errors: number };
  extracted: { success: number; skipped: number; errors: number };
  insights: { success: number; skipped: number; errors: number };
  conversations: { success: number; skipped: number; errors: number };
}

function emptyStats(): MigrationStats {
  return {
    metadata: { success: 0, skipped: 0, errors: 0 },
    extracted: { success: 0, skipped: 0, errors: 0 },
    insights: { success: 0, skipped: 0, errors: 0 },
    conversations: { success: 0, skipped: 0, errors: 0 },
  };
}

function mergeStats(total: MigrationStats, user: MigrationStats) {
  for (const key of Object.keys(total) as (keyof MigrationStats)[]) {
    total[key].success += user[key].success;
    total[key].skipped += user[key].skipped;
    total[key].errors += user[key].errors;
  }
}

// ============================================================
// Per-user migration
// ============================================================

async function migrateUser(
  db: ReturnType<typeof createDb>,
  userId: string,
  userBlobs: { pathname: string; url: string }[],
): Promise<MigrationStats> {
  const stats = emptyStats();

  // --- 1. Report Metadata ---
  const metadataBlobs = userBlobs.filter(
    (b) => b.pathname.includes("/extracted/") && b.pathname.endsWith("-metadata.json"),
  );

  for (const blob of metadataBlobs) {
    try {
      const raw = await fetchBlobJson<unknown>(blob.url);
      const result = ReportMetadataSchema.safeParse(raw);
      if (!result.success) {
        logWarn(`  Invalid metadata: ${blob.pathname} — ${result.error.message}`);
        stats.metadata.skipped++;
        continue;
      }

      const meta = result.data;
      logInfo(`  Metadata: ${meta.identificador} (${meta.nomeArquivoOriginal})`);

      if (!isDryRun) {
        await db
          .insert(schema.relatoriosMetadados)
          .values({
            identificador: meta.identificador,
            usuarioId: userId,
            mesReferencia: meta.mesReferencia,
            nomeArquivoOriginal: meta.nomeArquivoOriginal,
            caminhoArquivoPdf: meta.caminhoArquivoPdf,
            statusExtracao: meta.statusExtracao,
            origemDados: meta.origemDados,
            erroExtracao: meta.erroExtracao,
            dataUpload: new Date(meta.dataUpload),
          })
          .onConflictDoUpdate({
            target: [schema.relatoriosMetadados.usuarioId, schema.relatoriosMetadados.identificador],
            set: {
              mesReferencia: meta.mesReferencia,
              nomeArquivoOriginal: meta.nomeArquivoOriginal,
              caminhoArquivoPdf: meta.caminhoArquivoPdf,
              statusExtracao: meta.statusExtracao,
              origemDados: meta.origemDados,
              erroExtracao: meta.erroExtracao,
            },
          });
      }
      stats.metadata.success++;
    } catch (err) {
      logError(`  Failed metadata ${blob.pathname}: ${err instanceof Error ? err.message : String(err)}`);
      stats.metadata.errors++;
    }
  }

  // --- 2. Extracted Report Data ---
  const extractedBlobs = userBlobs.filter(
    (b) =>
      b.pathname.includes("/extracted/") &&
      b.pathname.endsWith(".json") &&
      !b.pathname.endsWith("-metadata.json"),
  );

  for (const blob of extractedBlobs) {
    try {
      const raw = await fetchBlobJson<unknown>(blob.url);
      const result = RelatorioExtraidoSchema.safeParse(raw);
      if (!result.success) {
        logWarn(`  Invalid extracted: ${blob.pathname} — ${result.error.message}`);
        stats.extracted.skipped++;
        continue;
      }

      // Extract identificador from pathname: {userId}/extracted/{id}.json
      const filename = blob.pathname.split("/").pop()!;
      const identificador = filename.replace(".json", "");
      logInfo(`  Extracted: ${identificador}`);

      if (!isDryRun) {
        await db
          .insert(schema.relatoriosExtraidos)
          .values({
            identificador,
            usuarioId: userId,
            dados: result.data as unknown as Record<string, unknown>,
            atualizadoEm: new Date(),
          })
          .onConflictDoUpdate({
            target: [schema.relatoriosExtraidos.usuarioId, schema.relatoriosExtraidos.identificador],
            set: {
              dados: result.data as unknown as Record<string, unknown>,
              atualizadoEm: new Date(),
            },
          });
      }
      stats.extracted.success++;
    } catch (err) {
      logError(`  Failed extracted ${blob.pathname}: ${err instanceof Error ? err.message : String(err)}`);
      stats.extracted.errors++;
    }
  }

  // --- 3. Insights ---
  const insightsBlobs = userBlobs.filter(
    (b) => b.pathname.includes("/insights/") && b.pathname.endsWith(".json"),
  );

  for (const blob of insightsBlobs) {
    try {
      const raw = await fetchBlobJson<unknown>(blob.url);
      const result = InsightsResponseSchema.safeParse(raw);
      if (!result.success) {
        logWarn(`  Invalid insights: ${blob.pathname} — ${result.error.message}`);
        stats.insights.skipped++;
        continue;
      }

      const filename = blob.pathname.split("/").pop()!;
      const identificador = filename.replace(".json", "");
      logInfo(`  Insights: ${identificador}`);

      if (!isDryRun) {
        await db
          .insert(schema.relatoriosInsights)
          .values({
            identificador,
            usuarioId: userId,
            dados: result.data as unknown as Record<string, unknown>,
            atualizadoEm: new Date(),
          })
          .onConflictDoUpdate({
            target: [schema.relatoriosInsights.usuarioId, schema.relatoriosInsights.identificador],
            set: {
              dados: result.data as unknown as Record<string, unknown>,
              atualizadoEm: new Date(),
            },
          });
      }
      stats.insights.success++;
    } catch (err) {
      logError(`  Failed insights ${blob.pathname}: ${err instanceof Error ? err.message : String(err)}`);
      stats.insights.errors++;
    }
  }

  // --- 4. Conversations ---
  const conversationBlobs = userBlobs.filter(
    (b) => b.pathname.includes("/conversations/") && b.pathname.endsWith("index.json"),
  );

  for (const blob of conversationBlobs) {
    try {
      const raw = await fetchBlobJson<unknown>(blob.url);
      const result = IndiceConversasSchema.safeParse(raw);
      if (!result.success) {
        logWarn(`  Invalid conversations: ${blob.pathname} — ${result.error.message}`);
        stats.conversations.skipped++;
        continue;
      }

      logInfo(`  Conversations: ${result.data.conversas.length} found`);

      for (const conversa of result.data.conversas) {
        try {
          if (!isDryRun) {
            await db
              .insert(schema.conversas)
              .values({
                identificador: conversa.identificador,
                usuarioId: conversa.usuarioId,
                titulo: conversa.titulo,
                identificadorPagina: conversa.identificadorPagina,
                mensagens: conversa.mensagens as unknown as Record<string, unknown>[],
                criadaEm: new Date(conversa.criadaEm),
                atualizadaEm: new Date(conversa.atualizadaEm),
              })
              .onConflictDoUpdate({
                target: [schema.conversas.identificador],
                set: {
                  titulo: conversa.titulo,
                  mensagens: conversa.mensagens as unknown as Record<string, unknown>[],
                  atualizadaEm: new Date(conversa.atualizadaEm),
                },
              });
          }
          stats.conversations.success++;
        } catch (err) {
          logError(`  Failed conversation ${conversa.identificador}: ${err instanceof Error ? err.message : String(err)}`);
          stats.conversations.errors++;
        }
      }
    } catch (err) {
      logError(`  Failed conversations ${blob.pathname}: ${err instanceof Error ? err.message : String(err)}`);
      stats.conversations.errors++;
    }
  }

  return stats;
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log();
  console.log(`${COLORS.bold}========================================${COLORS.reset}`);
  console.log(`${COLORS.bold} Vercel Blob → PostgreSQL Migration${COLORS.reset}`);
  console.log(`${COLORS.bold}========================================${COLORS.reset}`);
  console.log();

  if (isDryRun) {
    logWarn("DRY-RUN mode — no data will be written to the database.");
    logWarn("Use --execute to perform the actual migration.");
    console.log();
  } else {
    logInfo("EXECUTE mode — data WILL be written to the database.");
    console.log();
  }

  // Validate env vars
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    logError("BLOB_READ_WRITE_TOKEN is not set. Export it before running.");
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    logError("DATABASE_URL is not set. Export it before running.");
    process.exit(1);
  }

  const db = createDb();

  // Step 1: List all blobs
  logStep("1. Listing all blobs from Vercel Blob...");
  const allBlobs = await listAllBlobs();
  logSuccess(`Found ${allBlobs.length} total blobs.`);
  console.log();

  // Step 2: Discover users
  logStep("2. Discovering users...");
  const userIds = discoverUsers(allBlobs);
  logSuccess(`Found ${userIds.length} user(s): ${userIds.join(", ")}`);
  console.log();

  // Step 3: Migrate each user
  const totalStats = emptyStats();

  for (const userId of userIds) {
    logStep(`3. Migrating user: ${COLORS.bold}${userId}${COLORS.reset}`);
    const userBlobs = allBlobs.filter((b) => b.pathname.startsWith(`${userId}/`));
    logInfo(`  ${userBlobs.length} blobs for this user`);

    const userStats = await migrateUser(db, userId, userBlobs);
    mergeStats(totalStats, userStats);

    // Per-user summary
    const parts: string[] = [];
    if (userStats.metadata.success > 0) parts.push(`${userStats.metadata.success} metadata`);
    if (userStats.extracted.success > 0) parts.push(`${userStats.extracted.success} extracted`);
    if (userStats.insights.success > 0) parts.push(`${userStats.insights.success} insights`);
    if (userStats.conversations.success > 0) parts.push(`${userStats.conversations.success} conversations`);
    logSuccess(`  Done: ${parts.join(", ") || "nothing to migrate"}`);
    console.log();
  }

  // Step 4: Summary
  console.log(`${COLORS.bold}========================================${COLORS.reset}`);
  console.log(`${COLORS.bold} Summary${COLORS.reset}`);
  console.log(`${COLORS.bold}========================================${COLORS.reset}`);
  console.log();
  console.log(`  Users:         ${userIds.length}`);
  console.log(`  Metadata:      ${COLORS.green}${totalStats.metadata.success} migrated${COLORS.reset}, ${totalStats.metadata.skipped} skipped, ${totalStats.metadata.errors} errors`);
  console.log(`  Extracted:     ${COLORS.green}${totalStats.extracted.success} migrated${COLORS.reset}, ${totalStats.extracted.skipped} skipped, ${totalStats.extracted.errors} errors`);
  console.log(`  Insights:      ${COLORS.green}${totalStats.insights.success} migrated${COLORS.reset}, ${totalStats.insights.skipped} skipped, ${totalStats.insights.errors} errors`);
  console.log(`  Conversations: ${COLORS.green}${totalStats.conversations.success} migrated${COLORS.reset}, ${totalStats.conversations.skipped} skipped, ${totalStats.conversations.errors} errors`);
  console.log();

  if (isDryRun) {
    logWarn("This was a DRY-RUN. No data was written. Run with --execute to migrate.");
  } else {
    logSuccess("Migration complete!");
  }
}

main().catch((err) => {
  logError(`Fatal: ${err instanceof Error ? err.message : String(err)}`);
  if (err instanceof Error && err.stack) {
    console.error(err.stack);
  }
  process.exit(1);
});
