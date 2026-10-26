import { useEffect, useState } from "react";
import { Field } from "../Field/Field";
import { FileUpload, type FileUploadItem } from "./FileUpload";
import { Stack } from "../Layout/Layout";

const col = { display: "grid", gap: "var(--faun-space-4)", width: "min(100%, 520px)" } as const;

export function Thumbnail() {
  return <div style={col}><FileUpload title="Drop utility bills" accept=".pdf" maxSize={20 * 1024 * 1024} /></div>;
}

export function Overview() {
  return (
    <div style={col}>
      <Field label="Utility bills" description="One file per billing period.">
        <FileUpload title="Drop utility bills" accept=".pdf" maxSize={20 * 1024 * 1024} />
      </Field>
    </div>
  );
}

const sample: FileUploadItem[] = [
  { id: "1", name: "electricity-march.pdf", size: 1_240_000, status: "done" },
  { id: "2", name: "gas-march.pdf", size: 3_410_000, status: "uploading", progress: 62 },
  { id: "3", name: "water-march.pdf", size: 880_000, status: "queued" },
  { id: "4", name: "diesel-march.pdf", size: 640_000, status: "error", error: "Upload failed. Check your connection." },
];

export function FileList() {
  return (
    <div style={col}>
      <FileUpload title="Drop utility bills" accept=".pdf" maxSize={20 * 1024 * 1024} defaultFiles={sample} onRetry={() => {}} />
    </div>
  );
}

export function SimulatedUpload() {
  const [files, setFiles] = useState<FileUploadItem[]>([]);
  useEffect(() => {
    if (!files.some((f) => f.status === "queued" || f.status === "uploading")) return;
    const t = setInterval(() => setFiles((cur) => cur.map((f) => f.status === "queued" ? { ...f, status: "uploading", progress: 0 } : f.status === "uploading" ? ((f.progress ?? 0) >= 100 ? { ...f, status: "done" } : { ...f, progress: Math.min(100, (f.progress ?? 0) + 20) }) : f)), 400);
    return () => clearInterval(t);
  }, [files]);
  return (
    <div style={col}>
      <FileUpload title="Drop evidence files" accept=".pdf,.csv,.xlsx" maxSize={10 * 1024 * 1024} files={files} onFilesChange={setFiles} />
    </div>
  );
}

export function SingleFile() {
  return <div style={col}><Field label="Assurance letter"><FileUpload multiple={false} title="Drop the signed letter" accept=".pdf" maxSize={5 * 1024 * 1024} /></Field></div>;
}

export function WithError() {
  return (
    <div style={col}>
      <Field label="Utility bills" error="Add at least one bill for each billing period.">
        <FileUpload title="Drop utility bills" accept=".pdf" />
      </Field>
    </div>
  );
}

export function Disabled() {
  return <div style={col}><Field label="Utility bills" disabled><FileUpload title="Uploads are closed" accept=".pdf" /></Field></div>;
}

export function DoSayWhat() {
  return <div style={col}><FileUpload title="Drop utility bills" accept=".pdf" maxSize={20 * 1024 * 1024} /></div>;
}

export function DontGeneric() {
  return <div style={col}><FileUpload title="Upload" /></div>;
}

export function StateContract() {
  return (
    <Stack gap="4" style={{ inlineSize: "min(100%, 400px)" }}>
      <Field label="Scope 2 method" warn="Differs from last year's method. Restate the base year if this is intended."><FileUpload accept=".pdf" maxSize={20971520} /></Field>
      <Field label="Scope 2 method" readOnly description="Set by the approved methodology."><FileUpload accept=".pdf" maxSize={20971520} /></Field>
      <Field label="Scope 2 method" skeleton><FileUpload accept=".pdf" maxSize={20971520} /></Field>
    </Stack>
  );
}
