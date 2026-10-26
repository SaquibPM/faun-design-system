import { IconAttach, IconBell, IconChat, IconClose, IconDatabase, IconDisclosure, IconEmissionFactor, IconFileText, IconHome, IconLeaf, IconLedger, IconLogout, IconMateriality, IconMenu, IconSettings, IconStatusAttention, IconTarget, IconUsers, IconWorkflow } from "@faun-ds/icons";
import { AIPromptSuggestions, PromptComposer } from "@faun-ds/ai";
import {
  AppShell, Avatar, Button, Card, CardBody, CardHeader, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  EmptyState, IconButton, Tag, Kbd, SearchField, SideNav, SideNavItem, SideNavSection, SideNavUser, SideNavWorkspace, Skeleton, StatusBadge, Tabs, TabsContent, TabsList, TabsTrigger, TopBar, useAppShell,
} from "@faun-ds/react";
import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { H2, Segmented } from "../foundations/shared";
import { CodeBlock } from "../../components/CodeBlock";
import { Keys } from "../../components/mdx";
import "./patterns-chat.css";

/* ------------------------------------------------------------------ data */

const USER = "Priya Raman";
const FIRST_NAME = "Priya";
const PLACEHOLDER = "Ask about your emissions, a filing or a supplier";
const SUGGESTIONS = [
  "Summarise Scope 2 emissions by site for FY2026",
  "What is missing from the CSRD E1 draft?",
  "Which suppliers have no emission factor?",
  "Compare Scope 3 category 1 with last year",
];

type RunState = "running" | "awaiting_approval" | "completed" | "failed";
type RecentItem = { id: string; kind: "conversation" | "run"; title: string; meta: string; state: RunState };
const RECENT: RecentItem[] = [
  { id: "r1", kind: "run", title: "CSRD E1 disclosure draft", meta: "CSRD Filing Agent · started 12 min ago", state: "running" },
  { id: "r2", kind: "conversation", title: "Why did Scope 2 rise in the Chennai plant?", meta: "Emissions Analyst · 2 h ago", state: "completed" },
  { id: "r3", kind: "run", title: "Scope 3 category 1 calculation", meta: "Value Chain Agent · yesterday", state: "awaiting_approval" },
  { id: "r4", kind: "run", title: "Energy bill extraction, Pune", meta: "Document Agent · yesterday", state: "failed" },
  { id: "r5", kind: "conversation", title: "Draft the water policy statement", meta: "Disclosure Agent · 20 Oct", state: "completed" },
];
const WAITING = [
  { id: "w1", title: "Approve the E1-6 Scope 3 draft", meta: "CSRD Filing Agent · due 24 Oct" },
  { id: "w2", title: "Confirm 14 estimated emission factors", meta: "Value Chain Agent · due 28 Oct" },
];

const stay = (e: MouseEvent) => e.preventDefault();

