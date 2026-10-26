import { IconFileText, IconFilter, IconStatusAttention } from "@faun-ds/icons";
import { Badge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Collapsible, CollapsibleContent, CollapsibleTrigger } from "./Accordion";

const P = ({ children }: { children: string }) => <p style={{ margin: 0, color: "var(--faun-fg-muted)" }}>{children}</p>;

export function Thumbnail() {
  return (
    <div style={{ inlineSize: 240, borderBlockStart: "var(--faun-border-width-hairline) solid var(--faun-border-default)" }}>
      {["Scope", "Data", "Review"].map((t, i) => (
        <div key={t} style={{ padding: "var(--faun-space-2) var(--faun-space-1)", borderBlockEnd: "var(--faun-border-width-hairline) solid var(--faun-border-default)", display: "flex", justifyContent: "space-between", fontSize: "var(--faun-type-body-sm-font-size)", fontWeight: i === 0 ? 600 : 500 }}>
          <span>{t}</span><span style={{ color: "var(--faun-fg-muted)" }}>{i === 0 ? "–" : "+"}</span>
        </div>
      ))}
    </div>
  );
}

export function Overview() {
  return (
    <Accordion type="single" collapsible defaultValue="scope" style={{ inlineSize: "100%" }}>
      <AccordionItem value="scope">
        <AccordionTrigger description="Entities, period and boundary">Reporting scope</AccordionTrigger>
        <AccordionContent><P>Acme Industrial and 14 subsidiaries, FY2026, operational control approach.</P></AccordionContent>
      </AccordionItem>
      <AccordionItem value="data">
        <AccordionTrigger description="Sources feeding this report" meta={<Badge variant="outline">1,034</Badge>}>Datapoints</AccordionTrigger>
        <AccordionContent><P>Connected from the emissions ledger, Workday and 3 supplier portals.</P></AccordionContent>
      </AccordionItem>
      <AccordionItem value="assurance">
        <AccordionTrigger description="Limited assurance by an external auditor">Assurance</AccordionTrigger>
        <AccordionContent><P>Evidence packs are shared with the auditor at sign-off.</P></AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function Multiple() {
  return (
    <Accordion type="multiple" defaultValue={["a", "b"]} style={{ inlineSize: "100%" }}>
      <AccordionItem value="a"><AccordionTrigger icon={<IconFileText />}>Documents</AccordionTrigger><AccordionContent><P>418 documents linked to this report.</P></AccordionContent></AccordionItem>
      <AccordionItem value="b"><AccordionTrigger icon={<IconStatusAttention />} meta="12">Open gaps</AccordionTrigger><AccordionContent><P>12 datapoints are missing evidence.</P></AccordionContent></AccordionItem>
      <AccordionItem value="c"><AccordionTrigger icon={<IconFilter />}>Filters</AccordionTrigger><AccordionContent><P>Standard, status and owner.</P></AccordionContent></AccordionItem>
    </Accordion>
  );
}

export function Separated() {
  return (
    <Accordion type="single" collapsible variant="separated" defaultValue="a" style={{ inlineSize: "100%" }}>
      <AccordionItem value="a"><AccordionTrigger description="Used when the factor library has no match">Fallback factors</AccordionTrigger><AccordionContent><P>Spend-based factors apply only to categories without activity data.</P></AccordionContent></AccordionItem>
      <AccordionItem value="b"><AccordionTrigger description="Overrides by entity and site">Overrides</AccordionTrigger><AccordionContent><P>3 overrides active.</P></AccordionContent></AccordionItem>
    </Accordion>
  );
}

export function CollapsibleExample() {
  return (
    <Collapsible style={{ inlineSize: "100%" }}>
      <CollapsibleTrigger asChild><Button variant="ghost" leadingIcon={<IconFilter />}>Advanced filters</Button></CollapsibleTrigger>
      <CollapsibleContent><div style={{ paddingBlockStart: 12 }}><P>Boundary, assurance level and data owner.</P></div></CollapsibleContent>
    </Collapsible>
  );
}

export function DoOptional() {
  return (
    <Accordion type="single" collapsible style={{ inlineSize: "100%" }}>
      <AccordionItem value="a"><AccordionTrigger>Methodology notes</AccordionTrigger><AccordionContent><P>Supporting detail most people skip.</P></AccordionContent></AccordionItem>
    </Accordion>
  );
}

export function DontPrimary() {
  return (
    <Accordion type="single" collapsible defaultValue="a" style={{ inlineSize: "100%" }}>
      <AccordionItem value="a"><AccordionTrigger>Total emissions</AccordionTrigger><AccordionContent><P>The number people came for is hidden behind a click.</P></AccordionContent></AccordionItem>
    </Accordion>
  );
}
