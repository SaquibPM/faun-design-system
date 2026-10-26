import { Badge, IconButton, TooltipProvider } from "@faun-ds/react";
import { IconClose, IconMenu, IconSearch } from "@faun-ds/icons";
import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router";
import { navSections } from "../nav";
import { FaunMark } from "./FaunMark";
import { Search } from "./Search";
import { ThemeControls } from "./ThemeControls";

export function Shell() {
  const sections = useMemo(() => navSections(), []);
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => { setNavOpen(false); window.scrollTo({ top: 0 }); }, [loc.pathname]);
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearchOpen(true); }
      if (e.key === "/" && !(e.target as HTMLElement)?.closest("input, textarea, [contenteditable]")) { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);

  return (
    <TooltipProvider>
      <a className="docs-skip" href="#main">Skip to content</a>
      <header className="docs-top">
        <div className="docs-top-in">
          <IconButton className="docs-nav-toggle" icon={navOpen ? <IconClose /> : <IconMenu />} label={navOpen ? "Close navigation" : "Open navigation"} onClick={() => setNavOpen((o) => !o)} tooltip={false} />
          <NavLink to="/" className="docs-logo" aria-label="Faun Design System home">
            <FaunMark />
            <span className="docs-logo-word">Faun</span>
            <Badge size="sm" variant="outline" tone="neutral">v0.1</Badge>
          </NavLink>
          <nav className="docs-top-links" aria-label="Sections">
            <NavLink to="/foundations">Foundations</NavLink>
            <NavLink to="/components">Components</NavLink>
            <NavLink to="/patterns">Patterns</NavLink>
            <NavLink to="/guides/getting-started">Guides</NavLink>
          </nav>
          <button type="button" className="docs-search-trigger" onClick={() => setSearchOpen(true)}>
            <IconSearch size="sm" />
            <span>Search</span>
            <kbd>⌘K</kbd>
          </button>
          <ThemeControls />
        </div>
      </header>
      <div className="docs-body">
        <aside className="docs-side" data-open={navOpen || undefined} aria-label="Documentation">
          <div className="docs-side-find">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Find in documentation, press Control K or Command K"><IconSearch size="sm" /><span>Find</span></button>
          </div>
          <nav>
            {sections.map((s) => (
              <div className="docs-side-section" key={s.title}>
                <p className="docs-side-title">{s.title}</p>
                <ul>
                  {s.items.map((i) => (
                    <li key={i.to}>
                      <NavLink to={i.to} end className="docs-side-link">
                        <span>{i.label}</span>
                        {i.badge ? <Badge size="sm" tone="accent">{i.badge}</Badge> : null}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
        {navOpen ? <div className="docs-side-scrim" onClick={() => setNavOpen(false)} /> : null}
        <main id="main" className="docs-main" tabIndex={-1}>
          <Outlet />
          <footer className="docs-footer">
            <span>Faun Design System · Apache-2.0</span>
            <span className="docs-footer-links"><a href="https://github.com/SaquibPM/faun-design-system" rel="noreferrer">GitHub</a><a href="#/guides/contributing">Contribute</a><a href="#/foundations/accessibility">Accessibility</a></span>
          </footer>
        </main>
      </div>
      <Search open={searchOpen} onOpenChange={setSearchOpen} />
    </TooltipProvider>
  );
}
