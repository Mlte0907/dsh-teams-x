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
import type { ISessions } from '@deepseek-ai/dsh-api-session-controller/client'

let sessions: ISessions | undefined

/** Called once by the plugin shell with the injected sessions service. */
export function provideSessions(face: ISessions): void {
  sessions = face
}

/** The provided face, or undefined on hosts where apply never ran. */
export function peekSessions(): ISessions | undefined {
  return sessions
}
