import type { PersistedAppState, PersistedScenarioProgress } from "../shared/progress-types";

declare global {
  interface Window { cyprusSteps?: { loadAppState(): Promise<PersistedAppState>; saveScenarioProgress(scenarioId: string, progress: PersistedScenarioProgress): Promise<void>; resetScenarioProgress(scenarioId: string): Promise<boolean>; openExternal(url: string): Promise<boolean>; }; }
}

export {};
