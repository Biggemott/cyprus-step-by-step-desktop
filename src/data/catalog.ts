export type CategoryId = "relocation" | "daily_life" | "tax" | "work" | "healthcare" | "housing" | "family" | "car";

export type Category = { id: CategoryId; title: string };
export type Scenario = { id: string; category: CategoryId; title: string; stepEstimate: string; desktopSupported: boolean };

export const categories: Category[] = [
  { id: "relocation", title: "Relocation" },
  { id: "daily_life", title: "Daily life" },
  { id: "tax", title: "Tax" },
  { id: "work", title: "Work" },
  { id: "healthcare", title: "Healthcare" },
  { id: "housing", title: "Housing" },
  { id: "family", title: "Family & children" },
  { id: "car", title: "Car" },
];

const supported = "get_tax_number_and_tax_for_all_cyprus";
export const scenarios: Scenario[] = [
  { id: "first_steps_after_arrival_cyprus", category: "relocation", title: "First steps after arrival", stepEstimate: "Usually 10–12 steps", desktopSupported: false },
  { id: "prepare_address_proof_cyprus", category: "daily_life", title: "Prepare proof of address", stepEstimate: "Usually 6–8 steps", desktopSupported: false },
  { id: supported, category: "tax", title: "Get a tax number and Tax For All access", stepEstimate: "Usually 5–7 steps", desktopSupported: true },
  { id: "apply_for_visitor_residence_permit_cyprus", category: "relocation", title: "Apply for a visitor residence permit", stepEstimate: "Usually 8 steps", desktopSupported: false },
  { id: "register_as_eu_citizen_cyprus", category: "relocation", title: "Register as an EU citizen", stepEstimate: "Usually 8–9 steps", desktopSupported: false },
  { id: "open_bank_account_cyprus", category: "daily_life", title: "Open a personal bank account", stepEstimate: "Usually 9–10 steps", desktopSupported: false },
  { id: "renew_visitor_residence_permit_cyprus", category: "relocation", title: "Renew a visitor residence permit", stepEstimate: "Usually 8–10 steps", desktopSupported: false },
  { id: "file_individual_income_tax_return_cyprus", category: "tax", title: "File an individual income tax return", stepEstimate: "Usually 7–9 steps", desktopSupported: false },
  { id: "register_with_social_insurance_cyprus", category: "work", title: "Register with Social Insurance", stepEstimate: "Usually 5–7 steps", desktopSupported: false },
  { id: "register_with_gesy_cyprus", category: "healthcare", title: "Register with GESY", stepEstimate: "Usually 7–10 steps", desktopSupported: false },
  { id: "transfer_electricity_account_cyprus", category: "housing", title: "Transfer EAC electricity to your name", stepEstimate: "Usually 5–6 steps", desktopSupported: false },
  { id: "prepare_certified_translation_cyprus", category: "daily_life", title: "Prepare a certified translation", stepEstimate: "Usually 7–8 steps", desktopSupported: false },
  { id: "get_apostille_cyprus", category: "daily_life", title: "Get an apostille", stepEstimate: "Usually 7–8 steps", desktopSupported: false },
  { id: "enroll_child_in_public_school_cyprus", category: "family", title: "Enrol a child in public school", stepEstimate: "Usually 6–8 steps", desktopSupported: false },
  { id: "exchange_foreign_driving_licence_cyprus", category: "car", title: "Exchange a foreign driving licence", stepEstimate: "Usually 7–8 steps", desktopSupported: false },
  { id: "buy_used_car_cyprus", category: "car", title: "Buy a used car registered in Cyprus", stepEstimate: "Usually 10–11 steps", desktopSupported: false },
  { id: "renew_mot_cyprus", category: "car", title: "Renew MOT", stepEstimate: "Usually 6–7 steps", desktopSupported: false },
  { id: "renew_road_tax_cyprus", category: "car", title: "Renew road tax", stepEstimate: "Usually 6–7 steps", desktopSupported: false },
];

export const targetScenarioId = supported;
export const targetScenario = {
  title: "Get a tax number and Tax For All access",
  description: "For anyone who needs Cyprus tax access for work, official services or future filings.",
  stepEstimate: "Usually 5–7 steps",
  benefits: ["Answer a few questions", "Get a personalized checklist", "Track your progress", "Add reminders when needed"],
};
