import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axeViolations } from "../../../test/a11y.js";
import { Meter, ProgressBar, ProgressCircle } from "./Progress.js";

describe("ProgressBar", () => {
  it("is a named progressbar with value", () => {
    render(<ProgressBar label="Datapoints covered" value={812} max={1034} valueLabel="812 of 1,034" />);
    const bar = screen.getByRole("progressbar", { name: "Datapoints covered" });
    expect(bar).toHaveAttribute("aria-valuenow", "812");
    expect(bar).toHaveAttribute("aria-valuemax", "1034");
    expect(screen.getByText("812 of 1,034")).toBeInTheDocument();
  });
  it("shows a percentage when asked", () => {
    render(<ProgressBar label="Drafting" showValue value={40} />);
    expect(screen.getByText("40%")).toBeInTheDocument();
  });
  it("is indeterminate with null", () => {
    render(<ProgressBar label="Importing" value={null} />);
    expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
  });
  it("segments sum into one progressbar with spoken text and a legend", () => {
    render(<ProgressBar label="Quality" max={100} segments={[{ value: 60, label: "Evidenced", tone: "success" }, { value: 10, label: "Estimated", tone: "warning" }]} />);
    const bar = screen.getByRole("progressbar", { name: "Quality" });
    expect(bar).toHaveAttribute("aria-valuenow", "70");
    expect(bar).toHaveAttribute("aria-valuetext", "Evidenced 60%, Estimated 10%");
    expect(screen.getByText("Evidenced")).toBeInTheDocument();
  });
});

describe("ProgressCircle and Meter", () => {
  it("circle exposes its value", () => {
    render(<ProgressCircle aria-label="Coverage" value={91} />);
    expect(screen.getByRole("progressbar", { name: "Coverage" })).toHaveAttribute("aria-valuenow", "91");
  });
  it("meter has role=meter and colours by thresholds", () => {
    const { container, rerender } = render(<Meter label="Evidence" value={95} low={70} high={90} />);
    expect(screen.getByRole("meter", { name: "Evidence" })).toHaveAttribute("aria-valuenow", "95");
    expect(container.querySelector(".faun-progress-fill")).toHaveAttribute("data-tone", "success");
    rerender(<Meter label="Evidence" value={50} low={70} high={90} />);
    expect(container.querySelector(".faun-progress-fill")).toHaveAttribute("data-tone", "danger");
    rerender(<Meter label="Evidence" value={80} low={70} high={90} />);
    expect(container.querySelector(".faun-progress-fill")).toHaveAttribute("data-tone", "warning");
  });
  it("meter honours higherIsBetter=false", () => {
    const { container } = render(<Meter label="Intensity" value={10} low={15} high={20} higherIsBetter={false} />);
    expect(container.querySelector(".faun-progress-fill")).toHaveAttribute("data-tone", "success");
  });
  it("has no axe violations", async () => {
    const { container } = render(<div><ProgressBar label="A" value={20} /><ProgressBar label="B" value={null} /><ProgressBar label="C" segments={[{ value: 5, label: "x" }]} /><ProgressCircle aria-label="D" value={10} /><Meter label="E" value={30} /></div>);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("ProgressBar status", () => {
  it("finished fills the bar and writes Finished with an icon, not tone alone", () => {
    const { container } = render(<ProgressBar label="Import" value={40} status="finished" />);
    const bar = screen.getByRole("progressbar", { name: "Import" });
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    expect(bar).toHaveAttribute("aria-valuetext", "Finished");
    expect(screen.getByText("Finished")).toBeInTheDocument();
    expect(container.querySelector(".faun-progress-status svg")).not.toBeNull();
    expect(container.querySelector(".faun-progress-fill")).toHaveAttribute("data-tone", "success");
  });
  it("error keeps the value, turns red and says what went wrong", () => {
    const { container } = render(<ProgressBar label="Upload" value={62} status="error" statusText="Upload stopped at 62%. Check the file and retry." />);
    const bar = screen.getByRole("progressbar", { name: "Upload" });
    expect(bar).toHaveAttribute("aria-valuenow", "62");
    expect(bar).toHaveAttribute("aria-valuetext", "Error: Upload stopped at 62%. Check the file and retry.");
    expect(screen.getByText(/Upload stopped at 62%/)).toBeInTheDocument();
    expect(container.querySelector(".faun-progress-fill")).toHaveAttribute("data-tone", "danger");
  });
  it("error without text still says Failed", () => {
    render(<ProgressBar label="Upload" value={10} status="error" />);
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
  it("active shows helper text only when given", () => {
    const { container, rerender } = render(<ProgressBar label="Drafting" value={30} />);
    expect(container.querySelector(".faun-progress-status")).toBeNull();
    rerender(<ProgressBar label="Drafting" value={30} statusText="Drafting E1-6 narrative" />);
    expect(screen.getByText("Drafting E1-6 narrative")).toBeInTheDocument();
  });
});

describe("ProgressBar announcement contract", () => {
  const live = (c: HTMLElement) => within(c).getAllByText((_t, el) => el?.classList.contains("faun-visually-hidden") === true && el.hasAttribute("aria-live"))[0]!;
  it("is silent on first render, determinate or not", () => {
    const { container } = render(<><ProgressBar label="A" value={60} /><ProgressBar label="B" value={null} /></>);
    container.querySelectorAll("[aria-live]").forEach((el) => expect(el.textContent).toBe(""));
  });
  it("announces each 25 percent milestone crossed upward, politely, and not every tick", () => {
    const { container, rerender } = render(<ProgressBar label="Import" value={10} />);
    const region = container.querySelector("[aria-live]")!;
    expect(region).toHaveAttribute("aria-live", "polite");
    rerender(<ProgressBar label="Import" value={20} />);
    expect(region.textContent).toBe("");
    rerender(<ProgressBar label="Import" value={26} />);
    expect(region.textContent).toBe("Import: 25%");
    rerender(<ProgressBar label="Import" value={55} />);
    expect(region.textContent).toBe("Import: 50%");
    rerender(<ProgressBar label="Import" value={60} />);
    expect(region.textContent).toBe("Import: 50%");
    expect(live(container)).toBe(region);
  });
  it("announces in progress when a bar becomes indeterminate", () => {
    const { container, rerender } = render(<ProgressBar label="Import" value={50} />);
    rerender(<ProgressBar label="Import" value={null} />);
    expect(container.querySelector("[aria-live]")).toHaveTextContent("Import: in progress");
  });
  it("announces finished politely and failed as an alert", () => {
    const { container, rerender } = render(<ProgressBar label="Import" value={80} />);
    rerender(<ProgressBar label="Import" value={100} status="finished" />);
    let region = container.querySelector("[aria-live]")!;
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveTextContent("Import: finished");
    rerender(<ProgressBar label="Import" value={80} status="error" statusText="Stopped." />);
    region = container.querySelector("[aria-live]")!;
    expect(region).toHaveAttribute("role", "alert");
    expect(region).toHaveAttribute("aria-live", "assertive");
    expect(region).toHaveTextContent("Import: failed. Stopped.");
  });
  it("announce={false} removes the live region", () => {
    const { container } = render(<ProgressBar label="Import" value={50} announce={false} />);
    expect(container.querySelector("[aria-live]")).toBeNull();
  });
  it("has no axe violations in every status", async () => {
    const { container } = render(<div><ProgressBar label="A" value={20} statusText="Working" /><ProgressBar label="B" value={100} status="finished" /><ProgressBar label="C" value={30} status="error" statusText="Stopped." /></div>);
    expect(await axeViolations(container)).toEqual([]);
  });
});
