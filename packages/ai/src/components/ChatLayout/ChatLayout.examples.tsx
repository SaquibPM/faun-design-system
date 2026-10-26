import { IconAttach } from "@faun-ds/icons";
import { Button, IconButton } from "@faun-ds/react";
import { useState } from "react";
import { DraftPreview, draftCode, useDemoRun } from "../../utils/demo";
import { actors } from "../../utils/fixtures";
import { AIChatList, AIChatMessage } from "../AiChat/AiChat";
import { ArtifactPanel } from "../ArtifactPanel/ArtifactPanel";
import { ProgressPanel } from "../ProgressPanel/ProgressPanel";
import { PromptComposer } from "../PromptComposer/PromptComposer";
import { ChatLayout, ChatLayoutControls } from "./ChatLayout";

const frame = { inlineSize: "min(100%, 1040px)", blockSize: 600, border: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)", borderRadius: "var(--faun-radius-lg)", overflow: "hidden" } as const;
const versions = [{ id: "v3", label: "v3, 10:42" }, { id: "v2", label: "v2, 10:31" }];

/** A full conversation with both panels, controlled by the header toggles. */
export function Chat({ progress: p0 = false, artifact: a0 = false }: { progress?: boolean; artifact?: boolean }) {
  const [progress, setProgressRaw] = useState(p0);
  const [artifact, setArtifactRaw] = useState(a0);
  // Panels that start open must not pull focus on page load; panels the person opens must.
  const [touched, setTouched] = useState(false);
  const setProgress = (v: boolean) => { setTouched(true); setProgressRaw(v); };
  const setArtifact = (v: boolean) => { setTouched(true); setArtifactRaw(v); };
  const run = useDemoRun(progress);
  return (
    <ChatLayout
      label="Chat with the CSRD Filing Orchestrator"
      header={<><h2 style={{ margin: 0, fontSize: "var(--faun-type-heading-sm-font-size)", fontFamily: "var(--faun-type-heading-sm-font-family)" }}>ESRS E1 disclosure</h2><ChatLayoutControls progressOpen={progress} onProgressOpenChange={setProgress} artifactOpen={artifact} onArtifactOpenChange={setArtifact} /></>}
      composer={<PromptComposer label="Message to the CSRD Filing Orchestrator" placeholder="Ask a follow-up or ask for a change" actions={<IconButton variant="outline" icon={<IconAttach />} label="Attach a file" />} />}
      progress={progress ? <ProgressPanel variant="docked" autoFocus={touched} title="Drafting the ESRS E1 disclosure" steps={run.steps} elapsedMs={run.elapsedMs} onClose={() => setProgress(false)} /> : undefined}
      artifact={artifact ? <ArtifactPanel autoFocus={touched} title="ESRS E1-6 draft" kind="Document" versions={versions} preview={<DraftPreview />} code={draftCode} filename="esrs-e1-6-draft.md" onClose={() => setArtifact(false)} /> : undefined}
    >
      <AIChatList>
        <AIChatMessage role="user" author={actors.priya} time="10:12" text="Draft the E1-6 gross emissions disclosure for FY2025 from the ledger." />
        <AIChatMessage role="assistant" author={actors.orchestrator} time="10:12" feedback={false}>
          <p style={{ margin: 0 }}>I am drafting E1-6 now. I will ask you to approve it before anything is filed.</p>
          <div style={{ marginBlockStart: "var(--faun-space-3)" }}>
            <ProgressPanel title="Drafting the ESRS E1 disclosure" steps={run.steps} elapsedMs={run.elapsedMs} defaultOpen={false} actions={progress ? undefined : <Button size="sm" variant="outline" onClick={() => setProgress(true)}>Open panel</Button>} />
          </div>
        </AIChatMessage>
        <AIChatMessage role="assistant" author={actors.narrative} time="10:42" feedback={false}>
          <p style={{ margin: 0 }}>Draft v3 of E1-6 is ready: 48,212 tCO₂e in total, with 15 suppliers estimated.</p>
          <div style={{ marginBlockStart: "var(--faun-space-3)" }}><Button size="sm" variant="outline" aria-expanded={artifact} onClick={() => setArtifact(true)}>Open the draft</Button></div>
        </AIChatMessage>
      </AIChatList>
    </ChatLayout>
  );
}

export function Thumbnail() {
  return (
    <div style={{ inlineSize: 320, blockSize: 190, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ inlineSize: 1040, blockSize: 600, transform: "scale(0.31)", transformOrigin: "top left" }}><Chat progress artifact /></div>
    </div>
  );
}

export function Overview() {
  return <div style={frame}><Chat progress artifact /></div>;
}

export function ThreadOnly() {
  return <div style={frame}><Chat /></div>;
}

export function ProgressBeside() {
  return <div style={frame}><Chat progress /></div>;
}

export function Narrow() {
  return <div style={{ ...frame, inlineSize: 390, blockSize: 640 }}><Chat artifact /></div>;
}

export function NarrowProgress() {
  return <div style={{ ...frame, inlineSize: 390, blockSize: 640 }}><Chat progress /></div>;
}
