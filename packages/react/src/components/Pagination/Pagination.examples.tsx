import { useState } from "react";
import { Pagination } from "./Pagination";

export function Thumbnail() {
  return <Pagination page={3} onPageChange={() => {}} total={400} pageSize={25} hideSummary />;
}

export function Overview() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(25);
  return (
    <div style={{ inlineSize: "100%" }}>
      <Pagination page={page} onPageChange={setPage} total={1034} pageSize={size} pageSizeOptions={[25, 50, 100]} onPageSizeChange={(n) => { setSize(n); setPage(1); }} itemLabel="rows" />
    </div>
  );
}

export function Middle() {
  const [page, setPage] = useState(21);
  return <div style={{ inlineSize: "100%" }}><Pagination page={page} onPageChange={setPage} total={1034} pageSize={25} itemLabel="datapoints" /></div>;
}

export function Compact() {
  const [page, setPage] = useState(3);
  return <Pagination variant="compact" page={page} onPageChange={setPage} total={1034} pageSize={25} hideSummary />;
}

export function DoTotals() {
  return <div style={{ inlineSize: "100%" }}><Pagination page={2} onPageChange={() => {}} total={1034} pageSize={25} itemLabel="suppliers" /></div>;
}

export function DontFewItems() {
  return <div style={{ inlineSize: "100%" }}><Pagination page={1} onPageChange={() => {}} total={12} pageSize={25} itemLabel="suppliers" /></div>;
}
