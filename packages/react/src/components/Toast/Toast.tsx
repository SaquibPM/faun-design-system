import * as RT from "@radix-ui/react-toast";
import { IconClose, IconStatusDanger, IconStatusInfo, IconStatusSuccess, IconStatusWarning } from "@faun-ds/icons";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { Spinner } from "../Spinner/Spinner.js";

export type ToastTone = "neutral" | "info" | "success" | "warning" | "danger" | "loading";

export interface ToastOptions {
  /** Short outcome, in past tense where it reports an action: “Materiality approved”. */
  title: ReactNode;
  /** Optional detail: what happened, or what to do next. */
  description?: ReactNode;
  tone?: ToastTone;
  /** One action, e.g. Undo or View run. A toast with an action stays until it is dismissed or acted on, because a timer would take the action away from slow readers and screen reader users. Pass `duration` to opt back in to a timer. */
  action?: { label: string; onClick: () => void; altText?: string };
  /** Milliseconds before auto-dismiss. Default 5000 (8000 for errors); loading toasts and toasts with an action stay until dismissed or updated. Pass Infinity to persist. */
  duration?: number;
  /** Keeps the toast until someone dismisses it, whatever else is set. Use for anything that needs a decision or that people must not miss. */
  persistent?: boolean;
  /** Provide to update or dismiss a specific toast later. */
  id?: string;
}

type Entry = ToastOptions & { id: string; open: boolean; createdAt: number };

/* ------------------------------------------------------------------ store */
let entries: Entry[] = [];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
let seq = 0;

function upsert(opts: ToastOptions): string {
  const id = opts.id ?? `faun-toast-${++seq}`;
  const existing = entries.find((e) => e.id === id);
  if (existing) entries = entries.map((e) => (e.id === id ? { ...e, ...opts, id, open: true } : e));
  else entries = [...entries, { ...opts, id, open: true, createdAt: Date.now() }];
  emit();
  return id;
}

type ToastInput = ReactNode | ToastOptions;
const norm = (input: ToastInput, extra: Partial<ToastOptions> = {}): ToastOptions =>
  input && typeof input === "object" && "title" in (input as object) ? { ...(input as ToastOptions), ...extra } : { title: input as ReactNode, ...extra };

/**
 * Shows a toast. Returns its id.
 *   toast("Draft saved")
 *   toast.success({ title: "Materiality approved", action: { label: "View", onClick } })
 *   toast.promise(save(), { loading: "Saving…", success: "Saved", error: (e) => e.message })
 */
export function toast(input: ToastInput, opts: Partial<ToastOptions> = {}) {
  return upsert(norm(input, opts));
}
toast.success = (input: ToastInput, o: Partial<ToastOptions> = {}) => upsert(norm(input, { ...o, tone: "success" }));
toast.error = (input: ToastInput, o: Partial<ToastOptions> = {}) => upsert(norm(input, { ...o, tone: "danger" }));
toast.warning = (input: ToastInput, o: Partial<ToastOptions> = {}) => upsert(norm(input, { ...o, tone: "warning" }));
toast.info = (input: ToastInput, o: Partial<ToastOptions> = {}) => upsert(norm(input, { ...o, tone: "info" }));
toast.loading = (input: ToastInput, o: Partial<ToastOptions> = {}) => upsert(norm(input, { duration: Infinity, ...o, tone: "loading" }));
toast.update = (id: string, o: Partial<ToastOptions>) => {
  const e = entries.find((x) => x.id === id);
  if (e) upsert({ ...e, ...o, id });
};
/** Closes one toast, or all of them when called without an id. */
toast.dismiss = (id?: string) => {
  const ids = entries.filter((e) => e.open && (id === undefined || e.id === id)).map((e) => e.id);
  if (!ids.length) return;
  entries = entries.map((e) => (ids.includes(e.id) ? { ...e, open: false } : e));
  emit();
  // Remove after the exit animation; a toast re-opened with the same id in the meantime is kept.
  setTimeout(() => { entries = entries.filter((e) => !ids.includes(e.id) || e.open); emit(); }, 400);
};
toast.promise = <T,>(
  promise: Promise<T>,
  msgs: { loading: ReactNode; success: ReactNode | ((v: T) => ReactNode); error: ReactNode | ((e: unknown) => ReactNode) },
) => {
  const id = toast.loading(msgs.loading);
  promise.then(
    (v) => toast.update(id, { title: typeof msgs.success === "function" ? (msgs.success as (v: T) => ReactNode)(v) : msgs.success, tone: "success", duration: 5000 }),
    (e) => toast.update(id, { title: typeof msgs.error === "function" ? (msgs.error as (e: unknown) => ReactNode)(e) : msgs.error, tone: "danger", duration: 8000 }),
  );
  return promise;
};
/** Test helper: removes every toast immediately. */
toast.clearAll = () => { entries = []; emit(); };

