import type { ComponentType } from "react";
import type { TabMap } from "../../components/SectionTabs";
import { BulkActionsPattern } from "./BulkActions";
import { ConfirmDestructivePattern } from "./ConfirmDestructive";
import { NotificationsPattern } from "./Notifications";
import { SearchCommandPattern } from "./SearchCommand";
import { SettingsFormPattern } from "./SettingsForm";
import { ApprovalPattern } from "./Approval";
import { AgentRunPattern } from "./AgentRun";
import { FilingWorkspacePattern } from "./FilingWorkspace";
import { ListDetailPattern } from "./ListDetail";
import { OverviewDashboardPattern } from "./OverviewDashboard";
import { EmptyErrorPattern } from "./States";
import { OverviewPattern } from "./Overview";
import { HomeAssistantPattern } from "./HomeAssistant";
import { ChatWithPanelsPattern } from "./ChatWithPanels";
import { FormPagePattern } from "./FormPage";
import { LoginPattern } from "./Login";
import { SavingEditingPattern } from "./SavingEditing";
import { SearchResultsPattern } from "./SearchResultsFilters";

export type PatternEntry = { slug: string; title: string; description: string; Component: ComponentType; tabs?: TabMap; /** Earlier slugs that redirect here. */ aliases?: string[]; /** Shown first on the Patterns index. */ featured?: boolean; /** Hide the table of contents so a full-width frame fits. */ wide?: boolean };
export const patternPages: PatternEntry[] = [
  { slug: "assistant-home", featured: true, wide: true, aliases: ["home-with-assistant"], title: "Assistant home", description: "The first screen: a greeting, a large prompt composer, approvals waiting and recent work, beside a left navigation panel that opens with recents and collapses to an icon rail. Includes the composer states and the phone layout.", Component: HomeAssistantPattern, tabs: { overview: ["example", "panel", "states", "narrow"], usage: ["anatomy", "rules"], code: ["code"], accessibility: ["a11y"] } },
  { slug: "chat-with-panels", featured: true, wide: true, title: "Chat with panels", description: "A conversation with an agent, with the left navigation open or collapsed and a progress panel and an artifact panel opening beside the thread, each with its own switch.", Component: ChatWithPanelsPattern, tabs: { overview: ["example", "combinations", "narrow"], usage: ["anatomy", "rules"], code: ["code"], accessibility: ["a11y"] } },
  { slug: "approval-flow", title: "Approval flow", description: "How an agent hands a decision to a person, and how the decision is recorded.", Component: ApprovalPattern, tabs: { overview: ["example"], usage: ["rules"] } },
  { slug: "kpi-overview", title: "KPI overview", description: "Lead with a few evidenced numbers, their change and their basis.", Component: OverviewPattern, tabs: { overview: ["example"], usage: ["rules"] } },
  { slug: "empty-and-error", title: "Empty, error and no access", description: "Four situations that need a clear next step.", Component: EmptyErrorPattern, tabs: { overview: ["kinds", "inline"], usage: ["rules"] } },
  { slug: "agent-run-viewer", title: "Agent run viewer", description: "One screen for a run in progress: steps, the draft and its sources, confidence, lineage and the decision waiting on a person.", Component: AgentRunPattern, tabs: { overview: ["example"], usage: ["anatomy", "rules"] } },
  { slug: "list-and-detail", title: "Page template: list and detail", description: "A filterable table of records with a side panel that opens on the row.", Component: ListDetailPattern, tabs: { overview: ["example"], usage: ["rules"] } },
  { slug: "filing-workspace", title: "Page template: filing workspace", description: "Where one filing is run: stage progress, tasks and approvals.", Component: FilingWorkspacePattern, tabs: { overview: ["example"], usage: ["rules"] } },
  { slug: "overview-dashboard", title: "Page template: overview dashboard", description: "Headline figures and three charts for the first look at the inventory.", Component: OverviewDashboardPattern, tabs: { overview: ["example"], usage: ["rules"] } },
  { slug: "settings-form", title: "Settings form", description: "Labelled fields, validation that explains itself, and switches for settings that apply at once.", Component: SettingsFormPattern, tabs: { overview: ["example"], usage: ["rules"] } },
  { slug: "confirm-destructive-action", title: "Confirm destructive action", description: "Ask once, name the object and its consequences, and make the verb the button.", Component: ConfirmDestructivePattern, tabs: { overview: ["example"], usage: ["rules"] } },
  { slug: "bulk-actions", title: "Bulk actions on a table", description: "Select rows, see the count, apply one action to all of them and confirm the result.", Component: BulkActionsPattern, tabs: { overview: ["example"], usage: ["rules"] } },
  { slug: "notifications-and-toasts", title: "Notifications and toasts", description: "Choose between a toast, a banner, the notification centre and a dialog.", Component: NotificationsPattern, tabs: { overview: ["example"], usage: ["rules"] } },
  { slug: "search-and-command-palette", title: "Search and command palette", description: "One shortcut to jump to a filing or agent, or to start a common action.", Component: SearchCommandPattern, tabs: { overview: ["example"], usage: ["rules"] } },
  { slug: "login", title: "Login", description: "A sign-in page that asks for little, explains what went wrong and keeps what was typed. Centred and split layouts.", Component: LoginPattern, tabs: { overview: ["example"], usage: ["rules"] } },
  { slug: "saving-and-editing", title: "Saving and editing", description: "Autosave that says what it is doing, edit in place, and a guard that stops people leaving unsaved work behind.", Component: SavingEditingPattern, tabs: { overview: ["example", "inline"], usage: ["rules"] } },
  { slug: "search-results-with-filters", title: "Search results with filters", description: "A query, facets that show their effect, applied filter tags and an honest empty state.", Component: SearchResultsPattern, tabs: { overview: ["example"], usage: ["rules"] } },
  { slug: "form-page", title: "Form page", description: "A long form in sections with a section list, a validation summary that links to each error and focus that goes where the person needs it.", Component: FormPagePattern, tabs: { overview: ["example"], usage: ["rules"] } },
];
