import type {
  PersistedAppState,
  PersistedReminder,
  PersistedScenarioProgress,
  ReminderOption,
} from "../shared/progress-types";

declare global {
  interface Window {
    cyprusSteps?: {
      loadAppState(): Promise<PersistedAppState>;
      saveScenarioProgress(scenarioId: string, progress: PersistedScenarioProgress): Promise<void>;
      resetScenarioProgress(scenarioId: string): Promise<boolean>;
      setStepReminder(
        scenarioId: string,
        stepId: string,
        option: ReminderOption,
        stepTitle: string,
      ): Promise<PersistedReminder | null>;
      removeStepReminder(scenarioId: string, stepId: string): Promise<void>;
      openExternal(url: string): Promise<boolean>;
    };
  }
}

export {};
