/**
 * Event-driven shared task scheduler.
 *
 * DSH continuable agents expose explicit idle/running edges, so this
 * scheduler closes the dispatch loop without keeping a polling turn alive:
 * every idle edge and every task-graph mutation attempts one atomic claim
 * and wakes the selected durable member. A resident member that becomes idle
 * while it still owns an open attempt is parked: only an explicit captain
 * reassignment may rotate that capability. Automatic retry is reserved for
 * cold recovery, when the durable owner is no longer resident in the live
 * Agent registry.
 * @module dsh-teams-x/scheduler
 */
import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { type TeamTask } from './types.ts';
/** Per-dependency output cap in the assignment prompt. */
export declare const DEPENDENCY_OUTPUT_MAX_CHARS = 2000;
/** Combined dependency-output budget in the assignment prompt. */
export declare const DEPENDENCY_OUTPUTS_TOTAL_MAX_CHARS = 12000;
export interface SchedulerConfig {
    readonly stateDir: string;
    readonly executionPrompt?: string;
    /** Automatic repair loop config. */
    readonly repairLoop?: RepairLoopConfig;
}
/** Automatic repair loop configuration. */
export interface RepairLoopConfig {
    /** Maximum rounds of repair per failed task (default 3). */
    readonly maxRounds?: number;
    /** Whether to auto-derive repair tasks after a failed review (default true). */
    readonly autoDerive?: boolean;
}
/** Default max rounds for repair loop. */
export declare const DEFAULT_REPAIR_MAX_ROUNDS = 3;
/**
 * Check if a completed task verdict requires repair.
 */
export declare function verdictRequiresRepair(verdict?: string): boolean;
/**
 * Check if a task has reached the repair round limit.
 */
export declare function hasReachedRoundLimit(task: TeamTask, maxRounds: number): boolean;
/**
 * Derive a repair task from a failed quality task.
 * The repair task depends on the failed task, has round+1, and summarizes the findings.
 */
export declare function deriveRepairTask(failedTask: TeamTask, findings: readonly {
    id: string;
    severity: string;
    problem: string;
    requiredFix: string;
}[], taskSeq: number): TeamTask;
/**
 * Find an open (non-terminal) repair sibling derived from `sourceTaskId`.
 * Used to avoid deriving duplicate repair tasks for the same failed source
 * (2026-09-13 real run: two pending "Repair:" siblings piled up on one task).
 */
export declare function openRepairSiblingFor(tasks: readonly TeamTask[], sourceTaskId: string): TeamTask | undefined;
/**
 * Cancel every open repair sibling of `sourceTaskId` (in place). Called when
 * the source task completes successfully — pending repair siblings would
 * otherwise become ready duplicated work.
 * @returns the cancelled siblings, for logging/events.
 */
export declare function cancelSupersededRepairSiblings(tasks: readonly TeamTask[], sourceTaskId: string): TeamTask[];
/** Owner session gone entirely → the open attempt is orphaned; requeue it. */
export declare const STALL_ORPHAN_MS: number;
/** Owner idle with a parked attempt → remind the captain once per attempt. */
export declare const STALL_PARKED_NOTIFY_MS: number;
/** Owner running but no progress/updates for this long → advise the captain. */
export declare const STALL_RUNNING_NOTIFY_MS: number;
export type StallKind = 'orphan' | 'parked-stall' | 'running-stall';
/**
 * Classify one open member-owned attempt against its owner's live status.
 * Pure — the reconciler turns the result into requeues / captain mail.
 * `lastActivity` is the task's updatedAt; `ownerLive` is the owning member's
 * live agent status, or undefined when the session is gone.
 */
export declare function classifyStall(task: Pick<TeamTask, 'status' | 'attemptStartedAt' | 'updatedAt'>, ownerLive: 'running' | 'idle' | undefined, now: number): StallKind | null;
/**
 * A captain-owned task is stranded when the captain session can no longer
 * drive it: the session is gone, or it is not actively running a turn.
 * Such tasks have no event edge left to recover them (the scheduler is purely
 * event-driven), so the reconciler returns them to the shared pool.
 */
export declare function isStrandedCaptainTask(task: TeamTask, captainRunning: boolean): boolean;
export interface TeamScheduler {
    /** Try to give every genuinely idle/ready member one unit of ready work. */
    kickTeam(workspace: string, teamId: string, captain?: Agent): Promise<void>;
    /** Try to flush fallback mail or give one member one ready task. */
    kickMember(workspace: string, teamId: string, memberName: string, captain?: Agent): Promise<void>;
    /** Trigger repair loop for a failed quality task. */
    triggerRepairLoop(workspace: string, teamId: string, taskId: string): Promise<void>;
}
/** One completed recursive dependency shown to the assignee. */
export interface DependencyOutput {
    readonly id: string;
    readonly subject: string;
    readonly output?: string;
}
export interface DispatchTicket {
    readonly taskId: string;
    readonly memberName: string;
    readonly memberId: string;
    readonly attempt: number;
    readonly attemptId: string;
    readonly previousAssignee?: string;
    readonly subject: string;
    readonly description?: string;
    readonly teamDescription?: string;
    readonly dependencyOutputs: readonly DependencyOutput[];
    readonly executionPrompt?: string;
    readonly kind?: string;
    readonly round?: number;
    readonly objective?: string;
    readonly inScope?: readonly string[];
    readonly outOfScope?: readonly string[];
    readonly acceptance?: readonly string[];
    readonly verify?: readonly string[];
}
/**
 * Recursively collect `status=completed` ancestors of `taskId` in topological
 * order (dependencies before dependents). Cycles stop that branch only.
 */
export declare function collectCompletedDependencyOutputs(tasks: readonly TeamTask[], taskId: string, warn?: (message: string) => void): DependencyOutput[];
/**
 * Format completed-dependency outputs with per-item and total truncation.
 * Truncation drops from the end (oldest dependencies) to keep the most
 * recent outputs, and uses a running total instead of repeated joins.
 */
export declare function formatDependencyOutputs(items: readonly DependencyOutput[]): string;
export declare function assignmentPrompt(ticket: DispatchTicket, stateDir: string, teamId: string): string;
/** Install one scheduler and its member activity observer. */
export declare function installTeamScheduler(ctx: Context, config: SchedulerConfig): TeamScheduler;
