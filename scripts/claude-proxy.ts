/**
 * Claude Code Local Proxy
 *
 * Exposes an Anthropic-compatible HTTP API backed by the local `claude` CLI.
 * Personal use only — routes requests through your Claude Code subscription.
 * Supports model selection via the `model` field in the request body.
 *
 * Usage:
 *   npm run proxy
 *   PROXY_PORT=3099 npm run proxy
 *
 * Endpoints:
 *   POST /v1/messages  — Anthropic Messages API
 *   GET  /v1/models    — Model listing (static)
 *   GET  /health       — Liveness check
 */

import http from "node:http";
import { execSync, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";

// ============================================================
// Config
// ============================================================

const PORT = parseInt(process.env["PROXY_PORT"] ?? "3099", 10);
const HOST = "127.0.0.1";

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

  // Multi-turn: linearize history with role labels, then append the current message
  const history = messages.slice(0, -1);
  const last = messages[messages.length - 1];
  if (!last) return "";

  const historyText = history
    .map((m) => {
      const label = m.role === "user" ? "Human" : "Assistant";
      return `${label}: ${extractText(m.content)}`;
    })
    .join("\n\n");

  return `[Previous conversation]\n${historyText}\n\n[Current message]\n${extractText(last.content)}`;
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

async function invokeClaudeCli(
  prompt: string,
  systemPrompt: string | null,
  modelId?: string
): Promise<ClaudeJsonOutput> {
  return new Promise((resolve, reject) => {
    const cliModel = resolveCliModel(modelId);
    const args = ["-p", "--output-format", "json", "--model", cliModel];

    if (systemPrompt) {
      args.push("--system-prompt", systemPrompt);
    }

    args.push(prompt);

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
// Response formatting
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
    req.on("data", (chunk: Buffer) => {
      body += chunk.toString();
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function sendJson(
  res: http.ServerResponse,
  status: number,
  body: unknown
): void {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(json),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, x-api-key, anthropic-version",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  res.end(json);
}

// ============================================================
// Route handlers
// ============================================================

async function handleMessages(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  const rawBody = await readBody(req);

  let payload: AnthropicRequest;
  try {
    payload = JSON.parse(rawBody) as AnthropicRequest;
  } catch {
    sendJson(res, 400, {
      error: { type: "invalid_request_error", message: "Invalid JSON body" },
    });
    return;
  }

  if (!Array.isArray(payload.messages) || payload.messages.length === 0) {
    sendJson(res, 400, {
      error: {
        type: "invalid_request_error",
        message: "messages must be a non-empty array",
      },
    });
    return;
  }

  const prompt = buildPrompt(payload.messages);
  const systemPrompt = extractSystemPrompt(payload.system);

  const start = Date.now();

  let cliOutput: ClaudeJsonOutput;
  try {
    cliOutput = await invokeClaudeCli(prompt, systemPrompt, payload.model);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`${COLORS.red}✗ CLI error:${COLORS.reset} ${message}`);
    sendJson(res, 502, {
      error: { type: "api_error", message: `claude CLI error: ${message}` },
    });
    return;
  }

  if (cliOutput.is_error) {
    console.error(
      `${COLORS.red}✗ CLI returned error:${COLORS.reset} ${cliOutput.result}`
    );
    sendJson(res, 502, {
      error: { type: "api_error", message: cliOutput.result },
    });
    return;
  }

  const response = buildAnthropicResponse(cliOutput);
  const elapsed = Date.now() - start;

  console.log(
    `${COLORS.green}→${COLORS.reset} POST /v1/messages ` +
      `${COLORS.dim}${elapsed}ms${COLORS.reset} ` +
      `${COLORS.cyan}in:${cliOutput.usage?.input_tokens ?? 0} out:${cliOutput.usage?.output_tokens ?? 0}${COLORS.reset}`
  );

  sendJson(res, 200, response);
}

// ============================================================
// Server
// ============================================================

const server = http.createServer(
  async (req: http.IncomingMessage, res: http.ServerResponse) => {
    const { method, url } = req;

    // CORS preflight
    if (method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, x-api-key, anthropic-version",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      });
      res.end();
      return;
    }

    if (method === "GET" && url === "/health") {
      sendJson(res, 200, { status: "ok" });
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
      });
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
    });
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
    `${COLORS.dim}  POST /v1/messages   — Anthropic Messages API${COLORS.reset}`
  );
  console.log(
    `${COLORS.dim}  GET  /v1/models     — Model listing${COLORS.reset}`
  );
  console.log(
    `${COLORS.dim}  GET  /health        — Liveness check${COLORS.reset}\n`
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
