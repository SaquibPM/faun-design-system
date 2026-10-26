import { useCallback, useRef, useState } from "react";

/** Supports both controlled (`value` + `onChange`) and uncontrolled (`defaultValue`) usage. */
export function useControllableState<T>({ value, defaultValue, onChange }: { value?: T; defaultValue: T; onChange?: (v: T) => void }) {
  const [inner, setInner] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : inner;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (p: T) => T)(current) : next;
      if (!controlled) setInner(resolved);
      if (!Object.is(resolved, current)) onChangeRef.current?.(resolved);
    },
    [controlled, current],
  );
  return [current, set] as const;
}
