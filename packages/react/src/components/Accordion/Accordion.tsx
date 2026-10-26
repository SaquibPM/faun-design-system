import * as RA from "@radix-ui/react-accordion";
import * as RCo from "@radix-ui/react-collapsible";
import { IconChevronDown } from "@faun-ds/icons";
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";

export type AccordionProps = ComponentPropsWithoutRef<typeof RA.Root> & {
  /** divided (default): hairlines between items. separated: each item is its own bordered card. */
  variant?: "divided" | "separated";
};

/**
 * A stack of sections that expand and collapse. `type="single"` opens one at a time (add `collapsible` to allow closing it);
 * `type="multiple"` lets several stay open.
 */
export const Accordion = forwardRef<ElementRef<typeof RA.Root>, AccordionProps>(function Accordion({ variant = "divided", className, ...props }, ref) {
  return <RA.Root ref={ref} className={cx("faun-accordion", className)} data-variant={variant} {...(props as ComponentPropsWithoutRef<typeof RA.Root>)} />;
});

export const AccordionItem = forwardRef<ElementRef<typeof RA.Item>, ComponentPropsWithoutRef<typeof RA.Item>>(function AccordionItem({ className, ...props }, ref) {
  return <RA.Item ref={ref} className={cx("faun-accordion-item", className)} {...props} />;
});

export interface AccordionTriggerProps extends ComponentPropsWithoutRef<typeof RA.Trigger> {
  /** Leading icon. */
  icon?: ReactNode;
  /** One line under the title, visible while collapsed. */
  description?: ReactNode;
  /** Content aligned to the end, before the chevron: a badge or count. */
  meta?: ReactNode;
}

export const AccordionTrigger = forwardRef<ElementRef<typeof RA.Trigger>, AccordionTriggerProps>(function AccordionTrigger(
  { className, icon, description, meta, children, ...props },
  ref,
) {
  return (
    <RA.Header className="faun-accordion-header">
      <RA.Trigger ref={ref} className={cx("faun-accordion-trigger", className)} {...props}>
        {icon ? <span className="faun-accordion-icon" aria-hidden="true">{icon}</span> : null}
        <span className="faun-accordion-text">
          <span className="faun-accordion-title">{children}</span>
          {description ? <span className="faun-accordion-description">{description}</span> : null}
        </span>
        {meta ? <span className="faun-accordion-meta">{meta}</span> : null}
        <IconChevronDown className="faun-accordion-chevron" size="md" aria-hidden="true" />
      </RA.Trigger>
    </RA.Header>
  );
});

export const AccordionContent = forwardRef<ElementRef<typeof RA.Content>, ComponentPropsWithoutRef<typeof RA.Content>>(function AccordionContent({ className, children, ...props }, ref) {
  return (
    <RA.Content ref={ref} className={cx("faun-accordion-content", className)} {...props}>
      <div className="faun-accordion-body">{children}</div>
    </RA.Content>
  );
});

/* ------------------------------------------------------------------ Collapsible */

/** A single show/hide region. Use Accordion for groups of sections. */
export const Collapsible = RCo.Root;
export const CollapsibleTrigger = RCo.Trigger;
export const CollapsibleContent = forwardRef<ElementRef<typeof RCo.Content>, ComponentPropsWithoutRef<typeof RCo.Content>>(function CollapsibleContent({ className, ...props }, ref) {
  return <RCo.Content ref={ref} className={cx("faun-collapsible-content", className)} {...props} />;
});
