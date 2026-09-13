/**
 * Pure snapshot view types shared by the host assembler and the browser
 * panel. Zero imports beyond the durable type vocabulary, so the client
 * program can load this module without pulling in the host graph.
 * @module dsh-teams-x/snapshot-types
 */

import type { MemberStatus } from './types.ts'

/**
 * Browser/UI mutations allowed while a plan is waiting for approval.
 * Shared by the host runtime (tools.ts) and the client editor; kept in this
 * zero-import module so the browser bundle never pulls in the host graph.
 */
export type StagedPlanMutation =
  | {
      action: 'update_member'
      memberName: string
      role?: string | null
      provider: string
      model: string
      reasoningEffort?: string | null
      executionPrompt?: string | null
    }
  | {
      action: 'update_task'
      taskId: string
      subject: string
      description?: string | null
      assignee?: string | null
      dependencies: string[]
    }
  | {
      action: 'add_task'
      subject: string
      description?: string | null
      assignee?: string | null
      dependencies: string[]
    }
  | { action: 'remove_task'; taskId: string }
  | { action: 'remove_member'; memberName: string }

/** One member row of the activity snapshot. */
export interface TeamActivityMember {
  readonly id: string
  readonly name: string
  readonly role: string
  readonly provider: string
  readonly model: string
  readonly status: MemberStatus
  readonly activity: 'working' | 'idle' | 'unknown'
  readonly progress: number
  readonly done: number
  readonly total: number
  readonly currentTask: string
  readonly unread: number
}

/** One task row of the activity snapshot. */
export interface TeamActivityTask {
  readonly id: string
  readonly subject: string
  readonly description: string
  readonly status: string
  readonly state: string
  readonly assignee: string
  readonly model: string
  readonly dependencies: readonly string[]
  readonly depth: number
  readonly kind?: string
  readonly round?: number
  readonly verdict?: string
  /** Execution attempt generation (>=1 after first claim; bumped on retry). */
  readonly attempt?: number
  /** Shadow-takeover marker: the captain is personally driving this task. */
  readonly takenOverBy?: 'captain'
  /** Wall-clock task age in ms: createdAt → updatedAt when terminal, → now while open. */
  readonly elapsedMs?: number
  /** Latest progress note on the open attempt (long-task heartbeat). */
  readonly progressLatest?: string
  /** Total progress notes recorded for this task. */
  readonly progressCount?: number
}

/** One captain-inbox preview row. */
export interface TeamActivityMessage {
  readonly from: string
  readonly content: string
}

/** The full panel payload for one team. */
export interface TeamActivitySnapshot {
  readonly workspace: string
  readonly teamId: string
  readonly name: string
  readonly description?: string
  readonly captainSessionId: string
  readonly phase: 'staged' | 'running'
  readonly planReviewState?: 'awaiting_review' | 'awaiting_feedback'
  readonly halted?: boolean
  readonly members: readonly TeamActivityMember[]
  readonly tasks: readonly TeamActivityTask[]
  readonly messageCount: number
  readonly captainInbox: readonly TeamActivityMessage[]
}
