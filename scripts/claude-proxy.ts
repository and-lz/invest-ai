/**
 * Claude Code Local Proxy
 *
 * Exposes an Anthropic-compatible HTTP API backed by the local `claude` CLI.
 * Personal use only — routes requests through your Claude Code subscription.
 * Supports model selection via the `model` field in the request body.
 *
 * Features:
 *   - Real token-by-token streaming via `--output-format stream-json`
 *   - Request body size limit (100KB)
 *   - Concurrent request limit (3)
 *   - CORS restricted to localhost
 *
 * Usage:
 *   npm run proxy
 *   PROXY_PORT=3099 npm run proxy
 *
 * Endpoints:
 *   POST /v1/messages  — Anthropic Messages API
 *   GET  /v1/models    — Model listing (static)
 *   GET  /health       — Liveness check
 *   GET  /stats        — Health + request history (in-memory ring buffer)
 */

import http from "node:http";
import { execSync, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import readline from "node:readline";

// ============================================================
// Config
// ============================================================

const PORT = parseInt(process.env["PROXY_PORT"] ?? "3099", 10);
const HOST = "127.0.0.1";
const MAX_BODY_SIZE = 100 * 1024; // 100KB
const MAX_CONCURRENT_REQUESTS = 3;

/** CLI flags shared by all invocations — reduces overhead and token count. */
const SHARED_CLI_FLAGS = ["--no-session-persistence", "--tools", ""];

const COLORS = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

// ============================================================
// Request log (in-memory ring buffer)
// ============================================================

const MAX_LOG_ENTRIES = 200;
const requestLog: RequestLogEntry[] = [];
let totalRequests = 0;
let activeRequests = 0;
const startedAt = Date.now();

function recordRequest(entry: RequestLogEntry): void {
  totalRequests++;
  requestLog.unshift(entry); // most recent first
  if (requestLog.length > MAX_LOG_ENTRIES) {
    requestLog.length = MAX_LOG_ENTRIES;
  }
}

// ============================================================
// Types
// ============================================================

interface ContentBlock {
  type: string;
  text?: string;
}

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

interface AnthropicRequest {
  model?: string;
  messages: AnthropicMessage[];
  system?: string | ContentBlock[];
  max_tokens?: number;
  stream?: boolean;
}

interface RequestLogEntry {
  timestamp: string;
  method: string;
  url: string;
  model: string | null;
  statusCode: number;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
}

interface ClaudeJsonOutput {
  type: string;
  subtype: string;
  is_error: boolean;
  result: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
    [key: string]: unknown;
  };
  modelUsage?: Record<
    string,
    { inputTokens?: number; outputTokens?: number }
  >;
}

/** A single line from `--output-format stream-json --include-partial-messages` */
interface StreamJsonLine {
  type: string;
  subtype?: string;
  event?: {
    type: string;
    message?: { model?: string; usage?: Record<string, unknown> };
    delta?: { type?: string; text?: string; stop_reason?: string };
    index?: number;
    content_block?: { type: string; text?: string };
    usage?: Record<string, unknown>;
    [key: string]: unknown;
  };
  // Fields from the final "result" line
  is_error?: boolean;
  result?: string;
  stop_reason?: string;
  usage?: { input_tokens: number; output_tokens: number; [key: string]: unknown };
  modelUsage?: Record<string, { inputTokens?: number; outputTokens?: number }>;
  // Error info from assistant messages
  error?: string;
}

// ============================================================
// Startup check
// ============================================================

function checkClaudeCli(): void {
  try {
    const version = execSync("claude --version", { encoding: "utf8" }).trim();
    console.log(
      `${COLORS.green}✓${COLORS.reset} claude CLI found: ${COLORS.dim}${version}${COLORS.reset}`
    );
  } catch {
    console.error(
      `${COLORS.red}✗ claude CLI not found on PATH${COLORS.reset}`
    );
    console.error(`  Install Claude Code: https://claude.ai/code`);
    process.exit(1);
  }
}

// ============================================================
// Prompt construction
// ============================================================

function extractText(content: string | ContentBlock[]): string {
  if (typeof content === "string") return content;
  return content
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text ?? "")
    .join("\n");
}

function buildPrompt(messages: AnthropicMessage[]): string {
  if (messages.length === 1) {
    const msg = messages[0];
    if (!msg) return "";
    return extractText(msg.content);
  }

  // Multi-turn: use XML tags so Claude treats history as structured conversation
  const history = messages.slice(0, -1);
  const last = messages[messages.length - 1];
  if (!last) return "";

  const historyXml = history
    .map((m) => `<turn role="${m.role}">\n${extractText(m.content)}\n</turn>`)
    .join("\n");

  return `<conversation_history>\n${historyXml}\n</conversation_history>\n\n${extractText(last.content)}`;
}