/** How long a toast stays: forever when persistent, or when it has an action and no explicit duration; otherwise 5 s (8 s for errors). */
export function durationOf(e: Pick<ToastOptions, "duration" | "persistent" | "action" | "tone">): number {
  if (e.persistent) return Infinity;
  if (e.duration !== undefined) return e.duration;
  if (e.action) return Infinity;
  return e.tone === "danger" ? 8000 : 5000;
}

const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
const snapshot = () => entries;

/* Only the first mounted Toaster renders, so a second one (in a nested layout or a docs page) never duplicates toasts. */
let owners: symbol[] = [];
const ownerListeners = new Set<() => void>();
const ownersSnapshot = () => owners;
const subscribeOwners = (l: () => void) => { ownerListeners.add(l); return () => { ownerListeners.delete(l); }; };

/* ------------------------------------------------------------------ view */
const ICONS: Record<ToastTone, ReactNode> = {
  neutral: null,
  info: <IconStatusInfo size="lg" />,
  success: <IconStatusSuccess size="lg" />,
  warning: <IconStatusWarning size="lg" />,
  danger: <IconStatusDanger size="lg" />,
  loading: <Spinner size="lg" label={null} />,
};

export interface ToasterProps {
  /** Corner for the stack. Default bottom-right. */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-center" | "bottom-center";
  /** Name of the region for screen readers. */
  label?: string;
  /** Most toasts visible at once; older ones dismiss. Default 4. */
  max?: number;
  children?: ReactNode;
}

/** Renders queued toasts. Mount once near the root of the app. */
export function Toaster({ position = "bottom-right", label = "Notifications", max = 4, children }: ToasterProps) {
  const [me] = useState(() => Symbol("toaster"));
  useEffect(() => {
    owners = [...owners, me];
    ownerListeners.forEach((l) => l());
    return () => { owners = owners.filter((o) => o !== me); ownerListeners.forEach((l) => l()); };
  }, [me]);
  const currentOwners = useSyncExternalStore(subscribeOwners, ownersSnapshot, ownersSnapshot);
  const list = useSyncExternalStore(subscribe, snapshot, snapshot);
  const active = currentOwners[0] === me;

  const openIds = list.filter((e) => e.open).map((e) => e.id);
  const overflow = openIds.slice(0, Math.max(0, openIds.length - max));
  useEffect(() => { if (active) overflow.forEach((id) => toast.dismiss(id)); });

  return (
    <RT.Provider swipeDirection={position.endsWith("left") ? "left" : position.startsWith("top") ? "up" : "right"} label={label}>
      {children}
      {active
        ? list.map((e) => {
            const tone = e.tone ?? "neutral";
            return (
              <RT.Root
                key={e.id}
                open={e.open}
                duration={durationOf(e)}
                type={tone === "danger" || tone === "warning" ? "foreground" : "background"}
                onOpenChange={(open) => { if (!open) toast.dismiss(e.id); }}
                className="faun-toast"
                data-tone={tone}
              >
                {ICONS[tone] ? <span className="faun-toast-icon" aria-hidden="true">{ICONS[tone]}</span> : null}
                <div className="faun-toast-text">
                  <RT.Title className="faun-toast-title">{e.title}</RT.Title>
                  {e.description ? <RT.Description className="faun-toast-description">{e.description}</RT.Description> : null}
                </div>
                {e.action ? (
                  <RT.Action altText={e.action.altText ?? e.action.label} asChild>
                    <button type="button" className="faun-toast-action" onClick={e.action.onClick}>{e.action.label}</button>
                  </RT.Action>
                ) : null}
                <RT.Close className="faun-toast-close" aria-label="Dismiss notification">
                  <IconClose size="md" />
                </RT.Close>
              </RT.Root>
            );
          })
        : null}
      {active ? <RT.Viewport className="faun-toast-viewport" data-position={position} /> : null}
    </RT.Provider>
  );
}
