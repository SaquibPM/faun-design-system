import { IconExternal } from "@faun-ds/icons";
import { Slot, Slottable } from "@radix-ui/react-slot";
import { forwardRef, type AnchorHTMLAttributes } from "react";
import { cx } from "../../utils/cx.js";

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** `default` uses the link colour; `muted` sits quietly inside secondary text such as footers and captions. */
  tone?: "default" | "muted";
  /** Underline treatment. `always` (default) keeps links distinguishable inside running text; `hover` is for standalone links such as a "View all" row. */
  underline?: "always" | "hover";
  /** Open in a new tab. Adds `rel="noopener noreferrer"`, an external icon and a spoken "opens in a new tab". */
  external?: boolean;
  /** Render your router's link instead of `<a>`: `<Link asChild><RouterLink to="/filings" /></Link>`. */
  asChild?: boolean;
}

/** A text link to another page, document or evidence source. Use Button for actions that do not navigate. */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { tone = "default", underline = "always", external = false, asChild = false, className, children, target, rel, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      ref={ref}
      className={cx("faun-link", className)}
      data-tone={tone}
      data-underline={underline}
      target={external ? "_blank" : target}
      rel={external ? "noopener noreferrer" : rel}
      {...props}
    >
      <Slottable>{children}</Slottable>
      {external ? (
        <>
          <IconExternal className="faun-link-icon" aria-hidden="true" />
          <span className="faun-visually-hidden"> (opens in a new tab)</span>
        </>
      ) : null}
    </Comp>
  );
});
