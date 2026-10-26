import { IconAttach, IconClose, IconMenu } from "@faun-ds/icons";
import { AIChatList, AIChatMessage, ArtifactPanel, ChatLayout, ChatLayoutControls, ProgressPanel, PromptComposer, type ProgressStep } from "@faun-ds/ai";
import { AppShell, Button, IconButton, Kbd, SearchField, TopBar, useAppShell } from "@faun-ds/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { CodeBlock } from "../../components/CodeBlock";
import { Keys } from "../../components/mdx";
import { H2, Segmented } from "../foundations/shared";
import { HomeNav } from "./HomeAssistant";
import { actors } from "./sample";
import "./patterns-chat.css";

/* ------------------------------------------------------------------ data */

const DRAFT = `## E1-6 Gross Scope 1, 2 and 3 GHG emissions

| Scope | FY2025 (tCO2e) | Change |
| --- | ---: | ---: |
| Scope 1 | 3,212 | -4.1% |
| Scope 2, market-based | 2,090 | -11.6% |
| Scope 3 | 42,910 | +8.2% |
| Total | 48,212 | +6.3% |

Scope 3 category 1 covers 148 of 163 suppliers by spend.
The remaining 15 suppliers are estimated from spend-based factors.`;
const VERSIONS = [{ id: "v3", label: "v3, 10:42" }, { id: "v2", label: "v2, 10:31" }, { id: "v1", label: "v1, 10:12" }];

function Draft() {
  const rows: [string, string, string][] = [["Scope 1", "3,212", "-4.1%"], ["Scope 2, market-based", "2,090", "-11.6%"], ["Scope 3", "42,910", "+8.2%"], ["Total", "48,212", "+6.3%"]];
  return (
    <div className="pt-draft-doc">
      <h3>E1-6 Gross Scope 1, 2 and 3 GHG emissions</h3>
      <table>
        <caption>FY2025, tCO₂e</caption>
        <thead><tr><th scope="col">Scope</th><th scope="col">Emissions</th><th scope="col">Change</th></tr></thead>
        <tbody>{rows.map(([a, b, c]) => <tr key={a}><th scope="row">{a}</th><td>{b}</td><td>{c}</td></tr>)}</tbody>
      </table>
      <p>Scope 3 category 1 covers 148 of 163 suppliers by spend. The remaining 15 suppliers are estimated from spend-based factors.</p>
    </div>
  );
}

const BASE: ProgressStep[] = [
  { id: "collect", title: "Collect activity data", state: "done", detail: "12,480 ledger rows from 6 entities", elapsedMs: 256_000 },
  { id: "factors", title: "Apply emission factors", state: "in_progress", detail: "212 of 340 suppliers matched", elapsedMs: 94_000 },
  { id: "draft", title: "Draft the E1-6 narrative", state: "pending" },
  { id: "check", title: "Check against ESRS E1 datapoints", state: "pending" },
  { id: "approve", title: "Ask for approval", state: "pending" },
];

/** A task that advances once a second until it waits for approval. Paused while `playing` is false. */
function useRun(playing: boolean) {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!playing || t >= 18) return;
    const id = window.setTimeout(() => setT((x) => x + 1), 1000);
    return () => window.clearTimeout(id);
  }, [playing, t]);
  const steps: ProgressStep[] = [
    BASE[0]!,
    t >= 6 ? { ...BASE[1]!, state: "done", detail: "340 of 340 suppliers matched", elapsedMs: 100_000 } : { ...BASE[1]!, detail: `${Math.min(340, 212 + t * 21)} of 340 suppliers matched`, elapsedMs: 94_000 + t * 1000 },
    t >= 12 ? { ...BASE[2]!, state: "done", detail: "Draft v3 ready", elapsedMs: 6000 } : t >= 6 ? { ...BASE[2]!, state: "in_progress", detail: "Writing from 340 evidenced figures", elapsedMs: (t - 6) * 1000 } : BASE[2]!,
    t >= 16 ? { ...BASE[3]!, state: "done", detail: "41 of 41 datapoints covered", elapsedMs: 4000 } : t >= 12 ? { ...BASE[3]!, state: "in_progress", elapsedMs: (t - 12) * 1000 } : BASE[3]!,
    t >= 18 ? { ...BASE[4]!, state: "awaiting_human", detail: "Waiting for the sustainability lead" } : BASE[4]!,
  ];
  return { steps, elapsedMs: 350_000 + t * 1000 };
}

