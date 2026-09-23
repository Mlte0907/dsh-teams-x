/**
 * Panel runtime face — one module-level slot where the plugin shell hands the
 * injected host services down to hooks that live below the prop surface.
 *
 * The activity panel renders through four component hops (badge body → panel
 * body → team card → member row); threading the sessions face through all of
 * them just to power one hook would couple every layer to a service only the
 * leaf cares about. The shell provides once at apply time; consumers peek.
 * @module dsh-teams-x/client/client-runtime
 */
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client';
/** Called once by the plugin shell with the injected sessions service. */
export declare function provideSessions(face: ISessions): void;
/** The provided face, or undefined on hosts where apply never ran. */
export declare function peekSessions(): ISessions | undefined;
