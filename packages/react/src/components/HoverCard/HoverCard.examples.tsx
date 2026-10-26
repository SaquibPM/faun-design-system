import { IconOrchestrator } from "@faun-ds/icons";
import { Badge } from "../Badge/Badge";
import { Link } from "../Link/Link";
import { Stack } from "../Layout/Layout";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./HoverCard";

function AgentPreview() {
  return (
    <>
      <strong>CSRD Narrative Agent</strong>
      <span style={{ color: "var(--faun-fg-muted)" }}>Drafts ESRS E1-6 disclosures from approved ledger data and cites every figure.</span>
      <Badge tone="success" size="sm">Live · 412 runs this quarter</Badge>
    </>
  );
}

export function Thumbnail() {
  return (
    <div className="faun-hover-card" style={{ position: "static", animation: "none", inlineSize: "var(--faun-layout-dialog-sm)" }}>
      <AgentPreview />
    </div>
  );
}

export function Overview() {
  return (
    <p style={{ margin: 0 }}>
      This statement was drafted by{" "}
      <HoverCard>
        <HoverCardTrigger asChild><Link href="#agent">CSRD Narrative Agent</Link></HoverCardTrigger>
        <HoverCardContent><AgentPreview /></HoverCardContent>
      </HoverCard>{" "}
      and reviewed by the sustainability lead.
    </p>
  );
}

export function Sizes() {
  return (
    <Stack gap="3">
      <HoverCard defaultOpen>
        <HoverCardTrigger asChild><Link href="#a" underline="hover">Small card (240)</Link></HoverCardTrigger>
        <HoverCardContent size="sm" side="bottom"><span>Scope 2 location-based: 18,240 tCO₂e</span></HoverCardContent>
      </HoverCard>
    </Stack>
  );
}

export function Controlled() {
  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button type="button" className="faun-link" data-underline="always" style={{ all: "unset", cursor: "pointer", color: "var(--faun-fg-link)", textDecoration: "underline" }}>
          <IconOrchestrator aria-hidden="true" style={{ verticalAlign: "-0.15em" }} /> Supplier engagement agent
        </button>
      </HoverCardTrigger>
      <HoverCardContent size="sm">Collects Scope 3 Cat. 1 data from 148 suppliers and chases late replies.</HoverCardContent>
    </HoverCard>
  );
}

export function DoPreview() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild><Link href="#run">Run 418</Link></HoverCardTrigger>
      <HoverCardContent size="sm">Finished 14 minutes ago · 3 figures flagged for review.</HoverCardContent>
    </HoverCard>
  );
}

export function DontAction() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild><Link href="#run">Run 418</Link></HoverCardTrigger>
      <HoverCardContent size="sm">Approve this run from here? The button is hidden from keyboard and touch users.</HoverCardContent>
    </HoverCard>
  );
}
