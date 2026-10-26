import rule from "../src/rules/no-raw-status-colors.js";
import { tester } from "./setup.js";

tester.run("no-raw-status-colors", rule, {
  valid: [
    `const a = <div className="text-status-success bg-status-warning-soft border-status-danger-line" />;`,
    `const a = <div className="text-fg bg-surface text-danger-fg" />;`,
    `const a = <StatusBadge domain="run" state="failed" />;`,
    `const a = <div className="text-gray-500" />;`,
    `const a = <div className="text-green" />;`,
    `const a = <div className="red-flag text-redacted" />;`,
    `const a = <div style={{ color: "var(--faun-status-danger-fg)" }} />;`,
    `const a = <div style={{ color: "inherit" }} />;`,
    `const a = "text-green-600";`,
    `const a = { color: "green" };`,
    `const a = <div title="bg-red-500" />;`,
  ],
  invalid: [
    { code: `const a = <span className="text-green-600">Complete</span>;`, errors: [{ messageId: "cls", data: { token: "text-green-600" } }] },
    { code: `const a = <span className="bg-red-100 text-red-800" />;`, errors: [{ messageId: "cls" }, { messageId: "cls" }] },
    { code: `const a = <span className="dark:bg-amber-900/40" />;`, errors: [{ messageId: "cls" }] },
    { code: `const a = <span className="border-yellow-500" />;`, errors: [{ messageId: "cls" }] },
    { code: `const a = <span className="hover:text-emerald-50" />;`, errors: [{ messageId: "cls" }] },
    { code: `const a = <span className={cn("p-2", ok ? "text-green-500" : "text-red-500")} />;`, errors: [{ messageId: "cls" }, { messageId: "cls" }] },
    { code: "const a = <span className={`ring-orange-400 ${x}`} />;", errors: [{ messageId: "cls" }] },
    { code: `const a = <span className="!text-rose-950" />;`, errors: [{ messageId: "cls" }] },
    { code: `const a = <span style={{ color: "green" }} />;`, errors: [{ messageId: "style", data: { prop: "color", value: "green" } }] },
    { code: `const a = <span style={{ backgroundColor: "Red" }} />;`, errors: [{ messageId: "style" }] },
    { code: `const a = <rect style={{ fill: "orange" }} />;`, errors: [{ messageId: "style" }] },
    { code: `const a = cva("text-sky-700", {});`, errors: [{ messageId: "cls" }] },
    { code: `const a = twx("text-green-600");`, options: [{ classFunctions: ["twx"] }], errors: [{ messageId: "cls" }] },
  ],
});
