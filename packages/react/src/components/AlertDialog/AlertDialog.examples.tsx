import { IconStatusArchived, IconDelete, IconSend } from "@faun-ds/icons";
import { Button } from "../Button/Button";
import { AlertDialog, AlertDialogContent, AlertDialogTrigger } from "./AlertDialog";

export function Thumbnail() {
  return (
    <div className="faun-dialog faun-alert-dialog" data-size="sm" style={{ position: "static", transform: "none", animation: "none", inlineSize: 240 }}>
      <div className="faun-alert-dialog-main" style={{ padding: "var(--faun-space-3)", gap: "var(--faun-space-2-5)" }}>
        <div className="faun-alert-dialog-text">
          <p className="faun-dialog-title" style={{ fontSize: "var(--faun-type-body-md-font-size)", lineHeight: "var(--faun-type-body-md-line-height)" }}>Delete 3 tools?</p>
          <p className="faun-dialog-description" style={{ fontSize: "var(--faun-type-caption-font-size)", lineHeight: "var(--faun-type-caption-line-height)" }}>This can't be undone.</p>
        </div>
      </div>
      <div className="faun-dialog-footer" style={{ padding: "var(--faun-space-1) var(--faun-space-3) var(--faun-space-3)" }}>
        <div className="faun-dialog-footer-actions"><Button size="sm">Cancel</Button><Button size="sm" variant="solid" intent="danger">Delete</Button></div>
      </div>
    </div>
  );
}

export function Overview() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button intent="danger" leadingIcon={<IconStatusArchived />}>Archive agent</Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        title="Archive CSRD Filing Orchestrator?"
        description="It stops running and leaves the catalogue. Past runs and evidence stay in the audit trail. You can restore it from Archived agents."
        confirmLabel="Archive"
        onConfirm={() => new Promise((r) => setTimeout(r, 900))}
      />
    </AlertDialog>
  );
}

export function TypeToConfirm() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="soft" intent="danger" leadingIcon={<IconDelete />}>Delete factor library</Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        title="Delete the DEFRA 2025 factor library?"
        description="418 ledger rows use these factors. They will fall back to the next library in your override hierarchy, which changes reported Scope 1 totals. This can't be undone."
        confirmLabel="Delete library"
        confirmText="DEFRA 2025"
      />
    </AlertDialog>
  );
}

export function Consequential() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="solid" intent="accent" leadingIcon={<IconSend />}>Submit filing</Button>
      </AlertDialogTrigger>
      <AlertDialogContent
        intent="accent"
        title="Submit the CSRD statement for FY2026?"
        description="The statement and iXBRL package lock and go to your assurance provider. You can still add comments, but figures can't change."
        confirmLabel="Submit filing"
      >
        <ul style={{ margin: 0, paddingInlineStart: "var(--faun-space-5)" }}>
          <li>1,034 datapoints, 812 evidenced</li>
          <li>41 narratives approved</li>
        </ul>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function DoSpecific() {
  return (
    <>
      <Button>Keep tool</Button>
      <Button variant="solid" intent="danger">Delete tool</Button>
    </>
  );
}

export function DontGeneric() {
  return (
    <>
      <Button>No</Button>
      <Button variant="solid" intent="danger">Yes</Button>
    </>
  );
}
