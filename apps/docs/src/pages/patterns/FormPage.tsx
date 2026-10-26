import { Banner, Button, Card, CardBody, CardHeader, Field, Input, Link, RadioGroup, Select, Switch, Textarea } from "@faun-ds/react";
import { useRef, useState, type FormEvent } from "react";
import { H2 } from "../foundations/shared";
import "./patterns-b3.css";

type Values = { entity: string; country: string; boundary: string; baseYear: string; scope3: boolean; sources: string; reviewer: string; email: string };
type Key = keyof Values;
type Errors = Partial<Record<Key, string>>;

const INITIAL: Values = { entity: "", country: "", boundary: "", baseYear: "2031", scope3: true, sources: "", reviewer: "", email: "priya@" };

const SECTIONS: { id: string; title: string; keys: Key[] }[] = [
  { id: "organisation", title: "Organisation", keys: ["entity", "country"] },
  { id: "boundary", title: "Reporting boundary", keys: ["boundary", "baseYear"] },
  { id: "sources", title: "Emission sources", keys: ["sources"] },
  { id: "review", title: "Review", keys: ["reviewer", "email"] },
];
const LABEL: Record<Key, string> = { entity: "Legal entity", country: "Country of registration", boundary: "Consolidation approach", baseYear: "Base year", scope3: "Include Scope 3", sources: "Main emission sources", reviewer: "Reviewer", email: "Reviewer email" };

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.entity.trim()) e.entity = "Enter the legal entity name.";
  if (!v.country) e.country = "Choose the country where the entity is registered.";
  if (!v.boundary) e.boundary = "Choose how joint ventures are consolidated.";
  const y = Number(v.baseYear);
  if (!Number.isInteger(y) || y < 2015 || y > 2026) e.baseYear = "Enter a year between 2015 and 2026.";
  if (v.sources.trim().length < 20) e.sources = "Describe the main sources in at least a sentence, so the agents can plan data collection.";
  if (!v.reviewer.trim()) e.reviewer = "Name the person who reviews the filing.";
  if (!/^\S+@\S+\.\S+$/.test(v.email)) e.email = "Enter an email like name@company.com.";
  return e;
}

