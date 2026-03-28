import { app, BrowserWindow } from "electron";
import { spawn, execSync, ChildProcess } from "child_process";
import * as path from "path";
import * as fs from "fs";
import * as net from "net";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DEV_PORT = 3000;
const PROXY_PORT = 3099;

// ---------------------------------------------------------------------------
// Child process management
// ---------------------------------------------------------------------------

const childProcesses: ChildProcess[] = [];

let mainWindow: BrowserWindow | null = null;

function trackProcess(proc: ChildProcess): void {
  childProcesses.push(proc);
  proc.on("exit", () => {
    const idx = childProcesses.indexOf(proc);
    if (idx !== -1) childProcesses.splice(idx, 1);
  });
}

function killAllChildren(): void {
  for (const proc of [...childProcesses]) {
    if (proc.pid === undefined) continue;
    try {
      process.kill(-proc.pid, "SIGTERM");
    } catch {
      try {
        proc.kill("SIGTERM");
      } catch {
        // Process already dead
      }
    }
  }
  childProcesses.length = 0;
}

// ---------------------------------------------------------------------------
// Fork bomb detection + emergency stop
// ---------------------------------------------------------------------------

const PID_LOCK_FILE = "/tmp/fortuna-main.pid";

/**
 * Detects a fork bomb by counting running "Fortuna" processes.
 * If more than 2 are found (threshold for brief overlap at startup),
 * kills ALL Fortuna processes and quits immediately.
 * Returns true if a fork bomb was detected (caller should stop).
 */
function detectAndKillForkBomb(): boolean {
  if (!app.isPackaged) return false;
  try {
    const raw = execSync("pgrep -c -x Fortuna 2>/dev/null || echo 0", {
      encoding: "utf8",
    }).trim();
    const count = parseInt(raw, 10);
    if (count > 2) {
      console.error(
        `[electron] Fork bomb detected (${count} instances). Killing all.`
      );
      try {
        execSync("pkill -9 -x Fortuna 2>/dev/null || true");
      } catch {}
      app.quit();
      return true;
    }
  } catch {}
  return false;
}

/**
 * Acquires a PID lock file at a fixed path — independent of Electron's user
 * data directory so it works even when requestSingleInstanceLock fails.
 * Returns false if another live instance holds the lock (caller should stop).
 */
function acquirePidLock(): boolean {
  if (!app.isPackaged) return true;
  try {
    if (fs.existsSync(PID_LOCK_FILE)) {
      const existing = parseInt(fs.readFileSync(PID_LOCK_FILE, "utf-8").trim(), 10);
      if (!isNaN(existing)) {
        try {
          process.kill(existing, 0); // throws if process is dead
          // Process is alive — another instance is running
          console.error(
            `[electron] Duplicate instance detected (PID ${existing}). Killing all and quitting.`
          );
          try {
            execSync("pkill -9 -x Fortuna 2>/dev/null || true");
          } catch {}
          app.quit();
          return false;
        } catch {
          // Stale PID — process is dead, safe to overwrite
        }
      }
    }
    fs.writeFileSync(PID_LOCK_FILE, String(process.pid), "utf-8");
  } catch {
    // Fail open — don't block launch if lock file write fails
  }
  return true;
}

function releasePidLock(): void {
  if (!app.isPackaged) return;
  try {
    if (fs.existsSync(PID_LOCK_FILE)) {
      const stored = parseInt(fs.readFileSync(PID_LOCK_FILE, "utf-8").trim(), 10);
      if (stored === process.pid) {
        fs.unlinkSync(PID_LOCK_FILE);
      }
    }
  } catch {}
}

// ---------------------------------------------------------------------------
// Port utilities
// ---------------------------------------------------------------------------

function waitForPort(port: number, timeout = 60000): Promise<void> {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      const socket = new net.Socket();
      socket.setTimeout(500);
      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - start > timeout) {
          reject(new Error(`Port ${port} not ready after ${timeout}ms`));
        } else {
          setTimeout(check, 500);
        }
      });
      socket.once("timeout", () => {
        socket.destroy();
        if (Date.now() - start > timeout) {
          reject(new Error(`Port ${port} not ready after ${timeout}ms`));
        } else {
          setTimeout(check, 500);
        }
      });
      socket.connect(port, "127.0.0.1");
    };
    check();
  });
}