export function greetingFor(date: Date) {
  const h = date.getHours();
  return h < 5 ? "Good evening" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/* ------------------------------------------------------------ navigation */

type Dest = "home" | "ask" | "approvals" | "filings" | "datapoints" | "ledger" | "materiality" | "targets" | "agents" | "factors" | `recent-${string}`;

function NavItem({ id, icon, current, onGo, ...rest }: { id: Dest; icon: ReactNode; current: Dest; onGo?: (d: Dest) => void; count?: number; attention?: number | boolean; children: string }) {
  return (
    <SideNavItem href="#" icon={icon} current={current === id} onClick={(e) => { e.preventDefault(); onGo?.(id); }} {...rest} />
  );
}

/** The navigation panel. Expanded or collapsed follows the AppShell, or the `collapsed` prop outside one. */
export function HomeNav({ current = "home", collapsed, fresh, onGo, interactive = true, recents = true }: { current?: Dest; collapsed?: boolean; fresh?: boolean; onGo?: (d: Dest) => void; interactive?: boolean; recents?: boolean }) {
  const shell = useAppShell();
  const isRail = collapsed ?? shell?.collapsed ?? false;
  const counts = !fresh;
  const workspace = <SideNavWorkspace mark={<IconLeaf />} name="Acme ESG" context="Acme Industrial · FY2026" onSwitch={() => {}} />;
  const user = <SideNavUser name={USER} meta="Sustainability lead" onOpenMenu={() => {}} />;
  return (
    <SideNav
      collapsed={collapsed}
      workspace={interactive ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{workspace}</DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuItem icon={<IconLeaf />}>Acme Industrial · FY2026</DropdownMenuItem>
            <DropdownMenuItem icon={<IconLeaf />}>Acme Industrial · FY2025</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<IconUsers />}>Manage workspaces</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : workspace}
      footer={interactive ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>{user}</DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end">
            <DropdownMenuLabel>{USER}</DropdownMenuLabel>
            <DropdownMenuItem icon={<IconSettings />}>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem icon={<IconLogout />}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : user}
    >
      <SideNavSection>
        <NavItem id="home" icon={<IconHome />} current={current} onGo={onGo}>Home</NavItem>
        <NavItem id="ask" icon={<IconChat />} current={current} onGo={onGo}>Assistant</NavItem>
        <NavItem id="approvals" icon={<IconStatusAttention />} current={current} onGo={onGo} attention={counts ? 2 : undefined}>Approvals</NavItem>
      </SideNavSection>
      <SideNavSection title="Reporting">
        <NavItem id="filings" icon={<IconFileText />} current={current} onGo={onGo} count={counts ? 5 : undefined}>Filings</NavItem>
        <NavItem id="datapoints" icon={<IconDatabase />} current={current} onGo={onGo}>Datapoints</NavItem>
        <NavItem id="ledger" icon={<IconLedger />} current={current} onGo={onGo}>Emissions ledger</NavItem>
        <NavItem id="materiality" icon={<IconMateriality />} current={current} onGo={onGo}>Materiality</NavItem>
        <NavItem id="targets" icon={<IconTarget />} current={current} onGo={onGo}>Targets</NavItem>
      </SideNavSection>
      <SideNavSection title="Automation">
        <NavItem id="agents" icon={<IconWorkflow />} current={current} onGo={onGo} count={counts ? 5 : undefined}>Agents</NavItem>
        <NavItem id="factors" icon={<IconEmissionFactor />} current={current} onGo={onGo}>Factor library</NavItem>
      </SideNavSection>
      {recents && !fresh && !isRail ? (
        <SideNavSection title="Recent">
          {RECENT.slice(0, 4).map((r) => <NavItem key={r.id} id={`recent-${r.id}`} icon={r.kind === "run" ? <IconWorkflow /> : <IconChat />} current={current} onGo={onGo}>{r.title}</NavItem>)}
        </SideNavSection>
      ) : null}
    </SideNav>
  );
}

/* --------------------------------------------------------------- composer */

export type ComposerMode = "placeholder" | "text" | "attachments" | "suggestions" | "running" | "disabled";

function Attach() {
  return <IconButton icon={<IconAttach />} label="Attach a file" variant="ghost" />;
}

/** Static composer variants for the States section. */
export function ComposerSpecimen({ mode }: { mode: ComposerMode }) {
  const [text, setText] = useState(mode === "text" ? "Which suppliers have no emission factor for FY2026?" : "");
  const running = mode === "running";
  const chips = mode === "attachments" ? (
    <>
      <Tag onRemove={() => {}} removeLabel="Remove INV-20931.pdf">INV-20931.pdf</Tag>
      <Tag onRemove={() => {}} removeLabel="Remove pune-energy-2026.xlsx">pune-energy-2026.xlsx</Tag>
    </>
  ) : undefined;
  return (
    <div className="pt-composer-spec">
      <PromptComposer
        label="Ask the assistant"
        placeholder={mode === "disabled" ? "This filing is locked for audit" : PLACEHOLDER}
        value={mode === "attachments" ? "Check these bills against the March electricity total." : text}
        onValueChange={setText}
        running={running}
        disabled={running || mode === "disabled"}
        attachments={chips}
        allowEmpty={mode === "attachments"}
        actions={<Attach />}
        onStop={() => {}}
        hint={running ? "The Emissions Analyst is answering. Stop it to edit your question." : mode === "disabled" ? "Locked filings cannot be changed. Ask in a new conversation." : undefined}
      />
      {mode === "suggestions" ? <AIPromptSuggestions suggestions={SUGGESTIONS.slice(0, 3)} onSelect={setText} /> : null}
    </div>
  );
}