/* --------------------------------------------------------------- the chat */

type PanelState = { progress: boolean; artifact: boolean };

/** The conversation with its two panels. `leading` is the control at the start of the header (the menu button on a phone). */
function Conversation({ state, onChange, leading, openedByPerson }: { state: PanelState; onChange: (s: PanelState) => void; leading?: React.ReactNode; openedByPerson: boolean }) {
  const run = useRun(state.progress);
  const set = (patch: Partial<PanelState>) => onChange({ ...state, ...patch });
  return (
    <ChatLayout
      label="Chat with the CSRD Filing Orchestrator"
      header={
        <>
          <div className="pt-chat-title">{leading}<h2>ESRS E1 disclosure</h2></div>
          <ChatLayoutControls progressOpen={state.progress} onProgressOpenChange={(v) => set({ progress: v })} artifactOpen={state.artifact} onArtifactOpenChange={(v) => set({ artifact: v })} />
        </>
      }
      composer={<PromptComposer label="Message to the CSRD Filing Orchestrator" placeholder="Ask a follow-up or ask for a change" actions={<IconButton icon={<IconAttach />} label="Attach a file" />} hint="The agent can see this filing and its evidence." />}
      progress={state.progress ? <ProgressPanel variant="docked" autoFocus={openedByPerson} title="Drafting the ESRS E1 disclosure" steps={run.steps} elapsedMs={run.elapsedMs} onClose={() => set({ progress: false })} /> : undefined}
      artifact={state.artifact ? <ArtifactPanel autoFocus={openedByPerson} title="ESRS E1-6 draft" kind="Document" versions={VERSIONS} defaultVersion="v3" preview={<Draft />} code={DRAFT} filename="esrs-e1-6-draft.md" onClose={() => set({ artifact: false })} /> : undefined}
    >
      <AIChatList>
        <AIChatMessage role="user" author={actors.priya} time="10:12" text="Draft the E1-6 gross emissions disclosure for FY2025 from the ledger." />
        <AIChatMessage role="assistant" author={actors.orchestrator} time="10:12" feedback={false}>
          <p className="pt-chat-p">I am drafting E1-6 now. I will ask you to approve it before anything is filed.</p>
          <div className="pt-chat-inline">
            <ProgressPanel title="Drafting the ESRS E1 disclosure" steps={run.steps} elapsedMs={run.elapsedMs} defaultOpen={false} actions={state.progress ? undefined : <Button size="sm" variant="outline" onClick={() => set({ progress: true })}>Open panel</Button>} />
          </div>
        </AIChatMessage>
        <AIChatMessage role="assistant" author={actors.narrative} time="10:42" feedback={false}>
          <p className="pt-chat-p">Draft v3 of E1-6 is ready: 48,212 tCO₂e in total, with 15 suppliers estimated from spend.</p>
          <div className="pt-chat-inline"><Button size="sm" variant="outline" aria-expanded={state.artifact} onClick={() => set({ artifact: true })}>Open the draft</Button></div>
        </AIChatMessage>
      </AIChatList>
    </ChatLayout>
  );
}

/* ---------------------------------------------------------------- desktop */

const STORE = "faun-docs-chat-panel";
const readStored = (): boolean => { try { return window.localStorage.getItem(STORE) === "collapsed"; } catch { return false; } };
const writeStored = (c: boolean) => { try { window.localStorage.setItem(STORE, c ? "collapsed" : "expanded"); } catch { /* the panel still works */ } };

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

