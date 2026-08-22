import { app, BrowserWindow, ipcMain, Menu, Notification, shell } from "electron";
import { existsSync } from "node:fs";
import path from "node:path";
import { loadAppState, resetScenarioProgress, saveScenarioProgress, type PersistedScenarioProgress } from "./progress-store";
import { ReminderScheduler } from "./reminder-scheduler";

let mainWindow: BrowserWindow | null = null;
const supportedScenarioId = "get_tax_number_and_tax_for_all_cyprus";
const reminderScheduler = new ReminderScheduler();

app.setAppUserModelId("com.cyprussteps.desktop");

function configureDevelopmentNotificationShortcut() {
  if (process.platform !== "win32" || app.isPackaged || process.env.ELECTRON_CREATE_NOTIFICATION_SHORTCUT !== "1") return;
  const shortcutPath = path.join(app.getPath("appData"), "Microsoft", "Windows", "Start Menu", "Programs", "Cyprus Step-by-Step (Development).lnk");
  const created = shell.writeShortcutLink(shortcutPath, "replace", {
    target: process.execPath,
    args: ".",
    cwd: process.cwd(),
    description: "Cyprus Step-by-Step development notification identity",
    appUserModelId: "com.cyprussteps.desktop",
  });
  console.log(`[reminders] Development Start Menu shortcut ${created ? "created" : "could not be created"}: ${shortcutPath}`);
}

ipcMain.handle("progress:load", () => loadAppState());
ipcMain.handle("progress:save", (_event, scenarioId: string, progress: PersistedScenarioProgress) => {
  if (scenarioId !== supportedScenarioId) return;
  for (const stepId of progress.completedStepIds) reminderScheduler.cancel(scenarioId, stepId);
  saveScenarioProgress(scenarioId, progress);
});
ipcMain.handle("progress:reset", (_event, scenarioId: string) => {
  if (scenarioId !== supportedScenarioId) return false;
  reminderScheduler.cancelAll(scenarioId);
  return resetScenarioProgress(scenarioId);
});
ipcMain.handle("reminder:set", (_event, scenarioId: string, stepId: string, option: "tomorrow" | "in_3_days" | "in_1_week", stepTitle: string) => {
  if (scenarioId !== supportedScenarioId || typeof stepId !== "string" || typeof stepTitle !== "string" || !["tomorrow", "in_3_days", "in_1_week"].includes(option)) return null;
  return reminderScheduler.set(scenarioId, stepId, option, stepTitle);
});
ipcMain.handle("reminder:remove", (_event, scenarioId: string, stepId: string) => { if (scenarioId === supportedScenarioId && typeof stepId === "string") reminderScheduler.cancel(scenarioId, stepId); });
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
  if (!app.isPackaged) console.log(`[reminders] Notification.isSupported()=${Notification.isSupported()}.`);
  configureDevelopmentNotificationShortcut();
  reminderScheduler.restore();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
