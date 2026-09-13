/**
 * Durable TeamsX session event declarations.
 *
 * The `declare module` merge below is type-only and erased at runtime, so the
 * browser program can load this module without pulling in the host graph.
 * @module dsh-teams-x/event-types
 */

import type {} from '@deepseek-ai/dsh-session/types'

/** Every session event type TeamsX appends to the captain's session log. */
export type TeamsXEventType =
  | 'teamsx/team-created'
  | 'teamsx/team-approved'
  | 'teamsx/team-halted'
  | 'teamsx/team-resumed'
  | 'teamsx/team-deleted'
  | 'teamsx/plan-discarded'
  | 'teamsx/member-added'
  | 'teamsx/member-removed'
  | 'teamsx/task-created'
  | 'teamsx/task-updated'
  | 'teamsx/message-sent'

/** Payload shapes for the TeamsX session events. */
export interface TeamsXEventMap {
  'teamsx/team-created': { teamId: string; captainSessionId: string; name: string; description?: string; phase?: 'staged' | 'running' }
  'teamsx/team-approved': { teamId: string; members: number; tasks: number }
  'teamsx/team-halted': { teamId: string; cancelledTasks: number }
  'teamsx/team-resumed': { teamId: string; reason: string }
  'teamsx/team-deleted': { teamId: string }
  'teamsx/plan-discarded': { teamId: string }
  'teamsx/member-added': { teamId: string; memberId: string; name: string; role?: string }
  'teamsx/member-removed': { teamId: string; memberId: string }
  'teamsx/task-created': { teamId: string; taskId: string; subject: string; dependencies: string[]; assignee?: string; kind?: string; round?: number }
  'teamsx/task-updated': { teamId: string; taskId: string; status: string; assignee?: string; output?: string; verdict?: string; round?: number; takenOverBy?: 'captain' }
  'teamsx/message-sent': { teamId: string; messageId: string; from: string; to: string; content: string; ts: number }
}

declare module '@deepseek-ai/dsh-session/types' {
  interface SessionEventMap {
    'teamsx/team-created': TeamsXEventMap['teamsx/team-created']
    'teamsx/team-approved': TeamsXEventMap['teamsx/team-approved']
    'teamsx/team-halted': TeamsXEventMap['teamsx/team-halted']
    'teamsx/team-resumed': TeamsXEventMap['teamsx/team-resumed']
    'teamsx/team-deleted': TeamsXEventMap['teamsx/team-deleted']
    'teamsx/plan-discarded': TeamsXEventMap['teamsx/plan-discarded']
    'teamsx/member-added': TeamsXEventMap['teamsx/member-added']
    'teamsx/member-removed': TeamsXEventMap['teamsx/member-removed']
    'teamsx/task-created': TeamsXEventMap['teamsx/task-created']
    'teamsx/task-updated': TeamsXEventMap['teamsx/task-updated']
    'teamsx/message-sent': TeamsXEventMap['teamsx/message-sent']
  }
}
