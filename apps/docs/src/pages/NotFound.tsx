import { Button } from "@faun-ds/react";
import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="docs-page docs-empty">
      <p className="docs-eyebrow">404</p>
      <h1 className="docs-h1">This page isn’t here</h1>
      <p className="docs-lede">It may have moved. Search with ⌘K, or start from the overview.</p>
      <Button asChild variant="solid" intent="accent"><Link to="/">Go to overview</Link></Button>
    </div>
  );
}
