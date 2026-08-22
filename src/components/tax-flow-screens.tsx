import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { Answers, TaxSource, TaxStep } from "@/data/tax-scenario";
import type { PersistedReminder, ReminderOption } from "@/shared/progress-types";
import { answerOptions, taxScenario } from "@/data/tax-scenario";
import { useModalFocus } from "./modal-focus";

function Context({ showTaskTitle = true }: { showTaskTitle?: boolean }) {
  return (
    <>
      <span className="pill flow-pill">Tax</span>
      {showTaskTitle && <p className="flow-task-title">{taxScenario.title}</p>}
    </>
  );
}
function DoneCircle({ done, onClick }: { done: boolean; onClick?: () => void }) {
  return (
    <button
      className={`done-circle ${done ? "done-circle--done" : ""}`}
      aria-label={done ? "Mark step as not done" : "Mark step as done"}
      onClick={onClick}
    >
      {done ? "✓" : ""}
    </button>
  );
}
function SourceChip() {
  return (
    <span className="source-chip">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" />
      </svg>
      Source links
    </span>
  );
}

export function QuestionnaireScreen({
  questionIndex,
  answers,
  onAnswer,
  onBack,
  onNext,
}: {
  questionIndex: 0 | 1;
  answers: Answers;
  onAnswer: (id: "yes" | "no" | "dont_know") => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const question = taxScenario.questions[questionIndex];
  const selected = answers[question.id];
  const last = questionIndex === 1;
  return (
    <section className="page flow-page questionnaire-page">
      <button className="breadcrumb" onClick={onBack}>
        ← <span>{questionIndex === 0 ? "Task details" : "Previous question"}</span>
      </button>
      <Context />
      <div className="question-progress">
        <span>
          Question {questionIndex + 1} of {taxScenario.questions.length}
        </span>
        <i>
          <b style={{ width: `${((questionIndex + 1) / taxScenario.questions.length) * 100}%` }} />
        </i>
      </div>
      <h1>{question.text}</h1>
      <div className="answer-list">
        {answerOptions.map((option) => (
          <button
            key={option.id}
            className={`answer-card ${selected === option.id ? "answer-card--selected" : ""}`}
            onClick={() => onAnswer(option.id)}
          >
            <i className="radio">{selected === option.id && <b />}</i>
            {option.label}
          </button>
        ))}
      </div>
      <button className="primary-button flow-action" disabled={!selected} onClick={onNext}>
        {last ? "Create checklist" : "Next"}
      </button>
    </section>
  );
}

export function ChecklistScreen({
  steps,
  completed,
  backLabel,
  onBack,
  onToggle,
  onOpen,
  onReset,
}: {
  steps: TaxStep[];
  completed: Set<string>;
  backLabel: string;
  onBack: () => void;
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
  onReset: () => Promise<void>;
}) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const moreTriggerRef = useRef<HTMLButtonElement>(null);
  const resetMenuItemRef = useRef<HTMLButtonElement>(null);
  const resetDialogRef = useRef<HTMLElement>(null);
  const resetRestoreFocusRef = useRef(true);
  const closeMoreMenu = () => {
    setIsMoreOpen(false);
    requestAnimationFrame(() => moreTriggerRef.current?.focus());
  };
  useEffect(() => {
    if (!isMoreOpen) return;
    const frame = requestAnimationFrame(() => resetMenuItemRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMoreMenu();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [isMoreOpen]);
  useModalFocus(
    isResetConfirmOpen,
    resetDialogRef,
    moreTriggerRef,
    () => setIsResetConfirmOpen(false),
    resetRestoreFocusRef.current,
  );
  const incomplete = steps.filter((step) => !completed.has(step.id));
  const next = incomplete[0];
  const done = steps.length - incomplete.length;
  const finished = steps.filter((step) => completed.has(step.id));
  const Card = ({ step, nextStep = false }: { step: TaxStep; nextStep?: boolean }) => (
    <article className={`checklist-card ${nextStep ? "checklist-card--next" : ""}`}>
      <DoneCircle done={completed.has(step.id)} onClick={() => onToggle(step.id)} />
      <button className="checklist-card__body" onClick={() => onOpen(step.id)}>
        <span>{step.title}</span>
        {step.sourceKeys.length > 0 && <SourceChip />}
      </button>
      <button
        className="open-step"
        aria-label={`Open ${step.title}`}
        onClick={() => onOpen(step.id)}
      >
        ›
      </button>
    </article>
  );
  return (
    <section className="page flow-page checklist-page">
      <div className="checklist-header">
        <button className="breadcrumb" onClick={onBack}>
          ← <span>{backLabel}</span>
        </button>
        <div className="more-menu">
          <button
            ref={moreTriggerRef}
            className="more-button"
            aria-label="More actions"
            aria-expanded={isMoreOpen}
            aria-haspopup="menu"
            onClick={() => setIsMoreOpen((open) => !open)}
          >
            ⋮
          </button>
          {isMoreOpen && (
            <div role="menu">
              <button
                ref={resetMenuItemRef}
                role="menuitem"
                className="more-menu__item"
                onClick={() => {
                  resetRestoreFocusRef.current = true;
                  setIsMoreOpen(false);
                  setIsResetConfirmOpen(true);
                }}
              >
                Reset progress
              </button>
            </div>
          )}
        </div>
      </div>
      <Context showTaskTitle={false} />
      <h1>{taxScenario.title}</h1>
      <p className="checklist-description">{taxScenario.description}</p>
      <div className="progress-summary">
        <strong>
          {done} of {steps.length} steps done
        </strong>
        <i>
          <b style={{ width: `${steps.length ? (done / steps.length) * 100 : 0}%` }} />
        </i>
      </div>
      {next ? (
        <section>
          <h2>Next step</h2>
          <Card step={next} nextStep />
        </section>
      ) : (
        <section className="all-done">
          <h2>All steps done</h2>
          <p>You&apos;ve completed this personalized checklist.</p>
        </section>
      )}
      {incomplete.slice(1).length > 0 && (
        <section className="upcoming">
          <h2>Upcoming steps</h2>
          {incomplete.slice(1).map((step) => (
            <Card key={step.id} step={step} />
          ))}
        </section>
      )}
      {finished.length > 0 && (
        <section className="upcoming">
          <h2>Completed steps</h2>
          {finished.map((step) => (
            <Card key={step.id} step={step} />
          ))}
        </section>
      )}
      {isResetConfirmOpen && (
        <div className="reset-dialog-backdrop" role="presentation">
          <section
            ref={resetDialogRef}
            className="reset-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-progress-title"
          >
            <h2 id="reset-progress-title">Reset progress?</h2>
            <p>This will remove your answers, checklist progress and reminders for this task.</p>
            <div>
              <button
                data-modal-initial-focus
                className="secondary-button"
                onClick={() => setIsResetConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="danger-button"
                onClick={() => {
                  resetRestoreFocusRef.current = false;
                  setIsResetConfirmOpen(false);
                  void onReset();
                }}
              >
                Reset progress
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

const sourceTypeLabel: Record<TaxSource["type"], string> = {
  Official: "Official source",
  Portal: "Online service",
  Guide: "Guide",
};
const reminderLabels: Record<ReminderOption, string> = {
  tomorrow: "Tomorrow",
  in_3_days: "In 3 days",
  in_1_week: "In 1 week",
};
export function StepDetailsScreen({
  step,
  sources,
  completed,
  reminder,
  onBack,
  onToggle,
  onSetReminder,
  onRemoveReminder,
  onOpenSource,
}: {
  step: TaxStep;
  sources: readonly TaxSource[];
  completed: boolean;
  reminder?: PersistedReminder;
  onBack: () => void;
  onToggle: () => void;
  onSetReminder: (option: ReminderOption) => Promise<void>;
  onRemoveReminder: () => Promise<void>;
  onOpenSource: (url: string) => void;
}) {
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ReminderOption>("tomorrow");
  const reminderDialogRef = useRef<HTMLElement>(null);
  const reminderOpenerRef = useRef<HTMLElement>(null);
  useModalFocus(isReminderDialogOpen, reminderDialogRef, reminderOpenerRef, () =>
    setIsReminderDialogOpen(false),
  );
  const stepSources = step.sourceKeys
    .map((key) => sources.find((source) => source.key === key))
    .filter((source): source is TaxSource => Boolean(source));
  const openReminderDialog = (event: MouseEvent<HTMLElement>) => {
    reminderOpenerRef.current = event.currentTarget;
    setSelectedOption(reminder?.option ?? "tomorrow");
    setIsReminderDialogOpen(true);
  };
  return (
    <section className="page flow-page step-details-page">
      <button className="breadcrumb" onClick={onBack}>
        ← <span>Checklist</span>
      </button>
      <Context />
      <h1>{step.title}</h1>
      <span className={`status-pill ${completed ? "status-pill--done" : ""}`}>
        {completed ? "Done" : "Not done"}
      </span>
      <section className="detail-section">
        <h2>What to do</h2>
        <div className="instruction-card">{step.description}</div>
      </section>
      <section className="detail-section">
        <h2>Source links</h2>
        <div className="source-links">
          {stepSources.map((source) => (
            <button
              className="source-link"
              key={source.key}
              aria-label={`${source.title} (opens in external browser)`}
              onClick={() => onOpenSource(source.url)}
            >
              <strong>{source.title}</strong>
              <span>{sourceTypeLabel[source.type]}</span>
              <svg className="external-link-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
              </svg>
            </button>
          ))}
        </div>
        <p className="disclaimer">
          Information may change or depend on your situation. Always verify important details with
          official sources before taking action.
        </p>
      </section>
      {!completed && (
        <section className="detail-section">
          <h2>Reminder</h2>
          {reminder ? (
            <div className="reminder-card reminder-card--set">
              <button className="reminder-card__change" onClick={openReminderDialog}>
                <span className="reminder-card__label">
                  ◷ {reminderLabels[reminder.option]} <small>Reminder set</small>
                </span>
                <span className="text-action">Change</span>
              </button>
              <button
                className="text-action text-action--muted"
                onClick={() => {
                  void onRemoveReminder();
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              className="reminder-card reminder-card--interactive"
              onClick={openReminderDialog}
            >
              <span className="reminder-card__label">◷ Set reminder</span>
            </button>
          )}
        </section>
      )}
      {!completed && reminder && (
        <p className="reminder-note">Marking this step as done will cancel its reminder.</p>
      )}
      <button className="primary-button flow-action" onClick={onToggle}>
        {completed ? "Mark as not done" : "Mark as done"}
      </button>
      {isReminderDialogOpen && (
        <div className="reset-dialog-backdrop" role="presentation">
          <section
            ref={reminderDialogRef}
            className="reset-dialog reminder-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reminder-dialog-title"
          >
            <h2 id="reminder-dialog-title">Set reminder</h2>
            <div className="reminder-options" role="radiogroup" aria-label="Reminder timing">
              {(Object.keys(reminderLabels) as ReminderOption[]).map((option) => (
                <button
                  key={option}
                  role="radio"
                  aria-checked={selectedOption === option}
                  data-modal-initial-focus={selectedOption === option || undefined}
                  className={`reminder-option ${selectedOption === option ? "reminder-option--selected" : ""}`}
                  onClick={() => setSelectedOption(option)}
                >
                  <i className="radio">{selectedOption === option && <b />}</i>
                  <span>{reminderLabels[option]}</span>
                </button>
              ))}
            </div>
            <div className="reminder-actions">
              <button className="secondary-button" onClick={() => setIsReminderDialogOpen(false)}>
                Cancel
              </button>
              <button
                className="primary-button reminder-confirm"
                onClick={() => {
                  void onSetReminder(selectedOption);
                  setIsReminderDialogOpen(false);
                }}
              >
                Set reminder
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
