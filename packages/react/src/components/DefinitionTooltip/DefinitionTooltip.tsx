import * as RT from "@radix-ui/react-tooltip";
import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";

export interface DefinitionTooltipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "content"> {
  /** The term, shown with a dotted underline. */
  children: ReactNode;
  /** The definition. Plain text only: it is announced as the term's description and cannot hold links or buttons. */
  definition: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

/**
 * A term with a dotted underline that explains itself. The definition opens on hover and on keyboard focus,
 * stays open when the term is pressed, and closes on Escape or when the term is pressed again.
 */
export const DefinitionTooltip = forwardRef<HTMLButtonElement, DefinitionTooltipProps>(function DefinitionTooltip(
  { children, definition, side = "bottom", align = "start", className, onClick, ...props },
  ref,
) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  return (
    <RT.Provider delayDuration={200}>
      <RT.Root
        open={open || pinned}
        onOpenChange={(next) => {
          if (!next) setPinned(false);
          setOpen(next);
        }}
      >
        <RT.Trigger asChild>
          <button
            ref={ref}
            type="button"
            className={cx("faun-definition-term", className)}
            onClick={(e) => {
              onClick?.(e);
              // Radix closes on click; take over so a press pins the definition and a second press closes it.
              e.preventDefault();
              setPinned((p) => !p);
              setOpen(false);
            }}
            {...props}
          >
            {children}
          </button>
        </RT.Trigger>
        <RT.Portal>
          <RT.Content side={side} align={align} sideOffset={6} collisionPadding={8} className="faun-definition-content">
            {definition}
          </RT.Content>
        </RT.Portal>
      </RT.Root>
    </RT.Provider>
  );
});
