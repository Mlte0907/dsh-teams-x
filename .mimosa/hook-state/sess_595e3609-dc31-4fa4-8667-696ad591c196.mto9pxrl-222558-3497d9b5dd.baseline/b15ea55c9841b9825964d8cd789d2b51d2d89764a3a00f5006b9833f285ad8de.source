/**
 * Quality-gate rules: task contracts, path scope audit, and completion
 * validation. Pure functions — no I/O. v0.1 ships contract validation and
 * completion gates; the automatic repair/re-review loop is v0.2.
 * @module dsh-teams-x/quality
 */
import { TASK_KINDS, TERMINAL_TASK_STATUSES, } from "./types.js";
const QUALITY_KINDS = [
    'requirements', 'implementation', 'verification', 'review', 'repair', 'integration',
];
const WRITE_KINDS = ['implementation', 'repair'];
const OPEN_STATUSES = ['pending', 'claimed', 'in_progress'];
export function taskKindOf(task) {
    return task?.kind ?? 'work';
}
export function isQualityKind(kind) {
    return kind !== undefined && kind !== 'work' && QUALITY_KINDS.includes(kind);
}
/**
 * Normalize a workspace-relative POSIX path. `undefined` means illegal
 * (absolute, `..` escape, drive letter, or `~`).
 */
