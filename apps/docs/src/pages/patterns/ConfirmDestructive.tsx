import { IconDelete, IconStatusArchived } from "@faun-ds/icons";
import { AlertDialog, AlertDialogContent, AlertDialogTrigger, Banner, Button, Card, CardHeader } from "@faun-ds/react";
import { useState } from "react";
import { H2 } from "../foundations/shared";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function ConfirmDestructivePattern() {
  const [archived, setArchived] = useState(false);
  const [deleted, setDeleted] = useState(false);
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="Ask once, name the object, state what changes, and put the verb on the button. Reversible actions need a plain confirmation; actions that change reported figures ask the person to type the object's name.">Example</H2>
        <div className="pt-grid">
          <Card>
            <CardHeader title="Reversible: archive an agent" description="Leaves the catalogue. Restorable." />
            <div className="pt-body">
              {archived ? <Banner tone="success" variant="inline" title="CSRD Filing Orchestrator archived">Restore it from Archived agents.</Banner> : <p>The orchestrator has 2 runs in progress. They finish first, then it stops.</p>}
            </div>
            <div className="pt-actions">
              <AlertDialog>
                <AlertDialogTrigger asChild><Button intent="danger" variant="outline" leadingIcon={<IconStatusArchived />} disabled={archived}>Archive agent</Button></AlertDialogTrigger>
                <AlertDialogContent
                  title="Archive CSRD Filing Orchestrator?"
                  description="It stops running and leaves the catalogue. Past runs and evidence stay in the audit trail. You can restore it from Archived agents."
                  confirmLabel="Archive"
                  onConfirm={async () => { await wait(700); setArchived(true); }}
                />
              </AlertDialog>
            </div>
          </Card>
          <Card>
            <CardHeader title="Irreversible: delete a factor library" description="Changes reported Scope 1 totals." />
            <div className="pt-body">
              {deleted ? <Banner tone="success" variant="inline" title="DEFRA 2025 deleted">418 ledger rows now use the next library in your hierarchy.</Banner> : <p>418 ledger rows use the DEFRA 2025 library.</p>}
            </div>
            <div className="pt-actions">
              <AlertDialog>
                <AlertDialogTrigger asChild><Button intent="danger" variant="outline" leadingIcon={<IconDelete />} disabled={deleted}>Delete library</Button></AlertDialogTrigger>
                <AlertDialogContent
                  title="Delete the DEFRA 2025 factor library?"
                  description="418 ledger rows will fall back to the next library in your override hierarchy, which changes reported Scope 1 totals. This can't be undone."
                  confirmLabel="Delete library"
                  confirmText="DEFRA 2025"
                  onConfirm={async () => { await wait(700); setDeleted(true); }}
                />
              </AlertDialog>
            </div>
          </Card>
        </div>
      </section>
      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <ul className="fd-rules">
          <li>Title is a question that names the object: "Archive CSRD Filing Orchestrator?". Never "Are you sure?".</li>
          <li>The description says what stops, what is kept and whether it can be undone. Put consequences in numbers: "418 ledger rows".</li>
          <li>The confirm button repeats the verb ("Archive", "Delete library"), never "OK" or "Yes". Cancel is the default focus.</li>
          <li>Prefer undo to confirmation when the action is cheap to reverse. Confirm when it is not.</li>
          <li>Ask the person to type the object's name only when the action cannot be undone or changes reported figures.</li>
          <li>The destructive fill appears only inside the confirmation. The button that opens it is outlined.</li>
          <li>Keep the dialog open and the button busy while the action runs. Report the outcome in the page, not in a second dialog.</li>
        </ul>
      </section>
    </div>
  );
}
