import { IconFactory, IconMoreHorizontal, IconOrchestrator, IconWorkflow } from "@faun-ds/icons";
import { useState } from "react";
import { StatusBadge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { Inline, Stack } from "../Layout/Layout";
import { Tag } from "../Tag/Tag";
import { Card, CardBody, CardFooter, CardHeader } from "./Card";

export function Thumbnail() {
  return (
    <Card style={{ inlineSize: 200 }} padding="sm">
      <CardHeader title="Scope 1" description="3,212.6 tCO₂e" level={4} />
    </Card>
  );
}

export function Overview() {
  return (
    <Card style={{ inlineSize: "min(100%, 420px)" }}>
      <CardHeader
        icon={<IconWorkflow />}
        title="Workflow"
        description="9 steps · 3 done · 1 running · 1 waiting"
        actions={<IconButton icon={<IconMoreHorizontal />} label="Workflow options" size="sm" />}
      />
      <CardBody>
        The CSRD Filing Orchestrator is drafting disclosures. Materiality assessment is paused until you approve the matrix.
      </CardBody>
      <CardFooter divided>
        <Button variant="ghost">Open graph</Button>
        <Button variant="solid" intent="accent">Review approval</Button>
      </CardFooter>
    </Card>
  );
}

export function Variants() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--faun-space-4)", inlineSize: "100%" }}>
      <Card><CardHeader title="Default" description="Content surfaces" level={4} /></Card>
      <Card variant="interactive" asChild><a href="#agent"><CardHeader title="Interactive" description="Whole card is a link" level={4} /></a></Card>
      <Card variant="selected"><CardHeader title="Selected" description="Chosen in a set" level={4} /></Card>
      <Card variant="muted"><CardHeader title="Muted" description="Secondary or nested" level={4} /></Card>
    </div>
  );
}

const agents = [
  { id: "csrd", name: "CSRD Filing Orchestrator", desc: "Plans and drafts ESRS disclosures", tags: ["CSRD", "ESRS"] },
  { id: "cdp", name: "CDP Climate Responder", desc: "Answers the CDP 2026 questionnaire", tags: ["CDP"] },
  { id: "pcaf", name: "PCAF Financed Emissions", desc: "Attributes portfolio emissions", tags: ["PCAF"] },
];

export function SelectableCards() {
  const [chosen, setChosen] = useState("csrd");
  return (
    <div role="radiogroup" aria-label="Orchestrator" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--faun-space-3)", inlineSize: "100%" }}>
      {agents.map((n) => (
        <Card key={n.id} asChild variant={chosen === n.id ? "selected" : "interactive"} padding="md">
          <button type="button" role="radio" aria-checked={chosen === n.id} onClick={() => setChosen(n.id)} style={{ textAlign: "start", font: "inherit" }}>
            <Stack gap="2">
              <Inline gap="2"><IconOrchestrator size="md" aria-hidden="true" /><strong>{n.name}</strong></Inline>
              <span style={{ color: "var(--faun-fg-muted)", fontSize: "var(--faun-type-body-sm-font-size)" }}>{n.desc}</span>
              <Inline gap="1">{n.tags.map((t) => <Tag key={t} variant="framework" size="sm">{t}</Tag>)}</Inline>
            </Stack>
          </button>
        </Card>
      ))}
    </div>
  );
}

export function SiteCard() {
  return (
    <Card style={{ inlineSize: "min(100%, 360px)" }}>
      <CardHeader icon={<IconFactory />} title="Chennai plant" description="Manufacturing · Tamil Nadu" actions={<StatusBadge domain="data-quality" state="partial" />} />
      <CardBody>Water withdrawal in a high-stress basin keeps E3 material for this site.</CardBody>
    </Card>
  );
}

export function DoOneLevel() {
  return (
    <Card style={{ inlineSize: 260 }}>
      <CardHeader title="Emissions by scope" level={4} />
      <CardBody><Stack gap="1"><span>Scope 1 · 3,213</span><span>Scope 2 · 2,108</span><span>Scope 3 · 7,159</span></Stack></CardBody>
    </Card>
  );
}

export function DontNestCards() {
  return (
    <Card style={{ inlineSize: 260 }}>
      <CardHeader title="Emissions by scope" level={4} />
      <Stack gap="2">
        <Card padding="sm">Scope 1 · 3,213</Card><Card padding="sm">Scope 2 · 2,108</Card>
      </Stack>
    </Card>
  );
}
