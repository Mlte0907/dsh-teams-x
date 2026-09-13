/**
 * Durable TeamsX state types.
 *
 * A team is one directory under the state root holding `team.json`, an
 * `inbox/` of per-agent JSONL mailboxes, and a captain reverse index at the
 * state root. Members are continuable subagents whose durable child session
 * ids are recorded in the team file, so a team survives harness restarts.
 * @module dsh-teams-x/types
 */

/** Task lifecycle statuses in progression order. */
export type TaskStatus =
  | 'pending'
  | 'claimed'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled'

/** Statuses after which a task can no longer be claimed or worked on. */
export const TERMINAL_TASK_STATUSES: readonly TaskStatus[] = ['completed', 'failed', 'cancelled']

/** Structured task kind. Absent / unknown values are treated as `work`. */
export type TaskKind =
  | 'requirements'
  | 'implementation'
  | 'verification'
  | 'review'
  | 'repair'
  | 'integration'
  | 'work'

export const TASK_KINDS: readonly TaskKind[] = [
  'requirements', 'implementation', 'verification', 'review', 'repair', 'integration', 'work',
]

/** Review / requirements conclusion. Only `pass` may complete those kinds. */
export type ReviewVerdict = 'pass' | 'needs_revision' | 'reject'

export const REVIEW_VERDICTS: readonly ReviewVerdict[] = ['pass', 'needs_revision', 'reject']

/** Finding severity used by review / requirements output. */
export type FindingSeverity = 'low' | 'medium' | 'high' | 'blocker'

/** One structured review finding. */
export interface ReviewFinding {
  id: string
  severity: FindingSeverity
  file?: string
  line?: number
  problem: string
  requiredFix: string
  resolved?: boolean
}

/** One acceptance criterion result recorded at completion. */
export interface AcceptanceResult {
  criterion: string
  status: 'passed' | 'failed'
  evidence?: string
}

/** One verification command result recorded at completion. */
export interface CommandResult {
  command: string
  status: 'passed' | 'failed'
  exitCode?: number
  evidence?: string
}

/** One task of a team's task list. */
/** One progress note on an open task attempt. */
export interface TaskProgressEntry {
  readonly at: number
  readonly text: string
}

/** One archived contract revision from the captain re-contract flow. */
export interface ContractRevision {
  readonly at: number
  readonly actor: string
  readonly previous: {
    readonly objective?: string
    readonly inScope?: readonly string[]
    readonly outOfScope?: readonly string[]
    readonly acceptance?: readonly string[]
    readonly verify?: readonly string[]
  }
  readonly note?: string
}

export interface TeamTask {
  id: string
  subject: string
  description?: string
  status: TaskStatus
  /** Member name (or `captain`) the task is assigned to; unassigned tasks await a claim. */
  assignee?: string
  /**
   * Shadow takeover marker (v0.3): when the captain takes over a member-owned
   * task, the assignee stays the member and this flag records the captain's
   * active drive. The member keeps submit rights and its attempt stays valid;
   * the flag is released on the captain's idle edge or explicit reassign.
   */
  takenOverBy?: 'captain'
  /** One progress note appended by the worker during an open attempt. */
  progressLog?: readonly TaskProgressEntry[]
  /**
   * Large terminal outputs spill to `<teamDir>/artifacts/<file>`; `output`
   * keeps a preview and this reference points at the full text.
   */
  artifact?: { readonly file: string; readonly bytes: number }
  /** Wall-clock start of the current attempt; cleared when the attempt is invalidated. */
  attemptStartedAt?: number
  /** Cumulative token usage of the owner session recorded at task terminal. */
  usage?: { readonly inputTokens: number; readonly outputTokens: number; readonly cacheReadTokens?: number; readonly cacheWriteTokens?: number }
  /** Previous contract revisions (captain re-contract flow, newest first, cap 5). */
  contractHistory?: readonly ContractRevision[]
  /** Task ids that must reach `completed` before this task can be claimed. */
  dependencies: string[]
  /** The worker's written result, set when the task completes or fails. */
  output?: string
  /** Monotonic execution generation; reassignment/retry invalidates older attempts. */
  attempt?: number
  /** Capability for the current claimed/in-progress attempt; stale ids are rejected. */
  attemptId?: string
  /** Opaque generation for a revocation/handoff that has not started its next attempt yet. */
  handoffId?: string
  /** A handoff is quiescing the old owner; the scheduler must not dispatch it yet. */
  reassigning?: boolean
  kind?: TaskKind
  round?: number
  verdict?: ReviewVerdict
  findings?: ReviewFinding[]
  objective?: string
  inScope?: string[]
  outOfScope?: string[]
  acceptance?: string[]
  verify?: string[]
  /** Completion evidence recorded by the quality gates. */
  changedPaths?: string[]
  acceptanceResults?: AcceptanceResult[]
  commandsRun?: CommandResult[]
  createdAt: number
  updatedAt: number
}

/** Member lifecycle status. */
export type MemberStatus = 'idle' | 'working' | 'removed'

/** One team member: a continuable subagent plus its team-side record. */
export interface TeamMember {
  /** Durable continuable subagent session id (empty until spawned). */
  id: string
  /** Unique display name inside the team. */
  name: string
  /** Role description, e.g. `researcher`, `engineer`, `reviewer`. */
  role?: string
  /** Resolved LLM provider/model/effort route captured when this member was created. */
  provider?: string
  model?: string
  reasoningEffort?: string
  /** Prompt specific to this member's execution turns. */
  executionPrompt?: string
  /** Configured second-choice route. */
  fallback?: TeamModelFallback
  /** Active route after fallback, without changing the primary descriptor route. */
  activeProvider?: string
  activeModel?: string
  /** Whether the fallback route is currently active. */
  fallbackActive?: boolean
  joinedAt: number
  status: MemberStatus
}

/** Configured second-choice route. */
export interface TeamModelFallback {
  provider: string
  model: string
}

/** One mailbox message. */
export interface TeamMessage {
  id: string
  /** `captain` or a member name. */
  from: string
  to: string
  content: string
  ts: number
  /** Process-local delivery lease; prevents fallback and direct delivery racing. */
  deliveryClaimedAt?: number
  /** Set after the durable message was accepted by the recipient's live inbox. */
  deliveredAt?: number
  /** Set once the recipient has consumed the durable fallback. */
  readAt?: number
}

/** The full durable team record. */
export interface TeamState {
  /** Original team name. */
  name: string
  /** Sanitized directory id; the team's stable identity. */
  id: string
  /** Team purpose/goal. */
  description?: string
  /** Session id of the captain agent that owns this team. */
  captainSessionId: string
  createdAt: number
  /** Teammates only; the captain is implicit (the owning session). */
  members: TeamMember[]
  tasks: TeamTask[]
  /** Monotonic task id counter. */
  taskSeq: number
  /**
   * Two-phase execution lifecycle. Missing means `running` for durable
   * compatibility with teams created before staging existed.
   */
  phase?: 'staged' | 'running'
  /** Human-facing review sub-state while `phase` is `staged`. */
  planReviewState?: 'awaiting_review' | 'awaiting_feedback'
  /** Timestamp written only after a staged plan is explicitly approved. */
  approvedAt?: number
  /** Human halt from the captain chat; unfinished work is cancelled until resume. */
  halted?: boolean
  haltedAt?: number
}
