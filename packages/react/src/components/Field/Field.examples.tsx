import { Input, TextField } from "../Input/Input";
import { Select } from "../Select/Select";
import { Field, Fieldset } from "./Field";

const wrap = { inlineSize: "min(100%, 400px)" } as const;

export function Thumbnail() {
  return (
    <div style={{ inlineSize: "11rem" }}>
      <Field label="Entity" description="Legal entity name"><Input defaultValue="Acme UK" /></Field>
    </div>
  );
}

export function Overview() {
  return (
    <div style={wrap}>
      <Field label="Reporting boundary" description="Choose how emissions of joint ventures are consolidated." required>
        <Select
          placeholder="Select an approach"
          options={[
            { value: "control", label: "Operational control" },
            { value: "financial", label: "Financial control" },
            { value: "equity", label: "Equity share" },
          ]}
        />
      </Field>
    </div>
  );
}

export function Error() {
  return (
    <div style={wrap}>
      <Field label="Base year" error="Enter a year between 2015 and 2026." required>
        <Input defaultValue="2031" />
      </Field>
    </div>
  );
}

export function OptionalAndAction() {
  return (
    <div style={wrap}>
      <Field label="Methodology note" optional labelAction={<a href="#guidance" className="faun-link" data-underline="always">Guidance</a>}>
        <Input placeholder="e.g. Location-based, DEFRA 2025 factors" />
      </Field>
    </div>
  );
}

export function Grouped() {
  return (
    <div style={wrap}>
      <Fieldset legend="Reporting period" description="Dates are inclusive.">
        <TextField label="From" defaultValue="1 Jan 2026" />
        <TextField label="To" defaultValue="31 Dec 2026" />
      </Fieldset>
    </div>
  );
}

export function DoSpecificError() {
  return <div style={wrap}><Field label="Base year" error="Enter a year between 2015 and 2026."><Input defaultValue="2031" /></Field></div>;
}

export function DontVagueError() {
  return <div style={wrap}><Field label="Base year" error="Invalid input."><Input defaultValue="2031" /></Field></div>;
}

export function Warn() {
  return (
    <div style={wrap}>
      <Field label="Base year" warn="This year is more than 5 years back. Check the restatement policy.">
        <Input defaultValue="2019" />
      </Field>
    </div>
  );
}

export function Inline() {
  return (
    <div style={{ inlineSize: "min(100%, 560px)" }}>
      <Field variant="inline" label="Entity" description="Legal entity name."><Input defaultValue="Acme Industrial UK" /></Field>
    </div>
  );
}
