import { useState } from "react";
import { SearchField } from "./SearchField";
import { Field } from "../Field/Field";
import { Stack } from "../Layout/Layout";

const col = { display: "grid", gap: "var(--faun-space-4)", width: "min(100%, 360px)" } as const;

export function Thumbnail() {
  return <div style={col}><SearchField aria-label="Search" defaultValue="scope 3" /></div>;
}

export function Overview() {
  return <div style={col}><SearchField aria-label="Search agents" placeholder="Search agents and tools" shortcut="/" /></div>;
}

export function Sizes() {
  return (
    <div style={col}>
      <SearchField aria-label="Small" size="sm" placeholder="Small" />
      <SearchField aria-label="Medium" size="md" placeholder="Medium" />
      <SearchField aria-label="Large" size="lg" placeholder="Large" />
    </div>
  );
}

export function WithSubmit() {
  const [last, setLast] = useState<string | null>(null);
  return (
    <div style={col}>
      <SearchField aria-label="Search evidence" placeholder="Search evidence files" onSearch={setLast} />
      <p style={{ margin: 0, fontSize: "var(--faun-type-body-sm-font-size)" }}>{last === null ? "Press Enter to search." : `Searched for “${last}”.`}</p>
    </div>
  );
}

export function Loading() {
  return <div style={col}><SearchField aria-label="Search factors" loading defaultValue="natural gas" /></div>;
}

export function DoSpecificPlaceholder() {
  return <div style={col}><SearchField aria-label="Search" placeholder="Search by site, factor or run ID" /></div>;
}

export function DontVaguePlaceholder() {
  return <div style={col}><SearchField aria-label="Search" placeholder="Search…" /></div>;
}

export function StateContract() {
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 400px)" }}>
      <Field label="Scope 2 method" warn="Differs from last year's method. Restate the base year if this is intended."><SearchField defaultValue="diesel" /></Field>
      <Field label="Scope 2 method" readOnly description="Set by the approved methodology."><SearchField defaultValue="diesel" /></Field>
      <Field label="Scope 2 method" skeleton><SearchField defaultValue="diesel" /></Field>
    </Stack>
  );
}
