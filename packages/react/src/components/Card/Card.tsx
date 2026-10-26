import { Slot } from "@radix-ui/react-slot";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `default` surface; `interactive` lifts on hover and shows focus (use with `asChild` on a link or button);
   * `selected` marks the chosen card with the brand border; `muted` is a quiet nested surface without shadow.
   */
  variant?: "default" | "interactive" | "selected" | "muted";
  /** Inner padding. `density` (default) follows the density mode; `none` for edge-to-edge content such as tables. */
  padding?: "density" | "sm" | "md" | "lg" | "none";
  /** Render the child (a link or button) as the card, making the whole card one target. */
  asChild?: boolean;
}

/** A surface that groups related content and actions. */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card({ variant = "default", padding = "density", asChild, className, ...props }, ref) {
  const Comp = asChild ? Slot : "div";
  return <Comp ref={ref} className={cx("faun-card", className)} data-variant={variant} data-padding={padding} {...props} />;
});

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  /** Leading icon or avatar. */
  icon?: ReactNode;
  /** Actions on the end side: buttons, menus, a status badge. */
  actions?: ReactNode;
  /** Heading level for the title. Default 3. */
  level?: 2 | 3 | 4;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(function CardHeader({ title, description, icon, actions, level = 3, className, ...props }, ref) {
  const H = `h${level}` as "h3";
  return (
    <div ref={ref} className={cx("faun-card-header", className)} {...props}>
      {icon ? <span className="faun-card-icon" aria-hidden="true">{icon}</span> : null}
      <div className="faun-card-heading">
        <H className="faun-card-title">{title}</H>
        {description ? <p className="faun-card-description">{description}</p> : null}
      </div>
      {actions ? <div className="faun-card-actions">{actions}</div> : null}
    </div>
  );
});

export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardBody({ className, ...props }, ref) {
  return <div ref={ref} className={cx("faun-card-body", className)} {...props} />;
});

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Draw a divider above the footer. */
  divided?: boolean;
}
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(function CardFooter({ divided, className, ...props }, ref) {
  return <div ref={ref} className={cx("faun-card-footer", className)} data-divided={divided ? "" : undefined} {...props} />;
});
