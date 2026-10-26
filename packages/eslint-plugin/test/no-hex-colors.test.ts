import rule from "../src/rules/no-hex-colors.js";
import { tester } from "./setup.js";

tester.run("no-hex-colors", rule, {
  valid: [
    `const a = "var(--faun-bg-surface)";`,
    `const a = <div className="bg-surface text-fg-muted" />;`,
    `const a = <div style={{ color: "var(--faun-fg-muted)" }} />;`,
    `const a = <a href="#fff">Skip</a>;`,
    `const a = <svg><use href="#bad" /></svg>;`,
    `const a = "url(#gradient)";`,
    `const a = "&#x1F600;";`,
    `const a = "see #section-1";`,
    `import x from "#internal/path";`,
    { code: `const a = "#fff";`, options: [{ allow: ["#FFF"] }] },
    { code: `const a = "rgb(0 0 0)";`, options: [{ functions: false }] },
    `const a = "rgb(var(--channel))";`,
    `const a = 'color-mix(in srgb, var(--faun-fg) 50%, transparent)';`,
    `const a = "colorful";`,
  ],
  invalid: [
    // Ambiguous by design: #123 is a valid colour. Use the allow option for ticket references.
    { code: `const a = "Issue #123 is open";`, errors: [{ messageId: "hex" }] },
    { code: `const a = "#fff";`, errors: [{ messageId: "hex", data: { value: "#fff" } }] },
    { code: `const a = "#3E4C3A";`, errors: [{ messageId: "hex" }] },
    { code: `const a = "#3e4c3a80";`, errors: [{ messageId: "hex" }] },
    { code: `const a = "#f0f8";`, errors: [{ messageId: "hex" }] },
    { code: "const a = `border: 1px solid #ccc`;", errors: [{ messageId: "hex" }] },
    { code: `const a = <div style={{ color: "#d33" }} />;`, errors: [{ messageId: "hex" }] },
    { code: `const a = <div style={{ background: "linear-gradient(#fff, #000)" }} />;`, errors: [{ messageId: "hex" }, { messageId: "hex" }] },
    { code: `const a = <rect fill="#e11" />;`, errors: [{ messageId: "hex" }] },
    { code: `const a = "rgb(10, 20, 30)";`, errors: [{ messageId: "fn", data: { value: "rgb(10, 20, 30)" } }] },
    { code: `const a = "rgba(0,0,0,.4)";`, errors: [{ messageId: "fn" }] },
    { code: `const a = "hsl(120 30% 40%)";`, errors: [{ messageId: "fn" }] },
    { code: `const a = "oklch(60% 0.1 120)";`, errors: [{ messageId: "fn" }] },
    { code: `const a = "#fff";`, options: [{ allow: ["#000"] }], errors: [{ messageId: "hex" }] },
  ],
});