function extractSystemPrompt(
  system: string | ContentBlock[] | undefined
): string | null {
  if (!system) return null;
  const text = extractText(system);
  return text.trim() || null;
}

// ============================================================
// CLI invocation
// ============================================================

/**
 * Maps an Anthropic model ID to the `claude` CLI --model flag shorthand.
 * Defaults to "opus" for unknown / missing models.
 */
function resolveCliModel(modelId: string | undefined): string {
  switch (modelId) {
    case "claude-haiku-4-5":
      return "haiku";
    case "claude-sonnet-4-5":
      return "sonnet";
    case "claude-opus-4-6":
    default:
      return "opus";
  }
}

/** Build CLI args shared between streaming and non-streaming invocations. */
function buildBaseCliArgs(
  systemPrompt: string | null,
  modelId?: string,
): string[] {
  const cliModel = resolveCliModel(modelId);
  const args = ["-p", "--model", cliModel, ...SHARED_CLI_FLAGS];
  if (systemPrompt) {
    args.push("--system-prompt", systemPrompt);
  }
  return args;
}

/**
 * Non-streaming CLI invocation. Waits for full response, returns parsed JSON.
 * Used for `stream: false` requests.
 */
async function invokeClaudeCli(
  prompt: string,
  systemPrompt: string | null,
  modelId?: string
): Promise<ClaudeJsonOutput> {
  return new Promise((resolve, reject) => {
    const args = [...buildBaseCliArgs(systemPrompt, modelId), "--output-format", "json", prompt];

    const child = spawn("claude", args, {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      if (code !== 0 && !stdout) {
        reject(
          new Error(`claude exited with code ${code}: ${stderr.trim()}`)
        );
        return;
      }

      try {
        const parsed = JSON.parse(stdout.trim()) as ClaudeJsonOutput;
        resolve(parsed);
      } catch {
        reject(
          new Error(
            `Failed to parse claude output: ${stdout.slice(0, 200)}`
          )
        );
      }
    });

    child.on("error", (err) => {
      reject(new Error(`Failed to spawn claude: ${err.message}`));
    });
  });
}

// ============================================================
// Response formatting (non-streaming)
// ============================================================

function buildAnthropicResponse(cliOutput: ClaudeJsonOutput) {
  const modelName =
    Object.keys(cliOutput.modelUsage ?? {})[0] ?? "claude-opus-4-6";

  return {
    id: `msg_${randomUUID().replace(/-/g, "").slice(0, 24)}`,
    type: "message",
    role: "assistant",
    content: [{ type: "text", text: cliOutput.result.trim() }],
    model: modelName,
    stop_reason: cliOutput.stop_reason ?? "end_turn",
    stop_sequence: null,
    usage: {
      input_tokens: cliOutput.usage?.input_tokens ?? 0,
      output_tokens: cliOutput.usage?.output_tokens ?? 0,
    },
  };
}

// ============================================================
// HTTP helpers
// ============================================================

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_SIZE) {
        reject(new BodyTooLargeError());
        req.destroy();
        return;
      }
      body += chunk.toString();
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

class BodyTooLargeError extends Error {
  constructor() {
    super("Request body exceeds maximum size");
    this.name = "BodyTooLargeError";
  }
}

