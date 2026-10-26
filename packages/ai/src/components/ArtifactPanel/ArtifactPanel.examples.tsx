import { useRef, useState } from "react";
import { Button } from "@faun-ds/react";
import { DraftPreview, draftCode } from "../../utils/demo";
import { ArtifactPanel } from "./ArtifactPanel";

const versions = [{ id: "v3", label: "v3, 10:42" }, { id: "v2", label: "v2, 10:31" }, { id: "v1", label: "v1, 10:12" }];
const stage = { position: "relative", inlineSize: "min(100%, 880px)", blockSize: 480, display: "flex", justifyContent: "flex-end", border: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)", borderRadius: "var(--faun-radius-lg)", overflow: "hidden", background: "var(--faun-bg-canvas)" } as const;

export function Thumbnail() {
  return (
    <div style={{ inlineSize: 300, blockSize: 190, overflow: "hidden", border: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)", borderRadius: "var(--faun-radius-md)" }}>
      <ArtifactPanel autoFocus={false} title="ESRS E1-6 draft" kind="Document" preview={<DraftPreview />} code={draftCode} onClose={() => {}} defaultWidth={300} minWidth={200} />
    </div>
  );
}

export function Overview() {
  const [open, setOpen] = useState(true);
  const opener = useRef<HTMLButtonElement>(null);
  return (
    <div style={stage}>
      <div style={{ flex: 1, display: "grid", placeItems: "center", padding: "var(--faun-space-4)" }}>
        <Button ref={opener} variant="outline" onClick={() => setOpen(true)} aria-expanded={open}>Open the E1-6 draft</Button>
      </div>
      {open ? <ArtifactPanel autoFocus={false} title="ESRS E1-6 draft" kind="Document" versions={versions} defaultVersion="v3" preview={<DraftPreview />} code={draftCode} filename="esrs-e1-6-draft.md" onClose={() => { setOpen(false); opener.current?.focus(); }} /> : null}
    </div>
  );
}

export function WithoutCode() {
  return (
    <div style={stage}>
      <ArtifactPanel autoFocus={false} title="Scope 3 by category" kind="Table" preview={<DraftPreview />} onDownload={() => {}} onClose={() => {}} />
    </div>
  );
}

export function Maximised() {
  return (
    <div style={stage}>
      <ArtifactPanel autoFocus={false} defaultMaximized title="ESRS E1-6 draft" kind="Document" versions={versions} preview={<DraftPreview />} code={draftCode} onClose={() => {}} />
    </div>
  );
}

export function CodeTab() {
  return (
    <div style={stage}>
      <ArtifactPanel autoFocus={false} defaultTab="code" title="ESRS E1-6 draft" kind="Document" preview={<DraftPreview />} code={draftCode} onClose={() => {}} />
    </div>
  );
}

export function DoNameTheArtifact() {
  return (
    <div style={{ inlineSize: 360, blockSize: 340, border: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)", overflow: "hidden" }}>
      <ArtifactPanel autoFocus={false} title="ESRS E1-6 draft" kind="Document" versions={versions} preview={<DraftPreview />} onClose={() => {}} defaultWidth={360} minWidth={200} />
    </div>
  );
}

export function DontUntitled() {
  return (
    <div style={{ inlineSize: 360, blockSize: 340, border: "var(--faun-border-width-hairline) solid var(--faun-border-subtle)", overflow: "hidden" }}>
      <ArtifactPanel autoFocus={false} title="Output" preview={<p style={{ margin: 0 }}>Done. See the file.</p>} onClose={() => {}} defaultWidth={360} minWidth={200} />
    </div>
  );
}
