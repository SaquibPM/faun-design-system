import { IconApprovalGate, IconCheck, IconClose, IconEdit } from "@faun-ds/icons";
import { Button, Card, Field, StatusBadge, Textarea, cx } from "@faun-ds/react";
import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { formatRelative } from "../../utils/format.js";
import type { ApprovalRequest } from "../../utils/types.js";
import { ActorChip } from "../ActorChip/ActorChip.js";

export interface ApprovalCardProps extends Omit<HTMLAttributes<HTMLElement>, "children" | "title"> {
  /** The decision the agent is waiting on. */
  request: ApprovalRequest;
  /** Evidence the person needs to decide: a diff, a table, a draft. Shown between the summary and the actions. */
  children?: ReactNode;
  /** Called when the person approves. */
  onApprove?: (request: ApprovalRequest) => void;
  /** Called with a required reason when the person rejects. */
  onReject?: (request: ApprovalRequest, comment: string) => void;
  /** Called with the required instructions when the person asks for changes. The request stays pending. */
  onRequestChanges?: (request: ApprovalRequest, comment: string) => void;
  /** Disable the actions while a decision is being saved. */
  busy?: boolean;
  /** Heading level of the title. Default 3. */
  headingLevel?: 2 | 3 | 4;
  /** Reference time (ms since epoch) for relative times. Defaults to the time of the first render. */
  now?: number;
}

type Mode = "idle" | "changes" | "reject";

const COPY = {
  changes: { label: "What should change?", description: "The agent revises its work and asks again.", confirm: "Send changes", placeholder: "For example: use the 2025 market-based factor for sites in Germany." },
  reject: { label: "Why are you rejecting this?", description: "The agent stops and records your reason in the audit trail.", confirm: "Reject", placeholder: "For example: the boundary excludes the Pune plant." },
} as const;

function formatDate(iso: string): string {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(t) : iso;
}

/**
 * A decision an agent is waiting on. Shows what is asked, by whom and what happens next,
 * and offers approve, request changes and reject. Reject and request changes need words, so the audit trail always says why.
 */
export const ApprovalCard = forwardRef<HTMLElement, ApprovalCardProps>(function ApprovalCard(
  { request, children, onApprove, onReject, onRequestChanges, busy = false, headingLevel = 3, now: nowProp, className, ...props },
  ref,
) {
  const [mode, setMode] = useState<Mode>("idle");
  const [comment, setComment] = useState("");
  const [mounted] = useState(() => Date.now());
  const now = nowProp ?? mounted;
  const titleId = useId();
  const textarea = useRef<HTMLTextAreaElement>(null);
  const footer = useRef<HTMLElement>(null);
  const restore = useRef<Exclude<Mode, "idle"> | null>(null);
  const H = `h${headingLevel}` as "h3";
  const pending = request.state === "pending";

  useEffect(() => {
    if (mode !== "idle") textarea.current?.focus();
    else if (restore.current) {
      footer.current?.querySelector<HTMLButtonElement>(`[data-action="${restore.current}"]`)?.focus();
      restore.current = null;
    }
  }, [mode]);

  const open = (m: Exclude<Mode, "idle">) => () => setMode(m);
  const cancel = () => { restore.current = mode === "idle" ? null : mode; setMode("idle"); setComment(""); };
  const confirm = () => {
    const text = comment.trim();
    if (!text || mode === "idle") return;
    (mode === "reject" ? onReject : onRequestChanges)?.(request, text);
    restore.current = mode;
    setMode("idle");
    setComment("");
  };

  const decided = request.state !== "pending";
  return (
    <Card ref={ref as never} asChild padding="none" className={cx("faun-approval", className)} data-state={request.state}>
      <section aria-labelledby={titleId} {...props}>
        <header className="faun-approval-header">
          <span className="faun-approval-icon" aria-hidden="true"><IconApprovalGate size="lg" /></span>
          <div className="faun-approval-heading">
            <H id={titleId} className="faun-approval-title">{request.title}</H>
            <p className="faun-approval-requester">
              <ActorChip actor={request.requestedBy} size="sm" />
              {request.requestedAt ? <time dateTime={request.requestedAt}>Asked {formatRelative(request.requestedAt, now)}</time> : null}
              {pending && request.dueAt ? <time dateTime={request.dueAt}>Due {formatDate(request.dueAt)}</time> : null}
            </p>
          </div>
          <StatusBadge domain="approval" state={request.state} />
        </header>

        <div className="faun-approval-body">
          {request.summary ? <p className="faun-approval-summary">{request.summary}</p> : null}
          {children ? <div className="faun-approval-evidence">{children}</div> : null}
          {pending && (request.onApprove || request.onReject) ? (
            <dl className="faun-approval-outcomes">
              {request.onApprove ? <div><dt>If you approve</dt><dd>{request.onApprove}</dd></div> : null}
              {request.onReject ? <div><dt>If you reject</dt><dd>{request.onReject}</dd></div> : null}
            </dl>
          ) : null}
          {decided ? (
            <div className="faun-approval-decision">
              <p className="faun-approval-decided">
                {request.state === "approved" ? "Approved" : "Rejected"}
                {request.decidedBy ? <> by <ActorChip actor={request.decidedBy} size="sm" /></> : null}
                {request.decidedAt ? <> <time dateTime={request.decidedAt}>{formatRelative(request.decidedAt, now)}</time></> : null}
              </p>
              {request.comment ? <blockquote className="faun-approval-comment">{request.comment}</blockquote> : null}
            </div>
          ) : null}
        </div>

        {pending ? (
          <footer ref={footer} className="faun-approval-footer">
            {mode === "idle" ? (
              <div className="faun-approval-actions">
                <Button variant="solid" intent="accent" leadingIcon={<IconCheck />} disabled={busy} loading={busy} onClick={() => onApprove?.(request)}>Approve</Button>
                <Button data-action="changes" leadingIcon={<IconEdit />} disabled={busy} onClick={open("changes")}>Request changes</Button>
                <Button data-action="reject" intent="danger" leadingIcon={<IconClose />} disabled={busy} onClick={open("reject")}>Reject</Button>
              </div>
            ) : (
              <form className="faun-approval-form" onSubmit={(e) => { e.preventDefault(); confirm(); }} onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); cancel(); } }}>
                <Field label={COPY[mode].label} description={COPY[mode].description} required>
                  <Textarea ref={textarea} value={comment} onChange={(e) => setComment(e.target.value)} minRows={2} maxRows={6} autoGrow placeholder={COPY[mode].placeholder} />
                </Field>
                <div className="faun-approval-actions">
                  <Button type="submit" variant="solid" intent={mode === "reject" ? "danger" : "accent"} disabled={busy || !comment.trim()} loading={busy}>{COPY[mode].confirm}</Button>
                  <Button variant="ghost" onClick={cancel} disabled={busy}>Cancel</Button>
                </div>
              </form>
            )}
          </footer>
        ) : null}
      </section>
    </Card>
  );
});
