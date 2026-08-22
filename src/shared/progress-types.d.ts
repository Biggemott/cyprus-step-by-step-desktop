export type PersistedScenarioProgress = {
  answers: Record<string, string>;
  completedStepIds: string[];
  lastInteractionAt: number;
};

export type PersistedAppState = {
  version: 1;
  scenarios: Record<string, PersistedScenarioProgress>;
};