function EntityForm() {
  const [values, setValues] = useState<Values>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);
  const summary = useRef<HTMLDivElement>(null);
  const set = <K extends Key>(k: K, v: Values[K]) => {
    const next = { ...values, [k]: v };
    setValues(next);
    setSaved(false);
    if (submitted) setErrors(validate(next));
  };
  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate(values);
    setErrors(e);
    setSubmitted(true);
    setSaved(Object.keys(e).length === 0);
    if (Object.keys(e).length) setTimeout(() => summary.current?.focus(), 0);
  };
  const keys = Object.keys(errors) as Key[];
  const goTo = (key: Key) => (ev: React.MouseEvent) => {
    ev.preventDefault();
    const el = document.getElementById(`form-${key}`);
    el?.scrollIntoView({ block: "center" });
    el?.focus();
  };
  const sectionErrors = (keysIn: Key[]) => keysIn.filter((k) => errors[k]).length;

  return (
    <div className="pt-formpage">
      <nav aria-label="Sections">
        <ul className="pt-formpage-jump">
          {SECTIONS.map((s) => {
            const n = sectionErrors(s.keys);
            return <li key={s.id}><a href={`#${s.id}`} data-error={n ? "" : undefined} onClick={(ev) => { ev.preventDefault(); document.getElementById(s.id)?.scrollIntoView({ block: "start" }); }}>{s.title}{n ? <span>{n === 1 ? "1 error" : `${n} errors`}</span> : null}</a></li>;
          })}
        </ul>
      </nav>
      <form className="pt-formpage-main" onSubmit={submit} noValidate>
        {keys.length ? (
          <div ref={summary} className="pt-formpage-summary" tabIndex={-1}>
            <Banner tone="danger" title={`${keys.length} ${keys.length === 1 ? "field needs" : "fields need"} attention`}>
              <ul>{keys.map((k) => <li key={k}><a href={`#form-${k}`} onClick={goTo(k)}>{LABEL[k]}: {errors[k]}</a></li>)}</ul>
            </Banner>
          </div>
        ) : null}
        {saved ? <Banner tone="success" title="Entity profile saved">Agents will plan data collection from this profile.</Banner> : null}

        <Card id="organisation" className="pt-formpage-section">
          <CardHeader title="Organisation" description="Appears on the cover page of every disclosure." />
          <CardBody>
            <div className="pt-formpage-fields">
              <Field label="Legal entity" required error={errors.entity}><Input id="form-entity" value={values.entity} onChange={(e) => set("entity", e.target.value)} placeholder="Acme Industrial Ltd" /></Field>
              <Field label="Country of registration" required error={errors.country}>
                <Select id="form-country" placeholder="Choose a country" value={values.country} onValueChange={(v) => set("country", v)} options={[{ value: "de", label: "Germany" }, { value: "in", label: "India" }, { value: "nl", label: "Netherlands" }]} />
              </Field>
            </div>
          </CardBody>
        </Card>

        <Card id="boundary" className="pt-formpage-section">
          <CardHeader title="Reporting boundary" description="Decides whose emissions are counted." />
          <CardBody>
            <div className="pt-formpage-fields">
              <RadioGroup label="Consolidation approach" required error={errors.boundary} value={values.boundary} onValueChange={(v) => set("boundary", v)} options={[{ value: "control", label: "Operational control", description: "100% of emissions from operations you control" }, { value: "equity", label: "Equity share", description: "Emissions in proportion to ownership" }]} />
              <Field label="Base year" required error={errors.baseYear} description="Targets are measured from this year."><Input id="form-baseYear" inputMode="numeric" value={values.baseYear} onChange={(e) => set("baseYear", e.target.value)} /></Field>
              <Switch labelPosition="end" label="Include Scope 3" description="Adds value-chain categories to the filing." checked={values.scope3} onCheckedChange={(c) => set("scope3", c)} />
            </div>
          </CardBody>
        </Card>

        <Card id="sources" className="pt-formpage-section">
          <CardHeader title="Emission sources" description="Helps agents decide which data to ask for first." />
          <CardBody>
            <Field label="Main emission sources" required error={errors.sources} description="Fuels, purchased electricity, key suppliers.">
              <Textarea id="form-sources" minRows={3} value={values.sources} onChange={(e) => set("sources", e.target.value)} />
            </Field>
          </CardBody>
        </Card>

        <Card id="review" className="pt-formpage-section">
          <CardHeader title="Review" description="This person approves the filing before it is submitted." />
          <CardBody>
            <div className="pt-formpage-fields">
              <Field label="Reviewer" required error={errors.reviewer}><Input id="form-reviewer" value={values.reviewer} onChange={(e) => set("reviewer", e.target.value)} /></Field>
              <Field label="Reviewer email" required error={errors.email}><Input id="form-email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} /></Field>
            </div>
          </CardBody>
        </Card>

        <div className="pt-formpage-bar">
          <Link href="#cancel" onClick={(e) => { e.preventDefault(); setValues(INITIAL); setErrors({}); setSubmitted(false); setSaved(false); }}>Reset the form</Link>
          <Button type="submit" variant="solid" intent="accent">Save entity profile</Button>
        </div>
      </form>
    </div>
  );
}

export function FormPagePattern() {
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="A long form in sections, with a summary of everything that needs attention. Press Save with the form as it is: focus moves to the summary, each item jumps to its field, and the section list shows where the errors are.">Example</H2>
        <EntityForm />
      </section>
      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>Group fields into a few sections with plain titles and a line saying why they are asked. A section list on the side shows the shape of the page and lets people jump.</li>
          <li>Validate on submit, not while the person types in a field they have not finished. After the first submit, re-validate as they edit so errors clear as soon as they are fixed.</li>
          <li>On submit with errors, show a summary at the top that counts them and lists each one as a link, and move focus to it. Each link jumps to its field and focuses it.</li>
          <li>Keep each message with its field as well. The summary orients; the field message is where the fix happens. Both say what is wrong and how to fix it.</li>
          <li>Mark which sections have errors in the section list, in words (“2 errors”), not by colour alone.</li>
          <li>One primary action, at the end: “Save entity profile”, named for the result. A quiet secondary action sits beside it.</li>
          <li>Do not disable the Save button to prevent errors. Let the person press it and tell them what is missing.</li>
          <li>Keep the form on screen after a successful save and confirm in a banner, or move on to the next page; do not leave the person unsure.</li>
        </ul>
      </section>
    </div>
  );
}
