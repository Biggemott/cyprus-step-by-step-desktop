import { contextBridge, ipcRenderer } from "electron";
import type {
  PersistedAppState,
  PersistedReminder,
  PersistedScenarioProgress,
  ReminderOption,
} from "../src/shared/progress-types";

contextBridge.exposeInMainWorld("cyprusSteps", {
  loadAppState: (): Promise<PersistedAppState> => ipcRenderer.invoke("progress:load"),
  saveScenarioProgress: (scenarioId: string, progress: PersistedScenarioProgress): Promise<void> =>
    ipcRenderer.invoke("progress:save", scenarioId, progress),
  resetScenarioProgress: (scenarioId: string): Promise<boolean> =>
    ipcRenderer.invoke("progress:reset", scenarioId),
  setStepReminder: (
    scenarioId: string,
    stepId: string,
    option: ReminderOption,
    stepTitle: string,
  ): Promise<PersistedReminder | null> =>
    ipcRenderer.invoke("reminder:set", scenarioId, stepId, option, stepTitle),
  removeStepReminder: (scenarioId: string, stepId: string): Promise<void> =>
    ipcRenderer.invoke("reminder:remove", scenarioId, stepId),
  openExternal: (url: string): Promise<boolean> => ipcRenderer.invoke("external:open", url),
});