function findFreePort(preferred: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once("error", () => {
      // Preferred port in use — let OS pick a random one
      const fallback = net.createServer();
      fallback.once("error", reject);
      fallback.listen(0, "127.0.0.1", () => {
        const addr = fallback.address();
        const port = typeof addr === "object" && addr ? addr.port : 0;
        fallback.close(() => resolve(port));
      });
    });
    server.listen(preferred, "127.0.0.1", () => {
      server.close(() => resolve(preferred));
    });
  });
}

// ---------------------------------------------------------------------------
// Env file loader (for production builds)
// ---------------------------------------------------------------------------

function loadEnvFile(envPath: string): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!fs.existsSync(envPath)) return vars;

  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

// ---------------------------------------------------------------------------
// Resolve paths based on packaged vs dev
// ---------------------------------------------------------------------------

function getProjectRoot(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath)
    : path.resolve(__dirname, "..", "..");
}

function getStandalonePath(): string {
  return path.join(getProjectRoot(), "standalone");
}

function getProxyPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "claude-proxy.js");
  }
  return path.join(__dirname, "claude-proxy.js");
}

function getEnvPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, ".env.local");
  }
  return path.join(path.resolve(__dirname, "..", ".."), ".env.local");
}

// ---------------------------------------------------------------------------
// Build environment for child processes
// ---------------------------------------------------------------------------

function buildChildEnv(port: number): NodeJS.ProcessEnv {
  const envFromFile = loadEnvFile(getEnvPath());
  return {
    ...process.env,
    ...envFromFile,
    PORT: String(port),
    HOSTNAME: "localhost",
    NODE_ENV: "production",
    CLAUDE_PROXY_URL: `http://localhost:${PROXY_PORT}`,
    // CRITICAL: When packaged, process.execPath is the Electron binary.
    // Without this flag, spawning it runs main.js again → infinite fork bomb.
    ELECTRON_RUN_AS_NODE: "1",
  };
}

// ---------------------------------------------------------------------------
// Server spawning
// ---------------------------------------------------------------------------

function startDevServer(): void {
  const projectRoot = path.resolve(__dirname, "..", "..");
  const proc = spawn("npx", ["next", "dev", "--turbopack"], {
    cwd: projectRoot,
    shell: true,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  });

  trackProcess(proc);

  proc.stdout?.on("data", (data: Buffer) => {
    process.stdout.write(`[next-dev] ${data}`);
  });
  proc.stderr?.on("data", (data: Buffer) => {
    process.stderr.write(`[next-dev] ${data}`);
  });
  proc.on("exit", (code) => {
    console.log(`[next-dev] exited with code ${code}`);
  });
}

function startDevProxy(): void {
  const projectRoot = path.resolve(__dirname, "..", "..");
  const proxyScript = path.join(projectRoot, "scripts", "claude-proxy.ts");

  const proc = spawn("npx", ["tsx", proxyScript], {
    cwd: projectRoot,
    shell: true,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PROXY_PORT: String(PROXY_PORT) },
  });

  trackProcess(proc);

  proc.stdout?.on("data", (data: Buffer) => {
    process.stdout.write(`[proxy-dev] ${data}`);
  });
  proc.stderr?.on("data", (data: Buffer) => {
    process.stderr.write(`[proxy-dev] ${data}`);
  });
  proc.on("exit", (code) => {
    console.log(`[proxy-dev] exited with code ${code}`);
  });
}

function startProdServer(port: number): void {
  const standalonePath = getStandalonePath();
  const serverJs = path.join(standalonePath, "server.js");

  if (!fs.existsSync(serverJs)) {
    console.error(`[next-prod] server.js not found at ${serverJs}`);
    mainWindow?.loadURL(
      `data:text/html,<html><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0d0c14;color:#fff;font-family:system-ui;"><div style="text-align:center;"><div style="font-size:24px;margin-bottom:8px;">Build output not found</div><div style="color:#888;">server.js missing from standalone bundle</div></div></body></html>`
    );
    return;
  }

  const env = buildChildEnv(port);

  const proc = spawn(process.execPath, [serverJs], {
    cwd: standalonePath,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env,
  });

  trackProcess(proc);

  proc.stdout?.on("data", (data: Buffer) => {
    process.stdout.write(`[next-prod] ${data}`);
  });
  proc.stderr?.on("data", (data: Buffer) => {
    process.stderr.write(`[next-prod] ${data}`);
  });
  proc.on("exit", (code) => {
    console.log(`[next-prod] exited with code ${code}`);
  });
}

