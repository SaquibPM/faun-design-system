import { useEffect, useState } from "react";
import { actors, citations } from "../../utils/fixtures";
import { PromptComposer } from "../PromptComposer/PromptComposer";
import { AIChatList, AIChatMessage, AIPromptSuggestions } from "./AiChat";

const ANSWER = "Scope 3 category 1 is 41,820 tCO₂e for FY2025. It covers 148 of 163 suppliers by spend; the other 15 are estimated with spend-based factors.";

export function Thumbnail() {
  return (
    <div style={{ inlineSize: 260 }}>
      <AIChatMessage role="assistant" author={actors.scope3} text="Scope 3 is 41,820 tCO₂e." feedback={false} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "min(100%, 640px)" }}>
      <AIChatList>
        <AIChatMessage role="user" author={actors.priya} time="09:41" text="How much is Scope 3 category 1 this year, and how reliable is it?" />
        <AIChatMessage role="assistant" author={actors.scope3} time="09:42" text={ANSWER} citations={citations.slice(0, 2)} confidence={{ level: "medium", score: 0.78, reason: "15 suppliers have no measured data." }} explain={{ model: "scope3-estimator 2026-09" }} feedback={{ onRegenerate: () => {}, reasons: ["Inaccurate", "Missing sources"] }} />
      </AIChatList>
    </div>
  );
}

export function Live() {
  const words = ANSWER.split(/(?<=\s)/);
  const [n, setN] = useState(0);
  const [stopped, setStopped] = useState(false);
  useEffect(() => {
    if (stopped || n >= words.length) return;
    const id = setTimeout(() => setN((v) => v + 1), 110);
    return () => clearTimeout(id);
  }, [n, stopped, words.length]);
  const state = stopped ? "stopped" : n >= words.length ? "complete" : "streaming";
  return (
    <div style={{ inlineSize: "min(100%, 640px)", display: "grid", gap: "var(--faun-space-4)" }}>
      <AIChatList>
        <AIChatMessage role="user" author={actors.priya} time="09:41" text="How much is Scope 3 category 1?" />
        <AIChatMessage role="assistant" author={actors.scope3} state={state} text={words.slice(0, n).join("")} onStop={() => setStopped(true)} citations={state === "complete" ? citations.slice(0, 1) : undefined} feedback={{ onRegenerate: () => { setN(0); setStopped(false); } }} />
      </AIChatList>
    </div>
  );
}

export function WithComposer() {
  const [text, setText] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div style={{ inlineSize: "min(100%, 640px)", display: "grid", gap: "var(--faun-space-3)" }}>
      <AIChatList>
        {sent.map((m, i) => <AIChatMessage key={i} role="user" author={actors.priya} text={m} />)}
        <AIChatMessage role="assistant" author={actors.orchestrator} text="I can summarise open approvals, explain a figure or draft a disclosure paragraph. What would you like?" feedback={false} />
      </AIChatList>
      <AIPromptSuggestions suggestions={["Summarise open approvals", "Why is Scope 3 estimated?", "Draft ESRS E1-6"]} onSelect={setText} />
      <PromptComposer value={text} onValueChange={setText} onSend={(m) => { setSent((s) => [...s, m]); setText(""); }} placeholder="Ask the assistant" />
    </div>
  );
}

export function DoNameAndCite() {
  return <div style={{ inlineSize: 360 }}><AIChatMessage role="assistant" author={actors.scope3} text="Scope 3 is 41,820 tCO₂e." citations={citations.slice(0, 1)} feedback={false} /></div>;
}

export function DontAnonymous() {
  return <div style={{ inlineSize: 360, padding: "var(--faun-space-3)", border: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)", borderRadius: "var(--faun-radius-md)" }}>Scope 3 is 41,820 tCO₂e.</div>;
}
