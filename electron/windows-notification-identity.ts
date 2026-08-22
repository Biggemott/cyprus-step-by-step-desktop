import { app, shell } from "electron";
import path from "node:path";

export const windowsAppUserModelId = "com.cyprussteps.desktop";
export const windowsToastActivatorClsid = "{8C8B3A51-06DB-4B65-9A3A-4B29EF2EA740}";

const shortcutName = "Cyprus Step-by-Step.lnk";

export function configureWindowsNotificationIdentity() {
  if (process.platform !== "win32") return;
  app.setAppUserModelId(windowsAppUserModelId);
  app.setToastActivatorCLSID(windowsToastActivatorClsid);
}

export function ensureWindowsNotificationShortcut() {
  if (process.platform !== "win32") return;

  const isDevelopmentShortcut =
    !app.isPackaged && process.env.ELECTRON_CREATE_NOTIFICATION_SHORTCUT === "1";
  const portableExecutableFile = app.isPackaged ? process.env.PORTABLE_EXECUTABLE_FILE : undefined;
  if (!isDevelopmentShortcut && !portableExecutableFile) return;

  const target = portableExecutableFile ?? process.execPath;
  const shortcutPath = path.join(
    app.getPath("appData"),
    "Microsoft",
    "Windows",
    "Start Menu",
    "Programs",
    isDevelopmentShortcut ? "Cyprus Step-by-Step (Development).lnk" : shortcutName,
  );

  try {
    const created = shell.writeShortcutLink(shortcutPath, "create", {
      target,
      ...(isDevelopmentShortcut ? { args: "." } : {}),
      cwd: isDevelopmentShortcut ? process.cwd() : path.dirname(target),
      description: "Cyprus Step-by-Step",
      icon: target,
      iconIndex: 0,
      appUserModelId: windowsAppUserModelId,
      toastActivatorClsid: windowsToastActivatorClsid,
    });
    console.log(
      `[reminders] Start Menu shortcut ${created ? "updated" : "could not be updated"}: ${shortcutPath}`,
    );
  } catch (error) {
    console.error(
      `[reminders] Could not update Start Menu shortcut ${shortcutPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
