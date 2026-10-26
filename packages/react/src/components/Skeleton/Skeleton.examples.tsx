import { Card, CardBody } from "../Card/Card";
import { Inline, Stack } from "../Layout/Layout";
import { Skeleton, SkeletonRows } from "./Skeleton";

export function Thumbnail() {
  return (
    <Stack gap="2" style={{ inlineSize: 180 }}>
      <Inline gap="2"><Skeleton shape="circle" width="28px" /><Skeleton width="60%" /></Inline>
      <Skeleton lines={2} />
    </Stack>
  );
}

export function Overview() {
  return (
    <Card style={{ inlineSize: "min(100%, 420px)" }} aria-busy="true">
      <CardBody>
        <Stack gap="4">
          <Inline gap="3"><Skeleton shape="circle" width="40px" /><Stack gap="2" style={{ flex: 1 }}><Skeleton width="50%" /><Skeleton width="30%" /></Stack></Inline>
          <Skeleton lines={3} />
          <Skeleton shape="rect" height="var(--faun-space-20)" />
        </Stack>
      </CardBody>
    </Card>
  );
}

export function Shapes() {
  return (
    <Inline gap="6" align="start">
      <Stack gap="2" style={{ inlineSize: 160 }}><Skeleton lines={3} /><span style={{ fontSize: "var(--faun-type-caption-font-size)" }}>Text, 3 lines</span></Stack>
      <Stack gap="2"><Skeleton shape="circle" width="48px" /><span style={{ fontSize: "var(--faun-type-caption-font-size)" }}>Circle</span></Stack>
      <Stack gap="2"><Skeleton shape="rect" width="120px" height="64px" /><span style={{ fontSize: "var(--faun-type-caption-font-size)" }}>Rect</span></Stack>
    </Inline>
  );
}

export function Table() {
  return <SkeletonRows rows={5} columns={4} label="Loading datapoints" style={{ inlineSize: "min(100%, 560px)" }} />;
}

export function DoMatchShape() {
  return (
    <Inline gap="3" style={{ inlineSize: 280 }}><Skeleton shape="circle" width="32px" /><Stack gap="2" style={{ flex: 1 }}><Skeleton width="70%" /><Skeleton width="40%" /></Stack></Inline>
  );
}

export function DontGenericBlock() {
  return <Skeleton shape="rect" width="280px" height="64px" />;
}
