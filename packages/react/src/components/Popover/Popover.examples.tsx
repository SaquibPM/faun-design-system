import { IconFilter, IconStatusInfo, IconSettings } from "@faun-ds/icons";
import { useState } from "react";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { TextField } from "../Input/Input";
import { Popover, PopoverBody, PopoverClose, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger } from "./Popover";

export function Thumbnail() {
  return (
    <div className="faun-popover" style={{ position: "static", animation: "none", inlineSize: 200 }}>
      <PopoverHeaderStatic />
    </div>
  );
}
function PopoverHeaderStatic() {
  return (
    <div className="faun-popover-header">
      <p className="faun-popover-title">Emission factor</p>
      <p className="faun-popover-description">DEFRA 2025 · natural gas · 0.183 kgCO₂e/kWh</p>
    </div>
  );
}

export function Overview() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button leadingIcon={<IconStatusInfo />}>Factor details</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader title="Natural gas, gross CV" description="DEFRA 2025 conversion factors, Scope 1 stationary combustion." />
        <PopoverBody>
          <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "var(--faun-space-1) var(--faun-space-4)", margin: 0 }}>
            <dt style={{ color: "var(--faun-fg-muted)" }}>Factor</dt><dd style={{ margin: 0 }}>0.18296 kgCO₂e/kWh</dd>
            <dt style={{ color: "var(--faun-fg-muted)" }}>Valid</dt><dd style={{ margin: 0 }}>1 Jan – 31 Dec 2025</dd>
            <dt style={{ color: "var(--faun-fg-muted)" }}>Used by</dt><dd style={{ margin: 0 }}>418 ledger rows</dd>
          </dl>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

export function WithForm() {
  const [threshold, setThreshold] = useState("0.55");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button leadingIcon={<IconSettings />}>Materiality threshold</Button>
      </PopoverTrigger>
      <PopoverContent showClose>
        <PopoverHeader title="Materiality threshold" description="Topics scoring at or above this value are reported as material." />
        <PopoverBody>
          <TextField label="Threshold" value={threshold} onChange={(e) => setThreshold(e.target.value)} numeric />
        </PopoverBody>
        <PopoverFooter>
          <PopoverClose asChild><Button variant="ghost">Cancel</Button></PopoverClose>
          <PopoverClose asChild><Button variant="solid" intent="accent">Apply</Button></PopoverClose>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

export function Sizes() {
  return (
    <>
      {(["sm", "md", "lg"] as const).map((s) => (
        <Popover key={s}>
          <PopoverTrigger asChild><Button>{s === "sm" ? "Small" : s === "md" ? "Medium" : "Large"}</Button></PopoverTrigger>
          <PopoverContent size={s} arrow>
            <PopoverHeader title="Scope 3, category 1" description="Purchased goods and services. Spend-based estimate using EXIOBASE 3.8 factors." />
          </PopoverContent>
        </Popover>
      ))}
    </>
  );
}

export function IconTrigger() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <IconButton icon={<IconFilter />} label="Filter runs" variant="outline" tooltip={false} />
      </PopoverTrigger>
      <PopoverContent size="sm" align="end">
        <PopoverHeader title="Filter runs" description="Show runs started by agents, by people, or both." />
      </PopoverContent>
    </Popover>
  );
}

export function DoSupplementary() {
  return <Button leadingIcon={<IconStatusInfo />}>Why estimated?</Button>;
}

export function DontEssential() {
  return <Button variant="solid" intent="accent">Open to approve</Button>;
}

export function Caret() {
  return (
    <div style={{ display: "flex", gap: "var(--faun-space-3)", flexWrap: "wrap" }}>
      {(["start", "center", "end"] as const).map((align) => (
        <Popover key={align}>
          <PopoverTrigger asChild><Button>{`Align ${align}`}</Button></PopoverTrigger>
          <PopoverContent arrow align={align} size="sm" aria-label={`Caret, ${align} aligned`}>
            <PopoverHeader title="Estimated figure" description="Based on spend, not metered use. The caret follows the alignment." />
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}

export function Inverse() {
  return (
    <Popover defaultOpen>
      <PopoverTrigger asChild><Button leadingIcon={<IconFilter />}>Filters</Button></PopoverTrigger>
      <PopoverContent arrow tone="inverse" size="sm" aria-label="New">
        <PopoverHeader title="New: saved filters" description="Save a set of filters and reuse it from this menu." />
      </PopoverContent>
    </Popover>
  );
}
