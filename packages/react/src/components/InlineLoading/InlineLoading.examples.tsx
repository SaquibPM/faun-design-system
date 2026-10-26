import { useState } from "react";
import { Button } from "../Button/Button";
import { Inline, Stack } from "../Layout/Layout";
import { InlineLoading } from "./InlineLoading";

export function Thumbnail() {
  return <InlineLoading status="active" description="Saving…" />;
}

export function Overview() {
  const [status, setStatus] = useState<"inactive" | "active" | "finished" | "error">("inactive");
  const text = { inactive: "", active: "Saving draft…", finished: "Draft saved", error: "Draft not saved. Try again." }[status];
  const save = () => { setStatus("active"); setTimeout(() => setStatus("finished"), 1200); };
  return (
    <Inline gap="3">
      <Button onClick={save} disabled={status === "active"}>Save draft</Button>
      <InlineLoading status={status} description={text} onSuccess={() => setStatus("inactive")} />
    </Inline>
  );
}

export function Statuses() {
  return (
    <Stack gap="2">
      <InlineLoading status="active" description="Matching ledger rows to emission factors…" />
      <InlineLoading status="finished" description="1,204 rows matched" />
      <InlineLoading status="error" description="Factor library unavailable" />
    </Stack>
  );
}

export function DoNameTheAction() {
  return <InlineLoading status="active" description="Saving narrative…" />;
}

export function DontBareSpinner() {
  return <InlineLoading status="active" />;
}
