import { app } from "electron";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  PersistedAppState,
  PersistedReminder,
  PersistedScenarioProgress,
  ScenarioProgressMutation,
} from "../src/shared/progress-types";
import type { OperationResult } from "../src/shared/progress-types";
import { applyScenarioProgressMutation } from "./progress-mutation";

export type { PersistedAppState, PersistedScenarioProgress } from "../src/shared/progress-types";

const emptyState = (): PersistedAppState => ({ version: 1, scenarios: {} });
const storePath = () => path.join(app.getPath("userData"), "cyprussteps-progress.json");
type LoadResult =
  | { kind: "loaded"; state: PersistedAppState }
  | { kind: "missing"; state: PersistedAppState }
  | { kind: "failed"; error: string };
function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
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
    if (typeof progress !== "object" || progress === null) return null;
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
      return null;
    const remindersByStepId: Record<string, PersistedReminder> = {};
    if (typeof item.remindersByStepId === "object" && item.remindersByStepId !== null) {
      for (const [stepId, reminder] of Object.entries(item.remindersByStepId))
        if (!isReminder(reminder) || reminder.stepId !== stepId) return null;
        else remindersByStepId[stepId] = reminder;
    }
    scenarios[id] = {
      answers: item.answers,
      completedStepIds: item.completedStepIds,
      remindersByStepId,
      lastInteractionAt: item.lastInteractionAt,
    };
  }
  return { version: 1, scenarios };
}
export function loadAppStateResult(): LoadResult {
  const filePath = storePath();
  if (!existsSync(filePath)) return { kind: "missing", state: emptyState() };
  try {
    const state = parseState(JSON.parse(readFileSync(filePath, "utf8")));
    if (state) return { kind: "loaded", state };
    console.error("[progress] Could not load persisted progress: invalid file format.");
    return { kind: "failed", error: "Saved progress could not be read." };
  } catch (error) {
    console.error("[progress] Could not load persisted progress:", error);
    return { kind: "failed", error: "Saved progress could not be read." };
  }
}
export function loadAppState(): PersistedAppState {
  const result = loadAppStateResult();
  return result.kind === "failed" ? emptyState() : result.state;
}
function writeState(state: PersistedAppState): OperationResult {
  try {
    const filePath = storePath();
    const tempPath = `${filePath}.tmp`;
    writeFileSync(tempPath, JSON.stringify(state), "utf8");
    renameSync(tempPath, filePath);
    return { ok: true };
  } catch (error) {
    console.error("[progress] Could not write persisted progress:", error);
    return { ok: false, error: "Could not save progress." };
  }
}
export function saveScenarioProgress(
  scenarioId: string,
  progress: ScenarioProgressMutation,
): OperationResult {
  const loaded = loadAppStateResult();
  if (loaded.kind === "failed") return { ok: false, error: loaded.error };
  const state = loaded.state;
  const previous = state.scenarios[scenarioId];
  state.scenarios[scenarioId] = applyScenarioProgressMutation(previous, progress);
  return writeState(state);
}
export function updateScenarioProgress(
  scenarioId: string,
  update: (progress: PersistedScenarioProgress) => PersistedScenarioProgress,
): OperationResult {
  const loaded = loadAppStateResult();
  if (loaded.kind === "failed") return { ok: false, error: loaded.error };
  const state = loaded.state;
  const progress = state.scenarios[scenarioId];
  if (!progress) return { ok: false, error: "Progress was not found." };
  state.scenarios[scenarioId] = update(progress);
  return writeState(state);
}
export function resetScenarioProgress(scenarioId: string): OperationResult {
  const loaded = loadAppStateResult();
  if (loaded.kind === "failed") return { ok: false, error: loaded.error };
  const state = loaded.state;
  delete state.scenarios[scenarioId];
  return writeState(state);
}
