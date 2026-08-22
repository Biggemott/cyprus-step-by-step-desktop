import { describe, expect, it } from "vitest";
import {
  isKnownStepId,
  isSupportedReminderOption,
  isSupportedScenarioId,
  isValidScenarioProgress,
  supportedScenarioId,
} from "../electron/scenario-contract";

describe("scenario IPC contract", () => {
  it("accepts only the supported scenario ID", () => {
    expect(isSupportedScenarioId(supportedScenarioId)).toBe(true);
    expect(isSupportedScenarioId("other-scenario")).toBe(false);
  });

  it("accepts known step IDs and rejects unknown step IDs", () => {
    expect(isKnownStepId("check_if_tax_number_exists")).toBe(true);
    expect(isKnownStepId("unknown-step")).toBe(false);
  });

  it("rejects inherited object property names as step IDs", () => {
    expect(isKnownStepId("toString")).toBe(false);
    expect(isKnownStepId("constructor")).toBe(false);
    expect(isKnownStepId("__proto__")).toBe(false);
  });

  it("accepts supported reminder options and rejects arbitrary options", () => {
    expect(isSupportedReminderOption("tomorrow")).toBe(true);
    expect(isSupportedReminderOption("whenever")).toBe(false);
  });

  it("accepts progress with supported questionnaire answers", () => {
    expect(
      isValidScenarioProgress({
        answers: { already_has_tax_number: "yes", tax_for_all_access: "dont_know" },
        completedStepIds: ["check_if_tax_number_exists"],
        lastInteractionAt: 123,
      }),
    ).toBe(true);
  });

  it("rejects an array as a questionnaire answer map", () => {
    expect(
      isValidScenarioProgress({ answers: [], completedStepIds: [], lastInteractionAt: 1 }),
    ).toBe(false);
  });

  it("rejects progress with unknown answers, steps, or duplicate completed steps", () => {
    for (const progress of [
      { answers: { unknown_question: "yes" }, completedStepIds: [], lastInteractionAt: 1 },
      { answers: { already_has_tax_number: "maybe" }, completedStepIds: [], lastInteractionAt: 1 },
      { answers: {}, completedStepIds: ["unknown-step"], lastInteractionAt: 1 },
      {
        answers: {},
        completedStepIds: ["check_if_tax_number_exists", "check_if_tax_number_exists"],
        lastInteractionAt: 1,
      },
    ])
      expect(isValidScenarioProgress(progress)).toBe(false);
  });
});
