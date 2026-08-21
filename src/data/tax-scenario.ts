export type AnswerId = "yes" | "no" | "dont_know";
export type Answers = Partial<Record<"already_has_tax_number" | "tax_for_all_access", AnswerId>>;

export type TaxSource = { key: string; title: string; url: string; type: "Official" | "Portal" | "Guide" };
export type TaxStep = {
  id: string;
  title: string;
  description: string;
  sourceKeys: string[];
  showWhen?: { questionId: keyof Answers; values: AnswerId[] }[];
};

export const taxScenario = {
  id: "get_tax_number_and_tax_for_all_cyprus",
  category: "Tax",
  title: "Get a tax number and Tax For All access",
  description: "For anyone who needs Cyprus tax access for work, official services or future filings.",
  questions: [
    { id: "already_has_tax_number" as const, text: "Do you already have a Cyprus tax number?" },
    { id: "tax_for_all_access" as const, text: "Do you already have access to Tax For All?" },
  ],
  steps: [
    { id: "check_if_tax_number_exists", title: "Check whether you already have a tax number", description: "Before applying, check documents, employer records, older tax correspondence or Tax For All access to see whether a Cyprus tax number already exists for you.", sourceKeys: ["tax_department_tin"], showWhen: [{ questionId: "already_has_tax_number", values: ["yes", "dont_know"] }] },
    { id: "prepare_identity_and_contact_details", title: "Prepare identity and contact details", description: "Prepare your passport or ID, ARC or Cyprus ID if you have one, date of birth, phone number, email address and current address. Use details exactly as they appear in official documents.", sourceKeys: ["tax_for_all_create_account"] },
    { id: "check_cy_login_or_tfa_login", title: "Check your login route", description: "Tax For All may be accessed through a Tax For All account or CY Login. Check which login route applies to you before creating a new account.", sourceKeys: ["tax_for_all_portal", "cy_login"] },
    { id: "create_tax_for_all_account_if_needed", title: "Create a Tax For All account", description: "Start the official Tax For All account registration and confirm your email when the system asks you to activate the account.", sourceKeys: ["tax_for_all_create_account"], showWhen: [{ questionId: "tax_for_all_access", values: ["no", "dont_know"] }] },
    { id: "use_official_online_registration_guide", title: "Use the official online registration instructions", description: "Follow the current official instructions for individual registration in the Tax Department registry. Use only current Tax Department or Tax For All guidance, not old TAXISnet instructions unless the Tax Department still points you there.", sourceKeys: ["tax_online_registration_guides", "tax_for_all_portal"], showWhen: [{ questionId: "already_has_tax_number", values: ["no", "dont_know"] }] },
    { id: "submit_or_follow_registration_status", title: "Submit registration and follow the status", description: "Submit the registration through the official route shown by Tax For All and keep any confirmation, reference number or message from the Tax Department.", sourceKeys: ["tax_for_all_portal"], showWhen: [{ questionId: "already_has_tax_number", values: ["no", "dont_know"] }] },
    { id: "confirm_tax_number_and_access", title: "Confirm your tax number and account access", description: "After access is ready, confirm that your personal details are correct and that you can sign in again. Save the tax number in a secure place.", sourceKeys: ["tax_for_all_portal"] },
    { id: "save_tax_documents_and_next_deadlines", title: "Save tax documents and check future obligations", description: "Save your tax number, login route, confirmations and any messages from the Tax Department. Check official sources or a qualified professional for personal filing or payment obligations. Use the separate Task “File an individual income tax return” when you need to prepare a return.", sourceKeys: ["tax_department_tin"] },
  ] satisfies TaxStep[],
  sources: [
    { key: "tax_for_all_portal", title: "Tax For All portal", url: "https://taxforall.mof.gov.cy/", type: "Portal" },
    { key: "tax_for_all_create_account", title: "Tax For All account registration", url: "https://taxforall.mof.gov.cy/CreateAccount", type: "Portal" },
    { key: "tax_online_registration_guides", title: "Tax Department online registration guides", url: "https://www.gov.cy/mof-tfa/en/documents/online-registration-guides/", type: "Guide" },
    { key: "tax_department_tin", title: "Tax Department — Tax Identification Number", url: "https://www.mof.gov.cy/mof/tax/taxdep.nsf/All/F916AB10266CD23AC22581EF003A925F", type: "Official" },
    { key: "cy_login", title: "CY Login", url: "https://cylogin.cyprus.gov.cy/", type: "Portal" },
  ] satisfies TaxSource[],
} as const;

export const answerOptions: { id: AnswerId; label: string }[] = [
  { id: "yes", label: "Yes" }, { id: "no", label: "No" }, { id: "dont_know", label: "I don't know" },
];
