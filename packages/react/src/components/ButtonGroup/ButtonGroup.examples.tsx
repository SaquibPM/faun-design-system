import { Button } from "../Button/Button";
import { ButtonGroup } from "./ButtonGroup";

export function Thumbnail() {
  return (
    <ButtonGroup>
      <Button variant="ghost">Cancel</Button>
      <Button variant="solid" intent="accent">Approve</Button>
    </ButtonGroup>
  );
}

export function Overview() {
  return (
    <ButtonGroup aria-label="Review actions">
      <Button variant="ghost">Cancel</Button>
      <Button>Request changes</Button>
      <Button variant="solid" intent="accent">Approve materiality</Button>
    </ButtonGroup>
  );
}

export function Equal() {
  return (
    <div style={{ inlineSize: "min(100%, 420px)" }}>
      <ButtonGroup equal aria-label="Confirm">
        <Button>Keep draft</Button>
        <Button variant="solid" intent="accent">Publish</Button>
      </ButtonGroup>
    </div>
  );
}

export function Joined() {
  return (
    <ButtonGroup layout="joined" align="start" aria-label="Boundary approach">
      <Button>Operational</Button>
      <Button>Financial</Button>
      <Button>Equity share</Button>
    </ButtonGroup>
  );
}

export function Stacked() {
  return (
    <div style={{ inlineSize: "min(100%, 280px)" }}>
      <ButtonGroup stack="always" aria-label="Sign in">
        <Button variant="solid" intent="accent">Continue with SSO</Button>
        <Button>Use email instead</Button>
      </ButtonGroup>
    </div>
  );
}

export function DoOnePrimary() {
  return (
    <ButtonGroup>
      <Button variant="ghost">Cancel</Button>
      <Button variant="solid" intent="accent">Save</Button>
    </ButtonGroup>
  );
}

export function DontFourActions() {
  return (
    <ButtonGroup>
      <Button>Edit</Button><Button>Copy</Button><Button>Share</Button><Button variant="solid" intent="accent">Run</Button>
    </ButtonGroup>
  );
}
