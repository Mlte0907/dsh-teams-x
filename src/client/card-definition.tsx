/**
 * Conversation card for TeamsX team events.
 *
 * Matches teamsx/* session events and provides state tracking for the
 * conversation engine. Visual rendering via ConversationViewDefinition
 * is reserved for v0.2.
 * @module dsh-teams-x/client/card-definition
 */

/** TeamsX event type prefixes the card recognizes. */
const TEAM_EVENTS = new Set([
  'teamsx/team-created', 'teamsx/team-approved', 'teamsx/team-halted',
  'teamsx/team-resumed', 'teamsx/team-deleted', 'teamsx/plan-discarded',
  'teamsx/member-added', 'teamsx/member-removed', 'teamsx/task-created',
  'teamsx/task-updated', 'teamsx/message-sent',
])

/** Minimal ConversationNodeDefinition for TeamsX team events. */
export const teamsXCardDefinition = {
  kind: 'teamsx',

  match(event: { readonly type: string; readonly data?: Record<string, unknown> }) {
    if (!TEAM_EVENTS.has(event.type)) return null
    const data = (event.data ?? {}) as Record<string, unknown>
    const teamId = typeof data['teamId'] === 'string' ? data['teamId'] : ''
    if (teamId === '') return null
    return { id: teamId, role: 'start' as const }
  },

  start(_context: unknown, _match: unknown, _reader: unknown) {
    return { __teamsxCard: true }
  },

  update(_context: unknown, _match: unknown) {
    return undefined
  },
}
