import type {
  PersistedAppState,
  OperationResult,
  ReminderOperationResult,
  ReminderOption,
  ScenarioProgressMutation,
} from "../shared/progress-types";

declare global {
  interface Window {
    cyprusSteps?: {
      loadAppState(): Promise<PersistedAppState>;
      saveScenarioProgress(
        scenarioId: string,
        progress: ScenarioProgressMutation,
      ): Promise<OperationResult>;
      resetScenarioProgress(scenarioId: string): Promise<OperationResult>;
      setStepReminder(
        scenarioId: string,
        stepId: string,
        option: ReminderOption,
      ): Promise<ReminderOperationResult>;
      removeStepReminder(scenarioId: string, stepId: string): Promise<OperationResult>;
      openExternal(url: string): Promise<boolean>;
    };
  }
}

export {};
