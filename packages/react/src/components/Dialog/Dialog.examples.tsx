import { useState } from "react";
import { Button } from "../Button/Button";
import { TextField } from "../Input/Input";
import { Dialog, DialogBody, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from "./Dialog";

export function Thumbnail() {
  return (
    <div className="faun-dialog" style={{ position: "static", transform: "none", animation: "none", inlineSize: "var(--faun-layout-dialog-sm)" }}>
      <DialogStatic />
    </div>
  );
}
function DialogStatic() {
  return (
    <>
      <div className="faun-dialog-header"><p className="faun-dialog-title">Approve filing</p></div>
      <div className="faun-dialog-footer"><div className="faun-dialog-footer-actions"><Button size="sm">Cancel</Button><Button size="sm" variant="solid" intent="accent">Approve</Button></div></div>
    </>
  );
}

export function Overview() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="solid" intent="accent">Submit for approval</Button></DialogTrigger>
      <DialogContent size="sm">
        <DialogHeader title="Submit the CSRD statement?" description="Sustainability lead and CFO each approve before it is filed. You can still edit until the first approval." />
        <DialogBody>The statement covers FY2026 and cites 2,316 evidence items.</DialogBody>
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
          <DialogClose asChild><Button variant="solid" intent="accent">Submit for approval</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WithForm() {
  const [name, setName] = useState("");
  return (
    <Dialog>
      <DialogTrigger asChild><Button>Name the snapshot</Button></DialogTrigger>
      <DialogContent size="md" dismissible={false}>
        <DialogHeader title="Save a base-year snapshot" description="Snapshots freeze the inventory so restatements can be compared." />
        <DialogBody>
          <TextField label="Snapshot name" description="Shown in the audit trail." value={name} onChange={(e) => setName(e.target.value)} placeholder="FY2022 base year" />
        </DialogBody>
        <DialogFooter start={<span style={{ color: "var(--faun-fg-muted)" }}>Not saved yet</span>}>
          <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
          <Button variant="solid" intent="accent" disabled={!name.trim()}>Save snapshot</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Sizes() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button>Open a large dialog</Button></DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader title="Compare emission factors" description="DEFRA 2025 and IEA 2025 side by side." />
        <DialogBody>Large dialogs hold tables and side-by-side comparisons. Prefer a Sheet when the person needs to see the page behind.</DialogBody>
        <DialogFooter><DialogClose asChild><Button>Close</Button></DialogClose></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DoOneDecision() {
  return <Button variant="solid" intent="accent">Submit for approval</Button>;
}

export function DontStackedDialogs() {
  return <Button variant="outline">Open a dialog from a dialog</Button>;
}

const METHOD = [
  "Scope 1 emissions are activity data multiplied by an emission factor. The factor comes from the library version pinned for the reporting year.",
  "Scope 2 location-based emissions use grid average factors from the national inventory. Market-based emissions use supplier-specific factors where a contractual instrument exists, and the residual mix otherwise.",
  "Scope 3 category 1 combines spend-based and supplier-specific data. Where a supplier reports its own product footprint, that figure replaces the spend estimate and the data point is marked as measured.",
  "Every figure keeps a link to its evidence. When evidence is missing the figure is marked as estimated and counted in the coverage score.",
  "Restatements follow the base year policy. A structural change above the significance threshold restates the base year and every comparison.",
  "Biogenic emissions are reported separately from the scopes and are never netted against them.",
];

export function XsPassive() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button>Open a passive dialog</Button></DialogTrigger>
      <DialogContent size="xs" variant="passive">
        <DialogHeader title="Factor vintage" description="Natural gas uses DEFRA 2025, published in June 2025." />
        <DialogFooter><DialogClose asChild><Button>Close</Button></DialogClose></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Danger() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button variant="outline" intent="danger">Delete snapshot</Button></DialogTrigger>
      <DialogContent size="sm" variant="danger">
        <DialogHeader title="Delete the FY2022 snapshot?" description="Restatements that compare to it lose their baseline. This cannot be undone." />
        <DialogFooter>
          <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
          <DialogClose asChild><Button variant="solid" intent="danger">Delete snapshot</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LongContent() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button>Read the methodology</Button></DialogTrigger>
      <DialogContent size="md" variant="passive" style={{ maxBlockSize: "min(28rem, calc(100dvh - 4rem))" }}>
        <DialogHeader title="Calculation methodology" description="Scroll the text, or focus it and use the arrow keys." />
        <DialogBody scrollLabel="Calculation methodology">
          {METHOD.map((p) => <p key={p} style={{ margin: 0 }}>{p}</p>)}
        </DialogBody>
        <DialogFooter><DialogClose asChild><Button>Close</Button></DialogClose></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DoPassiveInfo() {
  return <Button variant="outline">Passive: explain, then Close</Button>;
}
