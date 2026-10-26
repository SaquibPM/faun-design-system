import rule from "../src/rules/icon-button-needs-label.js";
import { tester } from "./setup.js";

tester.run("icon-button-needs-label", rule, {
  valid: [
    `const a = <IconButton icon={<IconClose />} label="Close" />;`,
    `const a = <IconButton icon={<IconClose />} label={t("close")} />;`,
    `const a = <IconButton icon={<IconClose />} {...props} />;`,
    `const a = <button aria-label="Close"><IconClose /></button>;`,
    `const a = <button aria-labelledby="x"><IconClose /></button>;`,
    `const a = <button title="Close"><IconClose /></button>;`,
    `const a = <button><IconClose /> Close</button>;`,
    `const a = <button>Close</button>;`,
    `const a = <button />;`,
    `const a = <button {...props}><IconClose /></button>;`,
    `const a = <button>{label}</button>;`,
    `const a = <Button leadingIcon={<IconAdd />}>Add</Button>;`,
    { code: `const a = <Fab icon={<IconAdd />} label="Add" />;`, options: [{ components: ["Fab"] }] },
    { code: `const a = <button><IconClose /></button>;`, options: [{ nativeButtons: false }] },
    { code: `const a = <IconButton icon={<IconClose />} />;`, options: [{ components: ["Fab"] }] },
  ],
  invalid: [
    { code: `const a = <IconButton icon={<IconClose />} />;`, errors: [{ messageId: "missing", data: { name: "IconButton" } }] },
    { code: `const a = <IconButton icon={<IconClose />} label="" />;`, errors: [{ messageId: "empty" }] },
    { code: `const a = <IconButton icon={<IconClose />} label="  " />;`, errors: [{ messageId: "empty" }] },
    { code: `const a = <IconButton icon={<IconClose />} label={""} />;`, errors: [{ messageId: "empty" }] },
    { code: `const a = <IconButton icon={<IconClose />} label={undefined} />;`, errors: [{ messageId: "empty" }] },
    { code: `const a = <IconButton icon={<IconClose />} label />;`, errors: [{ messageId: "empty" }] },
    { code: `const a = <Fab icon={<IconAdd />} />;`, options: [{ components: ["Fab"] }], errors: [{ messageId: "missing", data: { name: "Fab" } }] },
    { code: `const a = <button><IconClose /></button>;`, errors: [{ messageId: "native" }] },
    { code: `const a = <button onClick={f}>\n  <IconClose />\n  <IconSearch />\n</button>;`, errors: [{ messageId: "native" }] },
    { code: `const a = <button aria-label=""><IconClose /></button>;`, errors: [{ messageId: "native" }] },
  ],
});
