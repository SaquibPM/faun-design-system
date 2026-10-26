import { IconEdit } from "@faun-ds/icons";
import { AlertDialog, AlertDialogContent, Banner, Button, Card, CardBody, CardHeader, Field, IconButton, InlineLoading, Input, Link, Tag, Textarea, type InlineLoadingStatus } from "@faun-ds/react";
import { useEffect, useRef, useState } from "react";
import { H2 } from "../foundations/shared";
import "./patterns-b3.css";

const SAVED_NARRATIVE = "Scope 3 category 1 emissions were 41,820 tCO₂e in FY2025. The figure covers 148 of 163 suppliers by spend.";

/** Autosave: wait for a pause in typing, save, say so, and say if it failed. */
function AutosaveEditor({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const [text, setText] = useState(SAVED_NARRATIVE);
  const [status, setStatus] = useState<InlineLoadingStatus>("inactive");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [failNext, setFailNext] = useState(false);
  const [dirty, setDirty] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(text);
  latest.current = text;

  const save = () => {
    setStatus("active");
    setTimeout(() => {
      if (failNext) { setStatus("error"); return; }
      setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setDirty(false);
      onDirtyChange(false);
      setStatus("finished");
    }, 600);
  };
  const change = (v: string) => {
    setText(v);
    setDirty(true);
    onDirtyChange(true);
    setStatus("inactive");
    clearTimeout(timer.current);
    timer.current = setTimeout(save, 1200);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  const description = status === "active" ? "Saving…" : status === "finished" ? "Saved" : status === "error" ? "Could not save. Your text is still here." : "";
  return (
    <Card>
      <CardHeader title="ESRS E1-6 narrative" description="Changes save by themselves a moment after you stop typing." />
      <CardBody>
        <div className="pt-edit">
          <Field label="Narrative"><Textarea value={text} onChange={(e) => change(e.target.value)} minRows={4} /></Field>
          <div className="pt-edit-bar">
            <div className="pt-edit-status">
              {status === "inactive" ? (
                dirty ? <Tag size="sm">Unsaved changes</Tag> : <span>{savedAt ? `All changes saved at ${savedAt}` : "All changes saved"}</span>
              ) : (
                <InlineLoading status={status} description={description} onSuccess={() => setStatus("inactive")} />
              )}
              {status === "error" ? <Button size="sm" onClick={() => { setFailNext(false); save(); }}>Try again</Button> : null}
            </div>
            <Button size="sm" variant="ghost" onClick={() => setFailNext((f) => !f)}>{failNext ? "Saves will succeed" : "Make the next save fail"}</Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

/** Edit in place: read first, edit on request, save or cancel explicitly. */
function InlineEdit() {
  const [value, setValue] = useState("Acme Industrial Ltd");
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const edit = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (editing) input.current?.focus(); }, [editing]);
  const finish = (commit: boolean) => {
    if (commit && draft.trim()) setValue(draft.trim()); else setDraft(value);
    setEditing(false);
    setTimeout(() => edit.current?.focus(), 0);
  };
  return (
    <Card>
      <CardHeader title="Reporting entity" description="Press Edit to change a value. Enter saves, Escape cancels." />
      <CardBody>
        <div className="pt-edit-row">
          <span className="pt-edit-label" id="entity-label">Legal entity</span>
          {editing ? (
            <form className="pt-edit-inline" onSubmit={(e) => { e.preventDefault(); finish(true); }} onKeyDown={(e) => { if (e.key === "Escape") finish(false); }}>
              <Input ref={input} aria-labelledby="entity-label" value={draft} onChange={(e) => setDraft(e.target.value)} />
              <Button type="submit" size="sm" variant="solid" intent="accent">Save</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => finish(false)}>Cancel</Button>
            </form>
          ) : (
            <div className="pt-edit-inline">
              <p className="pt-edit-value">{value}</p>
              <IconButton ref={edit} size="sm" icon={<IconEdit />} label={`Edit legal entity, currently ${value}`} onClick={() => { setDraft(value); setEditing(true); }} />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

/** Unsaved changes guard: leaving a dirty page asks first, and says what is lost. */
function LeaveGuard() {
  const [dirty, setDirty] = useState(false);
  const [left, setLeft] = useState(false);
  const [open, setOpen] = useState(false);
  const leave = () => { if (dirty) setOpen(true); else setLeft(true); };
  return (
    <div className="pt-edit">
      <AutosaveEditor onDirtyChange={setDirty} />
      <div className="pt-edit-bar">
        <Link href="#filings" onClick={(e) => { e.preventDefault(); leave(); }}>Back to filings</Link>
        <span className="pt-note">{left ? "You left the page." : dirty ? "A change is waiting to save: leaving asks first." : "Nothing waiting: leaving is immediate."}</span>
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent
          title="Leave without saving?"
          description="Your last change has not been saved yet. If you leave now, it is lost."
          confirmLabel="Leave without saving"
          cancelLabel="Stay and keep editing"
          onConfirm={() => { setLeft(true); setDirty(false); }}
        />
      </AlertDialog>
      {left ? <Banner tone="info" title="Left the page" onDismiss={() => setLeft(false)}>In the product this is where the next page opens.</Banner> : null}
    </div>
  );
}

export function SavingEditingPattern() {
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="Three parts of one promise: your work is safe. Type in the narrative and wait to see it save, make the next save fail, then try to leave with a change waiting.">Example</H2>
        <LeaveGuard />
      </section>
      <section className="fd-section">
        <H2 id="inline">Edit in place</H2>
        <InlineEdit />
      </section>
      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>Pick one saving model per screen: autosave, or an explicit Save button. Do not mix them in one form.</li>
          <li>Autosave waits for a pause in typing, not every key. Say what is happening in words beside the field: “Saving…”, then “Saved”, then back to a quiet “All changes saved at 09:42”.</li>
          <li>Announce status politely, and errors immediately. The status text is a live region, so screen reader users hear it without moving focus.</li>
          <li>If a save fails, keep the person's text, say so, and offer Try again. Never clear a field or close an editor on failure.</li>
          <li>Show unsaved work as a state, not a surprise: “Unsaved changes” beside the field until it saves.</li>
          <li>Guard leaving only when something would be lost. The dialog names the loss and the buttons say what they do: “Leave without saving” and “Stay and keep editing”, with focus on the safe choice.</li>
          <li>Also set the browser's leave warning (<code>beforeunload</code>) while there is unsaved work, for closing the tab or going back.</li>
          <li>Edit in place when one value changes at a time: show the value, offer an Edit button named for the value, save with Enter and cancel with Escape, and return focus to the Edit button.</li>
          <li>Use a form with a Save button (see the settings form) for changes that must apply together or need review.</li>
        </ul>
      </section>
    </div>
  );
}
