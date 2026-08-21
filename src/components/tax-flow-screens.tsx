import type { Answers, TaxSource, TaxStep } from "@/data/tax-scenario";
import { answerOptions, taxScenario } from "@/data/tax-scenario";

function Context({ showTaskTitle = true }: { showTaskTitle?: boolean }) { return <><span className="pill flow-pill">Tax</span>{showTaskTitle && <p className="flow-task-title">{taxScenario.title}</p>}</>; }
function DoneCircle({ done, onClick }: { done: boolean; onClick?: () => void }) { return <button className={`done-circle ${done ? "done-circle--done" : ""}`} aria-label={done ? "Mark step as not done" : "Mark step as done"} onClick={onClick}>{done ? "✓" : ""}</button>; }
function SourceChip() { return <span className="source-chip"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" /></svg>Source links</span>; }

export function QuestionnaireScreen({ questionIndex, answers, onAnswer, onBack, onNext }: { questionIndex: 0 | 1; answers: Answers; onAnswer: (id: "yes" | "no" | "dont_know") => void; onBack: () => void; onNext: () => void }) {
  const question = taxScenario.questions[questionIndex];
  const selected = answers[question.id];
  const last = questionIndex === 1;
  return <section className="page flow-page questionnaire-page"><button className="breadcrumb" onClick={onBack}>← <span>{questionIndex === 0 ? "Task details" : "Previous question"}</span></button><Context /><div className="question-progress"><span>Question {questionIndex + 1} of {taxScenario.questions.length}</span><i><b style={{ width: `${((questionIndex + 1) / taxScenario.questions.length) * 100}%` }} /></i></div><h1>{question.text}</h1><div className="answer-list">{answerOptions.map((option) => <button key={option.id} className={`answer-card ${selected === option.id ? "answer-card--selected" : ""}`} onClick={() => onAnswer(option.id)}><i className="radio">{selected === option.id && <b />}</i>{option.label}</button>)}</div><button className="primary-button flow-action" disabled={!selected} onClick={onNext}>{last ? "Create checklist" : "Next"}</button></section>;
}

export function ChecklistScreen({ steps, completed, onBack, onToggle, onOpen }: { steps: TaxStep[]; completed: Set<string>; onBack: () => void; onToggle: (id: string) => void; onOpen: (id: string) => void }) {
  const incomplete = steps.filter((step) => !completed.has(step.id));
  const next = incomplete[0];
  const done = steps.length - incomplete.length;
  const Card = ({ step, nextStep = false }: { step: TaxStep; nextStep?: boolean }) => <article className={`checklist-card ${nextStep ? "checklist-card--next" : ""}`}><DoneCircle done={completed.has(step.id)} onClick={() => onToggle(step.id)} /><button className="checklist-card__body" onClick={() => onOpen(step.id)}><span>{step.title}</span>{step.sourceKeys.length > 0 && <SourceChip />}</button><button className="open-step" aria-label={`Open ${step.title}`} onClick={() => onOpen(step.id)}>›</button></article>;
  const finished = steps.filter((step) => completed.has(step.id));
  return <section className="page flow-page checklist-page"><button className="breadcrumb" onClick={onBack}>← <span>Task details</span></button><Context showTaskTitle={false} /><h1>{taxScenario.title}</h1><p className="checklist-description">{taxScenario.description}</p><div className="progress-summary"><strong>{done} of {steps.length} steps done</strong><i><b style={{ width: `${steps.length ? (done / steps.length) * 100 : 0}%` }} /></i></div>{next ? <section><h2>Next step</h2><Card step={next} nextStep /></section> : <section className="all-done"><h2>All steps done</h2><p>You&apos;ve completed this personalized checklist.</p></section>} {incomplete.slice(1).length > 0 && <section className="upcoming"><h2>Upcoming steps</h2>{incomplete.slice(1).map((step) => <Card key={step.id} step={step} />)}</section>} {finished.length > 0 && <section className="upcoming"><h2>Completed steps</h2>{finished.map((step) => <Card key={step.id} step={step} />)}</section>}</section>;
}

export function StepDetailsScreen({ step, sources, completed, onBack, onToggle }: { step: TaxStep; sources: readonly TaxSource[]; completed: boolean; onBack: () => void; onToggle: () => void }) {
  const stepSources = step.sourceKeys.map((key) => sources.find((source) => source.key === key)).filter((source): source is TaxSource => Boolean(source));
  return <section className="page flow-page step-details-page"><button className="breadcrumb" onClick={onBack}>← <span>Checklist</span></button><Context /><h1>{step.title}</h1><span className={`status-pill ${completed ? "status-pill--done" : ""}`}>{completed ? "Done" : "Not done"}</span><section className="detail-section"><h2>What to do</h2><div className="instruction-card">{step.description}</div></section><section className="detail-section"><h2>Source links</h2><div className="source-links">{stepSources.map((source) => <div className="source-link" key={source.key}><span>{source.type}</span><strong>{source.title}</strong><small>{source.url}</small></div>)}</div><p className="disclaimer">Information may change or depend on your situation. Always verify important details with official sources before taking action.</p></section><button className="primary-button flow-action" onClick={onToggle}>{completed ? "Mark as not done" : "Mark as done"}</button></section>;
}
