import { app, BrowserWindow, ipcMain, Menu, Notification, shell } from "electron";
import { existsSync } from "node:fs";
import path from "node:path";
import { loadAppState, resetScenarioProgress, saveScenarioProgress } from "./progress-store";
import { ReminderScheduler } from "./reminder-scheduler";
import {
  configureWindowsNotificationIdentity,
  ensureWindowsNotificationShortcut,
} from "./windows-notification-identity";
import {
  isKnownStepId,
  isSupportedReminderOption,
  isSupportedScenarioId,
  isValidScenarioProgress,
} from "./scenario-contract";
import type { OperationResult } from "../src/shared/progress-types";

let mainWindow: BrowserWindow | null = null;
const reminderScheduler = new ReminderScheduler();
const invalidRequest = (): OperationResult => ({ ok: false, error: "Invalid request." });

configureWindowsNotificationIdentity();

ipcMain.handle("progress:load", () => loadAppState());
ipcMain.handle(
  "progress:save",
  (_event, scenarioId: unknown, progress: unknown): OperationResult => {
    if (!isSupportedScenarioId(scenarioId) || !isValidScenarioProgress(progress))
      return invalidRequest();
    const result = saveScenarioProgress(scenarioId, progress);
    if (!result.ok) return result;
    for (const stepId of progress.completedStepIds)
      reminderScheduler.clearTimer(scenarioId, stepId);
    return result;
  },
);
ipcMain.handle("progress:reset", (_event, scenarioId: unknown): OperationResult => {
  if (!isSupportedScenarioId(scenarioId)) return invalidRequest();
  const result = resetScenarioProgress(scenarioId);
  if (result.ok) reminderScheduler.clearAllTimers(scenarioId);
  return result;
});
ipcMain.handle("reminder:set", (_event, scenarioId: unknown, stepId: unknown, option: unknown) => {
  if (
    !isSupportedScenarioId(scenarioId) ||
    !isKnownStepId(stepId) ||
    !isSupportedReminderOption(option)
  )
    return invalidRequest();
  return reminderScheduler.set(scenarioId, stepId, option);
});
ipcMain.handle(
  "reminder:remove",
  (_event, scenarioId: unknown, stepId: unknown): OperationResult => {
    if (!isSupportedScenarioId(scenarioId) || !isKnownStepId(stepId)) return invalidRequest();
    return reminderScheduler.cancel(scenarioId, stepId);
  },
);
ipcMain.handle("external:open", async (_event, value: string) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    await shell.openExternal(url.toString());
    return true;
  } catch {
    return false;
  }
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 720,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: "#F8F9F7",
    icon: app.isPackaged
      ? path.join(process.resourcesPath, "icon.png")
      : path.join(__dirname, "..", "build", "icon.png"),
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
  if (!app.isPackaged)
    console.log(`[reminders] Notification.isSupported()=${Notification.isSupported()}.`);
  ensureWindowsNotificationShortcut();
  reminderScheduler.restore();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
