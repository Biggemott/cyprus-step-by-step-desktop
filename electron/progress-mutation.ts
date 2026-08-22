import type {
  PersistedScenarioProgress,
  ScenarioProgressMutation,
} from "../src/shared/progress-types";

export function applyScenarioProgressMutation(
  existingProgress: PersistedScenarioProgress | undefined,
  mutation: ScenarioProgressMutation,
): PersistedScenarioProgress {
  return {
    answers: mutation.answers,
    completedStepIds: mutation.completedStepIds,
    lastInteractionAt: mutation.lastInteractionAt,
    remindersByStepId: Object.fromEntries(
      Object.entries(existingProgress?.remindersByStepId ?? {}).filter(
        ([stepId]) => !mutation.completedStepIds.includes(stepId),
      ),
    ),
  };
}
