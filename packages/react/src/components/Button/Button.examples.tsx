import { IconAdd, IconChevronDown, IconDelete, IconDownload, IconPlay, IconStatusAttention } from "@faun-ds/icons";
import { useState } from "react";
import { Button } from "./Button";

export function Thumbnail() {
  return (
    <>
      <Button variant="solid" intent="accent">Run workflow</Button>
      <Button>Export</Button>
    </>
  );
}

export function Overview() {
  return (
    <>
      <Button variant="solid" intent="accent" leadingIcon={<IconPlay />}>Run workflow</Button>
      <Button leadingIcon={<IconDownload />}>Export</Button>
      <Button variant="ghost">Cancel</Button>
    </>
  );
}

export function Hierarchy() {
  return (
    <>
      <Button variant="solid" intent="accent">Primary</Button>
      <Button variant="outline">Secondary</Button>
      <Button variant="soft" intent="accent">Soft</Button>
      <Button variant="ghost">Tertiary</Button>
      <Button variant="link" intent="accent">Link</Button>
    </>
  );
}

export function Intents() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, auto)", gap: "var(--faun-space-3)", alignItems: "center" }}>
      {(["accent", "neutral", "danger"] as const).map((intent) => (
        ["solid", "soft", "outline", "ghost"].map((variant) => (
          <Button key={intent + variant} intent={intent} variant={variant as "solid"}>{intent === "danger" ? "Delete" : intent === "accent" ? "Approve" : "Export"}</Button>
        ))
      ))}
    </div>
  );
}

export function Sizes() {
  return (
    <>
      <Button size="xs" variant="solid" intent="accent">Extra small</Button>
      <Button size="sm" variant="solid" intent="accent">Small</Button>
      <Button size="md" variant="solid" intent="accent">Medium</Button>
      <Button size="lg" variant="solid" intent="accent">Large</Button>
      <Button size="xl" variant="solid" intent="accent">Extra large</Button>
    </>
  );
}

export function WithIcons() {
  return (
    <>
      <Button variant="solid" intent="accent" leadingIcon={<IconAdd />}>Add agent</Button>
      <Button trailingIcon={<IconChevronDown />}>Framework</Button>
      <Button variant="soft" intent="danger" leadingIcon={<IconDelete />}>Delete tool</Button>
    </>
  );
}

export function Loading() {
  const [busy, setBusy] = useState(false);
  return (
    <Button variant="solid" intent="accent" loading={busy} onClick={() => { setBusy(true); setTimeout(() => setBusy(false), 1800); }}>
      Approve materiality
    </Button>
  );
}

export function Outcome() {
  const [s, setS] = useState<"idle" | "busy" | "success" | "error">("idle");
  const run = () => { setS("busy"); setTimeout(() => { setS("success"); setTimeout(() => setS("idle"), 1500); }, 1200); };
  return (
    <Button
      variant="solid"
      intent="accent"
      loading={s === "busy"}
      status={s === "success" ? "success" : s === "error" ? "error" : undefined}
      statusLabel={s === "success" ? "Saved" : undefined}
      onClick={run}
    >
      {s === "success" ? "Saved" : "Save changes"}
    </Button>
  );
}

export function WrappingLabel() {
  return (
    <div style={{ inlineSize: "11rem" }}>
      <Button wrap fullWidth>Request an extension for the E1-6 assurance deadline</Button>
    </div>
  );
}

export function Disabled() {
  return (
    <>
      <Button variant="solid" intent="accent" disabled>Submit filing</Button>
      <Button disabled>Export</Button>
    </>
  );
}

export function AsLink() {
  return (
    <Button asChild variant="outline" leadingIcon={<IconStatusAttention />}>
      <a href="#approvals">Review 2 approvals</a>
    </Button>
  );
}

export function DoOnePrimary() {
  return (
    <>
      <Button variant="ghost">Cancel</Button>
      <Button variant="solid" intent="accent">Approve and continue</Button>
    </>
  );
}

export function DontTwoPrimaries() {
  return (
    <>
      <Button variant="solid" intent="accent">Save draft</Button>
      <Button variant="solid" intent="accent">Submit</Button>
    </>
  );
}

export function DoSpecificLabel() {
  return <Button variant="solid" intent="danger">Delete 3 tools</Button>;
}

export function DontVagueLabel() {
  return <Button variant="solid" intent="danger">OK</Button>;
}

export function Flat() {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--faun-space-3)" }}>
      <Button variant="solid" intent="accent">Run workflow</Button>
      <Button variant="soft" intent="accent">Review</Button>
      <Button variant="outline">Export</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="solid" intent="danger">Delete</Button>
      <Button variant="solid" intent="accent" disabled>Disabled</Button>
    </div>
  );
}