/* ----------------------------------------------------------------- canvas */

function RecentRow({ item }: { item: RecentItem }) {
  return (
    <li className="pt-home-row">
      <span className="pt-home-row-icon" aria-hidden="true">{item.kind === "run" ? <IconWorkflow /> : <IconChat />}</span>
      <a className="pt-home-row-main" href="#" onClick={stay}>
        <span className="pt-home-row-title">{item.title}</span>
        <span className="pt-home-row-meta">{item.meta}</span>
      </a>
      <StatusBadge domain="run" state={item.state} size="sm" />
    </li>
  );
}

function RecentSkeleton() {
  return (
    <div role="status" aria-label="Loading recent activity" className="pt-home-skel">
      {[0, 1, 2, 3].map((i) => (
        <div className="pt-home-skel-row" key={i}>
          <Skeleton shape="circle" width="var(--faun-size-control-sm)" />
          <div className="pt-home-skel-text"><Skeleton width={i % 2 ? "55%" : "70%"} /><Skeleton width="40%" /></div>
          <Skeleton shape="rect" width="var(--faun-space-20)" height="var(--faun-space-5)" />
        </div>
      ))}
    </div>
  );
}

function Hints() {
  const hints = [
    { icon: <IconDatabase />, title: "Connect your data", text: "Link the ledger or upload utility bills so answers rest on your numbers." },
    { icon: <IconDisclosure />, title: "Choose a framework", text: "Start a CSRD, CDP or GRI filing and the assistant tracks what is missing." },
    { icon: <IconUsers />, title: "Invite a colleague", text: "Approvals need a second person before anything is filed." },
  ];
  return (
    <ol className="pt-home-hints" aria-label="Get started">
      {hints.map((h, i) => (
        <li key={h.title}>
          <Card variant="default">
            <CardBody className="pt-home-hint">
              <span className="pt-home-hint-icon" aria-hidden="true">{h.icon}</span>
              <h3 className="pt-home-hint-title">{i + 1}. {h.title}</h3>
              <p>{h.text}</p>
            </CardBody>
          </Card>
        </li>
      ))}
    </ol>
  );
}

export type CanvasVariant = "default" | "first-run" | "loading";

