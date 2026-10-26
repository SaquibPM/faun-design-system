import { IconChevronDown, IconMenu } from "@faun-ds/icons";
import { forwardRef, useEffect, useState, type HTMLAttributes } from "react";
import { cx } from "../../utils/cx.js";
import { Button } from "../Button/Button.js";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../Menu/Menu.js";

export interface HeaderNavLinkData {
  label: string;
  href: string;
  /** Marks the page the person is on (`aria-current="page"`). */
  current?: boolean;
  /** Secondary line in a sub-menu. */
  description?: string;
}

export interface HeaderNavItemData {
  label: string;
  /** A destination. Leave out for an item that only opens a sub-menu. */
  href?: string;
  current?: boolean;
  /** Sub-menu links. An item with children opens a menu instead of navigating. */
  children?: HeaderNavLinkData[];
}

export interface HeaderNavProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  items: HeaderNavItemData[];
  /** Accessible name of the navigation landmark. Default "Primary". */
  label?: string;
  /** Below this width the links collapse into one "Menu" button. Default 768. */
  collapseBelow?: number;
}

function useNarrow(px: number) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(`(max-width: ${px - 0.02}px)`);
    const update = () => setNarrow(mql.matches);
    update();
    mql.addEventListener?.("change", update);
    return () => mql.removeEventListener?.("change", update);
  }, [px]);
  return narrow;
}

const hasCurrent = (i: HeaderNavItemData) => !!i.current || !!i.children?.some((c) => c.current);

function MenuLink({ link }: { link: HeaderNavLinkData }) {
  return (
    <DropdownMenuItem asChild>
      <a href={link.href} aria-current={link.current ? "page" : undefined}>
        <span className="faun-menu-text">
          <span className="faun-menu-label">{link.label}</span>
          {link.description ? <span className="faun-menu-description">{link.description}</span> : null}
        </span>
      </a>
    </DropdownMenuItem>
  );
}

/**
 * Links in the top bar, some of which open sub-menus. The current page is marked with `aria-current` and an underline;
 * a sub-menu button whose child is current is underlined too. On narrow screens the links fold into one Menu button.
 */
export const HeaderNav = forwardRef<HTMLElement, HeaderNavProps>(function HeaderNav({ items, label = "Primary", collapseBelow = 768, className, ...props }, ref) {
  const narrow = useNarrow(collapseBelow);
  if (narrow) {
    return (
      <nav ref={ref} aria-label={label} className={cx("faun-header-nav", className)} data-narrow="" {...props}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" leadingIcon={<IconMenu />}>Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {items.map((item, idx) =>
              item.children?.length ? (
                <DropdownMenuGroup key={item.label}>
                  {idx > 0 ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
                  {item.children.map((c) => <MenuLink key={c.href} link={c} />)}
                </DropdownMenuGroup>
              ) : item.href ? <MenuLink key={item.label} link={{ label: item.label, href: item.href, current: item.current }} /> : null,
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
    );
  }
  return (
    <nav ref={ref} aria-label={label} className={cx("faun-header-nav", className)} {...props}>
      <ul className="faun-header-nav-list">
        {items.map((item) => (
          <li key={item.label} className="faun-header-nav-li">
            {item.children?.length ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="faun-header-nav-link" data-current={hasCurrent(item) ? "" : undefined}>
                    {item.label}
                    <IconChevronDown size="sm" aria-hidden="true" className="faun-header-nav-chevron" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {item.children.map((c) => <MenuLink key={c.href} link={c} />)}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <a href={item.href} className="faun-header-nav-link" aria-current={item.current ? "page" : undefined} data-current={item.current ? "" : undefined}>{item.label}</a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
});
