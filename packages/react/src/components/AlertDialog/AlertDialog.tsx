import * as RD from "@radix-ui/react-dialog";
import { IconStatusDanger, IconStatusWarning } from "@faun-ds/icons";
import { forwardRef, useId, useRef, useState, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Button } from "../Button/Button.js";
import { Input } from "../Input/Input.js";

export const AlertDialog = RD.Root;
export const AlertDialogTrigger = RD.Trigger;

export interface AlertDialogContentProps {
  /** A question that names the action and its object: “Archive CSRD Filing Orchestrator?” */
  title: ReactNode;
  /** The consequence, in plain words. What stops, what is kept, whether it can be undone. */
  description: ReactNode;
  /** The confirm button label. Repeat the verb from the title: “Archive”, not “OK”. */
  confirmLabel: string;
  cancelLabel?: string;
  /** `danger` (default) for destructive actions, `accent` for consequential but safe ones such as submitting a filing. */
  intent?: "danger" | "accent";
  /** Called on confirm. Return a promise to show a loading state; the dialog closes when it resolves and stays open if it rejects. */
  onConfirm?: () => void | Promise<unknown>;
  /** Require typing this exact text before confirming. Use for irreversible actions on important objects. */
  confirmText?: string;
  /** Extra content between the description and the actions, e.g. a list of affected workflows. */
  children?: ReactNode;
  /** Hide the leading status icon. */
  hideIcon?: boolean;
  className?: string;
}

/**
 * Interrupts to confirm a consequential action. Focus starts on Cancel, Escape cancels, clicking outside does nothing.
 */
export const AlertDialogContent = forwardRef<HTMLDivElement, AlertDialogContentProps>(function AlertDialogContent(
  { title, description, confirmLabel, cancelLabel = "Cancel", intent = "danger", onConfirm, confirmText, children, hideIcon, className },
  ref,
) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const inputId = useId();
  const blocked = confirmText !== undefined && typed.trim() !== confirmText;

  const confirm = async () => {
    if (blocked || busy) return;
    setError(null);
    try {
      const r = onConfirm?.();
      if (r && typeof (r as Promise<unknown>).then === "function") {
        setBusy(true);
        await r;
      }
      setBusy(false);
      closeRef.current?.click();
    } catch (e) {
      setBusy(false);
      setError(e instanceof Error && e.message ? e.message : "That didn't work. Try again.");
    }
  };

  const Icon = intent === "danger" ? IconStatusDanger : IconStatusWarning;
  return (
    <RD.Portal>
      <RD.Overlay className="faun-dialog-scrim" />
      <RD.Content
        ref={ref}
        role="alertdialog"
        className={cx("faun-dialog", "faun-alert-dialog", className)}
        data-size="sm"
        data-intent={intent}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => { e.preventDefault(); (confirmText !== undefined ? (document.getElementById(inputId) as HTMLElement | null) : cancelRef.current)?.focus(); }}
        onCloseAutoFocus={() => { setTyped(""); setError(null); setBusy(false); }}
      >
        <div className="faun-alert-dialog-main">
          {hideIcon ? null : <span className="faun-alert-dialog-icon" aria-hidden="true"><Icon size="lg" /></span>}
          <div className="faun-alert-dialog-text">
            <RD.Title className="faun-dialog-title">{title}</RD.Title>
            <RD.Description className="faun-dialog-description">{description}</RD.Description>
            {children ? <div className="faun-alert-dialog-extra">{children}</div> : null}
            {confirmText !== undefined ? (
              <div className="faun-alert-dialog-confirm">
                <label htmlFor={inputId} className="faun-alert-dialog-confirm-label">
                  Type <strong>{confirmText}</strong> to confirm
                </label>
                <Input id={inputId} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void confirm(); } }} />
              </div>
            ) : null}
            {error ? <p className="faun-alert-dialog-error" role="alert">{error}</p> : null}
          </div>
        </div>
        <div className="faun-dialog-footer">
          <div className="faun-dialog-footer-actions">
            <RD.Close asChild>
              <Button ref={cancelRef} variant="outline" disabled={busy}>{cancelLabel}</Button>
            </RD.Close>
            <Button variant="solid" intent={intent} loading={busy} disabled={blocked} onClick={() => void confirm()}>{confirmLabel}</Button>
          </div>
          <RD.Close ref={closeRef} className="faun-visually-hidden" tabIndex={-1} aria-hidden="true" />
        </div>
      </RD.Content>
    </RD.Portal>
  );
});
