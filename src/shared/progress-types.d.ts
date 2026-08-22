export type ReminderOption = "tomorrow" | "in_3_days" | "in_1_week";

export type PersistedReminder = {
  stepId: string;
  option: ReminderOption;
  dueAt: number;
  stepTitle: string;
};

export type PersistedScenarioProgress = {
  answers: Record<string, string>;
  completedStepIds: string[];
  remindersByStepId: Record<string, PersistedReminder>;
  lastInteractionAt: number;
};

export type PersistedAppState = {
  version: 1;
  scenarios: Record<string, PersistedScenarioProgress>;
};
