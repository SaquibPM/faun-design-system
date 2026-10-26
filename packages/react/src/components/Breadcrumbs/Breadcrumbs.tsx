import { IconChevronRight, IconMoreHorizontal } from "@faun-ds/icons";
import { forwardRef, type HTMLAttributes, type MouseEventHandler, type ReactNode } from "react";
import { cx } from "../../utils/cx.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../Menu/Menu.js";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  /** Optional leading icon, usually only on the first item (e.g. a workspace). */
  icon?: ReactNode;
}

export interface BreadcrumbLinkProps {
  href: string;
  className: string;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  title?: string;
}

export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** The trail from the root to the current page. The last item is the current page. */
  items: BreadcrumbItem[];
  /** Collapse middle items into a “…” menu when there are more than this many. Default 4. */
  maxItems?: number;
  /** Items kept before the collapsed menu. Default 1. */
  itemsBeforeCollapse?: number;
  /** Items kept after the collapsed menu, including the current page. Default 2. */
  itemsAfterCollapse?: number;
  /** Render links with your router, e.g. `(p) => <NextLink {...p} />`. Defaults to a plain anchor. */
  renderLink?: (props: BreadcrumbLinkProps) => ReactNode;
  /** Name of the navigation landmark. Default “Breadcrumb”. */
  "aria-label"?: string;
}

const defaultLink = (p: BreadcrumbLinkProps) => <a {...p} />;

/** Shows where the current page sits in the hierarchy and links to each level above it. */
export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  { items, maxItems = 4, itemsBeforeCollapse = 1, itemsAfterCollapse = 2, renderLink = defaultLink, className, "aria-label": ariaLabel = "Breadcrumb", ...props },
  ref,
) {
  const collapse = items.length > maxItems && itemsBeforeCollapse + itemsAfterCollapse < items.length;
  const before = collapse ? items.slice(0, itemsBeforeCollapse) : items;
  const hidden = collapse ? items.slice(itemsBeforeCollapse, items.length - itemsAfterCollapse) : [];
  const after = collapse ? items.slice(items.length - itemsAfterCollapse) : [];
  const lastIndex = items.length - 1;

  const crumb = (item: BreadcrumbItem, index: number) => {
    const current = index === lastIndex;
    const inner = (
      <>
        {item.icon ? <span className="faun-breadcrumbs-icon" aria-hidden="true">{item.icon}</span> : null}
        <span className="faun-breadcrumbs-text">{item.label}</span>
      </>
    );
    return (
      <li key={`${index}-${item.label}`} className="faun-breadcrumbs-item">
        {current ? (
          <span className="faun-breadcrumbs-current" aria-current="page" title={item.label}>{inner}</span>
        ) : item.href ? (
          renderLink({ href: item.href, className: "faun-breadcrumbs-link", onClick: item.onClick, title: item.label, children: inner })
        ) : item.onClick ? (
          <button type="button" className="faun-breadcrumbs-link" onClick={item.onClick} title={item.label}>{inner}</button>
        ) : (
          <span className="faun-breadcrumbs-static" title={item.label}>{inner}</span>
        )}
        {current ? null : <span className="faun-breadcrumbs-separator" aria-hidden="true"><IconChevronRight size="sm" /></span>}
      </li>
    );
  };

  return (
    <nav ref={ref} aria-label={ariaLabel} className={cx("faun-breadcrumbs", className)} {...props}>
      <ol className="faun-breadcrumbs-list">
        {before.map((item, i) => crumb(item, i))}
        {collapse ? (
          <li className="faun-breadcrumbs-item">
            <DropdownMenu>
              <DropdownMenuTrigger className="faun-breadcrumbs-more" aria-label={`Show ${hidden.length} more ${hidden.length === 1 ? "level" : "levels"}`}>
                <IconMoreHorizontal size="md" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {hidden.map((item, i) =>
                  item.href ? (
                    <DropdownMenuItem key={i} asChild onClick={item.onClick}>
                      {renderLink({
                        href: item.href,
                        className: "faun-menu-item",
                        children: (
                          <>
                            {item.icon ? <span className="faun-menu-icon" aria-hidden="true">{item.icon}</span> : null}
                            <span className="faun-menu-text"><span className="faun-menu-label">{item.label}</span></span>
                          </>
                        ),
                      })}
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem key={i} icon={item.icon} onClick={item.onClick}>{item.label}</DropdownMenuItem>
                  ),
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="faun-breadcrumbs-separator" aria-hidden="true"><IconChevronRight size="sm" /></span>
          </li>
        ) : null}
        {after.map((item, i) => crumb(item, items.length - itemsAfterCollapse + i))}
      </ol>
    </nav>
  );
});