export function normalizeWorkspacePath(path) {
    if (typeof path !== 'string')
        return undefined;
    const trimmed = path.trim();
    if (trimmed === '')
        return undefined;
    if (trimmed.startsWith('~') || /^[A-Za-z]:/.test(trimmed))
        return undefined;
    const posix = trimmed.replaceAll('\\', '/');
    if (posix.startsWith('/'))
        return undefined;
    const parts = [];
    for (const part of posix.split('/')) {
        if (part === '' || part === '.')
            continue;
        if (part === '..')
            return undefined;
        parts.push(part);
    }
    return parts.join('/');
}
export function pathMatchesScope(path, pattern) {
    const normalizedPath = normalizeWorkspacePath(path);
    if (normalizedPath === undefined)
        return false;
    const rawPattern = pattern.trim().replaceAll('\\', '/');
    if (rawPattern.startsWith('~') || rawPattern.startsWith('/') || /^[A-Za-z]:/.test(rawPattern))
        return false;
    const directory = rawPattern.endsWith('/');
    const normalizedPattern = normalizeWorkspacePath(rawPattern);
    if (normalizedPattern === undefined) {
        return directory && (rawPattern === './' || rawPattern === '/' || rawPattern === '.');
    }
    if (directory || rawPattern === './' || rawPattern === '.') {
        if (normalizedPattern === '')
            return true;
        return normalizedPath === normalizedPattern || normalizedPath.startsWith(`${normalizedPattern}/`);
    }
    return normalizedPath === normalizedPattern;
}
/** Baseline exclusions applied before declared scope: secrets never count as in-scope. */
function isDefaultExcluded(path) {
    const normalized = normalizeWorkspacePath(path);
    if (normalized === undefined)
        return false;
    const segments = normalized.split('/');
    const base = segments[segments.length - 1] ?? '';
    if (segments[0] === '.git' || segments[0] === '.teams-x')
        return true;
    if (base === '.env' || base.startsWith('.env.'))
        return true;
    if (segments.includes('secrets'))
        return true;
    if (base.startsWith('id_rsa'))
        return true;
    return false;
}
export function classifyChangedPath(path, inScope = [], outOfScope = []) {
    if (normalizeWorkspacePath(path) === undefined)
        return 'illegal';
    if (isDefaultExcluded(path))
        return 'out_of_scope';
    if (outOfScope.some((pattern) => pathMatchesScope(path, pattern)))
        return 'out_of_scope';
    if (inScope.some((pattern) => pathMatchesScope(path, pattern)))
        return 'in_scope';
    return 'undeclared';
}
function nonemptyString(value) {
    return typeof value === 'string' && value.trim() !== '';
}
function nonemptyStringList(value) {
    return Array.isArray(value) && value.length > 0 && value.every(nonemptyString);
}
/** Normalize model-materialized blank optional fields (`""` → omitted). */
export function normalizeBlankOptionalTaskFields(input) {
    const next = { ...input };
    for (const key of Object.keys(next)) {
        const value = next[key];
        if (typeof value === 'string' && value.trim() === '')
            delete next[key];
    }
    for (const listKey of ['inScope', 'outOfScope', 'acceptance', 'verify', 'dependencies']) {
        const value = next[listKey];
        if (Array.isArray(value)) {
            const cleaned = value.filter((item) => typeof item === 'string' && item.trim() !== '');
            if (cleaned.length === 0)
                delete next[listKey];
            else
                next[listKey] = cleaned;
        }
    }
    return next;
}
/** Validate one create_task request against quality-gate contracts. */
export function validateCreateTask(tasks, input) {
    const kind = input.kind ?? 'work';
    if (!TASK_KINDS.includes(kind)) {
        return { ok: false, error: `unknown task kind "${String(kind)}"`, kind };
    }
    if (!nonemptyString(input.subject)) {
        return { ok: false, error: 'subject must be a non-empty string', kind };
    }
    if (isQualityKind(kind)) {
        if (!nonemptyString(input.objective)) {
            return { ok: false, error: `${kind} tasks require a non-empty objective`, kind };
        }
        if (!nonemptyStringList(input.acceptance)) {
            return { ok: false, error: `${kind} tasks require at least one acceptance criterion`, kind };
        }
    }
    if (WRITE_KINDS.includes(kind)) {
        if (!nonemptyStringList(input.inScope)) {
            return { ok: false, error: `${kind} tasks require a non-empty inScope`, kind };
        }
        if (!nonemptyStringList(input.verify)) {
            return { ok: false, error: `${kind} tasks require a non-empty verify list`, kind };
        }
    }
    if (kind === 'review') {
        const source = input.description?.trim() ?? '';
        if (source === '') {
            return { ok: false, error: 'review tasks require a description naming the reviewed task', kind };
        }
    }
    const dependencies = input.dependencies ?? [];
    for (const dependency of dependencies) {
        const upstream = tasks.find((item) => item.id === dependency);
        if (upstream === undefined) {
            return { ok: false, error: `dependency "${dependency}" does not exist`, kind };
        }
        if ((kind === 'repair' || kind === 'review')
            && (upstream.status === 'failed' || upstream.status === 'cancelled')) {
            return { ok: false, error: `${kind} must not depend on ${upstream.status} task "${dependency}"`, kind };
        }
    }
    if (WRITE_KINDS.includes(kind) && nonemptyStringList(input.inScope)) {
        const byId = new Map(tasks.map((task) => [task.id, task]));
        for (const other of tasks) {
            if (!WRITE_KINDS.includes(taskKindOf(other)))
                continue;
            if (!OPEN_STATUSES.includes(other.status))
                continue;
            if (dependencies.includes(other.id))
                continue;
            if (other.dependencies.some((id) => byId.get(id) === undefined))
                continue;
            const overlap = (input.inScope ?? []).filter((a) => (other.inScope ?? []).some((b) => (pathMatchesScope(a, b) || pathMatchesScope(b, a) || a === b)));
            if (overlap.length > 0) {
                return {
                    ok: false,
                    error: `inScope overlaps ${other.id} at ${overlap.join(', ')}; serialize these tasks or split the paths`,
                    kind,
                };
            }
        }
    }
    if (kind === 'implementation') {
        const requirements = tasks.filter((item) => taskKindOf(item) === 'requirements');
        const passed = requirements.some((item) => item.status === 'completed' && item.verdict === 'pass');
        if (requirements.length > 0 && !passed) {
            const coveredByDeps = requirements.some((item) => dependencies.includes(item.id));
            if (!coveredByDeps) {
                return {
                    ok: false,
                    error: 'implementation is blocked until a requirements task completes with verdict=pass; depend on the requirements task',
                    kind,
                };
            }
        }
    }
    return { ok: true, kind };
}
// v0.1 keeps the review loop declarative: review tasks name their reviewed
// task in the description until the v0.2 automatic repair loop needs an
// explicit reviewedTaskId field.
function openHighFindings(findings) {
    return (findings ?? []).filter((finding) => (finding.resolved !== true && (finding.severity === 'high' || finding.severity === 'blocker')));
}
function acceptanceCovered(required, results) {
    if (results === undefined)
        return false;
    const byCriterion = new Map(results.map((item) => [item.criterion, item]));
    if ((required ?? []).every((criterion) => byCriterion.get(criterion)?.status === 'passed'))
        return true;
    return results.length === (required ?? []).length && results.every((item) => item.status === 'passed');
}
function verifyCovered(required, results) {
    if (results === undefined)
        return false;
    const byCommand = new Map(results.map((item) => [item.command, item]));
    if ((required ?? []).every((command) => byCommand.get(command)?.status === 'passed'))
        return true;
    return results.length === (required ?? []).length && results.every((item) => item.status === 'passed');
}
/** The allowed task status transitions, keyed by current status. */
export const STATUS_TRANSITIONS = {
    pending: ['claimed', 'cancelled'],
    claimed: ['in_progress', 'failed', 'cancelled'],
    in_progress: ['completed', 'failed', 'cancelled'],
    completed: [],
    failed: [],
    cancelled: [],
};
export function transitionError(current, next) {
    if (current === next)
        return undefined;
    if (!STATUS_TRANSITIONS[current].includes(next)) {
        return `task status cannot move from "${current}" to "${next}"`;
    }
    return undefined;
}
/** Validate one completion/status update against the task's quality contract. */
export function evaluateQualityCompletion(task, update) {
    const nextStatus = update.status;
    if (nextStatus !== undefined && nextStatus !== task.status) {
        if (!STATUS_TRANSITIONS[task.status].includes(nextStatus)) {
            return { ok: false, error: `task status cannot move from "${task.status}" to "${nextStatus}"` };
        }
    }
    const kind = taskKindOf(task);
    if (kind === 'work')
        return { ok: true };
    const verdict = update.verdict ?? task.verdict;
    const findings = update.findings ?? task.findings;
    if (kind === 'review' || kind === 'requirements') {
        if (nextStatus === 'completed') {
            if (verdict === undefined)
                return { ok: false, error: `${kind} cannot complete without verdict=pass` };
            if (verdict !== 'pass')
                return { ok: false, error: `${kind} with verdict=${verdict} cannot complete` };
            if (openHighFindings(findings).length > 0) {
                return { ok: false, error: `${kind} pass cannot leave unresolved high/blocker findings` };
            }
        }
        if (nextStatus === 'failed' && (verdict === 'needs_revision' || verdict === 'reject')) {
            if ((findings ?? []).length < 1) {
                return { ok: false, error: `${kind} ${verdict} requires at least one finding` };
            }
        }
        return { ok: true };
    }
    if (kind === 'implementation' || kind === 'repair' || kind === 'verification' || kind === 'integration') {
        const commands = update.commandsRun ?? task.commandsRun;
        if (commands?.some((item) => item.status === 'failed') === true && nextStatus === 'completed') {
            return { ok: false, error: 'verify failure must fail the task' };
        }
        if (nextStatus !== 'completed')
            return { ok: true };
        const acceptanceResults = update.acceptanceResults ?? task.acceptanceResults;
        if (acceptanceResults === undefined || !acceptanceCovered(task.acceptance, acceptanceResults)) {
            return { ok: false, error: `${kind} completion requires passed acceptanceResults for every acceptance item` };
        }
        if (commands === undefined || !verifyCovered(task.verify, commands)) {
            return { ok: false, error: `${kind} completion requires a passed commandsRun entry for every verify command` };
        }
        if (kind === 'implementation' || kind === 'repair') {
            const changed = update.changedPaths ?? task.changedPaths;
            if (changed === undefined) {
                return { ok: false, error: `${kind} completion requires changedPaths` };
            }
            for (const path of changed) {
                const classification = classifyChangedPath(path, task.inScope ?? [], task.outOfScope ?? []);
                if (classification !== 'in_scope') {
                    return { ok: false, error: `${kind} cannot complete: ${path} is ${classification}` };
                }
            }
        }
    }
    return { ok: true };
}
/** Whether every task in the team reached a terminal state. */
export function allTasksTerminal(tasks) {
    return tasks.every((task) => TERMINAL_TASK_STATUSES.includes(task.status));
}
