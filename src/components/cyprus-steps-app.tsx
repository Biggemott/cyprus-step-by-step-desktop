"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { PersistedReminder, ReminderOption } from "@/shared/progress-types";
import {
  categories,
  scenarios,
  targetScenario,
  targetScenarioId,
  type CategoryId,
  type Scenario,
} from "@/data/catalog";
import { taxScenario, type Answers, type TaxStep } from "@/data/tax-scenario";
import { buildChecklist } from "@/lib/checklist";
import { CategoryIcon } from "./category-icon";
import { ChecklistScreen, QuestionnaireScreen, StepDetailsScreen } from "./tax-flow-screens";

type Origin = "home" | "tax";
type Lifecycle = "available" | "started" | "completed";
type Screen =
  | { name: "home" }
  | { name: "category"; categoryId: CategoryId }
  | { name: "details"; origin: Origin }
  | { name: "questionnaire"; origin: Origin; questionIndex: 0 | 1 }
  | { name: "checklist"; origin: Origin }
  | { name: "step-details"; origin: Origin; stepId: string };

function getScreenKey(screen: Screen) {
  if (screen.name === "category") return `category:${screen.categoryId}`;
  if (screen.name === "details") return `details:${screen.origin}`;
  if (screen.name === "questionnaire") return `questionnaire:${screen.questionIndex}`;
  if (screen.name === "checklist") return "checklist";
  if (screen.name === "step-details") return `step-details:${screen.stepId}`;
  return "home";
}
function Arrow() {
  return (
    <span className="arrow" aria-hidden="true">
      ›
    </span>
  );
}
function BenefitIcon({ type }: { type: number }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  const icon: Record<number, ReactNode> = {
    0: (
      <>
        <path {...common} d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v15H8.5A3.5 3.5 0 0 0 5 20.5Z" />
        <path {...common} d="M19 5.5A3.5 3.5 0 0 0 15.5 2H12v15h3.5a3.5 3.5 0 0 1 3.5 3.5Z" />
      </>
    ),
    1: (
      <>
        <path {...common} d="M6 3h9l3 3v15H6z" />
        <path {...common} d="M15 3v4h4M9 12h6M9 16h6" />
        <path {...common} d="m9 8 1 1 2-2" />
      </>
    ),
    2: (
      <>
        <path {...common} d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
      </>
    ),
    3: (
      <>
        <path {...common} d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {icon[type]}
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Sidebar({
  screen,
  onHome,
  onCategory,
}: {
  screen: Screen;
  onHome: () => void;
  onCategory: (id: CategoryId) => void;
}) {
  const isCategoryActive = (categoryId: CategoryId) =>
    (screen.name === "category" && screen.categoryId === categoryId) ||
    (["details", "questionnaire", "checklist", "step-details"].includes(screen.name) &&
      categoryId === "tax");
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="./cyprussteps-brandmark.svg" alt="" />
        <span>Cyprus Step-by-Step</span>
      </div>
      <nav aria-label="Main navigation">
        <button
          className={`nav-item ${screen.name === "home" ? "nav-item--active" : ""}`}
          onClick={onHome}
        >
          <span className="home-glyph">⌂</span>Home
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`nav-item ${isCategoryActive(category.id) ? "nav-item--active" : ""}`}
            onClick={() => onCategory(category.id)}
          >
            <CategoryIcon category={category.id} />
            {category.title}
          </button>
        ))}
      </nav>
    </aside>
  );
}
function ScenarioCard({ scenario, onOpen }: { scenario: Scenario; onOpen: () => void }) {
  const category = categories.find((item) => item.id === scenario.category)!;
  const active = scenario.desktopSupported;
  return (
    <button
      className={`scenario-card ${active ? "scenario-card--active" : "scenario-card--muted"}`}
      onClick={active ? onOpen : undefined}
      disabled={!active}
    >
      <div>
        <span className="scenario-card__title">{scenario.title}</span>
        <span className="scenario-card__meta">
          <b>{category.title}</b>
          <i />
          {scenario.stepEstimate}
        </span>
      </div>
      {active && <Arrow />}
    </button>
  );
}
function ProgressTaskCard({
  done,
  total,
  completed,
  onOpen,
}: {
  done: number;
  total: number;
  completed: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      className={`scenario-card scenario-card--active progress-task-card ${completed ? "progress-task-card--completed" : ""}`}
      onClick={onOpen}
    >
      <div>
        <span className="scenario-card__title">{targetScenario.title}</span>
        <span className="scenario-card__meta">
          <b>Tax</b>
          <i />
          {done} of {total} steps done
        </span>
        <i className="task-progress">
          <b style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
        </i>
      </div>
      <span className="task-card-mark" aria-hidden="true">
        {completed ? "✓" : "›"}
      </span>
    </button>
  );
}

