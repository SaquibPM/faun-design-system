import rule from "../src/rules/no-arbitrary-tailwind-values.js";
import { tester } from "./setup.js";

tester.run("no-arbitrary-tailwind-values", rule, {
  valid: [
    `const a = <div className="text-body-sm rounded-md p-4 z-modal" />;`,
    `const a = <div className="data-[state=open]:bg-hover group-data-[open=true]:text-fg" />;`,
    `const a = <div className="w-[var(--faun-space-5)]" />`,
    `const a = <div className="bg-[--faun-bg-raised]" />`,
    `const a = <div className="[&>svg]:size-4" />`,
    `const a = <div className={cn("flex", open && "bg-surface")} />`,
    `const a = <div title="text-[11px] is banned" />;`,
    `const a = "text-[11px]";`,
    { code: `const a = <div className="w-[var(--radix-popover-trigger-width)]" />;`, options: [{ allow: ["^var\\(--radix-"] }] },
    { code: `const a = twx("text-[11px]");`, options: [{}] },
    `const a = <div className={\`flex \${gap}\`} />;`,
  ],
  invalid: [
    { code: `const a = <div className="text-[11px]" />;`, errors: [{ messageId: "value", data: { token: "text-[11px]" } }] },
    { code: `const a = <div className="rounded-[10px] z-[80]" />;`, errors: [{ messageId: "value" }, { messageId: "value" }] },
    { code: `const a = <div className="md:hover:w-[calc(100%-2rem)]" />;`, errors: [{ messageId: "value" }] },
    { code: `const a = <div className="-mt-[3px]" />;`, errors: [{ messageId: "value" }] },
    { code: `const a = <div className="bg-[#fff]/50" />;`, errors: [{ messageId: "value" }] },
    { code: `const a = <div className="[mask-type:luminance]" />;`, errors: [{ messageId: "property" }] },
    { code: `const a = <div className={cn("flex", open && "h-[42px]")} />;`, errors: [{ messageId: "value" }] },
    { code: `const a = clsx(["p-[7px]", { "m-[1px]": on }]);`, errors: [{ messageId: "value" }, { messageId: "value" }] },
    { code: "const a = <div className={`flex gap-[5px] ${x}`} />;", errors: [{ messageId: "value" }] },
    { code: `const a = <div class="text-[11px]" />;`, errors: [{ messageId: "value" }] },
    { code: `const a = twx("text-[11px]");`, options: [{ classFunctions: ["twx"] }], errors: [{ messageId: "value" }] },
    { code: `const a = <div className="w-[var(--radix-x)]" />;`, options: [{ allow: ["^var\\(--other-"] }], errors: [{ messageId: "value" }] },
    { code: `const a = cva("size-[18px]", { variants: {} });`, errors: [{ messageId: "value" }] },
  ],
});
