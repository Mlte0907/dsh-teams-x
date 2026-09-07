/**
 * Module-level open-request channel from the `/teamsx` slash command to the
 * session-scoped ActivityPanel instance (whose `open` flag is component
 * state). Plain listener set — no store dependency, safe for the bundle.
 * @module dsh-teams-x/client/open-request
 */

type Listener = (sessionId: string) => void

const listeners = new Set<Listener>()

/** Ask the panel of `sessionId` to expand (no-op when it is not mounted). */
export function requestTeamsXPanel(sessionId: string): void {
  for (const listener of [...listeners]) listener(sessionId)
}

/** Subscribe; returns the unsubscribe function. */
export function onTeamsXPanelRequest(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
