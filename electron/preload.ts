import { contextBridge, ipcRenderer } from "electron";
import type {
  PersistedAppState,
  OperationResult,
  ReminderOperationResult,
  ReminderOption,
  ScenarioProgressMutation,
} from "../src/shared/progress-types";

contextBridge.exposeInMainWorld("cyprusSteps", {
  loadAppState: (): Promise<PersistedAppState> => ipcRenderer.invoke("progress:load"),
  saveScenarioProgress: (
    scenarioId: string,
    progress: ScenarioProgressMutation,
  ): Promise<OperationResult> => ipcRenderer.invoke("progress:save", scenarioId, progress),
  resetScenarioProgress: (scenarioId: string): Promise<OperationResult> =>
    ipcRenderer.invoke("progress:reset", scenarioId),
  setStepReminder: (
    scenarioId: string,
    stepId: string,
    option: ReminderOption,
  ): Promise<ReminderOperationResult> =>
    ipcRenderer.invoke("reminder:set", scenarioId, stepId, option),
  removeStepReminder: (scenarioId: string, stepId: string): Promise<OperationResult> =>
    ipcRenderer.invoke("reminder:remove", scenarioId, stepId),
  openExternal: (url: string): Promise<boolean> => ipcRenderer.invoke("external:open", url),
});