export function CyprusStepsApp() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const [answers, setAnswers] = useState<Answers>({});
  const [visibleSteps, setVisibleSteps] = useState<TaxStep[]>([]);
  const [completedStepIds, setCompletedStepIds] = useState<Set<string>>(() => new Set());
  const [remindersByStepId, setRemindersByStepId] = useState<Record<string, PersistedReminder>>({});
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const contentAreaRef = useRef<HTMLElement>(null);
  const saveProgress = (nextAnswers: Answers, nextCompleted: Set<string>) => {
    const finalizedAnswers: Record<string, string> = {};
    for (const [key, value] of Object.entries(nextAnswers))
      if (value) finalizedAnswers[key] = value;
    void window.cyprusSteps?.saveScenarioProgress(targetScenarioId, {
      answers: finalizedAnswers,
      completedStepIds: [...nextCompleted],
      remindersByStepId: {},
      lastInteractionAt: Date.now(),
    });
  };
  const hasChecklist = visibleSteps.length > 0;
  const doneCount = visibleSteps.filter((step) => completedStepIds.has(step.id)).length;
  const lifecycle: Lifecycle = !hasChecklist
    ? "available"
    : doneCount === visibleSteps.length
      ? "completed"
      : "started";
  useEffect(() => {
    const bridge = window.cyprusSteps;
    if (!bridge) {
      setIsBootstrapped(true);
      return;
    }
    void bridge
      .loadAppState()
      .then((state) => {
        const progress = state.scenarios[targetScenarioId];
        const restoredAnswers: Answers = {};
        for (const question of taxScenario.questions) {
          const answer = progress?.answers[question.id];
          if (answer === "yes" || answer === "no" || answer === "dont_know")
            restoredAnswers[question.id] = answer;
        }
        if (progress && taxScenario.questions.every((question) => restoredAnswers[question.id])) {
          const restoredSteps = buildChecklist(taxScenario.steps, restoredAnswers);
          const completed = new Set(
            progress.completedStepIds.filter((id) => restoredSteps.some((step) => step.id === id)),
          );
          setAnswers(restoredAnswers);
          setVisibleSteps(restoredSteps);
          setCompletedStepIds(completed);
          setRemindersByStepId(
            Object.fromEntries(
              Object.entries(progress.remindersByStepId).filter(
                ([stepId]) =>
                  restoredSteps.some((step) => step.id === stepId) && !completed.has(stepId),
              ),
            ),
          );
        }
      })
      .catch(() => undefined)
      .finally(() => setIsBootstrapped(true));
  }, []);
  const refreshReminders = async () => {
    const progress = (await window.cyprusSteps?.loadAppState())?.scenarios[targetScenarioId];
    if (progress) setRemindersByStepId(progress.remindersByStepId);
  };
  const openChecklist = (origin: Origin) => {
    saveProgress(answers, completedStepIds);
    setScreen({ name: "checklist", origin });
  };
  const openScenario = (scenario: Scenario, origin: Origin) => {
    if (scenario.id === targetScenarioId)
      lifecycle === "available" ? setScreen({ name: "details", origin }) : openChecklist(origin);
  };
  const openCategory = (categoryId: CategoryId) => setScreen({ name: "category", categoryId });
  const toggleStep = (stepId: string) =>
    setCompletedStepIds((current) => {
      const next = new Set(current);
      const isCompleting = !next.has(stepId);
      if (isCompleting) {
        next.add(stepId);
        setRemindersByStepId((reminders) => {
          const { [stepId]: _removed, ...remaining } = reminders;
          return remaining;
        });
      } else next.delete(stepId);
      saveProgress(answers, next);
      return next;
    });
  const resetProgress = async (origin: Origin) => {
    if (!(await window.cyprusSteps?.resetScenarioProgress(targetScenarioId))) return;
    setAnswers({});
    setVisibleSteps([]);
    setCompletedStepIds(new Set());
    setRemindersByStepId({});
    setScreen({ name: "details", origin });
  };
  const screenKey = getScreenKey(screen);
  useLayoutEffect(() => {
    contentAreaRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [screenKey]);
  const targetScenarioCard = scenarios.find((scenario) => scenario.id === targetScenarioId)!;
  const otherUnstartedScenarios = scenarios.filter((scenario) => scenario.id !== targetScenarioId);
  const homeRecommended = (
    lifecycle === "available"
      ? [targetScenarioCard, ...otherUnstartedScenarios]
      : otherUnstartedScenarios
  ).slice(0, 4);
  const taxAvailable = scenarios.filter(
    (scenario) =>
      scenario.category === "tax" &&
      (scenario.id !== targetScenarioId || lifecycle === "available"),
  );
  let content: ReactNode;
  if (screen.name === "details") {
    const backTarget =
      screen.origin === "home"
        ? { label: "Home", screen: { name: "home" } as Screen }
        : { label: "Tax", screen: { name: "category", categoryId: "tax" } as Screen };
    content = (
      <ScenarioDetails
        backLabel={backTarget.label}
        onBack={() => setScreen(backTarget.screen)}
        onStart={() =>
          setScreen({ name: "questionnaire", origin: screen.origin, questionIndex: 0 })
        }
      />
    );
  } else if (screen.name === "questionnaire")
    content = (
      <QuestionnaireScreen
        questionIndex={screen.questionIndex}
        answers={answers}
        onAnswer={(answer) =>
          setAnswers((current) => ({
            ...current,
            [taxScenario.questions[screen.questionIndex].id]: answer,
          }))
        }
        onBack={() =>
          screen.questionIndex === 0
            ? setScreen({ name: "details", origin: screen.origin })
            : setScreen({ name: "questionnaire", origin: screen.origin, questionIndex: 0 })
        }
        onNext={() => {
          if (screen.questionIndex === 0)
            setScreen({ name: "questionnaire", origin: screen.origin, questionIndex: 1 });
          else {
            const nextSteps = buildChecklist(taxScenario.steps, answers);
            const emptyCompleted = new Set<string>();
            setVisibleSteps(nextSteps);
            setCompletedStepIds(emptyCompleted);
            saveProgress(answers, emptyCompleted);
            setScreen({ name: "checklist", origin: screen.origin });
          }
        }}
      />
    );
  else if (screen.name === "checklist") {
    const backScreen: Screen =
      screen.origin === "home" ? { name: "home" } : { name: "category", categoryId: "tax" };
    content = (
      <ChecklistScreen
        steps={visibleSteps}
        completed={completedStepIds}
        backLabel={screen.origin === "home" ? "Home" : "Tax"}
        onBack={() => setScreen(backScreen)}
        onToggle={toggleStep}
        onOpen={(stepId) => {
          void refreshReminders();
          setScreen({ name: "step-details", origin: screen.origin, stepId });
        }}
        onReset={() => resetProgress(screen.origin)}
      />
    );
  } else if (screen.name === "step-details") {
    const step = visibleSteps.find((item) => item.id === screen.stepId);
    content = step ? (
      <StepDetailsScreen
        step={step}
        sources={taxScenario.sources}
        completed={completedStepIds.has(step.id)}
        reminder={remindersByStepId[step.id]}
        onBack={() => setScreen({ name: "checklist", origin: screen.origin })}
        onToggle={() => {
          toggleStep(step.id);
          setScreen({ name: "checklist", origin: screen.origin });
        }}
        onSetReminder={async (option: ReminderOption) => {
          const reminder = await window.cyprusSteps?.setStepReminder(
            targetScenarioId,
            step.id,
            option,
            step.title,
          );
          if (reminder) setRemindersByStepId((current) => ({ ...current, [step.id]: reminder }));
        }}
        onRemoveReminder={async () => {
          await window.cyprusSteps?.removeStepReminder(targetScenarioId, step.id);
          setRemindersByStepId((current) => {
            const { [step.id]: _removed, ...next } = current;
            return next;
          });
        }}
        onOpenSource={(url) => {
          void window.cyprusSteps?.openExternal(url);
        }}
      />
    ) : null;
  } else if (screen.name === "category") {
    const category = categories.find((item) => item.id === screen.categoryId)!;
    const isTax = category.id === "tax";
    const availableSection = (
      <section>
        <h2>Available tasks</h2>
        <div className="scenario-grid">
          {(isTax
            ? taxAvailable
            : scenarios.filter((scenario) => scenario.category === category.id)
          ).map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              onOpen={() => openScenario(scenario, "tax")}
            />
          ))}
        </div>
      </section>
    );
    const lifecycleSection =
      isTax && lifecycle !== "available" ? (
        <section className="task-lifecycle-section">
          <h2>{lifecycle === "started" ? "Started tasks" : "Completed tasks"}</h2>
          <div className="scenario-grid">
            <ProgressTaskCard
              done={doneCount}
              total={visibleSteps.length}
              completed={lifecycle === "completed"}
              onOpen={() => openChecklist("tax")}
            />
          </div>
        </section>
      ) : null;
    content = (
      <section className="page category-page">
        <header className="page-header">
          <div className="category-heading__icon">
            <CategoryIcon category={category.id} />
          </div>
          <div>
            <span className="eyebrow">Category</span>
            <h1>{category.title}</h1>
          </div>
        </header>
        {lifecycle === "started" && lifecycleSection}
        {availableSection}
        {lifecycle === "completed" && lifecycleSection}
      </section>
    );
  } else
    content = (
      <section className="page home-page">
        <header className="welcome">
          <span className="eyebrow">Welcome to</span>
          <h1>Cyprus Step-by-Step</h1>
          <p>Practical guidance for everyday life and important admin in Cyprus.</p>
        </header>
        {lifecycle === "started" && (
          <section className="continue-section">
            <h2>Continue</h2>
            <button className="continue-card" onClick={() => openChecklist("home")}>
              <span className="continue-card__eyebrow">
                Get a tax number and Tax For All access
              </span>
              <strong>
                Next {visibleSteps.findIndex((step) => !completedStepIds.has(step.id)) + 1} of{" "}
                {visibleSteps.length}:{" "}
                {visibleSteps.find((step) => !completedStepIds.has(step.id))?.title}
              </strong>
              <i>
                <b style={{ width: `${(doneCount / visibleSteps.length) * 100}%` }} />
              </i>
              <small>
                {doneCount} of {visibleSteps.length} steps done
              </small>
            </button>
          </section>
        )}
        <section>
          <h2>Recommended tasks</h2>
          <div className="recommended-grid">
            {homeRecommended.map((scenario) => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onOpen={() => openScenario(scenario, "home")}
              />
            ))}
          </div>
        </section>
        {lifecycle === "completed" && (
          <section className="home-completed">
            <h2>Completed</h2>
            <div className="recommended-grid">
              <ProgressTaskCard
                done={doneCount}
                total={visibleSteps.length}
                completed
                onOpen={() => openChecklist("home")}
              />
            </div>
          </section>
        )}
      </section>
    );
  if (!isBootstrapped) return <div className="desktop-app" aria-busy="true" />;
  return (
    <div className="desktop-app">
      <Sidebar
        screen={screen}
        onHome={() => setScreen({ name: "home" })}
        onCategory={openCategory}
      />
      <main className="content-area" ref={contentAreaRef}>
        {content}
      </main>
    </div>
  );
}

function ScenarioDetails({
  backLabel,
  onBack,
  onStart,
}: {
  backLabel: string;
  onBack: () => void;
  onStart: () => void;
}) {
  return (
    <section className="page scenario-details">
      <button className="breadcrumb" onClick={onBack}>
        ← <span>{backLabel}</span>
      </button>
      <div className="details-grid">
        <div className="details-main">
          <span className="pill">Tax</span>
          <h1>{targetScenario.title}</h1>
          <p className="lead">{targetScenario.description}</p>
          <section className="benefits">
            <h2>What you&apos;ll get</h2>
            <div className="benefit-grid">
              {targetScenario.benefits.map((benefit, index) => (
                <div className="benefit-card" key={benefit}>
                  <BenefitIcon type={index} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="details-side">
          <div className="meta-card">
            <span className="meta-card__label">Personalized task</span>
            <strong>{targetScenario.stepEstimate}</strong>
          </div>
          <div className="source-card">
            <LinkIcon />
            <div>
              <strong>Source links included</strong>
              <p>Source links are shown inside relevant checklist steps.</p>
            </div>
          </div>
          <button className="primary-button" type="button" onClick={onStart}>
            Start task
          </button>
        </aside>
      </div>
    </section>
  );
}
