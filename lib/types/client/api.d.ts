/**
 * Fetch/POST helpers for the plugin's host-plane routes. Leaf module: no
 * React, no component imports.
 * @module dsh-teams-x/client/api
 */
import type { TeamActivitySnapshot } from '../snapshot-types.ts';
/** Fetch the state endpoint (live or archived). */
export declare function fetchTeams(viewMode: 'live' | 'archive'): Promise<TeamActivitySnapshot[]>;
/** POST the halt route for one team. */
export declare function haltTeam(captainSessionId: string, teamId: string): Promise<void>;
/** POST the pause route for one member (interrupt; attempt stays parked). */
export declare function pauseMember(captainSessionId: string, teamId: string, memberName: string): Promise<void>;
/** POST one staged-plan review action. */
export declare function planAction(captainSessionId: string, teamId: string, action: 'approve' | 'discard' | 'continue'): Promise<void>;
