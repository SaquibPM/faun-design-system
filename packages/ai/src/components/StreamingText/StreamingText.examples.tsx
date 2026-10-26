import { useEffect, useState } from "react";
import { Button } from "@faun-ds/react";
import { actors } from "../../utils/fixtures";
import { StreamingText } from "./StreamingText";

const DRAFT =
  "Scope 3 category 1 emissions for FY2025 are estimated at 41,820 tCO₂e. The estimate covers 148 of 163 suppliers by spend. " +
  "The remaining 15 suppliers are estimated with spend-based factors and are flagged for follow-up in the supplier engagement plan.";

/** Reveals the text word by word, the way a model response arrives. */
function useSimulatedStream(full: string, active: boolean, wordsPerSecond = 9) {
  const words = full.split(/(?<=\s)/);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setN((v) => Math.min(words.length, v + 1)), 1000 / wordsPerSecond);
    return () => clearInterval(id);
  }, [active, words.length, wordsPerSecond]);
  return { text: words.slice(0, n).join(""), done: n >= words.length, reset: () => setN(0) };
}

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "min(100%, 300px)" }}>
      <StreamingText state="streaming" agent={actors.narrative} text={DRAFT.slice(0, 96)} />
    </div>
  );
}

export function Overview() {
  return (
    <div style={{ inlineSize: "min(100%, 640px)" }}>
      <StreamingText state="streaming" agent={actors.narrative} text={DRAFT.slice(0, 150)} onStop={() => {}} />
    </div>
  );
}

export function Live() {
  const [stopped, setStopped] = useState(false);
  const [run, setRun] = useState(0);
  const { text, done, reset } = useSimulatedStream(DRAFT, !stopped);
  const state = stopped ? "stopped" : done ? "complete" : "streaming";
  return (
    <div key={run} style={{ display: "grid", gap: 12, inlineSize: "min(100%, 640px)" }}>
      <StreamingText agent={actors.narrative} text={text} state={state} onStop={() => setStopped(true)} />
      <div><Button size="sm" onClick={() => { reset(); setStopped(false); setRun(run + 1); }}>Replay</Button></div>
    </div>
  );
}

export function Complete() {
  return (
    <div style={{ inlineSize: "min(100%, 640px)" }}>
      <StreamingText agent={actors.narrative} text={DRAFT} />
    </div>
  );
}

export function Stopped() {
  return (
    <div style={{ inlineSize: "min(100%, 640px)" }}>
      <StreamingText agent={actors.narrative} state="stopped" text={DRAFT.slice(0, 118)} />
    </div>
  );
}

export function Plain() {
  return (
    <div style={{ inlineSize: "min(100%, 640px)" }}>
      <StreamingText appearance="plain" state="streaming" text={DRAFT.slice(0, 118)} onStop={() => {}} />
    </div>
  );
}

export function DoLetThemStop() {
  return <div style={{ inlineSize: "min(100%, 420px)" }}><StreamingText state="streaming" agent={actors.narrative} text={DRAFT.slice(0, 80)} onStop={() => {}} /></div>;
}

export function DontNoWayToStop() {
  return <div style={{ inlineSize: "min(100%, 420px)" }}><StreamingText state="streaming" text={DRAFT.slice(0, 80)} /></div>;
}
