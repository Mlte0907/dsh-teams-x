/**
 * Leaf module for the plugin's HTTP endpoints. Constants live here (not in
 * ActivityPanel) so editor/card/panel modules can import them without
 * creating an ActivityPanel ↔ editor import cycle.
 * @module dsh-teams-x/client/endpoints
 */
/** Panel data endpoint served by the host plane. */
export declare const TEAMSX_STATE_URL = "/plugins/dsh-teams-x/state";
/** Halt endpoint served by the host plane. */
export declare const TEAMSX_HALT_URL = "/plugins/dsh-teams-x/halt";
/** Per-member pause endpoint served by the host plane. */
export declare const TEAMSX_PAUSE_URL = "/plugins/dsh-teams-x/member/pause";
/** Staged-plan review endpoint served by the host plane. */
export declare const TEAMSX_PLAN_URL = "/plugins/dsh-teams-x/plan";
