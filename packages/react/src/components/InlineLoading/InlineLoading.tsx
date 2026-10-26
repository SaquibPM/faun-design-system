import { IconCheck, IconStatusDanger } from "@faun-ds/icons";
import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { Spinner } from "../Spinner/Spinner.js";

export type InlineLoadingStatus = "inactive" | "active" | "finished" | "error";

export interface InlineLoadingProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** `inactive` shows nothing, `active` a spinner, `finished` a check, `error` an alert. */
  status?: InlineLoadingStatus;
  /** The text beside the icon, e.g. "Saving…", "Saved", "Save failed". Change it with the status. It is announced to screen readers. */
  description?: ReactNode;
  /** Milliseconds `finished` stays visible before `onSuccess` fires. Default 1500. */
  successDelay?: number;
  /** Called once after `successDelay` when the status becomes `finished`. Use it to return to `inactive`. */
  onSuccess?: () => void;
}

/**
 * Shows the progress of one small action beside the thing that started it: Saving, Saved, Save failed.
 * Always mounted, so changes to the text are announced politely (errors assertively).
 */
export const InlineLoading = forwardRef<HTMLDivElement, InlineLoadingProps>(function InlineLoading(
  { status = "active", description, successDelay = 1500, onSuccess, className, ...props },
  ref,
) {
  const done = useRef(onSuccess);
  done.current = onSuccess;
  useEffect(() => {
    if (status !== "finished") return;
    const t = setTimeout(() => done.current?.(), successDelay);
    return () => clearTimeout(t);
  }, [status, successDelay]);
  return (
    <div
      ref={ref}
      className={cx("faun-inline-loading", className)}
      data-status={status}
      role={status === "error" ? "alert" : "status"}
      aria-live={status === "error" ? "assertive" : "polite"}
      {...props}
    >
      {status === "active" ? <Spinner size="sm" label={null} /> : null}
      {status === "finished" ? <IconCheck size="sm" aria-hidden="true" /> : null}
      {status === "error" ? <IconStatusDanger size="sm" aria-hidden="true" /> : null}
      {status !== "inactive" && description ? <span className="faun-inline-loading-text">{description}</span> : null}
    </div>
  );
});
