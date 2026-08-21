"use client";

import { useState, type ReactNode } from "react";
import { categories, scenarios, targetScenario, targetScenarioId, type CategoryId, type Scenario } from "@/data/catalog";
import { CategoryIcon } from "./category-icon";

type Screen = { name: "home" } | { name: "category"; categoryId: CategoryId } | { name: "details"; origin: "home" | "category" };
function Arrow() { return <span className="arrow" aria-hidden="true">›</span>; }
function BenefitIcon({ type }: { type: number }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const icon: Record<number, ReactNode> = {
    0: <><path {...common} d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v15H8.5A3.5 3.5 0 0 0 5 20.5Z"/><path {...common} d="M19 5.5A3.5 3.5 0 0 0 15.5 2H12v15h3.5a3.5 3.5 0 0 1 3.5 3.5Z"/></>,
    1: <><path {...common} d="M6 3h9l3 3v15H6z"/><path {...common} d="M15 3v4h4M9 12h6M9 16h6"/><path {...common} d="m9 8 1 1 2-2"/></>,
    2: <><path {...common} d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
    3: <><path {...common} d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{icon[type]}</svg>;
}
function LinkIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>; }
function Sidebar({ screen, onHome, onCategory }: { screen: Screen; onHome: () => void; onCategory: (id: CategoryId) => void }) {
  const isCategoryActive = (categoryId: CategoryId) => (screen.name === "category" && screen.categoryId === categoryId) || (screen.name === "details" && categoryId === "tax");
  return <aside className="sidebar"><div className="sidebar-brand"><img src="./cyprussteps-brandmark.svg" alt="" /><span>Cyprus Step-by-Step</span></div><nav aria-label="Main navigation"><button className={`nav-item ${screen.name === "home" ? "nav-item--active" : ""}`} onClick={onHome}><span className="home-glyph">⌂</span>Home</button>{categories.map((category) => <button key={category.id} className={`nav-item ${isCategoryActive(category.id) ? "nav-item--active" : ""}`} onClick={() => onCategory(category.id)}><CategoryIcon category={category.id} />{category.title}</button>)}</nav></aside>;
}
function ScenarioCard({ scenario, onOpen }: { scenario: Scenario; onOpen: () => void }) {
  const category = categories.find((item) => item.id === scenario.category)!;
  const active = scenario.desktopSupported;
  return <button className={`scenario-card ${active ? "scenario-card--active" : "scenario-card--muted"}`} onClick={active ? onOpen : undefined} disabled={!active}><div><span className="scenario-card__title">{scenario.title}</span><span className="scenario-card__meta"><b>{category.title}</b><i />{scenario.stepEstimate}</span></div>{active && <Arrow />}</button>;
}
export function CyprusStepsApp() {
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const openScenario = (scenario: Scenario, origin: "home" | "category") => { if (scenario.id === targetScenarioId) setScreen({ name: "details", origin }); };
  const openCategory = (categoryId: CategoryId) => setScreen({ name: "category", categoryId });
  const homeRecommended = [
    scenarios.find((scenario) => scenario.id === targetScenarioId)!,
    scenarios.find((scenario) => scenario.id === "first_steps_after_arrival_cyprus")!,
    scenarios.find((scenario) => scenario.id === "prepare_address_proof_cyprus")!,
    scenarios.find((scenario) => scenario.id === "apply_for_visitor_residence_permit_cyprus")!,
  ];
  let content: ReactNode;
  if (screen.name === "details") {
    const backTarget = screen.origin === "home" ? { label: "Home", screen: { name: "home" } as Screen } : { label: "Tax", screen: { name: "category", categoryId: "tax" } as Screen };
    content = <ScenarioDetails backLabel={backTarget.label} onBack={() => setScreen(backTarget.screen)} />;
  }
  else if (screen.name === "category") { const category = categories.find((item) => item.id === screen.categoryId)!; content = <section className="page category-page"><header className="page-header"><div className="category-heading__icon"><CategoryIcon category={category.id} /></div><div><span className="eyebrow">Category</span><h1>{category.title}</h1></div></header><section><h2>Available tasks</h2><div className="scenario-grid">{scenarios.filter((scenario) => scenario.category === category.id).map((scenario) => <ScenarioCard key={scenario.id} scenario={scenario} onOpen={() => openScenario(scenario, "category")} />)}</div></section></section>; }
  else content = <section className="page home-page"><header className="welcome"><span className="eyebrow">Welcome to</span><h1>Cyprus Step-by-Step</h1><p>Practical guidance for everyday life and important admin in Cyprus.</p></header><section><h2>Recommended tasks</h2><div className="recommended-grid"><ScenarioCard scenario={homeRecommended[0]} onOpen={() => openScenario(homeRecommended[0], "home")} /><ScenarioCard scenario={homeRecommended[1]} onOpen={() => openScenario(homeRecommended[1], "home")} /><ScenarioCard scenario={homeRecommended[2]} onOpen={() => openScenario(homeRecommended[2], "home")} /><ScenarioCard scenario={homeRecommended[3]} onOpen={() => openScenario(homeRecommended[3], "home")} /></div></section></section>;
  return <div className="desktop-app"><Sidebar screen={screen} onHome={() => setScreen({ name: "home" })} onCategory={openCategory} /><main className="content-area">{content}</main></div>;
}
function ScenarioDetails({ backLabel, onBack }: { backLabel: string; onBack: () => void }) {
  return <section className="page scenario-details"><button className="breadcrumb" onClick={onBack}>← <span>{backLabel}</span></button><div className="details-grid"><div className="details-main"><span className="pill">Tax</span><h1>{targetScenario.title}</h1><p className="lead">{targetScenario.description}</p><section className="benefits"><h2>What you&apos;ll get</h2><div className="benefit-grid">{targetScenario.benefits.map((benefit, index) => <div className="benefit-card" key={benefit}><BenefitIcon type={index} /><span>{benefit}</span></div>)}</div></section></div><aside className="details-side"><div className="meta-card"><span className="meta-card__label">Personalized task</span><strong>{targetScenario.stepEstimate}</strong></div><div className="source-card"><LinkIcon /><div><strong>Source links included</strong><p>Source links are shown inside relevant checklist steps.</p></div></div><button className="primary-button" type="button" disabled>Start task</button></aside></div></section>;
}
