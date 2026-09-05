/**
 * Team state persistence and pure team-logic rules.
 *
 * State lives on disk under `<workspace>/<stateDir>/<teamId>/`:
 * - `team.json` — the durable {@link TeamState} record
 * - `inbox/<agentKey>.jsonl` — one JSONL mailbox per agent (`captain` or a
 *   member name)
 *
 * Two upgrades over the reference design:
 * - **Reverse index**: `index.json` at the state root maps captain and member
 *   session ids to team ids, so `findTeamByParticipant` is O(1) instead of a
 *   full directory scan. A miss or corrupt index falls back to the scan and
 *   rewrites the index (self-healing), so the index is never authoritative
 *   on its own.
 * - **Lock hygiene**: {@link withTeamLock} deletes its map entry on release
 *   when no later waiter chained onto it, so long-lived processes do not
 *   accumulate stale promise chains per team.
 *
 * All mutations run through an in-process per-team queue so read-modify-write
 * stays serial; writes go through a same-directory temp-file rename with a
 * Windows-tolerant retry.
 * @module dsh-teams-x/state
 */
import { type TeamMessage, type TeamState, type TeamTask } from './types.ts';
/** Mailbox key of the captain. */
export declare const CAPTAIN_KEY = "captain";
/**
 * Serialize mutations of one scope across the whole process.
 * @param key - the mutation scope (team id, retired-members root, …).
 * @param fn - the mutation to run exclusively.
 * @returns the mutation's result.
 */
export declare function withTeamLock<T>(key: string, fn: () => Promise<T>): Promise<T>;
/**
 * Fold a free-form name into a safe path/key segment. Unicode letters and
 * digits survive (CJK/Cyrillic stay distinct); everything else folds to `-`.
 * Over-long names are truncated with a digest appended.
 */
export declare function sanitizeKey(name: string): string;
/** Create the team directory structure and the initial team record. */
export declare function createTeamDir(stateRoot: string, state: TeamState): Promise<void>;
/**
 * Persist one team record (inside the caller's lock). The reverse index is
 * NOT touched here: status-only writes leave the identity set unchanged, and
 * any real drift (member add/remove) is repaired by the next index miss via
 * the self-healing scan. Call identity-mutating paths should invoke
 * {@link reindexTeam} explicitly.
 */
export declare function writeTeam(stateRoot: string, state: TeamState): Promise<void>;
/** Refresh one team's reverse-index entries after its identity set changed. */
export declare function reindexTeam(stateRoot: string, state: TeamState): Promise<void>;
/** Read one team record; `undefined` when absent. */
export declare function readTeam(stateRoot: string, teamId: string): Promise<TeamState | undefined>;
/** Synchronously read one team record while a continuable child is composed. */
export declare function readTeamSync(stateRoot: string, teamId: string): TeamState | undefined;
/**
 * Find the team in which one session is an active participant, via the
 * reverse index with a self-healing full-scan fallback.
 * @param stateRoot - resolved absolute state root directory.
 * @param agentSessionId - calling captain/member session id.
 */
export declare function findTeamByParticipant(stateRoot: string, agentSessionId: string): Promise<TeamState | undefined>;
/** Find the team owned by one captain session (at most one per captain). */
export declare function findTeamByCaptain(stateRoot: string, captainSessionId: string): Promise<TeamState | undefined>;
/** Remove a team's whole directory (members should be interrupted first). */
export declare function removeTeamDir(stateRoot: string, teamId: string): Promise<void>;
/**
 * Archive a team instead of deleting it: the whole directory moves under
 * `<stateRoot>/archive/<teamId>/` so later sessions can review how tasks
 * were planned. The live activity scan skips the archive naturally.
 */
export declare function archiveTeamDir(stateRoot: string, teamId: string): Promise<void>;
/** Read one archived team (already moved under `archive/`), or undefined. */
export declare function readArchivedTeam(stateRoot: string, teamId: string): Promise<TeamState | undefined>;
/** List every archived team id under the state root. */
export declare function listArchivedTeamIds(stateRoot: string): Promise<string[]>;
/** Read the durable set of member session ids retired by remove/delete. */
export declare function readRetiredMemberIds(stateRoot: string): Promise<Set<string>>;
/** Atomically add session ids to the durable retired-member deny-list. */
export declare function recordRetiredMemberIds(stateRoot: string, memberIds: readonly string[]): Promise<void>;
/** Build a fresh message record. */
export declare function createMessage(from: string, to: string, content: string): TeamMessage;
/**
 * Append one message to an agent's mailbox (JSONL). Callers must hold the
 * team lock: the sanitizeKey normalizer may map different agent names to the
 * same file, so the team-level lock is the serialization boundary.
 */
export declare function appendMailbox(stateRoot: string, teamId: string, agentKey: string, message: TeamMessage): Promise<void>;
/**
 * Read one agent's whole mailbox, oldest first. Malformed records are
 * skipped (reported via `onMalformedLine`) so one damaged line cannot make
 * the whole team unreadable.
 */
export declare function readMailbox(stateRoot: string, teamId: string, agentKey: string, onMalformedLine?: (lineNumber: number, error: unknown) => void): Promise<TeamMessage[]>;
/** Read only messages that have not been acknowledged by their recipient. */
export declare function readUnreadMailbox(stateRoot: string, teamId: string, agentKey: string, onMalformedLine?: (lineNumber: number, error: unknown) => void): Promise<TeamMessage[]>;
/** Lease selected fallback messages to one delivery path. */
export declare function claimMailboxDelivery(stateRoot: string, teamId: string, agentKey: string, messageIds: readonly string[]): Promise<void>;
/** Release a failed delivery lease so the scheduler can retry it later. */
export declare function releaseMailboxDelivery(stateRoot: string, teamId: string, agentKey: string, messageIds: readonly string[]): Promise<void>;
/** Mark selected durable mailbox records delivered/read. */
export declare function acknowledgeMailbox(stateRoot: string, teamId: string, agentKey: string, messageIds: readonly string[]): Promise<void>;
/** Activate the task's current generation for one owner and return its capability id. */
export declare function activateTaskAttempt(task: TeamTask, assignee: string): string;
/** Start a fresh task generation for one owner. */
export declare function beginTaskAttempt(task: TeamTask, assignee: string): string;
/** Cancel one unfinished task without returning it to the ready pool. */
export declare function cancelUnfinishedTask(task: TeamTask, output?: string): void;
/**
 * Revoke the current worker immediately. Clearing its capability makes old
 * updates stale; a separate handoff generation serializes async quiescence.
 */
export declare function invalidateTaskAttempt(task: TeamTask, nextAssignee?: string, reassigning?: boolean): void;
/**
 * Whether `dependencies` are all satisfied (every named task exists and
 * completed) for the given task list.
 * @param byId - optional pre-built lookup map for hot loops.
 */
export declare function unsatisfiedDependencies(tasks: readonly TeamTask[], dependencies: readonly string[], byId?: Map<string, TeamTask>): string[];
/** Visual task state for the activity panel. */
export type VisualTaskState = 'blocked' | 'open' | 'running' | 'completed' | 'failed' | 'cancelled';
/**
 * The visual state of one task. Pass a pre-built `byId` map when called in a
 * loop over the same task list.
 */
export declare function taskVisualState(status: string, dependencies: readonly string[], tasks: readonly TeamTask[], byId?: Map<string, TeamTask>): VisualTaskState;
/** Longest dependency path depth per task id (each depth = one lane column). */
export declare function taskDepthsById(tasks: readonly TeamTask[]): Map<string, number>;
