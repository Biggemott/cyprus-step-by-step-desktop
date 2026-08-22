import { describe, expect, it } from "vitest";
import { applyScenarioProgressMutation } from "../electron/progress-mutation";
import type {
  PersistedReminder,
  PersistedScenarioProgress,
  ScenarioProgressMutation,
} from "../src/shared/progress-types";

const reminder = (stepId: string): PersistedReminder => ({
  stepId,
  option: "tomorrow",
  dueAt: 123,
  stepTitle: stepId,
});

const mutation = (completedStepIds: string[] = []): ScenarioProgressMutation => ({
  answers: { already_has_tax_number: "no" },
  completedStepIds,
  lastInteractionAt: 456,
});

const existingProgress = (
  remindersByStepId: Record<string, PersistedReminder>,
): PersistedScenarioProgress => ({
  answers: { already_has_tax_number: "yes" },
  completedStepIds: [],
  remindersByStepId,
  lastInteractionAt: 1,
});

describe("applyScenarioProgressMutation", () => {
  it("initializes an empty reminder map for new progress", () => {
    expect(applyScenarioProgressMutation(undefined, mutation(["completed"]))).toEqual({
      ...mutation(["completed"]),
      remindersByStepId: {},
    });
  });

  it("preserves reminders for incomplete steps", () => {
    const retained = reminder("incomplete");
    expect(
      applyScenarioProgressMutation(existingProgress({ incomplete: retained }), mutation())
        .remindersByStepId,
    ).toEqual({ incomplete: retained });
  });

  it("removes the reminder when its step becomes completed", () => {
    expect(
      applyScenarioProgressMutation(
        existingProgress({ completed: reminder("completed") }),
        mutation(["completed"]),
      ).remindersByStepId,
    ).toEqual({});
  });

  it("preserves unrelated reminders when completing a reminded step", () => {
    const other = reminder("other");
    expect(
      applyScenarioProgressMutation(
        existingProgress({ completed: reminder("completed"), other }),
        mutation(["completed"]),
      ).remindersByStepId,
    ).toEqual({ other });
  });
});
