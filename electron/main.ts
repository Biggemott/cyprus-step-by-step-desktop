import { app, BrowserWindow, ipcMain, Menu, shell } from "electron";
import { existsSync } from "node:fs";
import path from "node:path";
import { loadAppState, resetScenarioProgress, saveScenarioProgress, type PersistedScenarioProgress } from "./progress-store";

let mainWindow: BrowserWindow | null = null;
const supportedScenarioId = "get_tax_number_and_tax_for_all_cyprus";

ipcMain.handle("progress:load", () => loadAppState());
ipcMain.handle("progress:save", (_event, scenarioId: string, progress: PersistedScenarioProgress) => { if (scenarioId === supportedScenarioId) saveScenarioProgress(scenarioId, progress); });
ipcMain.handle("progress:reset", (_event, scenarioId: string) => scenarioId === supportedScenarioId && resetScenarioProgress(scenarioId));
ipcMain.handle("external:open", async (_event, value: string) => {
  try { const url = new URL(value); if (url.protocol !== "https:") return false; await shell.openExternal(url.toString()); return true; } catch { return false; }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 720,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: "#F8F9F7",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  const staticRendererPath = path.join(__dirname, "..", "out", "index.html");
  const useStaticRenderer = app.isPackaged || process.env.ELECTRON_STATIC === "1";
  if (!useStaticRenderer) {
    const developmentUrl = process.env.ELECTRON_START_URL || "http://localhost:3000";
    void mainWindow.loadURL(developmentUrl);
  } else {
    if (!existsSync(staticRendererPath)) {
      throw new Error("Static renderer is missing. Run npm.cmd run build before electron:prod.");
    }
    void mainWindow.loadFile(staticRendererPath);
  }
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
