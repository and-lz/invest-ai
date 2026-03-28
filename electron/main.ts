import {
  app,
  Tray,
  Menu,
  nativeImage,
  shell,
  Notification,
  MenuItemConstructorOptions,
} from "electron";
import { spawn, ChildProcess } from "child_process";
import * as path from "path";
import * as net from "net";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const DEV_PORT = 3000;
const DEV_URL = `http://localhost:${DEV_PORT}`;

type ServerState = "idle" | "starting" | "running" | "stopped";

let tray: Tray | null = null;
let serverProcess: ChildProcess | null = null;
let serverState: ServerState = "idle";

function getIconPath(): string {
  return path.join(__dirname, "..", "electron", "icons", "trayTemplate.png");
}

function getTrayTitle(): string {
  switch (serverState) {
    case "idle":
      return "Invest AI";
    case "starting":
      return "Invest AI (starting...)";
    case "running":
      return "Invest AI (running)";
    case "stopped":
      return "Invest AI (stopped)";
  }
}

function isPortInUse(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => {
      resolve(false);
    });
    socket.connect(port, "127.0.0.1");
  });
}

function showNotification(title: string, body: string): void {
  new Notification({ title, body }).show();
}

function killServerProcess(): void {
  if (!serverProcess || serverProcess.pid === undefined) return;

  try {
    // Kill the entire process group (negative PID)
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

async function startServer(): Promise<void> {
  if (serverState === "running" || serverState === "starting") return;

  const portInUse = await isPortInUse(DEV_PORT);
  if (portInUse) {
    showNotification(
      "Port already in use",
      `Port ${DEV_PORT} is already in use. Stop the existing server first.`
    );
    return;
  }

  serverState = "starting";
  updateTrayMenu();

  serverProcess = spawn("npm", ["run", "dev"], {
    cwd: PROJECT_ROOT,
    shell: true,
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
  });

  // Detect when the server is ready by watching stdout for the Next.js ready message
  serverProcess.stdout?.on("data", (data: Buffer) => {
    const output = data.toString();
    if (
      output.includes("Ready in") ||
      output.includes(`localhost:${DEV_PORT}`)
    ) {
      serverState = "running";
      updateTrayMenu();
      showNotification("Server started", `Dev server running at ${DEV_URL}`);
    }
  });

  serverProcess.stderr?.on("data", (data: Buffer) => {
    // Log stderr but don't treat compilation warnings as crashes
    const output = data.toString();
    if (output.includes("Error") && !output.includes("Warning")) {
      console.error("[dev-server]", output);
    }
  });

  serverProcess.on("exit", (code) => {
    if (serverState === "running" || serverState === "starting") {
      serverState = "stopped";
      updateTrayMenu();
      if (code !== 0 && code !== null) {
        showNotification(
          "Server crashed",
          `Dev server exited with code ${code}`
        );
      }
    }
    serverProcess = null;
  });
}

function stopServer(): void {
  if (serverState !== "running" && serverState !== "starting") return;

  killServerProcess();
  serverState = "idle";
  updateTrayMenu();
  showNotification("Server stopped", "Dev server has been stopped");
}

function buildContextMenu(): Menu {
  const isRunning =
    serverState === "running" || serverState === "starting";

  const template: MenuItemConstructorOptions[] = [
    {
      label: getTrayTitle(),
      enabled: false,
    },
    { type: "separator" },
    {
      label: "Start Server",
      enabled: !isRunning,
      click: () => startServer(),
    },
    {
      label: "Stop Server",
      enabled: isRunning,
      click: () => stopServer(),
    },
    { type: "separator" },
    {
      label: "Open in Browser",
      enabled: serverState === "running",
      click: () => shell.openExternal(DEV_URL),
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        killServerProcess();
        app.quit();
      },
    },
  ];

  return Menu.buildFromTemplate(template);
}

function updateTrayMenu(): void {
  if (!tray) return;
  tray.setToolTip(getTrayTitle());
  tray.setContextMenu(buildContextMenu());
}

app.dock?.hide();

app.whenReady().then(() => {
  const icon = nativeImage.createFromPath(getIconPath());
  icon.setTemplateImage(true);

  tray = new Tray(icon);
  tray.setToolTip(getTrayTitle());
  tray.setContextMenu(buildContextMenu());
});

app.on("before-quit", () => {
  killServerProcess();
});

// Prevent app from quitting when all windows are closed (we have no windows)
app.on("window-all-closed", () => {
  // Do nothing — keep the app running (tray only, no windows)
});
