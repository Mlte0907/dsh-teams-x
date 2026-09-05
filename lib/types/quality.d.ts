/**
 * Quality-gate rules: task contracts, path scope audit, and completion
 * validation. Pure functions — no I/O. v0.1 ships contract validation and
 * completion gates; the automatic repair/re-review loop is v0.2.
 * @module dsh-teams-x/quality
 */
import { type AcceptanceResult, type CommandResult, type ReviewFinding, type ReviewVerdict, type TaskKind, type TaskStatus, type TeamTask } from './types.ts';
export type PathClassification = 'in_scope' | 'out_of_scope' | 'undeclared' | 'illegal';
export interface CreateTaskInput {
    subject: string;
    description?: string;
    dependencies?: string[];
    assignee?: string;
    kind?: TaskKind;
    round?: number;
    objective?: string;
    inScope?: string[];
    outOfScope?: string[];
    acceptance?: string[];
    verify?: string[];
}
export interface QualityCompletionUpdate {
    status?: TaskStatus;
    output?: string;
    verdict?: ReviewVerdict;
    findings?: ReviewFinding[];
    changedPaths?: string[];
    acceptanceResults?: AcceptanceResult[];
    commandsRun?: CommandResult[];
}
export interface QualityCompletionResult {
    ok: boolean;
    error?: string;
}
export declare function taskKindOf(task: Pick<TeamTask, 'kind'> | undefined): TaskKind;
export declare function isQualityKind(kind: TaskKind | undefined): boolean;
/**
 * Normalize a workspace-relative POSIX path. `undefined` means illegal
 * (absolute, `..` escape, drive letter, or `~`).
 */
export declare function normalizeWorkspacePath(path: string): string | undefined;
export declare function pathMatchesScope(path: string, pattern: string): boolean;
export declare function classifyChangedPath(path: string, inScope?: readonly string[], outOfScope?: readonly string[]): PathClassification;
/**
 * Normalize model-materialized blank optional fields (`""` → omitted).
 * `dependencies` is deliberately NOT touched: it is a required structural
 * field the call sites default to `[]`, and dropping it here would leak into
 * the durable state and brick reloads (same class as the reference's #105).
 */
export declare function normalizeBlankOptionalTaskFields<T extends Record<string, unknown>>(input: T): T;
/** Validate one create_task request against quality-gate contracts. */
export declare function validateCreateTask(tasks: readonly TeamTask[], input: CreateTaskInput): {
    ok: boolean;
    error?: string;
    kind: TaskKind;
};
/** The allowed task status transitions, keyed by current status. */
export declare const STATUS_TRANSITIONS: Readonly<Record<TaskStatus, readonly TaskStatus[]>>;
export declare function transitionError(current: TaskStatus, next: TaskStatus): string | undefined;
/** Validate one completion/status update against the task's quality contract. */
export declare function evaluateQualityCompletion(task: TeamTask, update: QualityCompletionUpdate): QualityCompletionResult;
/** Whether every task in the team reached a terminal state. */
export declare function allTasksTerminal(tasks: readonly TeamTask[]): boolean;