function ChatScreen({ collapsed, onCollapsedChange, state, onChange, openedByPerson }: { collapsed: boolean; onCollapsedChange: (c: boolean) => void; state: PanelState; onChange: (s: PanelState) => void; openedByPerson: boolean }) {
  return (
    <div className="pt-frame pt-chat-frame">
      <AppShell
        fill="container"
        navCollapsed={collapsed}
        onNavCollapsedChange={onCollapsedChange}
        nav={<HomeNav current="ask" />}
        topBar={<TopBar start={<span className="pt-home-crumb">Assistant</span>} search={<SearchField aria-label="Search" placeholder="Search filings, suppliers, factors" shortcut="⌘K" size="sm" />} />}
      >
        <PanelShortcut />
        <Conversation state={state} onChange={onChange} openedByPerson={openedByPerson} />
      </AppShell>
    </div>
  );
}

/* ------------------------------------------------------------------ phone */

function ChatPhone({ initial, caption }: { initial: PanelState; caption: string }) {
  const [state, setState] = useState(initial);
  const [navOpen, setNavOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (navOpen) nav.current?.querySelector<HTMLElement>("a[href], button")?.focus();
    else toggle.current?.focus();
  }, [navOpen]);
  return (
    <figure className="pt-phone-wrap">
      <div className="pt-phone pt-chat-phone" onKeyDown={(e) => { if (navOpen && e.key === "Escape") setNavOpen(false); }}>
        <div className="pt-chat-phone-body" inert={navOpen || undefined}>
          <Conversation
            state={state}
            onChange={(s) => { setTouched(true); setState(s); }}
            openedByPerson={touched}
            leading={<IconButton ref={toggle} icon={navOpen ? <IconClose /> : <IconMenu />} label={navOpen ? "Close navigation" : "Open navigation"} aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)} />}
          />
        </div>
        {navOpen ? (
          <>
            <div className="pt-phone-scrim" aria-hidden="true" onClick={() => setNavOpen(false)} />
            <div className="pt-phone-nav" ref={nav} onClick={(e) => { if ((e.target as HTMLElement).closest("a[href]")) setNavOpen(false); }}><HomeNav current="ask" collapsed={false} interactive={false} /></div>
          </>
        ) : null}
      </div>
      <figcaption className="pt-note">{caption}</figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------- page */

const CODE = `<AppShell nav={<SideNav …/>} navCollapsed={collapsed} onNavCollapsedChange={setCollapsed} topBar={<TopBar />}>
  <ChatLayout
    label="Chat with the CSRD Filing Orchestrator"
    header={<>
      <h2>ESRS E1 disclosure</h2>
      <ChatLayoutControls progressOpen={progress} onProgressOpenChange={setProgress}
                          artifactOpen={artifact} onArtifactOpenChange={setArtifact} />
    </>}
    composer={<PromptComposer label="Message" placeholder="Ask a follow-up" />}
    progress={progress ? <ProgressPanel variant="docked" title="Drafting E1" steps={steps} elapsedMs={elapsed}
                                        onClose={() => setProgress(false)} /> : undefined}
    artifact={artifact ? <ArtifactPanel title="ESRS E1-6 draft" kind="Document" versions={versions}
                                        preview={<Draft />} code={markdown} onClose={() => setArtifact(false)} /> : undefined}
  >
    <AIChatList>…</AIChatList>
  </ChatLayout>
</AppShell>`;

