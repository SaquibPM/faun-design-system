import { IconClose, IconStatusDanger, IconStatusInfo, IconStatusSuccess, IconStatusWarning } from "@faun-ds/icons";
import type { ReactNode } from "react";
import { Button } from "../Button/Button";
import { Toaster, toast } from "./Toast";

/** A static toast for previews. Live toasts render in the Toaster's fixed viewport. */
function Still({ tone, icon, title, description, action }: { tone: string; icon?: ReactNode; title: string; description?: string; action?: string }) {
  return (
    <div className="faun-toast" data-tone={tone} style={{ animation: "none", inlineSize: "100%", maxInlineSize: 380, boxSizing: "border-box" }}>
      {icon ? <span className="faun-toast-icon" aria-hidden="true">{icon}</span> : null}
      <div className="faun-toast-text">
        <div className="faun-toast-title">{title}</div>
        {description ? <div className="faun-toast-description">{description}</div> : null}
      </div>
      {action ? <span className="faun-toast-action" style={{ display: "inline-flex", alignItems: "center" }}>{action}</span> : null}
      <span className="faun-toast-close" aria-hidden="true"><IconClose size="md" /></span>
    </div>
  );
}

export function Thumbnail() {
  return (
    <div style={{ display: "grid", gap: "var(--faun-space-2)", inlineSize: 240 }}>
      <Still tone="success" icon={<IconStatusSuccess size="lg" />} title="Materiality approved" />
      <Still tone="danger" icon={<IconStatusDanger size="lg" />} title="Export failed" />
    </div>
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function Overview() {
  return (
    <div style={{ display: "grid", gap: "var(--faun-space-4)", justifyItems: "start" }}>
      <Toaster />
      <Still tone="success" icon={<IconStatusSuccess size="lg" />} title="Materiality approved" description="12 topics are now in scope for FY2026." action="View" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--faun-space-2)" }}>
        <Button onClick={() => toast.success({ title: "Materiality approved", description: "12 topics are now in scope for FY2026.", action: { label: "View", onClick: () => {} } })}>Show success</Button>
        <Button onClick={() => toast.error({ title: "Export failed", description: "The XBRL validator rejected 2 tags. Open the report to fix them." })}>Show error</Button>
        <Button
          onClick={() =>
            toast.promise(sleep(1800).then(() => 15), {
              loading: "Calculating Scope 3…",
              success: (n) => `${n} categories calculated`,
              error: "Calculation failed",
            })
          }
        >
          Run calculation
        </Button>
      </div>
    </div>
  );
}

export function Tones() {
  return (
    <div style={{ display: "grid", gap: "var(--faun-space-2)", inlineSize: "100%", maxInlineSize: 380 }}>
      <Toaster />
      <Still tone="neutral" title="Draft saved" />
      <Still tone="info" icon={<IconStatusInfo size="lg" />} title="Sync started" description="Workday HRIS · about 2 minutes" />
      <Still tone="warning" icon={<IconStatusWarning size="lg" />} title="3 rows skipped" description="Missing period. They stay in the import queue." />
      <Still tone="danger" icon={<IconStatusDanger size="lg" />} title="Export failed" description="The XBRL validator rejected 2 tags." action="Open" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--faun-space-2)", marginBlockStart: "var(--faun-space-2)" }}>
        <Button size="sm" onClick={() => toast("Draft saved")}>Neutral</Button>
        <Button size="sm" onClick={() => toast.info({ title: "Sync started", description: "Workday HRIS · about 2 minutes" })}>Info</Button>
        <Button size="sm" onClick={() => toast.warning({ title: "3 rows skipped", description: "Missing period. They stay in the import queue." })}>Warning</Button>
        <Button size="sm" onClick={() => toast.error({ title: "Export failed", description: "The XBRL validator rejected 2 tags." })}>Error</Button>
      </div>
    </div>
  );
}

export function WithUndo() {
  return (
    <div>
      <Toaster />
      <Button
        intent="danger"
        variant="outline"
        onClick={() => toast({ title: "Supplier archived", description: "Northwind Logistics", action: { label: "Undo", onClick: () => toast.success("Supplier restored") } })}
      >
        Archive supplier
      </Button>
    </div>
  );
}

export function Persistent() {
  return (
    <div>
      <Toaster />
      <Button
        variant="outline"
        onClick={() => toast.warning({ title: "Scope 2 factors are out of date", description: "Review before the filing closes.", persistent: true })}
      >
        Show a toast that stays
      </Button>
    </div>
  );
}

export function DoOutcome() {
  return <Still tone="success" icon={<IconStatusSuccess size="lg" />} title="Report exported" description="CSRD_FY2026.xhtml · 4.2 MB" action="Open" />;
}

export function DontBlocking() {
  return <Still tone="danger" icon={<IconStatusDanger size="lg" />} title="Your session expires in 2 minutes. Save your work or you will lose 3 unsaved datapoints." />;
}
