import type { Answers, TaxStep } from "@/data/tax-scenario";

/** Mirrors the KMP ChecklistBuilder: all visibility conditions must match. */
export function buildChecklist(steps: readonly TaxStep[], answers: Answers): TaxStep[] {
  return steps.filter(
    (step) =>
      step.showWhen?.every((condition) => {
        const answer = answers[condition.questionId];
        return answer !== undefined && condition.values.includes(answer);
      }) ?? true,
  );
}
