import { IconFilter, IconPanelRight } from "@faun-ds/icons";
import { Badge, StatusBadge } from "../Badge/Badge";
import { Button } from "../Button/Button";
import { TextField } from "../Input/Input";
import { Sheet, SheetBody, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTrigger } from "./Sheet";

export function Thumbnail() {
  return (
    <div style={{ position: "relative", inlineSize: 220, blockSize: 110, borderRadius: "var(--faun-radius-md)", overflow: "hidden", background: "var(--faun-bg-surface)", border: "var(--faun-border-width-hairline) solid var(--faun-border-default)" }}>
      <div style={{ position: "absolute", inset: "0 0 0 auto", inlineSize: 120, background: "var(--faun-bg-raised)", boxShadow: "var(--faun-elevation-4)", borderInlineStart: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)", padding: "var(--faun-space-2-5)", display: "grid", gap: "var(--faun-space-1-5)", alignContent: "start" }}>
        <span style={{ fontWeight: 600, fontSize: "var(--faun-type-caption-font-size)" }}>Gross Scope 1</span>
        <span style={{ blockSize: 6, borderRadius: "var(--faun-radius-xs)", background: "var(--faun-gray-a4)" }} />
        <span style={{ blockSize: 6, inlineSize: "70%", borderRadius: "var(--faun-radius-xs)", background: "var(--faun-gray-a4)" }} />
      </div>
    </div>
  );
}

const Detail = () => (
  <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "var(--faun-space-2) var(--faun-space-6)", margin: 0 }}>
    <dt style={{ color: "var(--faun-fg-muted)" }}>Value</dt><dd style={{ margin: 0 }}>3,212.6 tCO₂e</dd>
    <dt style={{ color: "var(--faun-fg-muted)" }}>Source</dt><dd style={{ margin: 0 }}>Emissions ledger · 418 rows</dd>
    <dt style={{ color: "var(--faun-fg-muted)" }}>Factor</dt><dd style={{ margin: 0 }}>DEFRA 2025, natural gas</dd>
    <dt style={{ color: "var(--faun-fg-muted)" }}>Reference</dt><dd style={{ margin: 0 }}><code>ESRS E1-6 §44(a)</code></dd>
  </dl>
);

export function Overview() {
  return (
    <Sheet>
      <SheetTrigger asChild><Button leadingIcon={<IconPanelRight />}>Open datapoint</Button></SheetTrigger>
      <SheetContent>
        <SheetHeader title="Gross Scope 1 GHG emissions" description="FY2026 · Acme Industrial" meta={<><StatusBadge domain="data-quality" state="evidenced" /><Badge variant="outline">E1 Climate</Badge></>} />
        <SheetBody><Detail /></SheetBody>
        <SheetFooter>
          <SheetClose asChild><Button variant="ghost">Close</Button></SheetClose>
          <Button variant="solid" intent="accent">Open evidence</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function FilterSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild><Button leadingIcon={<IconFilter />}>Filters</Button></SheetTrigger>
      <SheetContent side="left" size="sm" dismissible={false}>
        <SheetHeader title="Filter datapoints" description="Narrow the ESRS datapoints shown in the table." />
        <SheetBody>
          <TextField label="Site" placeholder="Any site" />
          <TextField label="Owner" placeholder="Anyone" />
        </SheetBody>
        <SheetFooter start={<Button variant="ghost">Reset</Button>}>
          <SheetClose asChild><Button>Cancel</Button></SheetClose>
          <SheetClose asChild><Button variant="solid" intent="accent">Apply filters</Button></SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function Inspector() {
  return (
    <Sheet modal={false}>
      <SheetTrigger asChild><Button>Open inspector</Button></SheetTrigger>
      <SheetContent size="sm">
        <SheetHeader title="Disclosure drafting" description="Sub-agent · step 5 of 9" meta={<StatusBadge domain="task" state="in_progress" />} />
        <SheetBody><p style={{ margin: 0 }}>212 of 340 datapoints drafted. The page stays interactive while this panel is open.</p></SheetBody>
      </SheetContent>
    </Sheet>
  );
}

export function Bottom() {
  return (
    <Sheet>
      <SheetTrigger asChild><Button>Run options</Button></SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader title="Run CSRD Filing Orchestrator" description="Choose how this run starts." />
        <SheetBody><p style={{ margin: 0 }}>Full run from requirement discovery, or resume from the last checkpoint.</p></SheetBody>
        <SheetFooter><SheetClose asChild><Button variant="solid" intent="accent">Start run</Button></SheetClose></SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function DoDetail() {
  return <Thumbnail />;
}

export function DontStack() {
  return (
    <div style={{ position: "relative", inlineSize: 220, blockSize: 110, borderRadius: "var(--faun-radius-md)", overflow: "hidden", background: "var(--faun-bg-scrim)" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", top: 0, bottom: 0, right: i * 30, inlineSize: 110, background: "var(--faun-bg-raised)", boxShadow: "var(--faun-elevation-4)", borderInlineStart: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)" }} />
      ))}
    </div>
  );
}
