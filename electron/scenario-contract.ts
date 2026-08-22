import type { ReminderOption } from "../src/shared/progress-types";

export const supportedScenarioId = "get_tax_number_and_tax_for_all_cyprus";
export const knownQuestionIds = new Set(["already_has_tax_number", "tax_for_all_access"]);
export const validAnswerValues = new Set(["yes", "no", "dont_know"]);
export const supportedReminderOptions = new Set<ReminderOption>([
  "tomorrow",
  "in_3_days",
  "in_1_week",
]);

const stepTitles: Record<string, string> = {
  check_if_tax_number_exists: "Check whether you already have a tax number",
  prepare_identity_and_contact_details: "Prepare identity and contact details",
  check_cy_login_or_tfa_login: "Check your login route",
  create_tax_for_all_account_if_needed: "Create a Tax For All account",
  use_official_online_registration_guide: "Use the official online registration instructions",
  submit_or_follow_registration_status: "Submit registration and follow the status",
  confirm_tax_number_and_access: "Confirm your tax number and account access",
  save_tax_documents_and_next_deadlines: "Save tax documents and check future obligations",
};

export function isKnownStepId(value: unknown): value is string {
  return typeof value === "string" && value in stepTitles;
}

export function getStepTitle(stepId: string): string {
  return stepTitles[stepId];
}
