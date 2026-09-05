/**
 * TeamsX activity panel, mounted as a session-scoped header action.
 *
 * The badge registers into `conversation.session.header.actions` (next to the
 * autonomous-mode and Session-log controls), so it only ever exists inside an
 * open session's title bar. The framework resolves `sessionId` for
 * session-scoped slots, and the badge renders nothing unless a team belongs
 * to THIS session (captain or member id match) — switching to a session that
 * never used TeamsX shows no badge at all.
 *
 * The expanded panel portals to document.body as a fixed-position card
 * anchored under the badge; placement probes elementFromPoint so third-party
 * higher-layer docks (better-sidebar) cannot cover it.
 * @module dsh-teams-x/client/ActivityPanel
 */
import type { ReactElement } from 'react';
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { TeamsXLocaleKey } from './locale-keys.ts';
import type { TeamActivitySnapshot } from '../snapshot-types.ts';
import type { TeamsXSessionNavigator } from './session-navigation.ts';
/** Panel data endpoint served by the host plane. */
export declare const TEAMSX_STATE_URL = "/plugins/dsh-teams-x/state";
/** Halt endpoint served by the host plane. */
export declare const TEAMSX_HALT_URL = "/plugins/dsh-teams-x/halt";
/** Per-member pause endpoint served by the host plane. */
export declare const TEAMSX_PAUSE_URL = "/plugins/dsh-teams-x/member/pause";
/** Staged-plan review endpoint served by the host plane. */
export declare const TEAMSX_PLAN_URL = "/plugins/dsh-teams-x/plan";
/** Poll cadence for the live view. */
export declare const POLL_INTERVAL_MS = 4000;
/** Collapsed discovery cadence: slow, but fast enough to notice a team the
 * session creates after this badge mounted. */
export declare const DISCOVERY_INTERVAL_MS = 10000;
/** Locale formatter supplied by the harness locale service. */
export type PanelTranslate = (key: TeamsXLocaleKey, params?: Record<string, string | number>) => string;
export interface ActivityPanelProps extends PropsRuntime<'conversation.session.header.actions'>, PropsLocale<'teamsX'> {
    /** Client sessions service, used to open member transcripts. */
    readonly sessions: TeamsXSessionNavigator;
    /** Open one member's transcript (wired by the plugin shell). */
    readonly openMember: (parentId: TeamActivitySnapshot['captainSessionId'], childId: string) => void;
}
/**
 * The session-scoped shell: a header chip that exists only when THIS session
 * owns or participates in a live team; the expanded panel portals to body.
 */
export declare function ActivityPanel({ sessionId, t, openMember }: ActivityPanelProps): ReactElement | null;
