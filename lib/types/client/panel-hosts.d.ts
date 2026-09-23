/**
 * The 0.1.5-only hosts for the shared TeamsX activity body.
 *
 * The right Sidebar tab is the extra way into the same content the
 * session-header badge opens as a dropdown — and on a phone the right Sidebar
 * is the full-width drawer, so this is the mobile-reachable one.
 *
 * (2026-09-12) The sidebar panel-icon row entry and its main-column panel are
 * GONE by product decision: the desktop left sidebar must not offer a TeamsX
 * button (its panel duplicated the badge dropdown and the right-Sidebar tab).
 * Only the right-Sidebar tab registration remains here.
 *
 * OPTIONAL BY CONTRACT. `ctx.sidebarRightTabs` and the keyed `main` dispatch
 * ship on the 0.1.5-rc.1 line only, so every registration here rides a
 * DEFERRED inject and is guarded: the plugin's hard injects stay `slots` +
 * `locale`, and on a host without these seats nothing is registered, the
 * callback never fires, and the shipped badge keeps working.
 * A foreign registry (a throwing `register`, a taken id) costs the extra host,
 * never the browser.
 * @module dsh-teams-x/client/panel-hosts
 */
import type { ReactElement } from 'react';
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { TeamActivitySnapshot } from '../snapshot-types.ts';
/** Open one member's transcript (wired by the plugin shell). */
export type OpenMember = (parentId: TeamActivitySnapshot['captainSessionId'], childId: string) => void;
/** Props the right Sidebar's tab seat delivers: the session and the locale `t`. */
type TabBodyProps = PropsRuntime<'sidebar.right.pane.tab'> & PropsLocale<'teamsX'> & {
    readonly openMember: OpenMember;
};
/** The right Sidebar tab: the shared body in the panel's own scrolling column. */
export declare function TeamsXTabBody(props: TabBodyProps): ReactElement;
/**
 * Contribute every 0.1.5-only host. Called from `apply` after the badge is
 * mounted, so a host that serves none of these seats still has the panel.
 *
 * The labels of a seat registered outside React are read through the plugin's
 * own bound translate, so a locale service without `bind` (an older or minimal
 * host) costs the extra hosts and nothing else.
 * @param ctx - client root context.
 * @param openMember - member-transcript navigation.
 */
export declare function registerPanelHosts(ctx: ClientContext, openMember: OpenMember): void;
export {};
