import { IconClose, IconFileText, IconRefresh, IconStatusAttention, IconFileCheck, IconUpload } from "@faun-ds/icons";
import { forwardRef, useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { useControllableState } from "../../utils/use-controllable-state.js";
import { useFieldControl, type ControlStateProps } from "../Field/Field.js";

export type FileUploadStatus = "queued" | "uploading" | "done" | "error";

export interface FileUploadItem {
  id: string;
  name: string;
  /** Bytes. */
  size: number;
  status: FileUploadStatus;
  /** 0–100 while uploading. */
  progress?: number;
  /** Shown under the name when status is "error". */
  error?: string;
  /** Set false to hide the retry button (validation failures are never retryable). */
  retryable?: boolean;
  /** The underlying File, when it came from this control. */
  file?: File;
}

export interface FileUploadProps extends ControlStateProps {
  /** Headline in the dropzone. Say what to drop: "Drop utility bills". */
  title?: ReactNode;
  /** Type and size hint. Generated from `accept` and `maxSize` when omitted, e.g. "PDF, up to 20 MB". */
  hint?: ReactNode;
  /** Accepted types, as for `<input accept>`: ".pdf,.csv" or "image/*". */
  accept?: string;
  /** Largest allowed file in bytes. */
  maxSize?: number;
  /** Most files the list may hold. */
  maxFiles?: number;
  /** Allow several files. Default true. */
  multiple?: boolean;
  /** Controlled file list. */
  files?: FileUploadItem[];
  defaultFiles?: FileUploadItem[];
  /** Called with the next list whenever files are added or removed. */
  onFilesChange?: (files: FileUploadItem[]) => void;
  /** Called with the files that passed validation, so you can start uploading them. */
  onFilesAccepted?: (items: FileUploadItem[]) => void;
  /** Called when the user asks to retry a failed upload. Shows a retry button on errored items. */
  onRetry?: (item: FileUploadItem) => void;
  /** Hide the file list (render your own). */
  hideList?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  "aria-describedby"?: string;
  className?: string;
}

/** Formats a byte count for people: 940 KB, 12.4 MB. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v >= 100 || Number.isInteger(v) ? Math.round(v) : v.toFixed(1)} ${units[i]}`;
}

function describeAccept(accept?: string) {
  if (!accept) return "";
  return accept.split(",").map((t) => t.trim()).filter(Boolean).map((t) => t.startsWith(".") ? t.slice(1).toUpperCase() : t.endsWith("/*") ? `${t.slice(0, -2)} files` : (t.split("/")[1] ?? t).toUpperCase()).filter((t, i, a) => a.indexOf(t) === i).join(", ");
}

function matches(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  return accept.split(",").map((t) => t.trim().toLowerCase()).some((t) =>
    t.startsWith(".") ? name.endsWith(t) : t.endsWith("/*") ? file.type.startsWith(t.slice(0, -1)) : file.type === t);
}

let seq = 0;

/** Collects files by drag and drop or browsing, validates type and size, and shows each file's progress. */
export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(function FileUpload(
  { title = "Drop files here", hint, accept, maxSize, maxFiles, multiple = true, files, defaultFiles = [], onFilesChange, onFilesAccepted, onRetry, hideList, disabled, invalid, warn, readOnly, skeleton, required, name, id, className, ...aria },
  ref,
) {
  const hintId = useId();
  const { invalid: isInvalid, state, ...control } = useFieldControl({ id, disabled, required, "aria-invalid": invalid || undefined, "aria-describedby": aria["aria-describedby"] }, { warn, readOnly, skeleton });
  const [list, setList] = useControllableState<FileUploadItem[]>({ value: files, defaultValue: defaultFiles, onChange: onFilesChange });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autoHint = [describeAccept(accept), maxSize ? `up to ${formatBytes(maxSize)}` : ""].filter(Boolean).join(", ");
  const hintText = hint ?? (autoHint ? autoHint.charAt(0).toUpperCase() + autoHint.slice(1) : null);

  const add = (incoming: File[]) => {
    if (control.disabled || state.readOnly || !incoming.length) return;
    const picked = multiple ? incoming : incoming.slice(0, 1);
    let room = maxFiles ? Math.max(0, maxFiles - list.filter((f) => f.status !== "error").length) : Infinity;
    const items: FileUploadItem[] = picked.map((file) => {
      const base = { id: `faun-file-${++seq}`, name: file.name, size: file.size, file };
      if (!matches(file, accept)) return { ...base, status: "error", retryable: false, error: `${describeAccept(accept) || "This type"} only` };
      if (maxSize && file.size > maxSize) return { ...base, status: "error", retryable: false, error: `Larger than ${formatBytes(maxSize)}` };
      if (room <= 0) return { ...base, status: "error", retryable: false, error: `Limit of ${maxFiles} ${maxFiles === 1 ? "file" : "files"}` };
      room--;
      return { ...base, status: "queued" };
    });
    const accepted = items.filter((i) => i.status !== "error");
    setList(multiple ? [...list, ...items] : items);
    if (accepted.length) onFilesAccepted?.(accepted);
  };
  const remove = (item: FileUploadItem) => setList(list.filter((f) => f.id !== item.id));
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDragging(false); add(Array.from(e.dataTransfer.files)); };

  return (
    <div className={cx("faun-file-upload", className)} data-disabled={control.disabled && !state.skeleton ? "" : undefined} {...state.attrs}>
      {state.readOnly ? null : <div
        className="faun-file-upload-dropzone"
        data-dragging={dragging ? "" : undefined}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); if (!control.disabled) setDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = control.disabled ? "none" : "copy"; }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
        onDrop={onDrop}
      >
        <span className="faun-file-upload-icon" aria-hidden="true"><IconUpload /></span>
        <span className="faun-file-upload-title">{title}</span>
        <span className="faun-file-upload-sub">
          or <span className="faun-file-upload-browse">browse</span>
          {hintText ? <span id={hintId} className="faun-file-upload-hint">{hintText}</span> : null}
        </span>
        <input
          ref={(el) => { inputRef.current = el; if (typeof ref === "function") ref(el); else if (ref) ref.current = el; }}
          type="file"
          className="faun-visually-hidden"
          id={control.id}
          name={name}
          accept={accept}
          multiple={multiple}
          disabled={control.disabled}
          required={required && !list.length}
          aria-invalid={isInvalid || undefined}
          aria-describedby={[control["aria-describedby"], hintText ? hintId : null].filter(Boolean).join(" ") || undefined}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => { add(Array.from(e.currentTarget.files ?? [])); e.currentTarget.value = ""; }}
        />
      </div>}
      {!hideList && list.length && !state.skeleton ? (
        <ul className="faun-file-upload-list" aria-label="Files">
          {list.map((item) => (
            <li key={item.id} className="faun-file-upload-item" data-status={item.status}>
              <span className="faun-file-upload-item-icon" aria-hidden="true">
                {item.status === "error" ? <IconStatusAttention /> : item.status === "done" ? <IconFileCheck /> : <IconFileText />}
              </span>
              <span className="faun-file-upload-item-body">
                <span className="faun-file-upload-item-name" title={item.name}>{item.name}</span>
                <span className="faun-file-upload-item-meta">
                  {item.status === "error" ? <span className="faun-file-upload-item-error">{item.error ?? "Upload failed"}</span>
                    : item.status === "uploading" ? `${formatBytes(item.size)} · ${Math.round(item.progress ?? 0)}%`
                    : item.status === "queued" ? `${formatBytes(item.size)} · Waiting`
                    : `${formatBytes(item.size)} · Uploaded`}
                </span>
                {item.status === "uploading" ? (
                  <span className="faun-file-upload-progress" role="progressbar" aria-label={`Uploading ${item.name}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(item.progress ?? 0)}>
                    <span style={{ inlineSize: `${Math.min(100, Math.max(0, item.progress ?? 0))}%` }} />
                  </span>
                ) : null}
              </span>
              <span className="faun-file-upload-item-actions">
                {item.status === "error" && onRetry && !state.readOnly && item.retryable !== false ? (
                  <button type="button" className="faun-file-upload-action" aria-label={`Retry ${item.name}`} onClick={() => onRetry(item)}><IconRefresh /></button>
                ) : null}
                {state.readOnly ? null : <button type="button" className="faun-file-upload-action" aria-label={`Remove ${item.name}`} onClick={() => remove(item)} disabled={control.disabled}><IconClose /></button>}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
});