export function ChatWithPanelsPattern() {
  const [collapsed, setCollapsedState] = useState(readStored);
  const [state, setState] = useState<PanelState>({ progress: true, artifact: true });
  const [touched, setTouched] = useState(false);
  const setCollapsed = (c: boolean) => { setCollapsedState(c); writeStored(c); };
  const change = (s: PanelState) => { setTouched(true); setState(s); };
  return (
    <div className="fd">
      <section className="fd-section">
        <H2 id="example" lede="A conversation with an agent, in the app shell. The left navigation collapses to a rail, the progress panel and the artifact panel open beside the thread, and each has its own switch. Every control below also exists inside the product: the panel button in the top bar, and the two buttons in the chat header.">Example</H2>
        <div className="pt-home-toolbar" role="group" aria-label="Layout controls">
          <Segmented label="Left navigation" value={collapsed ? "collapsed" : "expanded"} onChange={(v) => setCollapsed(v === "collapsed")} options={[["expanded", "Navigation open"], ["collapsed", "Navigation collapsed"]]} />
          <Segmented label="Progress panel" value={state.progress ? "on" : "off"} onChange={(v) => change({ ...state, progress: v === "on" })} options={[["on", "Progress on"], ["off", "Progress off"]]} />
          <Segmented label="Artifact panel" value={state.artifact ? "on" : "off"} onChange={(v) => change({ ...state, artifact: v === "on" })} options={[["on", "Artifact on"], ["off", "Artifact off"]]} />
          <p className="pt-note pt-home-keys">Collapse the navigation with <Kbd keys={["Ctrl", "B"]} size="sm" />. Escape closes the panel that has focus.</p>
        </div>
        <ChatScreen collapsed={collapsed} onCollapsedChange={setCollapsed} state={state} onChange={change} openedByPerson={touched} />
      </section>

      <section className="fd-section">
        <H2 id="combinations" lede="The same screen with the left navigation open or collapsed, and with each panel on its own. The artifact panel is resizable and maximises over the thread.">Combinations</H2>
        <div className="pt-combos">
          <figure className="pt-combo"><div className="pt-frame pt-chat-frame pt-combo-frame"><Combo collapsed={false} progress={false} artifact /></div><figcaption className="pt-note">Navigation open, artifact beside the thread. The thread keeps at least 360 px, so the artifact column narrows first.</figcaption></figure>
          <figure className="pt-combo"><div className="pt-frame pt-chat-frame pt-combo-frame"><Combo collapsed progress artifact={false} /></div><figcaption className="pt-note">Navigation collapsed to the rail, progress panel alone in the right column.</figcaption></figure>
        </div>
      </section>

      <section className="fd-section">
        <H2 id="narrow" lede="Under 768 px wide the navigation, the progress panel and the artifact panel all become sheets. The thread goes inert while one is open. These are drawn at phone width and work: press the menu button, the panel buttons or Escape.">Narrow layout (390 px)</H2>
        <div className="pt-phones">
          <ChatPhone initial={{ progress: false, artifact: false }} caption="Thread only. The menu button opens the navigation sheet; the two buttons open the panels." />
          <ChatPhone initial={{ progress: true, artifact: false }} caption="Progress panel: a bottom sheet over a scrim. Close or Escape returns to the thread." />
          <ChatPhone initial={{ progress: false, artifact: true }} caption="Artifact panel: a full-screen sheet with the same tabs and actions. Maximise is gone because it is already maximal." />
        </div>
      </section>

      <section className="fd-section">
        <H2 id="anatomy" lede="Compose these parts. Do not rebuild them.">What each part does</H2>
        <ul className="fd-rules">
          <li><b>App shell</b> owns the left navigation, its collapse to a rail, the sheet on a phone and the skip link. <Link className="fd-link" to="/components/app-shell">App shell</Link>.</li>
          <li><b>Chat layout</b> holds the header, the thread, the composer and a column for the panels, and turns the panels into sheets when it is narrow. <Link className="fd-link" to="/components/chat-layout">Chat layout</Link>.</li>
          <li><b>Progress panel</b> says which step the agent is on. It appears twice on purpose: as a folded card in the thread, so the conversation reads in order, and docked, so it stays in view. <Link className="fd-link" to="/components/progress-panel">Progress panel</Link>.</li>
          <li><b>Artifact panel</b> shows what the agent made, with Preview and Code tabs, versions, copy, download, maximise and close. <Link className="fd-link" to="/components/artifact-panel">Artifact panel</Link>.</li>
        </ul>
      </section>

      <section className="fd-section">
        <H2 id="rules">Rules</H2>
        <h3 className="pt-rules-h">Opening and closing panels</h3>
        <ul className="fd-rules">
          <li>Open a panel from the message that makes it useful: a button in the message, or a link on the progress card. Open the progress panel once, when work starts; never reopen it after the person closes it.</li>
          <li>The header toggles are the person&rsquo;s way to bring a panel back. Their labels say what the next press does.</li>
          <li>When both panels are open the progress panel sits above the artifact, in the same column, and is limited to under half the height so the artifact stays readable.</li>
          <li>Do not open the artifact panel on a phone without being asked: it covers the conversation.</li>
        </ul>
        <h3 className="pt-rules-h">Focus</h3>
        <ul className="fd-rules">
          <li>A panel the person opens takes focus on its title. Closing it gives focus back to the control that opened it.</li>
          <li>A panel that is already open when the page loads does not take focus.</li>
          <li>On a phone the thread is inert while a sheet is open, so focus cannot leave it.</li>
          <li>Escape closes the panel that has focus. In a maximised artifact the first Escape restores the size.</li>
        </ul>
        <h3 className="pt-rules-h">Width</h3>
        <ul className="fd-rules">
          <li>The artifact starts at 560 px and the person can resize it with the pointer or the arrow keys. The thread never drops below 360 px.</li>
          <li>Remember the width per person, not per conversation.</li>
        </ul>
      </section>

      <section className="fd-section">
        <H2 id="code" lede="The chat layout lives in the page area of the shell. Remove the page padding so the layout can fill it.">Code</H2>
        <CodeBlock code={CODE} />
        <ul className="fd-rules">
          <li>Render <code>progress</code> and <code>artifact</code> to open them; leave them out to close them. The layout keeps no open state.</li>
          <li>Components: <Link className="fd-link" to="/components/chat-layout">Chat layout</Link>, <Link className="fd-link" to="/components/progress-panel">Progress panel</Link>, <Link className="fd-link" to="/components/artifact-panel">Artifact panel</Link>, <Link className="fd-link" to="/components/ai-chat">AI chat</Link>, <Link className="fd-link" to="/components/prompt-composer">Prompt composer</Link>.</li>
        </ul>
      </section>

      <section className="fd-section">
        <H2 id="a11y" lede="What a keyboard or screen reader user gets on this screen.">Accessibility</H2>
        <Keys rows={[["Ctrl + B", "Collapses or expands the left navigation. Cmd + B on macOS."], ["Tab", "Skip link, navigation, top bar, chat header toggles, thread, composer, then the open panels."], ["Escape", "Closes the progress or artifact panel that has focus. Restores a maximised artifact first."], ["Left and Right arrows", "On the artifact resize handle: wider or narrower by 16 px. Shift for 64 px. Home and End for the limits."]]} />
        <ul className="fd-rules">
          <li>Landmarks: navigation “Main”, the chat region, and each panel as a region named by its title.</li>
          <li>The toggles are buttons with <code>aria-pressed</code>. The progress panel announces a change of step politely; the artifact announces copy.</li>
          <li>Status is always an icon and a word. Motion is a short fade and is removed under reduced motion.</li>
        </ul>
      </section>
    </div>
  );
}

function Combo({ collapsed, progress, artifact }: { collapsed: boolean; progress: boolean; artifact: boolean }) {
  const [state, setState] = useState<PanelState>({ progress, artifact });
  return (
    <AppShell fill="container" navCollapsed={collapsed} nav={<HomeNav current="ask" interactive={false} />} topBar={<TopBar start={<span className="pt-home-crumb">Assistant</span>} />}>
      <Conversation state={state} onChange={setState} openedByPerson={false} />
    </AppShell>
  );
}
