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

export type ScenarioProgressMutation = Pick<
  PersistedScenarioProgress,
  "answers" | "completedStepIds" | "lastInteractionAt"
>;

export type PersistedAppState = {
  version: 1;
  scenarios: Record<string, PersistedScenarioProgress>;
};

export type OperationResult = { ok: true } | { ok: false; error: string };

export type ReminderOperationResult =
  { ok: true; reminder: PersistedReminder } | { ok: false; error: string };
