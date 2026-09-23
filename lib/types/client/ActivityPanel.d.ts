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
 *
 * v0.10 split: the shared body lives in panel-body.tsx, the team card in
 * team-card.tsx, the unified timeline in timeline-stream.tsx, the review bar
 * in plan-review.tsx, endpoints in endpoints.ts, API helpers in api.ts, and
 * formatting in format.ts. This file keeps the session-scoped shell plus the
 * historical export surface (TeamsXPanelBody, PanelTranslate, URL constants).
 * @module dsh-teams-x/client/ActivityPanel
 */
import type { ReactElement } from 'react';
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { TeamActivitySnapshot } from '../snapshot-types.ts';
import type { PanelTranslate } from './format.ts';
import { TEAMSX_HALT_URL, TEAMSX_PAUSE_URL, TEAMSX_PLAN_URL, TEAMSX_STATE_URL } from './endpoints.ts';
import { DISCOVERY_INTERVAL_MS, POLL_INTERVAL_MS, TeamsXPanelBody, type TeamsXPanelBodyProps } from './panel-body.tsx';
import type { TeamsXSessionNavigator } from './session-navigation.ts';
export { TEAMSX_STATE_URL, TEAMSX_HALT_URL, TEAMSX_PAUSE_URL, TEAMSX_PLAN_URL };
export { POLL_INTERVAL_MS, DISCOVERY_INTERVAL_MS };
export type { PanelTranslate };
export { TeamsXPanelBody };
export type { TeamsXPanelBodyProps };
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
