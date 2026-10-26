import { useState } from "react";
import { IconAttach, IconMoreHorizontal, IconUpload, IconZap } from "@faun-ds/icons";
import { Button, IconButton, Tag } from "@faun-ds/react";
import { PromptComposer } from "./PromptComposer";

/** The toolbar from the design: a labelled pill, then round icon buttons. The composer rounds them; you only pick the variants. */
const toolbar = (
  <>
    <Button variant="outline" leadingIcon={<IconUpload />}>Attach evidence</Button>
    <IconButton variant="outline" className="faun-composer-glyph" icon={<IconZap />} label="Quick actions" />
    <IconButton variant="outline" icon={<IconMoreHorizontal />} label="More" />
  </>
);

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "min(100%, 320px)" }}>
      <PromptComposer placeholder="Ask the CSRD Filing Orchestrator" defaultValue="Why is Scope 3 category 1 up 8%?" actions={<IconButton variant="outline" icon={<IconAttach />} label="Attach a file" />} />
    </div>
  );
}

export function Overview() {
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div style={{ display: "grid", gap: 12, inlineSize: "min(100%, 640px)" }}>
      {sent.length ? <p style={{ margin: 0 }}>Sent: “{sent[sent.length - 1]}”</p> : null}
      <PromptComposer
        label="Message to the CSRD Filing Orchestrator"
        placeholder="Ask anything about your ESG data"
        actions={toolbar}
        hint="The agent can see this filing and its evidence. Shift+Enter adds a line."
        onSend={(text) => setSent([...sent, text])}
      />
    </div>
  );
}

export function WithAttachments() {
  return (
    <div style={{ inlineSize: "min(100%, 640px)" }}>
      <PromptComposer
        label="Message"
        defaultValue="Check these invoices against the March electricity total."
        attachments={<><Tag onRemove={() => {}} removeLabel="Remove INV-20931.pdf">INV-20931.pdf</Tag><Tag onRemove={() => {}} removeLabel="Remove utility-export.xlsx">utility-export.xlsx</Tag></>}
        actions={<Button variant="outline" leadingIcon={<IconUpload />}>Attach evidence</Button>}
        allowEmpty
      />
    </div>
  );
}

export function Running() {
  return (
    <div style={{ inlineSize: "min(100%, 640px)" }}>
      <PromptComposer label="Message" running onStop={() => {}} placeholder="Add a follow-up while the agent works" hint="The E1 Narrative Sub-agent is drafting. Stop to interrupt." />
    </div>
  );
}

export function ModEnter() {
  return (
    <div style={{ inlineSize: "min(100%, 640px)" }}>
      <PromptComposer label="Instruction" submitKey="mod-enter" defaultValue={"Draft the E1-6 narrative.\nUse market-based Scope 2 for Germany."} hint="Ctrl+Enter sends. Enter adds a line." />
    </div>
  );
}

export function Disabled() {
  return (
    <div style={{ inlineSize: "min(100%, 640px)" }}>
      <PromptComposer label="Message" disabled placeholder="This filing is locked for audit" />
    </div>
  );
}

export function DoShortPlaceholder() {
  return <div style={{ inlineSize: "min(100%, 420px)" }}><PromptComposer label="Message" placeholder="Ask about a disclosure, a factor or a run" /></div>;
}

export function DontInstructionsInPlaceholder() {
  return <div style={{ inlineSize: "min(100%, 420px)" }}><PromptComposer label="Message" placeholder="Type your question here and then press the send button to submit it to the assistant" /></div>;
}
