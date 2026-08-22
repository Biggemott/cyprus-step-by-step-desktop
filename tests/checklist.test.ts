import { describe, expect, it } from "vitest";
import { buildChecklist } from "../src/lib/checklist";
import type { Answers, TaxStep } from "../src/data/tax-scenario";

const step = (id: string, showWhen?: TaxStep["showWhen"]): TaxStep => ({
  id,
  title: id,
  description: id,
  sourceKeys: [],
  showWhen,
});

describe("buildChecklist", () => {
  it("keeps unconditional steps visible regardless of answers", () => {
    expect(buildChecklist([step("always")], {})).toEqual([step("always")]);
  });

  it("includes a conditional step when its condition matches", () => {
    const conditional = step("matching", [
      { questionId: "already_has_tax_number", values: ["yes"] },
    ]);

    expect(buildChecklist([conditional], { already_has_tax_number: "yes" })).toEqual([conditional]);
  });

  it("excludes a conditional step when its condition does not match", () => {
    expect(
      buildChecklist(
        [step("not-matching", [{ questionId: "tax_for_all_access", values: ["no"] }])],
        {
          tax_for_all_access: "yes",
        },
      ),
    ).toEqual([]);
  });

  it("requires all showWhen conditions to match", () => {
    const conditional = step("all-conditions", [
      { questionId: "already_has_tax_number", values: ["yes"] },
      { questionId: "tax_for_all_access", values: ["no"] },
    ]);

    expect(
      buildChecklist([conditional], {
        already_has_tax_number: "yes",
        tax_for_all_access: "yes",
      }),
    ).toEqual([]);

    expect(
      buildChecklist([conditional], {
        already_has_tax_number: "yes",
        tax_for_all_access: "no",
      }),
    ).toEqual([conditional]);
  });

  it("preserves content ordering after conditional filtering", () => {
    const steps = [
      step("first", [{ questionId: "already_has_tax_number", values: ["yes"] }]),
      step("second"),
      step("third", [{ questionId: "tax_for_all_access", values: ["no"] }]),
    ];

    expect(
      buildChecklist(steps, { already_has_tax_number: "yes", tax_for_all_access: "no" }).map(
        ({ id }) => id,
      ),
    ).toEqual(["first", "second", "third"]);
  });

  it("excludes a conditional step when its answer is missing", () => {
    const answers: Answers = {};
    expect(
      buildChecklist(
        [step("conditional", [{ questionId: "already_has_tax_number", values: ["yes"] }])],
        answers,
      ),
    ).toEqual([]);
  });
});
