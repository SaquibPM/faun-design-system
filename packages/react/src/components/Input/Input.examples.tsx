import { IconSearch } from "@faun-ds/icons";
import { Stack } from "../Layout/Layout";
import { Input, PasswordInput, TextField } from "./Input";
import { Field } from "../Field/Field";

const wrap = { inlineSize: "min(100%, 360px)" } as const;

export function Thumbnail() {
  return <div style={{ inlineSize: "11rem" }}><Input aria-label="Supplier" defaultValue="Northwind Logistics" /></div>;
}

export function Overview() {
  return (
    <div style={wrap}>
      <TextField label="Facility name" description="As it appears in the organisational boundary." defaultValue="Leeds plant" />
    </div>
  );
}

export function Sizes() {
  return (
    <Stack gap="3" style={wrap}>
      <Input size="sm" aria-label="Small" defaultValue="Small" />
      <Input size="md" aria-label="Medium" defaultValue="Medium" />
      <Input size="lg" aria-label="Large" defaultValue="Large" />
    </Stack>
  );
}

export function Affixes() {
  return (
    <Stack gap="3" style={wrap}>
      <Input aria-label="Search entities" prefix={<IconSearch />} placeholder="Search entities" />
      <Input aria-label="Fuel used" suffix="litres" numeric defaultValue="12,480" />
    </Stack>
  );
}

export function States() {
  return (
    <Stack gap="3" style={wrap}>
      <TextField label="Invalid" error="Enter a year between 2015 and 2026." defaultValue="2031" />
      <TextField label="Disabled" disabled defaultValue="Locked by approval" />
      <Input aria-label="Read only" readOnly defaultValue="Run 418" />
    </Stack>
  );
}

export function DoSpecificLabel() {
  return <div style={wrap}><TextField label="Supplier legal name" placeholder="Northwind Logistics Ltd" /></div>;
}

export function DontPlaceholderAsLabel() {
  return <div style={wrap}><Input aria-label="Name" placeholder="Name" /></div>;
}

export function StateContract() {
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 400px)" }}>
      <Field label="Scope 2 method" warn="Differs from last year's method. Restate the base year if this is intended."><Input defaultValue="Market-based" /></Field>
      <Field label="Scope 2 method" readOnly description="Set by the approved methodology."><Input defaultValue="Market-based" /></Field>
      <Field label="Scope 2 method" skeleton><Input defaultValue="Market-based" /></Field>
    </Stack>
  );
}

export function Password() {
  return (
    <div style={{ inlineSize: "min(100%, 400px)" }}>
      <Field label="API key passphrase" description="Used to decrypt the key stored for this tenant."><PasswordInput placeholder="Enter passphrase" /></Field>
    </div>
  );
}

export function Counter() {
  return (
    <div style={{ inlineSize: "min(100%, 400px)" }}>
      <TextField label="Disclosure title" maxLength={40} showCount defaultValue="Gross Scope 1 emissions, FY2026" description="Shown in the filing index." />
    </div>
  );
}

export function InlineLabel() {
  return (
    <Stack gap="3" style={{ inlineSize: "min(100%, 560px)" }}>
      <TextField variant="inline" label="Entity" defaultValue="Acme Industrial UK" />
      <TextField variant="inline" label="Reporting year" defaultValue="FY2026" description="Calendar or fiscal year." />
    </Stack>
  );
}

export function FluidLabel() {
  return (
    <Stack gap="3" style={{ inlineSize: "min(100%, 400px)" }}>
      <TextField variant="fluid" label="Entity" defaultValue="Acme Industrial UK" />
      <TextField variant="fluid" label="Reporting year" placeholder="FY2026" />
    </Stack>
  );
}
