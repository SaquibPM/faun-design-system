import { Banner, Button, Card, CardHeader, Field, Fieldset, Input, Select, Switch } from "@faun-ds/react";
import { useState, type FormEvent } from "react";
import { H2 } from "../foundations/shared";

type Values = { entity: string; boundary: string; baseYear: string; failures: boolean; approvals: boolean };
type Errors = Partial<Record<"entity" | "boundary" | "baseYear", string>>;

const initial: Values = { entity: "Acme Industrial Ltd", boundary: "", baseYear: "2031", failures: true, approvals: true };
const BOUNDARIES = [
  { value: "control", label: "Operational control", description: "100% of emissions from operations you control" },
  { value: "financial", label: "Financial control", description: "100% of emissions from entities you control financially" },
  { value: "equity", label: "Equity share", description: "Emissions in proportion to your ownership" },
];

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.entity.trim()) e.entity = "Enter the legal entity name.";
  if (!v.boundary) e.boundary = "Choose a consolidation approach to continue.";
  const y = Number(v.baseYear);
  if (!Number.isInteger(y) || y < 2015 || y > 2026) e.baseYear = "Enter a year between 2015 and 2026.";
  return e;
}

function SettingsForm() {
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = <K extends keyof Values>(k: K, v: Values[K]) => { setValues((s) => ({ ...s, [k]: v })); setSaved(false); if (submitted) setErrors(validate({ ...values, [k]: v })); };
  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate(values);
    setErrors(e); setSubmitted(true);
    setSaved(Object.keys(e).length === 0);
  };
  const count = Object.keys(errors).length;
  return (
    <Card>
      <CardHeader title="Reporting settings" description="Applies to every filing in this workspace." />
      <form className="pt-form" onSubmit={onSubmit} noValidate>
        {count > 0 ? <Banner tone="danger" variant="inline" title={`${count} ${count === 1 ? "field needs" : "fields need"} attention`}>Fix the fields marked below, then save again.</Banner> : null}
        {saved ? <Banner tone="success" variant="inline" title="Settings saved">New filings use the updated reporting boundary.</Banner> : null}
        <Fieldset legend="Organisation" description="Used on the cover page of every disclosure.">
          <Field label="Legal entity" required error={errors.entity}><Input value={values.entity} onChange={(e) => set("entity", e.target.value)} /></Field>
          <div className="pt-form-row">
            <Field label="Reporting boundary" required error={errors.boundary} description="How joint ventures are consolidated.">
              <Select placeholder="Select an approach" options={BOUNDARIES} value={values.boundary} onValueChange={(v) => set("boundary", v)} />
            </Field>
            <Field label="Base year" required error={errors.baseYear} description="Targets are measured from this year.">
              <Input inputMode="numeric" value={values.baseYear} onChange={(e) => set("baseYear", e.target.value)} />
            </Field>
          </div>
        </Fieldset>
        <Fieldset legend="Notifications">
          <Switch labelPosition="end" label="Email me when a run fails" description="Sent to the run owner within a minute." checked={values.failures} onCheckedChange={(c) => set("failures", c)} />
          <Switch labelPosition="end" label="Email me when an approval is waiting" description="At most one digest an hour." checked={values.approvals} onCheckedChange={(c) => set("approvals", c)} />
        </Fieldset>
        <div className="pt-actions">
          <Button type="button" variant="ghost" onClick={() => { setValues(initial); setErrors({}); setSubmitted(false); setSaved(false); }}>Reset</Button>
          <Button type="submit" variant="solid" intent="accent">Save settings</Button>
        </div>
      </form>
    </Card>
  );
}

export function SettingsFormPattern() {
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="A form that saves on one explicit action and tells the person what is wrong, where, and how to fix it. The base year starts invalid and the boundary is unset: press Save to see validation.">Example</H2>
        <SettingsForm />
      </section>
      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>Every control sits in a Field with a visible label. Mark the exceptions: say Optional when most fields are required.</li>
          <li>Validate on submit, then re-validate as the person edits. Do not show errors on a field they have not reached.</li>
          <li>An error names the problem and the fix: "Enter a year between 2015 and 2026", never "Invalid input".</li>
          <li>When a save fails, show a summary Banner with the count above the form, and keep each message with its field.</li>
          <li>Text and select fields save with the form. A Switch applies a setting at once, so use it for settings that need no review and say so in the description.</li>
          <li>One solid accent button, aligned to the end. Reset and cancel are ghost.</li>
        </ul>
      </section>
    </div>
  );
}