/** The home canvas: greeting, composer, suggestions, approvals strip and recents. Owns the composer state. */
export function HomeCanvas({ variant = "default", headingLevel = 1, now }: { variant?: CanvasVariant; headingLevel?: 1 | 2; now?: Date }) {
  const [value, setValue] = useState("");
  const [running, setRunning] = useState(false);
  const [recent, setRecent] = useState<RecentItem[]>(variant === "default" ? RECENT : []);
  const timer = useRef<number>(0);
  const formRef = useRef<HTMLFormElement>(null);
  const runId = useRef<string | null>(null);
  const H = `h${headingLevel}` as "h1";
  const uid = useId();
  const greeting = greetingFor(now ?? new Date());
  const first = variant === "first-run";
  const loading = variant === "loading";
  const waiting = variant === "default" ? WAITING : [];

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => { setRecent(variant === "default" ? RECENT : []); }, [variant]);

  const settle = (state: RunState) => {
    window.clearTimeout(timer.current);
    const id = runId.current;
    setRunning(false);
    if (id) setRecent((r) => r.map((x) => (x.id === id ? { ...x, state, meta: state === "completed" ? "Emissions Analyst · just now" : "Stopped by you · just now" } : x)));
  };
  const send = (text: string) => {
    const id = `new-${Date.now()}`;
    runId.current = id;
    setRecent((r) => [{ id, kind: "conversation", title: text, meta: "Emissions Analyst · answering", state: "running" }, ...r]);
    setValue("");
    setRunning(true);
    timer.current = window.setTimeout(() => settle("completed"), 5000);
  };
  const pick = (s: string) => {
    setValue(s);
    formRef.current?.querySelector("textarea")?.focus();
  };

  const conversations = recent.filter((r) => r.kind === "conversation");
  const runs = recent.filter((r) => r.kind === "run");
  const list = (items: RecentItem[]) => (items.length ? <ul className="pt-home-list">{items.map((i) => <RecentRow key={i.id} item={i} />)}</ul> : <p className="pt-note pt-home-none">Nothing here yet.</p>);

  return (
    <div className="pt-home">
      <div className="pt-home-hero">
        <H className="pt-home-greeting">{greeting}, {FIRST_NAME}</H>
        <p className="pt-home-sub">{first ? "Acme Industrial · FY2026. Start with a question, or set up your data below." : loading ? "Acme Industrial · FY2026" : "Acme Industrial · FY2026. Two approvals are waiting on you."}</p>
      </div>

      <div className="pt-home-compose">
        <p className="pt-home-label">Ask the assistant</p>
        <PromptComposer
          ref={formRef}
          label="Ask the assistant"
          placeholder={PLACEHOLDER}
          value={value}
          onValueChange={setValue}
          onSend={send}
          onStop={() => settle("failed")}
          running={running}
          disabled={running}
          actions={<Attach />}
          hint={running ? "The Emissions Analyst is answering. Stop it to edit your question." : "The assistant reads your filings and ledger. It asks before it changes anything."}
        />
        {(
          <ul className="pt-home-chips" aria-label="Suggested prompts">
            {SUGGESTIONS.slice(0, first ? 3 : 4).map((s) => (
              <li key={s}><Button size="sm" variant="outline" disabled={running} onClick={() => pick(s)}>{s}</Button></li>
            ))}
          </ul>
        )}
      </div>

      {first ? <Hints /> : null}

      {!first ? (
        <section className="pt-home-block" aria-labelledby={`pt-home-wait-${uid}`}>
          <Card>
            <CardHeader level={2} title={<span id={`pt-home-wait-${uid}`}>Waiting on you</span>} description={loading ? undefined : `${waiting.length} approvals`} />
            <CardBody>
              {loading ? (
                <div role="status" aria-label="Loading approvals" className="pt-home-skel">
                  {[0, 1].map((i) => <div className="pt-home-skel-row" key={i}><Skeleton shape="circle" width="var(--faun-size-control-sm)" /><div className="pt-home-skel-text"><Skeleton width="60%" /><Skeleton width="35%" /></div><Skeleton shape="rect" width="var(--faun-space-16)" height="var(--faun-size-control-sm)" /></div>)}
                </div>
              ) : (
                <ul className="pt-home-list">
                  {waiting.map((w) => (
                    <li className="pt-home-row" key={w.id}>
                      <span className="pt-home-row-icon" data-tone="attention" aria-hidden="true"><IconStatusAttention /></span>
                      <div className="pt-home-row-main"><span className="pt-home-row-title">{w.title}</span><span className="pt-home-row-meta">{w.meta}</span></div>
                      <Button size="sm" variant="outline">Review</Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </section>
      ) : null}

      <section className="pt-home-block" aria-labelledby={`pt-home-recent-${uid}`}>
        <h2 className="pt-home-h2"><span id={`pt-home-recent-${uid}`}>Recent</span></h2>
        {loading ? <RecentSkeleton /> : first ? (
          <Card variant="default" padding="none">
            <EmptyState kind="first-use" size="sm" level={3} title="Nothing here yet" description="Your conversations and agent runs appear here, newest first, so you can pick up where you left off." />
          </Card>
        ) : (
          <Tabs defaultValue="all">
            <TabsList aria-label="Recent activity">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="conversations">Conversations</TabsTrigger>
              <TabsTrigger value="runs">Runs</TabsTrigger>
            </TabsList>
            <TabsContent value="all">{list(recent)}</TabsContent>
            <TabsContent value="conversations">{list(conversations)}</TabsContent>
            <TabsContent value="runs">{list(runs)}</TabsContent>
          </Tabs>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------ live screen */

const STORE = "faun-docs-home-panel";
function readStored(): boolean {
  try { return window.localStorage.getItem(STORE) === "collapsed"; } catch { return false; }
}
function writeStored(collapsed: boolean) {
  try { window.localStorage.setItem(STORE, collapsed ? "collapsed" : "expanded"); } catch { /* storage unavailable: the panel still works */ }
}

/** Binds Cmd or Ctrl+B to the shell: collapses the rail on desktop, opens the sheet on narrow screens. */
function PanelShortcut() {
  const shell = useAppShell();
  const ref = useRef(shell);
  ref.current = shell;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.shiftKey || e.key.toLowerCase() !== "b") return;
      const s = ref.current;
      if (!s) return;
      e.preventDefault();
      if (s.mobile) s.setMobileOpen(!s.mobileOpen);
      else s.setCollapsed(!s.collapsed);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}

/** The interactive template: AppShell with the panel, the topbar and the home canvas. */
export function HomeScreen({ collapsed, onCollapsedChange, variant = "default" }: { collapsed: boolean; onCollapsedChange: (c: boolean) => void; variant?: CanvasVariant }) {
  const [current, setCurrent] = useState<Dest>("home");
  return (
    <div className="pt-frame">
      <AppShell
        fill="container"
        navCollapsed={collapsed}
        onNavCollapsedChange={onCollapsedChange}
        nav={<HomeNav current={current} fresh={variant === "first-run"} onGo={setCurrent} />}
        topBar={
          <TopBar
            start={<span className="pt-home-crumb">Home</span>}
            search={<SearchField aria-label="Search" placeholder="Search filings, suppliers, factors" shortcut="⌘K" size="sm" />}
            actions={<IconButton icon={<IconBell />} label={variant === "first-run" ? "Notifications" : "Notifications, 3 unread"} />}
          />
        }
      >
        <PanelShortcut />
        <HomeCanvas variant={variant} />
      </AppShell>
    </div>
  );
}

/* -------------------------------------------------------------- specimens */

function PanelSpecimen({ collapsed }: { collapsed: boolean }) {
  const notes = collapsed
    ? ["The mark stands for the workspace switcher; its name moves to a tooltip.", "A hairline replaces each section heading. Recent conversations are not shown: they need their words.", "Items keep their icon. A tooltip with the label and count shows on hover and keyboard focus.", "Items awaiting you show a dot; plain counts move into the tooltip.", "The current page keeps its fill and edge marker.", "The avatar opens the user menu."]
    : ["Workspace switcher with the tenant and period.", "Sections with a heading each.", "Labels, counts and an attention badge for items awaiting you.", "Recent conversations and runs under their own heading, newest first.", "The current page has a fill and an edge marker.", "The user menu sits at the foot."];
  return (
    <figure className="pt-spec" aria-label={collapsed ? "Collapsed panel" : "Expanded panel"}>
      <div className="pt-spec-nav" data-collapsed={collapsed || undefined}>
        <HomeNav collapsed={collapsed} interactive={false} />
      </div>
      <figcaption>
        <h3 className="pt-spec-title">{collapsed ? "Collapsed: icon rail" : "Expanded"}</h3>
        <ol className="pt-spec-notes">{notes.map((n) => <li key={n}>{n}</li>)}</ol>
      </figcaption>
    </figure>
  );
}

function Phone({ initialOpen = false }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  const toggle = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (open) nav.current?.querySelector<HTMLElement>("a[href], button")?.focus();
    else toggle.current?.focus();
  }, [open]);
  return (
    <figure className="pt-phone-wrap">
      <div className="pt-phone" data-open={open || undefined} onKeyDown={(e) => { if (open && e.key === "Escape") setOpen(false); }}>
        <div className="pt-phone-bar">
          <IconButton ref={toggle} icon={open ? <IconClose /> : <IconMenu />} label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen(!open)} />
          <span className="pt-home-crumb">Home</span>
          <IconButton icon={<IconBell />} label="Notifications, 3 unread" />
        </div>
        <div className="pt-phone-body" inert={open || undefined}>
          <HomeCanvas headingLevel={2} />
        </div>
        {open ? (
          <>
            <div className="pt-phone-scrim" aria-hidden="true" onClick={() => setOpen(false)} />
            <div className="pt-phone-nav" ref={nav} onClick={(e) => { if ((e.target as HTMLElement).closest("a[href]")) setOpen(false); }}><HomeNav collapsed={false} interactive={false} /></div>
          </>
        ) : null}
      </div>
      <figcaption className="pt-note">{initialOpen ? "Panel open: a sheet over a scrim. The page behind is inert. Escape, the scrim or choosing a destination closes it." : "Panel closed: the menu button replaces the panel. Press it to open the sheet."}</figcaption>
    </figure>
  );
}

const CODE = `import { AppShell, SideNav, SideNavItem, SideNavSection, TopBar } from "@faun-ds/react";
import { PromptComposer, AIPromptSuggestions } from "@faun-ds/ai";

// 1. Remember the person's choice, and restore it before first paint.
const [collapsed, setCollapsed] = useState(() => localStorage.getItem("nav") === "collapsed");

<AppShell
  navCollapsed={collapsed}
  onNavCollapsedChange={(c) => { setCollapsed(c); localStorage.setItem("nav", c ? "collapsed" : "expanded"); }}
  nav={<SideNav workspace={<SideNavWorkspace … />} footer={<SideNavUser … />}>…</SideNav>}
  topBar={<TopBar start="Home" />}          // renders the collapse button and the narrow-screen menu button
>
  <h1>Good morning, Priya</h1>
  <PromptComposer label="Ask the assistant" placeholder="Ask about your emissions, a filing or a supplier" />
  <AIPromptSuggestions suggestions={suggestions} onSelect={setText} />
</AppShell>`;

/* -------------------------------------------------------------------- page */

export function HomeAssistantPattern() {
  const [collapsed, setCollapsedState] = useState(readStored);
  const [variant, setVariant] = useState<CanvasVariant>("default");
  const setCollapsed = (c: boolean) => { setCollapsedState(c); writeStored(c); };
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="The first screen after sign-in: a greeting, one large place to ask, what is waiting on the person, and where they left off. The navigation panel collapses to an icon rail. Try it with the button in the top bar or the keyboard.">Example</H2>
        <div className="pt-home-toolbar">
          <Segmented label="Navigation panel" value={collapsed ? "collapsed" : "expanded"} onChange={(v) => setCollapsed(v === "collapsed")} options={[["expanded", "Panel expanded"], ["collapsed", "Panel collapsed"]]} />
          <Segmented label="Page state" value={variant} onChange={setVariant} options={[["default", "With activity"], ["first-run", "First run"], ["loading", "Loading"]]} />
          <p className="pt-note pt-home-keys">Collapse or expand with <Kbd keys={["Ctrl", "B"]} size="sm" /> or <Kbd keys={["⌘", "B"]} size="sm" />. Below 768 px wide the same keys open the sheet.</p>
        </div>
        <HomeScreen collapsed={collapsed} onCollapsedChange={setCollapsed} variant={variant} />
      </section>

      <section className="fd-section">
        <H2 id="panel" lede="Both states of the navigation panel, as they are used. The interactive example above switches between them.">Navigation panel states</H2>
        <div className="pt-spec-grid">
          <PanelSpecimen collapsed={false} />
          <PanelSpecimen collapsed />
        </div>
      </section>

      <section className="fd-section">
        <H2 id="states" lede="The page has three states and the composer has six. Each tells the person what to do next.">States</H2>
        <div className="pt-states">
          <div className="pt-state">
            <h3 className="pt-state-title">First run</h3>
            <p className="pt-note">No recents and nothing waiting. The page says what to set up instead of showing empty lists.</p>
            <div className="pt-state-frame"><HomeCanvas variant="first-run" headingLevel={2} /></div>
          </div>
          <div className="pt-state">
            <h3 className="pt-state-title">Loading</h3>
            <p className="pt-note">Skeletons shaped like the rows. The greeting and the composer are ready at once, so the person can start typing.</p>
            <div className="pt-state-frame"><HomeCanvas variant="loading" headingLevel={2} /></div>
          </div>
        </div>
        <h3 className="pt-state-title pt-gap">Composer</h3>
        <div className="pt-composers">
          <div><p className="pt-home-label">Empty, with placeholder</p><ComposerSpecimen mode="placeholder" /></div>
          <div><p className="pt-home-label">With text</p><ComposerSpecimen mode="text" /></div>
          <div><p className="pt-home-label">With attachment chips</p><ComposerSpecimen mode="attachments" /></div>
          <div><p className="pt-home-label">With suggested prompts</p><ComposerSpecimen mode="suggestions" /></div>
          <div><p className="pt-home-label">Agent answering: disabled, with Stop</p><ComposerSpecimen mode="running" /></div>
          <div><p className="pt-home-label">Disabled</p><ComposerSpecimen mode="disabled" /></div>
        </div>
      </section>

      <section className="fd-section">
        <H2 id="narrow" lede="Under 768 px wide the panel leaves the layout. A menu button in the top bar opens it as a sheet. Both are drawn at phone width and work: press the menu button, press Escape, or tap the scrim. Resize the live example or open this page on a phone to use the real shell.">Narrow layout</H2>
        <div className="pt-phones">
          <Phone />
          <Phone initialOpen />
        </div>
      </section>

      <section className="fd-section">
        <H2 id="code" lede="The template is a composition of existing components. The shell owns collapsing, the sheet and focus; you own remembering the choice.">Code</H2>
        <CodeBlock code={CODE} />
        <ul className="fd-rules">
          <li>Components: <Link className="fd-link" to="/components/app-shell">App shell</Link>, <Link className="fd-link" to="/components/prompt-composer">Prompt composer</Link>, <Link className="fd-link" to="/components/ai-chat">AI chat</Link> (suggested prompts), <Link className="fd-link" to="/components/tag">Tag</Link> (attachment chips).</li>
          <li>When the person sends, move to the conversation. The next step is the <Link className="fd-link" to="/patterns/chat-with-panels">Chat with panels</Link> pattern.</li>
        </ul>
      </section>

      <section className="fd-section">
        <H2 id="a11y" lede="Keyboard and screen reader behaviour of the whole screen.">Accessibility</H2>
        <Keys rows={[["Ctrl + B", "Collapses or expands the navigation panel. Cmd + B on macOS. Below 768 px it opens the sheet."], ["Tab", "Skip link first, then the panel, the top bar and the page. A collapsed item shows its tooltip on focus."], ["Enter", "In the composer: sends. Shift + Enter adds a line."], ["Escape", "Closes the navigation sheet on a narrow screen and returns focus to the menu button."]]} />
        <ul className="fd-rules">
          <li>The panel is a navigation landmark named “Main”. The toggle is a button whose label changes between “Collapse navigation” and “Expand navigation”, with <code>aria-expanded</code>.</li>
          <li>In the rail every item keeps its accessible name; the tooltip repeats it and adds the count.</li>
          <li>The greeting is the only level 1 heading. Suggested prompts are a labelled group of buttons.</li>
          <li>Open as a sheet, the page behind is inert and focus starts on the first destination.</li>
          <li>Placeholder text meets contrast in every theme, but is never the label.</li>
        </ul>
      </section>

      <section className="fd-section">
        <H2 id="anatomy" lede="Compose these parts. Do not rebuild them.">What each part does</H2>
        <ul className="fd-rules">
          <li><b>App shell and side navigation</b> hold the panel, the top bar and the page. The shell owns collapsing, the sheet on narrow screens and focus.</li>
          <li><b>Greeting</b> uses the display type, the person's first name and the time of day. It is the page title, so it is the one heading level 1.</li>
          <li><b>Prompt composer</b> is the main action. It is larger than anything else on the page and sits above the fold.</li>
          <li><b>Suggested prompts</b> are buttons that fill the composer. They do not send.</li>
          <li><b>Waiting on you</b> lists approvals, each with who asked, when it is due and one Review button.</li>
          <li><b>Recent</b> lists conversations and runs with a status badge: icon, label and tone.</li>
        </ul>
      </section>

      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <h3 className="pt-rules-h">When the panel collapses</h3>
        <ul className="fd-rules">
          <li>On wide screens the person chooses. Collapse with the top bar button or Cmd or Ctrl+B. Never collapse on hover or on a timer.</li>
          <li>Collapse automatically only when the page needs the width, such as a workspace with a side-by-side editor. Say so in the page, and let the person expand it again.</li>
          <li>Below 768 px wide the panel is closed and opens as a sheet from the menu button. It closes after a destination is chosen.</li>
          <li>The rail keeps every destination, the current marker and attention. Counts become a dot for items awaiting the person, and move into the tooltip for the rest.</li>
        </ul>
        <h3 className="pt-rules-h">Remembering state</h3>
        <ul className="fd-rules">
          <li>Remember the choice per person, not per page. Store it with their preferences, or in local storage if there is no account setting. The page must work when storage is unavailable.</li>
          <li>Restore the state before first paint so the panel does not jump.</li>
          <li>Do not remember the narrow sheet. It always starts closed.</li>
        </ul>
        <h3 className="pt-rules-h">Focus management</h3>
        <ul className="fd-rules">
          <li>Collapsing leaves focus where it is. If the toggle is the focused control it stays focused and its label changes between Collapse navigation and Expand navigation.</li>
          <li>Opening the sheet moves focus to its first destination and makes the page behind inert. Closing it returns focus to the menu button.</li>
          <li>Every collapsed item shows its label in a tooltip on keyboard focus as well as hover. The tooltip is never the only name: the label stays in the accessibility tree.</li>
          <li>The skip link jumps past the panel to the main content. Choosing a suggested prompt moves focus into the composer with the text in place.</li>
        </ul>
        <h3 className="pt-rules-h">Writing the placeholder and labels</h3>
        <ul className="fd-rules">
          <li>A placeholder is an example of a good question, never an instruction. Write &ldquo;Ask about your emissions, a filing or a supplier&rdquo;, not &ldquo;Type your question here&rdquo;.</li>
          <li>A placeholder disappears as soon as the person types, so it cannot carry anything they need. Keep the visible label &ldquo;Ask the assistant&rdquo; above the composer.</li>
          <li>Placeholder text uses the muted foreground and still meets contrast. Keep it to one line at the narrowest width.</li>
          <li>Suggested prompts are complete questions a person would ask, in sentence case, with no trailing full stop. Offer three or four, not more.</li>
          <li>While an agent runs, the composer is disabled and Send becomes Stop. Say what is running and what Stop does.</li>
        </ul>
      </section>
    </div>
  );
}
