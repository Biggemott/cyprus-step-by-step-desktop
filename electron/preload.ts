import { contextBridge, ipcRenderer } from "electron";
import type { PersistedAppState, PersistedScenarioProgress } from "../src/shared/progress-types";

contextBridge.exposeInMainWorld("cyprusSteps", {
  loadAppState: (): Promise<PersistedAppState> => ipcRenderer.invoke("progress:load"),
  saveScenarioProgress: (scenarioId: string, progress: PersistedScenarioProgress): Promise<void> => ipcRenderer.invoke("progress:save", scenarioId, progress),
  resetScenarioProgress: (scenarioId: string): Promise<boolean> => ipcRenderer.invoke("progress:reset", scenarioId),
  openExternal: (url: string): Promise<boolean> => ipcRenderer.invoke("external:open", url),
});
