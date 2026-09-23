import type { ReactElement } from 'react';
import type { TeamActivitySnapshot } from '../snapshot-types.ts';
import type { PanelTranslate } from './format.ts';
import { type OpenMember } from './team-card.tsx';
/** Poll cadence for the live view. */
export declare const POLL_INTERVAL_MS = 4000;
/** Collapsed discovery cadence: slow, but fast enough to notice a team the
 * session creates after this badge mounted. */
export declare const DISCOVERY_INTERVAL_MS = 10000;
/** Props the shared activity body needs from whichever host renders it. */
export interface TeamsXPanelBodyProps {
    /** Session whose teams this body lists. */
    readonly sessionId: string;
    /** Locale formatter supplied by the hosting seat. */
    readonly t: PanelTranslate;
    /** Open one member's transcript (wired by the plugin shell). */
    readonly openMember: OpenMember;
    /**
     * Close the hosting panel. Omitted by a host that owns its own close control
     * (the right Sidebar's tab strip), which is also what hides the body's ✕.
     */
    readonly onClose?: () => void;
}
/**
 * Fetch team snapshots. `live` mode polls (slow cadence when collapsed,
 * fast when expanded); `archive` mode fetches once on mount and on
 * explicit reload only (static historical data, no auto-refresh).
 *
 * 静默轮询（quiet polling）: a tick whose payload would render identically
 * commits no state — same reference in, no re-render, control states stay
 * put. When a poll fails, the last-known-good list stays on screen and the
 * panel flips to `stale` (a quiet note, not an error wall); the error box is
 * reserved for "nothing to show at all". `busy` is the manual-reload spinner
 * only — background ticks are invisible unless data changed.
 */
export declare function useTeamData(expanded: boolean, viewMode: 'live' | 'archive'): {
    teams: TeamActivitySnapshot[];
    error?: string;
    stale: boolean;
    busy: boolean;
    reload: () => void;
};
export declare function TeamsXPanelBody({ sessionId, t, openMember, onClose }: TeamsXPanelBodyProps): ReactElement;