/** Check if an origin is from localhost. */
function isLocalhostOrigin(origin: string | undefined): boolean {
  if (!origin) return true; // no origin header = same-origin or non-browser
  try {
    const url = new URL(origin);
    return url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function getCorsHeaders(origin: string | undefined): Record<string, string> {
  if (!isLocalhostOrigin(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin ?? "http://localhost:3000",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, x-api-key, anthropic-version",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

function sendJson(
  res: http.ServerResponse,
  status: number,
  body: unknown,
  origin?: string
): void {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(json),
    ...getCorsHeaders(origin),
  });
  res.end(json);
}

// ============================================================
// SSE streaming helpers
// ============================================================

function sendSseEvent(
  res: http.ServerResponse,
  eventType: string,
  data: unknown
): void {
  res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
}

// ============================================================
// Route handlers
// ============================================================

function parsePayload(rawBody: string, res: http.ServerResponse, origin?: string): AnthropicRequest | null {
  let payload: AnthropicRequest;
  try {
    payload = JSON.parse(rawBody) as AnthropicRequest;
  } catch {
    sendJson(res, 400, {
      error: { type: "invalid_request_error", message: "Invalid JSON body" },
    }, origin);
    return null;
  }

  if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
    sendJson(res, 400, {
      error: {
        type: "invalid_request_error",
        message: "messages must be a non-empty array",
      },
    }, origin);
    return null;
  }

  return payload;
}

/**
 * Handle streaming request — spawn CLI with `stream-json` and pipe real
 * token-by-token SSE events directly to the client.
 */
async function handleMessagesStream(
  payload: AnthropicRequest,
  res: http.ServerResponse,
  origin?: string,
): Promise<void> {
  const prompt = buildPrompt(payload.messages);
  const systemPrompt = extractSystemPrompt(payload.system);
  const start = Date.now();

  const args = [
    ...buildBaseCliArgs(systemPrompt, payload.model),
    "--output-format", "stream-json",
    "--verbose",
    "--include-partial-messages",
    prompt,
  ];

  const child = spawn("claude", args, {
    stdio: ["ignore", "pipe", "pipe"],
  });

  // Kill CLI process if client disconnects
  let clientDisconnected = false;
  res.on("close", () => {
    clientDisconnected = true;
    child.kill("SIGTERM");
  });

  // Start SSE response immediately
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    ...getCorsHeaders(origin),
  });

  // Track usage from the result line for logging
  let inputTokens = 0;
  let outputTokens = 0;
  let modelName = payload.model ?? "claude-opus-4-6";
  let hadError = false;

  // Parse NDJSON from CLI stdout line by line
  const rl = readline.createInterface({ input: child.stdout!, crlfDelay: Infinity });

  for await (const rawLine of rl) {
    if (clientDisconnected) break;

    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    let line: StreamJsonLine;
    try {
      line = JSON.parse(trimmed) as StreamJsonLine;
    } catch {
      continue; // skip malformed lines
    }

    // Forward stream_event lines as SSE — these are the real Anthropic events
    if (line.type === "stream_event" && line.event) {
      sendSseEvent(res, line.event.type, line.event);
    }

    // Check for authentication or CLI errors in assistant messages
    if (line.type === "assistant" && line.error) {
      hadError = true;
      console.error(`${COLORS.red}✗ CLI error:${COLORS.reset} ${line.error}`);
      sendJson(res, 502, {
        error: { type: "api_error", message: `claude CLI error: ${line.error}` },
      }, origin);
      break;
    }

    // Extract usage from the final result line
    if (line.type === "result") {
      inputTokens = line.usage?.input_tokens ?? 0;
      outputTokens = line.usage?.output_tokens ?? 0;
      const models = Object.keys(line.modelUsage ?? {});
      if (models[0]) modelName = models[0];

      if (line.is_error) {
        hadError = true;
        console.error(
          `${COLORS.red}✗ CLI returned error:${COLORS.reset} ${line.result}`
        );
      }
    }
  }

  if (!clientDisconnected && !hadError) {
    res.end();
  }

  const elapsed = Date.now() - start;

  recordRequest({
    timestamp: new Date().toISOString(),
    method: "POST",
    url: "/v1/messages",
    model: modelName,
    statusCode: hadError ? 502 : 200,
    latencyMs: elapsed,
    inputTokens,
    outputTokens,
  });

  console.log(
    `${COLORS.green}→${COLORS.reset} POST /v1/messages ${COLORS.yellow}[stream]${COLORS.reset} ` +
      `${COLORS.dim}${elapsed}ms${COLORS.reset} ` +
      `${COLORS.cyan}in:${inputTokens} out:${outputTokens}${COLORS.reset}`
  );
}

async function handleMessages(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  const origin = req.headers.origin;

  // Enforce concurrent request limit
  if (activeRequests >= MAX_CONCURRENT_REQUESTS) {
    sendJson(res, 429, {
      error: {
        type: "rate_limit_error",
        message: `Too many concurrent requests (max ${MAX_CONCURRENT_REQUESTS}). Try again shortly.`,
      },
    }, origin);
    res.setHeader("Retry-After", "5");
    return;
  }

  activeRequests++;

  try {
    let rawBody: string;
    try {
      rawBody = await readBody(req);
    } catch (err) {
      if (err instanceof BodyTooLargeError) {
        sendJson(res, 413, {
          error: {
            type: "invalid_request_error",
            message: `Request body exceeds maximum size of ${MAX_BODY_SIZE} bytes`,
          },
        }, origin);
        return;
      }
      throw err;
    }

    const payload = parsePayload(rawBody, res, origin);
    if (!payload) return;

    // Dispatch to streaming handler if requested
    if (payload.stream) {
      return await handleMessagesStream(payload, res, origin);
    }

    // Non-streaming path
    const prompt = buildPrompt(payload.messages);
    const systemPrompt = extractSystemPrompt(payload.system);

    const start = Date.now();

    let cliOutput: ClaudeJsonOutput;
    try {
      cliOutput = await invokeClaudeCli(prompt, systemPrompt, payload.model);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`${COLORS.red}✗ CLI error:${COLORS.reset} ${message}`);
      recordRequest({
        timestamp: new Date().toISOString(),
        method: "POST",
        url: "/v1/messages",
        model: payload.model ?? null,
        statusCode: 502,
        latencyMs: Date.now() - start,
        inputTokens: 0,
        outputTokens: 0,
      });
      sendJson(res, 502, {
        error: { type: "api_error", message: `claude CLI error: ${message}` },
      }, origin);
      return;
    }

    if (cliOutput.is_error) {
      console.error(
        `${COLORS.red}✗ CLI returned error:${COLORS.reset} ${cliOutput.result}`
      );
      recordRequest({
        timestamp: new Date().toISOString(),
        method: "POST",
        url: "/v1/messages",
        model: payload.model ?? null,
        statusCode: 502,
        latencyMs: Date.now() - start,
        inputTokens: 0,
        outputTokens: 0,
      });
      sendJson(res, 502, {
        error: { type: "api_error", message: cliOutput.result },
      }, origin);
      return;
    }

    const response = buildAnthropicResponse(cliOutput);
    const elapsed = Date.now() - start;
    const inTok = cliOutput.usage?.input_tokens ?? 0;
    const outTok = cliOutput.usage?.output_tokens ?? 0;

    recordRequest({
      timestamp: new Date().toISOString(),
      method: "POST",
      url: "/v1/messages",
      model: response.model,
      statusCode: 200,
      latencyMs: elapsed,
      inputTokens: inTok,
      outputTokens: outTok,
    });

    console.log(
      `${COLORS.green}→${COLORS.reset} POST /v1/messages ` +
        `${COLORS.dim}${elapsed}ms${COLORS.reset} ` +
        `${COLORS.cyan}in:${inTok} out:${outTok}${COLORS.reset}`
    );

    sendJson(res, 200, response, origin);
  } finally {
    activeRequests--;
  }
}

