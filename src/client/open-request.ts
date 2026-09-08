/**
 * Module-level open-request channel from the `/teamsx` slash command to the
 * session-scoped ActivityPanel instance (whose `open` flag is component
 * state). Plain listener set — no store dependency, safe for the bundle.
 *
 * Two signals flow through this module:
 * 1. **Delivery / claim** — `requestTeamsXPanel` asks the panel of `sessionId`
 *    to expand. Each listener returns `true` when it claims the request (the
 *    panel is mounted for that session and has expanded). The call returns
 *    `true` iff at least one listener claimed.
 * 2. **Unclaimed fallback** — when no listener claims (the panel is not
 *    mounted for this session, e.g. the host home screen), the same synchronous
 *    call stack notifies `unclaimedListeners` so a global hint host can show a
 *    user-visible message instead of the legacy silent no-op.
 *
 * Both channels are plain `Set` listeners with no store dependency.
 * @module dsh-teams-x/client/open-request
 */

/** Claim semantics: a listener confirms "this panel handles the request" and
 *  has triggered expansion by returning `true`. Any other return (false /
 *  void / undefined) is treated as not-claimed. */
export type TeamsXPanelListener = (sessionId: string | undefined) => boolean | void

/** Unclaimed callback: `requestTeamsXPanel` invokes this synchronously once
 *  when zero listeners claimed the request. */
export type TeamsXPanelUnclaimedListener = (sessionId: string | undefined) => void

const listeners = new Set<TeamsXPanelListener>()
const unclaimedListeners = new Set<TeamsXPanelUnclaimedListener>()

/**
 * Ask the panel of `sessionId` to expand. Returns `true` iff at least one
 * listener claimed the request. When nobody claims, synchronously triggers
 * the unclaimed fallback channel (same call stack, no async race).
 */
export function requestTeamsXPanel(sessionId: string | undefined): boolean {
  let claimed = false
  for (const listener of [...listeners]) {
    if (listener(sessionId) === true) claimed = true
  }
  if (!claimed) {
    for (const listener of [...unclaimedListeners]) listener(sessionId)
  }
  return claimed
}

/** Subscribe to open requests; returns the unsubscribe function. */
export function onTeamsXPanelRequest(listener: TeamsXPanelListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Subscribe to unclaimed fallback; returns the unsubscribe function. */
export function onTeamsXPanelUnclaimed(listener: TeamsXPanelUnclaimedListener): () => void {
  unclaimedListeners.add(listener)
  return () => {
    unclaimedListeners.delete(listener)
  }
}
