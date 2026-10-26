import { useCallback, type Ref } from "react";

type PossibleRef<T> = Ref<T> | undefined;
function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as { current: T }).current = value;
}
export function composeRefs<T>(...refs: PossibleRef<T>[]) {
  return (node: T) => refs.forEach((r) => setRef(r, node));
}
export function useComposedRefs<T>(...refs: PossibleRef<T>[]) {
  return useCallback(composeRefs(...refs), refs);
}