// ============================================================
// Server
// ============================================================

const server = http.createServer(
  async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const { method, url } = req;
    const origin = req.headers.origin;

    // CORS: reject non-localhost origins
    if (origin && !isLocalhostOrigin(origin)) {
      sendJson(res, 403, {
        error: { type: "forbidden", message: "Non-localhost origin rejected" },
      });
      return;
    }

    // CORS preflight
    if (method === "OPTIONS") {
      res.writeHead(204, getCorsHeaders(origin));
      res.end();
      return;
    }

    if (method === "GET" && url === "/health") {
      sendJson(res, 200, { status: "ok" }, origin);
      return;
    }

    if (method === "GET" && url === "/stats") {
      sendJson(res, 200, {
        status: "ok",
        startedAt: new Date(startedAt).toISOString(),
        uptimeMs: Date.now() - startedAt,
        totalRequests,
        activeRequests,
        bufferSize: requestLog.length,
        requests: requestLog,
      }, origin);
      return;
    }

    if (method === "GET" && url === "/v1/models") {
      const created = Math.floor(Date.now() / 1000);
      sendJson(res, 200, {
        object: "list",
        data: [
          { id: "claude-haiku-4-5", object: "model", created, owned_by: "claude-code" },
          { id: "claude-sonnet-4-5", object: "model", created, owned_by: "claude-code" },
          { id: "claude-opus-4-6", object: "model", created, owned_by: "claude-code" },
        ],
      }, origin);
      return;
    }

    if (method === "POST" && url === "/v1/messages") {
      await handleMessages(req, res);
      return;
    }

    sendJson(res, 404, {
      error: {
        type: "not_found",
        message: `${method} ${url} not found`,
      },
    }, origin);
  }
);

// ============================================================
// Startup
// ============================================================

console.log(
  `\n${COLORS.bold}Claude Code Local Proxy${COLORS.reset} ${COLORS.dim}(personal use only · model selected per request, defaults to opus)${COLORS.reset}\n`
);

checkClaudeCli();

server.listen(PORT, HOST, () => {
  console.log(
    `\n${COLORS.green}${COLORS.bold}✓ Listening${COLORS.reset} http://${HOST}:${PORT}\n`
  );
  console.log(
    `${COLORS.dim}  POST /v1/messages   — Anthropic Messages API (real streaming)${COLORS.reset}`
  );
  console.log(
    `${COLORS.dim}  GET  /v1/models     — Model listing${COLORS.reset}`
  );
  console.log(
    `${COLORS.dim}  GET  /health        — Liveness check${COLORS.reset}`
  );
  console.log(
    `${COLORS.dim}  GET  /stats         — Health + request history${COLORS.reset}`
  );
  console.log(
    `${COLORS.dim}  Max body: ${MAX_BODY_SIZE / 1024}KB · Max concurrent: ${MAX_CONCURRENT_REQUESTS} · CORS: localhost only${COLORS.reset}\n`
  );
});

// Graceful shutdown
function shutdown(): void {
  console.log(`\n${COLORS.yellow}Shutting down...${COLORS.reset}`);
  server.close(() => {
    console.log(`${COLORS.green}✓ Server closed${COLORS.reset}`);
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