function startProxy(): void {
  const proxyPath = getProxyPath();

  if (!fs.existsSync(proxyPath)) {
    console.warn(`[proxy] claude-proxy.js not found at ${proxyPath} — skipping`);
    return;
  }

  const env = { ...process.env, ...loadEnvFile(getEnvPath()), PROXY_PORT: String(PROXY_PORT), ELECTRON_RUN_AS_NODE: "1" };

  const proc = spawn(process.execPath, [proxyPath], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env,
  });

  trackProcess(proc);

  proc.stdout?.on("data", (data: Buffer) => {
    process.stdout.write(`[proxy] ${data}`);
  });
  proc.stderr?.on("data", (data: Buffer) => {
    process.stderr.write(`[proxy] ${data}`);
  });
  proc.on("exit", (code) => {
    console.log(`[proxy] exited with code ${code}`);
  });
}

// ---------------------------------------------------------------------------
// Window
// ---------------------------------------------------------------------------

function createWindow(): void {
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, "..", "electron", "icons", "icon.png")
    : path.join(__dirname, "..", "icons", "icon.png");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: "Fortuna",
    icon: iconPath,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Allow popups for Google OAuth
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (
      url.includes("accounts.google.com") ||
      url.includes("google.com/o/oauth2")
    ) {
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          width: 500,
          height: 700,
          title: "Sign in with Google",
          autoHideMenuBar: true,
        },
      };
    }
    if (url.includes("localhost")) {
      return { action: "allow" };
    }
    return { action: "deny" };
  });

  // Loading screen
  mainWindow.loadURL(
    `data:text/html,
    <html>
      <head><style>
        body { margin:0; display:flex; align-items:center; justify-content:center;
               height:100vh; background:#0d0c14; color:#fff; font-family:system-ui; }
        .loader { text-align:center; }
        .spinner { width:40px; height:40px; border:3px solid #333;
                   border-top-color:#fff; border-radius:50%;
                   animation:spin 0.8s linear infinite; margin:0 auto 16px; }
        @keyframes spin { to { transform:rotate(360deg); } }
      </style></head>
      <body><div class="loader">
        <div class="spinner"></div>
        <div>Starting server...</div>
      </div></body>
    </html>`
  );

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------

app.name = "Fortuna";

// Prevent multiple instances (safety net against fork bombs)
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {

app.on("second-instance", () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  // --- Fork bomb guards (must run before any spawn) ---
  if (detectAndKillForkBomb()) return;
  if (!acquirePidLock()) return;

  createWindow();

  let serverPort: number;

  if (app.isPackaged) {
    // Propagate ELECTRON_RUN_AS_NODE to ALL descendant processes so even
    // grandchildren (e.g. Next.js internal workers) run as Node.js, not GUI.
    process.env.ELECTRON_RUN_AS_NODE = "1";

    // Production: run standalone Next.js server + proxy
    serverPort = await findFreePort(DEV_PORT);
    console.log(`[electron] Production mode — port ${serverPort}`);
    startProdServer(serverPort);
    startProxy();
  } else {
    // Development: run next dev + proxy (mirrors npm run dev:raw)
    serverPort = DEV_PORT;
    console.log("[electron] Development mode");
    startDevServer();
    startDevProxy();
  }

  try {
    await waitForPort(serverPort);
    await new Promise((r) => setTimeout(r, 1000));
    mainWindow?.loadURL(`http://localhost:${serverPort}`);
  } catch (err) {
    console.error("[electron] Server failed to start:", err);
    mainWindow?.loadURL(
      `data:text/html,
      <html><body style="margin:0;display:flex;align-items:center;justify-content:center;
        height:100vh;background:#0d0c14;color:#fff;font-family:system-ui;">
        <div style="text-align:center;">
          <div style="font-size:24px;margin-bottom:8px;">Failed to start server</div>
          <div style="color:#888;">Check the terminal for errors</div>
        </div>
      </body></html>`
    );
  }
});

app.on("window-all-closed", () => {
  killAllChildren();
  app.quit();
});

app.on("before-quit", () => {
  killAllChildren();
  releasePidLock();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    mainWindow!.loadURL(`http://localhost:${DEV_PORT}`);
  }
});

} // end of single-instance lock
