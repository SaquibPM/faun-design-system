import { forwardRef, type AnchorHTMLAttributes } from "react";
import { cx } from "../../utils/cx.js";

export interface SkipLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  /** The id of the element to jump to, with the hash: `#main`. The element should be focusable (`tabIndex={-1}`) so focus lands there. */
  href: `#${string}`;
}

/**
 * A link that is invisible until it receives keyboard focus, and jumps past repeated navigation to the main content.
 * It must be the first focusable element on the page. AppShell renders one for you.
 */
export const SkipLink = forwardRef<HTMLAnchorElement, SkipLinkProps>(function SkipLink({ href, className, children = "Skip to main content", onClick, ...props }, ref) {
  return (
    <a
      ref={ref}
      href={href}
      className={cx("faun-skip-link", className)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        const target = document.getElementById(href.slice(1));
        if (target) {
          // Hash navigation does not always move focus to a non-link element; do it explicitly.
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus();
        }
      }}
      {...props}
    >
      {children}
    </a>
  );
});
