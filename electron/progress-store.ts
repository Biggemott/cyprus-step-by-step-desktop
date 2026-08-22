import { app } from "electron";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  PersistedAppState,
  PersistedReminder,
  PersistedScenarioProgress,
} from "../src/shared/progress-types";

export type { PersistedAppState, PersistedScenarioProgress } from "../src/shared/progress-types";

const emptyState = (): PersistedAppState => ({ version: 1, scenarios: {} });
const storePath = () => path.join(app.getPath("userData"), "cyprussteps-progress.json");
function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.values(value).every((item) => typeof item === "string")
  );
}
function isReminder(value: unknown): value is PersistedReminder {
  if (typeof value !== "object" || value === null) return false;
  const item = value as {
    stepId?: unknown;
    option?: unknown;
    dueAt?: unknown;
    stepTitle?: unknown;
  };
  return (
    typeof item.stepId === "string" &&
    (item.option === "tomorrow" || item.option === "in_3_days" || item.option === "in_1_week") &&
    Number.isFinite(item.dueAt) &&
    typeof item.stepTitle === "string"
  );
}
function parseState(value: unknown): PersistedAppState | null {
  if (typeof value !== "object" || value === null) return null;
  const state = value as { version?: unknown; scenarios?: unknown };
  if (state.version !== 1 || typeof state.scenarios !== "object" || state.scenarios === null)
    return null;
  const scenarios: Record<string, PersistedScenarioProgress> = {};
  for (const [id, progress] of Object.entries(state.scenarios)) {
    if (typeof progress !== "object" || progress === null) continue;
    const item = progress as {
      answers?: unknown;
      completedStepIds?: unknown;
      remindersByStepId?: unknown;
      lastInteractionAt?: unknown;
    };
    if (
      !isStringRecord(item.answers) ||
      !Array.isArray(item.completedStepIds) ||
      !item.completedStepIds.every((step) => typeof step === "string") ||
      typeof item.lastInteractionAt !== "number"
    )
      continue;
    const remindersByStepId: Record<string, PersistedReminder> = {};
    if (typeof item.remindersByStepId === "object" && item.remindersByStepId !== null)
      for (const [stepId, reminder] of Object.entries(item.remindersByStepId))
        if (isReminder(reminder) && reminder.stepId === stepId)
          remindersByStepId[stepId] = reminder;
    scenarios[id] = {
      answers: item.answers,
      completedStepIds: item.completedStepIds,
      remindersByStepId,
      lastInteractionAt: item.lastInteractionAt,
    };
  }
  return { version: 1, scenarios };
}
export function loadAppState(): PersistedAppState {
  try {
    return parseState(JSON.parse(readFileSync(storePath(), "utf8"))) ?? emptyState();
  } catch {
    return emptyState();
  }
}
function writeState(state: PersistedAppState): boolean {
  try {
    const filePath = storePath();
    const tempPath = `${filePath}.tmp`;
    writeFileSync(tempPath, JSON.stringify(state), "utf8");
    renameSync(tempPath, filePath);
    return true;
  } catch {
    return false;
  }
}
export function saveScenarioProgress(
  scenarioId: string,
  progress: PersistedScenarioProgress,
): void {
  const state = loadAppState();
  const previous = state.scenarios[scenarioId];
  state.scenarios[scenarioId] = {
    ...progress,
    remindersByStepId: previous?.remindersByStepId ?? progress.remindersByStepId,
  };
  writeState(state);
}
export function updateScenarioProgress(
  scenarioId: string,
  update: (progress: PersistedScenarioProgress) => PersistedScenarioProgress,
): void {
  const state = loadAppState();
  const progress = state.scenarios[scenarioId];
  if (!progress) return;
  state.scenarios[scenarioId] = update(progress);
  writeState(state);
}
export function resetScenarioProgress(scenarioId: string): boolean {
  const state = loadAppState();
  delete state.scenarios[scenarioId];
  return writeState(state);
}
