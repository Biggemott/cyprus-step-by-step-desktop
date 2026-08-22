import { app, Notification } from "electron";
import type {
  OperationResult,
  PersistedReminder,
  ReminderOperationResult,
  ReminderOption,
} from "../src/shared/progress-types";
import { loadAppState, loadAppStateResult, updateScenarioProgress } from "./progress-store";
import { getStepTitle } from "./scenario-contract";

const DEMO_DELAY_MS = 30_000;
type Timer = ReturnType<typeof setTimeout>;

export class ReminderScheduler {
  private readonly timers = new Map<string, Timer>();
  private key(scenarioId: string, stepId: string) {
    return `${scenarioId}:${stepId}`;
  }

  set(scenarioId: string, stepId: string, option: ReminderOption): ReminderOperationResult {
    const loaded = loadAppStateResult();
    if (loaded.kind === "failed") return { ok: false, error: loaded.error };
    const progress = loaded.state.scenarios[scenarioId];
    if (!progress || progress.completedStepIds.includes(stepId))
      return { ok: false, error: "The reminder could not be set." };
    const reminder: PersistedReminder = {
      stepId,
      option,
      dueAt: Date.now() + DEMO_DELAY_MS,
      stepTitle: getStepTitle(stepId),
    };
    const result = updateScenarioProgress(scenarioId, (current) => ({
      ...current,
      remindersByStepId: { ...current.remindersByStepId, [stepId]: reminder },
    }));
    if (!result.ok) return result;
    this.schedule(scenarioId, reminder);
    return { ok: true, reminder };
  }

  cancel(scenarioId: string, stepId: string): OperationResult {
    const result = updateScenarioProgress(scenarioId, (current) => {
      const { [stepId]: _removed, ...remindersByStepId } = current.remindersByStepId;
      return { ...current, remindersByStepId };
    });
    if (!result.ok) return result;
    this.clearTimer(scenarioId, stepId);
    return result;
  }

  clearTimer(scenarioId: string, stepId: string) {
    const key = this.key(scenarioId, stepId);
    const timer = this.timers.get(key);
    if (timer) clearTimeout(timer);
    this.timers.delete(key);
  }

  clearAllTimers(scenarioId: string) {
    for (const key of [...this.timers.keys()])
      if (key.startsWith(`${scenarioId}:`)) {
        const timer = this.timers.get(key);
        if (timer) clearTimeout(timer);
        this.timers.delete(key);
      }
  }

  restore() {
    for (const [scenarioId, progress] of Object.entries(loadAppState().scenarios)) {
      for (const reminder of Object.values(progress.remindersByStepId)) {
        if (progress.completedStepIds.includes(reminder.stepId)) {
          this.log(`Removing reminder for completed step ${reminder.stepId} during restore.`);
          const result = this.cancel(scenarioId, reminder.stepId);
          if (!result.ok) this.log(`Could not remove completed reminder: ${result.error}`);
        } else {
          this.log(
            `Restoring ${reminder.dueAt <= Date.now() ? "overdue" : "pending"} reminder for ${reminder.stepId}.`,
          );
          this.schedule(scenarioId, reminder);
        }
      }
    }
  }

  private schedule(scenarioId: string, reminder: PersistedReminder) {
    const key = this.key(scenarioId, reminder.stepId);
    const existing = this.timers.get(key);
    if (existing) clearTimeout(existing);
    const remainingDelay = Math.max(50, reminder.dueAt - Date.now());
    this.log(
      `Scheduling reminder for ${reminder.stepId} at ${reminder.dueAt} (in ${remainingDelay}ms).`,
    );
    this.timers.set(
      key,
      setTimeout(() => this.fire(scenarioId, reminder), remainingDelay),
    );
  }

  private fire(scenarioId: string, reminder: PersistedReminder) {
    this.timers.delete(this.key(scenarioId, reminder.stepId));
    const current = loadAppState().scenarios[scenarioId]?.remindersByStepId[reminder.stepId];
    if (!current || current.dueAt !== reminder.dueAt) return;
    this.log(
      `Reminder timer fired for ${reminder.stepId}. Notification.isSupported()=${Notification.isSupported()}.`,
    );
    if (!Notification.isSupported()) return;
    try {
      const notification = new Notification({
        title: "Cyprus Step-by-Step",
        body: reminder.stepTitle,
      });
      notification.once("show", () => {
        this.log(`Notification shown for ${reminder.stepId}.`);
        this.removeDeliveredReminder(scenarioId, reminder);
      });
      notification.once("failed", (_event, error) =>
        this.log(`Notification failed for ${reminder.stepId}: ${error}`),
      );
      notification.show();
    } catch (error) {
      this.log(
        `Notification construction/show failed for ${reminder.stepId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private removeDeliveredReminder(scenarioId: string, reminder: PersistedReminder) {
    const result = updateScenarioProgress(scenarioId, (current) => {
      const persistedReminder = current.remindersByStepId[reminder.stepId];
      if (!persistedReminder || persistedReminder.dueAt !== reminder.dueAt) return current;
      const { [reminder.stepId]: _delivered, ...remindersByStepId } = current.remindersByStepId;
      return { ...current, remindersByStepId };
    });
    if (!result.ok)
      this.log(`Could not remove delivered reminder from persistence: ${result.error}`);
  }

  private log(message: string) {
    if (!app.isPackaged) console.log(`[reminders] ${message}`);
  }
}
