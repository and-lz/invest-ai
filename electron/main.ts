import { app, BrowserWindow, shell, net as electronNet } from "electron";
import { spawn, ChildProcess } from "child_process";
import * as path from "path";
import * as net from "net";

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const DEV_PORT = 3000;
const DEV_URL = `http://localhost:${DEV_PORT}`;

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

function killServerProcess(): void {
  if (!serverProcess || serverProcess.pid === undefined) return;
  try {
    process.kill(-serverProcess.pid, "SIGTERM");
  } catch {
    try {
      serverProcess.kill("SIGTERM");
    } catch {
      // Process already dead
    }
  }
  serverProcess = null;
}

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

function startDevServer(): void {
  serverProcess = spawn("npx", ["next", "dev", "--turbopack"], {
    cwd: PROJECT_ROOT,
    shell: true,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  });

  serverProcess.stdout?.on("data", (data: Buffer) => {
    process.stdout.write(`[dev] ${data}`);
  });

  serverProcess.stderr?.on("data", (data: Buffer) => {
    process.stderr.write(`[dev] ${data}`);
  });

  serverProcess.on("exit", (code) => {
    console.log(`[dev] Server exited with code ${code}`);
    serverProcess = null;
  });
}

function createWindow(): void {
  const iconPath = path.join(__dirname, "..", "icons", "icon.png");

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: "Investimentos",
    icon: iconPath,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Delegate Google OAuth to the system browser where passkeys work.
  // When navigation targets accounts.google.com, open it externally.
  // After auth completes, Google redirects back to localhost:3000 which
  // lands in the user's browser. The Electron window polls for the session.
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url.includes("accounts.google.com")) {
      event.preventDefault();
      shell.openExternal(url);
      // Poll until the session exists (user completed login in browser)
      pollForSession();
    }
  });

  // Also intercept new-window requests (target="_blank" or window.open)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (
      url.includes("accounts.google.com") ||
      url.includes("google.com/o/oauth2")
    ) {
      shell.openExternal(url);
      pollForSession();
      return { action: "deny" };
    }
    return { action: "deny" };
  });

  // Show loading state while server starts
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
        <div>Starting dev server...</div>
      </div></body>
    </html>`
  );

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function pollForSession(): void {
  if (!mainWindow) return;

  const interval = setInterval(async () => {
    if (!mainWindow) {
      clearInterval(interval);
      return;
    }
    try {
      // Check if the session endpoint returns an authenticated user
      const response = await electronNet.fetch(`${DEV_URL}/api/auth/session`);
      const data = await response.json();
      if (data && typeof data === "object" && "user" in data) {
        clearInterval(interval);
        // Reload the app — user is now authenticated
        mainWindow?.loadURL(DEV_URL);
      }
    } catch {
      // Server not ready or request failed, keep polling
    }
  }, 2000);

  // Stop polling after 5 minutes
  setTimeout(() => clearInterval(interval), 5 * 60 * 1000);
}

app.whenReady().then(async () => {
  createWindow();
  startDevServer();

  try {
    await waitForPort(DEV_PORT);
    await new Promise((r) => setTimeout(r, 1000));
    mainWindow?.loadURL(DEV_URL);
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
  killServerProcess();
  app.quit();
});

app.on("before-quit", () => {
  killServerProcess();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
    mainWindow!.loadURL(DEV_URL);
  }
});
