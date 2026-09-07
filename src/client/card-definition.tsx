/**
 * Conversation node definition for the TeamsX team card.
 *
 * Folds the 11 `teamsx/*` session event types into one keyed Chat node per
 * team (`target: 'chat'`), following the ui-workflow-run pattern. All state
 * logic lives in the zero-dependency card-state module; this file only
 * adapts it to the conversation assembler contract.
 * @module dsh-teams-x/client/card-definition
 */
import type { ConversationNodeDefinition } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { ChatConversationViewNode } from '@deepseek-ai/dsh-client-ui-chat/client'
import {
  TEAMSX_CARD_EVENT_TYPES,
  teamsXCardMatchRole,
  teamsXCardStart,
  teamsXCardUpdate,
  type TeamsXCardState,
} from './card-state.ts'

/** The card payload carried by every rendered Chat node. */
export type TeamsXCardData = TeamsXCardState

declare module '@deepseek-ai/dsh-client-ui-chat/client' {
  interface ChatNodeDataMap {
    /** Durable team card: roster, tasks, and lifecycle phase. */
    'teamsx-card': TeamsXCardData
  }
}

/**
 * The assembler-facing definition. `update()` always returns a state object
 * (the assembler fails loud on undefined), and `buildViewNode` returns null
 * only when the window does not contain the creating event.
 */
export const teamsXCardDefinition: ConversationNodeDefinition<TeamsXCardState> = {
  kind: 'teamsx',
  target: 'chat',
  match: (event) => {
    if (!TEAMSX_CARD_EVENT_TYPES.includes(event.type)) return null
    return teamsXCardMatchRole(event.type, event.data)
  },
  start: (_context, match) => {
    if (match.event.type !== 'teamsx/team-created') {
      throw new Error('teamsx card start requires teamsx/team-created')
    }
    return teamsXCardStart(match.event.data)
  },
  update: (context, match) => (
    teamsXCardUpdate(context.state, match.event.type, match.event.data)
  ),
  buildViewNode: (context): ChatConversationViewNode | null => {
    if (context.start === undefined) return null
    return {
      key: context.key,
      kind: 'teamsx-card',
      id: context.id,
      target: 'chat',
      anchorSeq: context.start.event.seq,
      location: context.start.location,
      visibility: 'visible',
      data: context.state,
    }
  },
}
