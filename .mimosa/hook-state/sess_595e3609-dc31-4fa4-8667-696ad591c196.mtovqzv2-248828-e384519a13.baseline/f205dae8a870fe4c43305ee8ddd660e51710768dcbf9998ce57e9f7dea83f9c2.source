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

import { createHash, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  TERMINAL_TASK_STATUSES,
  type TaskStatus,
  type TeamMember,
  type TeamMessage,
  type TeamState,
  type TeamTask,
} from './types.ts'

/** Mailbox key of the captain. */
export const CAPTAIN_KEY = 'captain'
/** Durable deny-list for members that must never be resumed. */
const RETIRED_MEMBERS_FILE = 'retired-members.json'
/** Reverse index file at the state root (session id → team id). */
const INDEX_FILE = 'index.json'
/** A crashed live-delivery attempt becomes retryable after this interval. */
const MAILBOX_DELIVERY_LEASE_MS = 60_000

/** In-process per-team mutation queues (promise chains). */
const locks = new Map<string, Promise<unknown>>()

/**
 * Serialize mutations of one scope across the whole process.
 * @param key - the mutation scope (team id, retired-members root, …).
 * @param fn - the mutation to run exclusively.
 * @returns the mutation's result.
 */
export async function withTeamLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const previous = locks.get(key) ?? Promise.resolve()
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  const tail = previous.then(() => gate)
  locks.set(key, tail)
  await previous
  try {
    return await fn()
  } finally {
    release()
    // Delete the map entry when no later waiter chained onto this tail, so
    // finished teams do not accumulate stale promise references.
    if (locks.get(key) === tail) locks.delete(key)
  }
}

/** Longest key emitted before truncating and appending a digest. */
const MAX_KEY_LENGTH = 48

/** Short stable digest, used to keep otherwise-colliding keys distinct. */
function keyDigest(name: string): string {
  return createHash('sha256').update(name).digest('hex').slice(0, 8)
}

/**
 * Fold a free-form name into a safe path/key segment. Unicode letters and
 * digits survive (CJK/Cyrillic stay distinct); everything else folds to `-`.
 * Over-long names are truncated with a digest appended.
 */
export function sanitizeKey(name: string): string {
  const cleaned = name.normalize('NFC').trim().toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  if (cleaned === '') return `k-${keyDigest(name)}`
  const points = [...cleaned]
  if (points.length > MAX_KEY_LENGTH) {
    return `${points.slice(0, MAX_KEY_LENGTH).join('')}-${keyDigest(name)}`
  }
  return cleaned
}

// ── atomic write primitives ──

/** Rename attempts before falling back to a direct overwrite. */
const ATOMIC_RENAME_RETRIES = 3
/** Pause between rename attempts. */
const ATOMIC_RENAME_RETRY_DELAY_MS = 50
/** Rename error codes worth retrying (Windows transient locks). */
const RETRYABLE_RENAME_CODES = new Set(['EPERM', 'EACCES', 'EBUSY', 'EEXIST', 'ENOTEMPTY'])

function isRetryableRenameError(error: unknown): boolean {
  return error instanceof Error
    && 'code' in error
    && RETRYABLE_RENAME_CODES.has((error as NodeJS.ErrnoException).code ?? '')
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Atomically replace one UTF-8 file from a same-directory temp file. */
async function atomicWriteText(file: string, content: string): Promise<void> {
  const temporary = `${file}.${process.pid}.${randomUUID()}.tmp`
  try {
    await writeFile(temporary, content, { encoding: 'utf8', flag: 'wx' })
  } catch (error: unknown) {
    await rm(temporary, { force: true }).catch(() => undefined)
    throw error
  }
  for (let attempt = 0; ; attempt += 1) {
    try {
      await rename(temporary, file)
      return
    } catch (error: unknown) {
      if (isRetryableRenameError(error) && attempt < ATOMIC_RENAME_RETRIES) {
        await sleep(ATOMIC_RENAME_RETRY_DELAY_MS)
        continue
      }
      // Content is already fully written to the temp file, so a direct
      // overwrite is a content-equivalent degraded path (Windows EPERM).
      let fallbackError: unknown
      try {
        await writeFile(file, content, 'utf8')
      } catch (writeError: unknown) {
        fallbackError = writeError
      }
      await rm(temporary, { force: true }).catch(() => undefined)
      if (fallbackError !== undefined) {
        throw new AggregateError(
          [error, fallbackError],
          `failed to replace "${file}" atomically (${String(error)}) or by direct write (${String(fallbackError)})`,
        )
      }
      return
    }
  }
}

// ── reverse index (session id → team id) ──

interface TeamsIndex {
  /** Captain session id → team id. */
  captains: Record<string, string>
  /** Member session id → team id. */
  members: Record<string, string>
}

function emptyIndex(): TeamsIndex {
  return { captains: {}, members: {} }
}

function indexMemberOf(state: TeamState): TeamsIndex {
  const index = emptyIndex()
  index.captains[state.captainSessionId] = state.id
  for (const member of state.members) {
    if (member.id !== '' && member.status !== 'removed') index.members[member.id] = state.id
  }
  return index
}

async function writeIndex(stateRoot: string, index: TeamsIndex): Promise<void> {
  await mkdir(stateRoot, { recursive: true })
  await atomicWriteText(join(stateRoot, INDEX_FILE), JSON.stringify(index))
}

async function readIndex(stateRoot: string): Promise<TeamsIndex | undefined> {
  try {
    const raw = await readFile(join(stateRoot, INDEX_FILE), 'utf8')
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return undefined
    const record = parsed as Record<string, unknown>
    if (typeof record['captains'] !== 'object' || record['captains'] === null) return undefined
    if (typeof record['members'] !== 'object' || record['members'] === null) return undefined
    return { captains: record['captains'] as TeamsIndex['captains'], members: record['members'] as TeamsIndex['members'] }
  } catch {
    return undefined
  }
}

/**
 * Add one team's identities to the reverse index under the state-root lock.
 * Read-modify-write of the whole index keeps concurrent team creations safe.
 */
async function indexTeam(stateRoot: string, state: TeamState): Promise<void> {
  await withTeamLock(`index:${stateRoot}`, async () => {
    const index = (await readIndex(stateRoot)) ?? emptyIndex()
    const member = indexMemberOf(state)
    Object.assign(index.captains, member.captains)
    Object.assign(index.members, member.members)
    await writeIndex(stateRoot, index)
  })
}

/** Drop one team's stale identities from the reverse index. */
async function unindexTeam(stateRoot: string, teamId: string): Promise<void> {
  await withTeamLock(`index:${stateRoot}`, async () => {
    const index = (await readIndex(stateRoot)) ?? emptyIndex()
    for (const key of Object.keys(index.captains)) {
      if (index.captains[key] === teamId) delete index.captains[key]
    }
    for (const key of Object.keys(index.members)) {
      if (index.members[key] === teamId) delete index.members[key]
    }
    await writeIndex(stateRoot, index)
  })
}

// ── durable validation ──

/** Remove the optional UTF-8 BOM some editors prepend to JSON text. */
function stripLeadingBom(value: string): string {
  return value.charCodeAt(0) === 0xFEFF ? value.slice(1) : value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string'
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isTeamMember(value: unknown): value is TeamMember {
  if (!isRecord(value)) return false
  return typeof value['id'] === 'string'
    && typeof value['name'] === 'string'
    && value['name'].trim() !== ''
    && isOptionalString(value['role'])
    && isOptionalString(value['provider'])
    && isOptionalString(value['model'])
    && isOptionalString(value['reasoningEffort'])
    && isOptionalString(value['activeProvider'])
    && isOptionalString(value['activeModel'])
    && (value['executionPrompt'] === undefined || typeof value['executionPrompt'] === 'string')
    && (value['fallback'] === undefined
      || (isRecord(value['fallback'])
        && typeof value['fallback']['provider'] === 'string'
        && typeof value['fallback']['model'] === 'string'))
    && (value['fallbackActive'] === undefined || typeof value['fallbackActive'] === 'boolean')
    && isFiniteNumber(value['joinedAt'])
    && (value['status'] === 'idle' || value['status'] === 'working' || value['status'] === 'removed')
}

function isValidTaskStatus(value: unknown): value is TaskStatus {
  return value === 'pending' || value === 'claimed' || value === 'in_progress'
    || value === 'completed' || value === 'failed' || value === 'cancelled'
}

function isTeamTask(value: unknown): value is TeamTask {
  if (!isRecord(value)) return false
  return typeof value['id'] === 'string'
    && typeof value['subject'] === 'string'
    && isValidTaskStatus(value['status'])
    && isOptionalString(value['description'])
    && isOptionalString(value['assignee'])
    && Array.isArray(value['dependencies'])
    && value['dependencies'].every((dependency) => typeof dependency === 'string')
    && isOptionalString(value['output'])
    && (value['attempt'] === undefined
      || (Number.isSafeInteger(value['attempt']) && (value['attempt'] as number) >= 0))
    && isOptionalString(value['attemptId'])
    && isOptionalString(value['handoffId'])
    && (value['reassigning'] === undefined || typeof value['reassigning'] === 'boolean')
    && (value['kind'] === undefined || typeof value['kind'] === 'string')
    && isFiniteNumber(value['createdAt'])
    && isFiniteNumber(value['updatedAt'])
}

function isTeamState(value: unknown, expectedId: string): value is TeamState {
  if (!isRecord(value)) return false
  const shape = value['id'] === expectedId
    && typeof value['name'] === 'string'
    && value['name'].trim() !== ''
    && isOptionalString(value['description'])
    && typeof value['captainSessionId'] === 'string'
    && value['captainSessionId'] !== ''
    && isFiniteNumber(value['createdAt'])
    && Array.isArray(value['members'])
    && value['members'].every(isTeamMember)
    && Array.isArray(value['tasks'])
    && value['tasks'].every(isTeamTask)
    && Number.isSafeInteger(value['taskSeq'])
    && (value['taskSeq'] as number) >= 0
    && (value['phase'] === undefined || value['phase'] === 'staged' || value['phase'] === 'running')
    && (value['planReviewState'] === undefined
      || value['planReviewState'] === 'awaiting_review'
      || value['planReviewState'] === 'awaiting_feedback')
    && (value['approvedAt'] === undefined || isFiniteNumber(value['approvedAt']))
    && (value['halted'] === undefined || typeof value['halted'] === 'boolean')
    && (value['haltedAt'] === undefined || isFiniteNumber(value['haltedAt']))
  if (!shape) return false
  const staged = value['phase'] === 'staged'
  const memberKeys = new Set<string>()
  const memberIds = new Set<string>()
  for (const member of value['members'] as TeamMember[]) {
    const key = sanitizeKey(member.name)
    if ((!staged && member.id === '') || key === CAPTAIN_KEY || memberKeys.has(key)) return false
    if (member.id !== '') {
      if (memberIds.has(member.id)) return false
      memberIds.add(member.id)
    }
    memberKeys.add(key)
  }
  const taskIds = new Set<string>()
  for (const task of value['tasks'] as TeamTask[]) {
    if (task.id === '' || taskIds.has(task.id)) return false
    taskIds.add(task.id)
  }
  return true
}

/**
 * Tolerate legacy or hand-edited records instead of bricking the team on
 * reload: blank optional strings collapse to omitted, and unknown enum values
 * coerce to their nearest meaning (any unrecognized `phase` reads as
 * `running`; an unrecognized `planReviewState` is dropped). Structural
 * violations (missing/ill-typed required fields) still reject, with the
 * reason available via {@link describeTeamStateError}.
 */
function coerceTeamState(value: unknown, expectedId: string): TeamState | undefined {
  if (!isRecord(value) || !Array.isArray(value['tasks'])) return undefined
  const tasks = (value['tasks'] as unknown[]).map((task) => {
    if (!isRecord(task)) return task
    const cleaned: Record<string, unknown> = { ...task }
    for (const key of Object.keys(cleaned)) {
      if (typeof cleaned[key] === 'string' && (cleaned[key] as string).trim() === '') delete cleaned[key]
    }
    // Only OPTIONAL list fields may collapse to omitted. `dependencies` is a
    // required structural field (isTeamTask enforces the array): dropping it
    // here would brick every team whose task has no prerequisites — the exact
    // failure mode the reference implementation avoids by never touching it.
    for (const listKey of ['inScope', 'outOfScope', 'acceptance', 'verify']) {
      const list = cleaned[listKey]
      if (Array.isArray(list)) {
        const filtered = list.filter((item) => typeof item === 'string' && item.trim() !== '')
        if (filtered.length === 0) delete cleaned[listKey]
        else cleaned[listKey] = filtered
      }
    }
    // Required structure: dependencies always materializes as a string array.
    const dependencies = cleaned['dependencies']
    cleaned['dependencies'] = Array.isArray(dependencies)
      ? dependencies.filter((item): item is string => typeof item === 'string')
      : []
    return cleaned
  })
  const coerced: Record<string, unknown> = { ...value, tasks }
  // Enum tolerance: a hand-edited or future-phase value maps to its nearest
  // meaning rather than invalidating the whole durable record.
  if (coerced['phase'] !== undefined && coerced['phase'] !== 'staged') {
    coerced['phase'] = 'running'
  }
  if (coerced['phase'] !== 'staged' || (coerced['planReviewState'] !== 'awaiting_review'
    && coerced['planReviewState'] !== 'awaiting_feedback')) {
    delete coerced['planReviewState']
  }
  return isTeamState(coerced, expectedId) ? coerced : undefined
}

/**
 * Describe the first reason a (raw, pre-coercion) team record would fail
 * validation, walking every isTeamState check in order. Best-effort and
 * verbose by design: an unusable durable record must never masquerade as a
 * generic failure.
 */
export function describeTeamStateError(value: unknown, expectedId: string): string {
  if (!isRecord(value)) return 'team.json is not a JSON object'
  if (value['id'] !== expectedId) return `id ${JSON.stringify(value['id'])} does not match directory "${expectedId}"`
  if (typeof value['name'] !== 'string' || (value['name'] as string).trim() === '') return 'name must be a non-empty string'
  if (!isOptionalString(value['description'])) return 'description must be a string when present'
  if (typeof value['captainSessionId'] !== 'string' || (value['captainSessionId'] as string) === '') return 'captainSessionId must be a non-empty string'
  if (!isFiniteNumber(value['createdAt'])) return 'createdAt must be a finite number'
  if (!Array.isArray(value['members'])) return 'members must be an array'
  const members = value['members'] as unknown[]
  const badMember = members.findIndex((member) => !isTeamMember(member))
  if (badMember >= 0) return `members[${badMember}] is not a valid member record (needs string id/name, finite joinedAt, status idle|working|removed)`
  if (!Array.isArray(value['tasks'])) return 'tasks must be an array'
  const tasks = value['tasks'] as unknown[]
  const badTask = tasks.findIndex((task) => !isTeamTask(task))
  if (badTask >= 0) return `tasks[${badTask}] is not a valid task record (needs id/subject/status/dependencies/createdAt/updatedAt)`
  if (!Number.isSafeInteger(value['taskSeq']) || (value['taskSeq'] as number) < 0) return 'taskSeq must be a non-negative safe integer'
  if (value['phase'] !== undefined && value['phase'] !== 'staged' && value['phase'] !== 'running') {
    return `phase ${JSON.stringify(value['phase'])} is unrecognized (expected "staged" or "running")`
  }
  if (value['planReviewState'] !== undefined
    && value['planReviewState'] !== 'awaiting_review'
    && value['planReviewState'] !== 'awaiting_feedback') {
    return `planReviewState ${JSON.stringify(value['planReviewState'])} is unrecognized (expected "awaiting_review" or "awaiting_feedback")`
  }
  if (value['approvedAt'] !== undefined && !isFiniteNumber(value['approvedAt'])) return 'approvedAt must be a finite number'
  if (value['halted'] !== undefined && typeof value['halted'] !== 'boolean') return 'halted must be a boolean'
  if (value['haltedAt'] !== undefined && !isFiniteNumber(value['haltedAt'])) return 'haltedAt must be a finite number'
  const staged = value['phase'] === 'staged'
  const memberKeys = new Set<string>()
  const memberIds = new Set<string>()
  for (const [index, member] of (value['members'] as TeamMember[]).entries()) {
    const key = sanitizeKey(member.name)
    if (!staged && member.id === '') return `members[${index}] has an empty id on a non-staged team`
    if (key === CAPTAIN_KEY) return `members[${index}] name collides with the reserved captain key`
    if (memberKeys.has(key)) return `members[${index}] name "${member.name}" collides with an earlier member`
    if (member.id !== '' && memberIds.has(member.id)) return `members[${index}] id collides with an earlier member`
    memberKeys.add(key)
    if (member.id !== '') memberIds.add(member.id)
  }
  const taskIds = new Set<string>()
  for (const [index, task] of (value['tasks'] as TeamTask[]).entries()) {
    if (task.id === '') return `tasks[${index}] has an empty id`
    if (taskIds.has(task.id)) return `tasks[${index}] id "${task.id}" collides with an earlier task`
    taskIds.add(task.id)
  }
  return 'no rule identified the failure (post-coercion state still rejected — file a bug)'
}

/**
 * Scan the state root and report each team's loadability. Used to enrich
 * authorization errors: a team that exists but fails validation must not
 * masquerade as "no team at all".
 */
export async function stateRootDiagnostics(
  stateRoot: string,
): Promise<Array<{ id: string; valid: boolean; error?: string }>> {
  let entries
  try {
    entries = await readdir(stateRoot, { withFileTypes: true })
  } catch {
    return []
  }
  const report: Array<{ id: string; valid: boolean; error?: string }> = []
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'archive') continue
    try {
      const team = await readTeam(stateRoot, entry.name)
      report.push({ id: entry.name, valid: team !== undefined, ...team === undefined ? { error: 'unreadable' } : {} })
    } catch (error: unknown) {
      report.push({ id: entry.name, valid: false, error: error instanceof Error ? error.message : String(error) })
    }
  }
  return report
}

// ── team CRUD ──

/** Create the team directory structure and the initial team record. */
export async function createTeamDir(stateRoot: string, state: TeamState): Promise<void> {
  const dir = join(stateRoot, state.id)
  await mkdir(join(dir, 'inbox'), { recursive: true })
  await atomicWriteText(join(dir, 'team.json'), JSON.stringify(state, null, 2))
  await indexTeam(stateRoot, state)
}

/**
 * Persist one team record (inside the caller's lock). The reverse index is
 * NOT touched here: status-only writes leave the identity set unchanged, and
 * any real drift (member add/remove) is repaired by the next index miss via
 * the self-healing scan. Call identity-mutating paths should invoke
 * {@link reindexTeam} explicitly.
 */
export async function writeTeam(stateRoot: string, state: TeamState): Promise<void> {
  await atomicWriteText(join(stateRoot, state.id, 'team.json'), JSON.stringify(state, null, 2))
}

/** Refresh one team's reverse-index entries after its identity set changed. */
export async function reindexTeam(stateRoot: string, state: TeamState): Promise<void> {
  await indexTeam(stateRoot, state)
}

/** Read one team record; `undefined` when absent. */
export async function readTeam(stateRoot: string, teamId: string): Promise<TeamState | undefined> {
  try {
    const raw = await readFile(join(stateRoot, teamId, 'team.json'), 'utf8')
    const value: unknown = JSON.parse(stripLeadingBom(raw))
    const team = coerceTeamState(value, teamId)
    if (team === undefined) {
      throw new Error(`invalid TeamsX state in team "${teamId}": ${describeTeamStateError(value, teamId)}`)
    }
    return team
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined
    }
    throw error
  }
}

/** Synchronously read one team record while a continuable child is composed. */
export function readTeamSync(stateRoot: string, teamId: string): TeamState | undefined {
  try {
    const raw = readFileSync(join(stateRoot, teamId, 'team.json'), 'utf8')
    const value: unknown = JSON.parse(stripLeadingBom(raw))
    const team = coerceTeamState(value, teamId)
    if (team === undefined) {
      throw new Error(`invalid TeamsX state in team "${teamId}": ${describeTeamStateError(value, teamId)}`)
    }
    return team
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined
    }
    throw error
  }
}

/**
 * Rescan every team directory and rebuild the reverse index. Used when the
 * index missed or disagrees with disk; the scan is the durable truth.
 */
async function rebuildIndex(stateRoot: string): Promise<void> {
  const index = emptyIndex()
  let entries
  try {
    entries = await readdir(stateRoot, { withFileTypes: true })
  } catch {
    await writeIndex(stateRoot, index)
    return
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'archive') continue
    try {
      const team = await readTeam(stateRoot, entry.name)
      if (team === undefined) continue
      const member = indexMemberOf(team)
      Object.assign(index.captains, member.captains)
      Object.assign(index.members, member.members)
    } catch {
      // Unreadable team directories stay out of the index; the scan path
      // reports them individually.
    }
  }
  await writeIndex(stateRoot, index)
}

async function scanForParticipant(
  stateRoot: string,
  agentSessionId: string,
): Promise<TeamState | undefined> {
  let entries
  try {
    entries = await readdir(stateRoot, { withFileTypes: true })
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return undefined
    }
    throw error
  }
  let found: TeamState | undefined
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'archive') continue
    const team = await readTeam(stateRoot, entry.name).catch(() => undefined)
    const participates = team !== undefined
      && (team.captainSessionId === agentSessionId
        || team.members.some((member) => member.id === agentSessionId && member.status !== 'removed'))
    if (participates) {
      if (found !== undefined && found.id !== team?.id) {
        throw new Error(`agent session belongs to multiple active teams ("${found.id}", "${team?.id}"); the target team is ambiguous`)
      }
      found = team
    }
  }
  return found
}

/**
 * Authoritative scan: return EVERY team in the state root the session
 * participates in (captain or member), bypassing the reverse index. The
 * index is a cache and can drift (crash, restart, hand edit) — invariant
 * checks like "one active team per captain" must never trust it.
 */
export async function listTeamsForParticipant(
  stateRoot: string,
  agentSessionId: string,
): Promise<TeamState[]> {
  let entries
  try {
    entries = await readdir(stateRoot, { withFileTypes: true })
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
  const matches: TeamState[] = []
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'archive') continue
    const team = await readTeam(stateRoot, entry.name).catch(() => undefined)
    if (team === undefined) continue
    const participates = team.captainSessionId === agentSessionId
      || team.members.some((member) => member.id === agentSessionId && member.status !== 'removed')
    if (participates) matches.push(team)
  }
  return matches
}

/**
 * Find the team in which one session is an active participant, via the
 * reverse index with a self-healing full-scan fallback.
 * @param stateRoot - resolved absolute state root directory.
 * @param agentSessionId - calling captain/member session id.
 */
export async function findTeamByParticipant(
  stateRoot: string,
  agentSessionId: string,
): Promise<TeamState | undefined> {
  const index = await readIndex(stateRoot)
  if (index !== undefined) {
    const teamId = index.captains[agentSessionId] ?? index.members[agentSessionId]
    if (teamId !== undefined) {
      const team = await readTeam(stateRoot, teamId).catch(() => undefined)
      const participates = team !== undefined
        && (team.captainSessionId === agentSessionId
          || team.members.some((member) => member.id === agentSessionId && member.status !== 'removed'))
      if (participates) return team
    } else {
      const scanned = await scanForParticipant(stateRoot, agentSessionId)
      // Only pay for a rebuild when the scan found something the index missed.
      if (scanned !== undefined) {
        await rebuildIndex(stateRoot).catch(() => undefined)
        return scanned
      }
      return undefined
    }
  }
  // No (or corrupt) index: scan is the durable truth, then rebuild.
  const scanned = await scanForParticipant(stateRoot, agentSessionId)
  if (scanned !== undefined) await rebuildIndex(stateRoot).catch(() => undefined)
  return scanned
}

/** Find the team owned by one captain session (at most one per captain). */
export async function findTeamByCaptain(
  stateRoot: string,
  captainSessionId: string,
): Promise<TeamState | undefined> {
  const team = await findTeamByParticipant(stateRoot, captainSessionId)
  if (team !== undefined && team.captainSessionId !== captainSessionId) return undefined
  return team
}

/** Remove a team's whole directory (members should be interrupted first). */
export async function removeTeamDir(stateRoot: string, teamId: string): Promise<void> {
  await rm(join(stateRoot, teamId), { recursive: true, force: true })
  await unindexTeam(stateRoot, teamId)
}

/**
 * Archive a team instead of deleting it: the whole directory moves under
 * `<stateRoot>/archive/<teamId>/` so later sessions can review how tasks
 * were planned. The live activity scan skips the archive naturally.
 */
export async function archiveTeamDir(stateRoot: string, teamId: string): Promise<void> {
  const archiveRoot = join(stateRoot, 'archive')
  await mkdir(archiveRoot, { recursive: true })
  await renameWithRetry(join(stateRoot, teamId), join(archiveRoot, teamId))
  await unindexTeam(stateRoot, teamId)
}

/** `rename` with the same transient retry policy as the state-file write. */
async function renameWithRetry(from: string, to: string): Promise<void> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      await rename(from, to)
      return
    } catch (error: unknown) {
      if (isRetryableRenameError(error) && attempt < ATOMIC_RENAME_RETRIES) {
        await sleep(ATOMIC_RENAME_RETRY_DELAY_MS)
        continue
      }
      throw error
    }
  }
}

/** Read one archived team (already moved under `archive/`), or undefined. */
export async function readArchivedTeam(stateRoot: string, teamId: string): Promise<TeamState | undefined> {
  return readTeam(join(stateRoot, 'archive'), teamId)
}

/** List every archived team id under the state root. */
export async function listArchivedTeamIds(stateRoot: string): Promise<string[]> {
  try {
    const entries = await readdir(join(stateRoot, 'archive'), { withFileTypes: true })
    return entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => entry.name)
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

// ── retired members ──

/** In-process cache for retired member sets, keyed by stateRoot. */
const retiredMembersCache = new Map<string, Set<string>>()

/** Read the durable set of member session ids retired by remove/delete. */
export async function readRetiredMemberIds(stateRoot: string): Promise<Set<string>> {
  const cached = retiredMembersCache.get(stateRoot)
  if (cached !== undefined) return cached
  try {
    const parsed: unknown = JSON.parse(stripLeadingBom(
      await readFile(join(stateRoot, RETIRED_MEMBERS_FILE), 'utf8'),
    ))
    if (!Array.isArray(parsed) || parsed.some((value) => typeof value !== 'string' || value === '')) {
      throw new Error('invalid TeamsX retired member index')
    }
    const result = new Set(parsed)
    retiredMembersCache.set(stateRoot, result)
    return result
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      const empty = new Set<string>()
      retiredMembersCache.set(stateRoot, empty)
      return empty
    }
    throw error
  }
}

/** Atomically add session ids to the durable retired-member deny-list. */
export async function recordRetiredMemberIds(stateRoot: string, memberIds: readonly string[]): Promise<void> {
  const additions = memberIds.filter((id) => id !== '')
  if (additions.length === 0) return
  await withTeamLock(`retired-members:${stateRoot}`, async () => {
    const retired = await readRetiredMemberIds(stateRoot)
    for (const id of additions) retired.add(id)
    await mkdir(stateRoot, { recursive: true })
    await atomicWriteText(
      join(stateRoot, RETIRED_MEMBERS_FILE),
      `${JSON.stringify([...retired].sort(), null, 2)}\n`,
    )
    // Invalidate so the next read reflects disk truth even after a partial failure.
    retiredMembersCache.delete(stateRoot)
  })
}

// ── mailboxes ──

/** Build a fresh message record. */
export function createMessage(from: string, to: string, content: string): TeamMessage {
  return { id: randomUUID(), from, to, content, ts: Date.now() }
}

/**
 * Append one message to an agent's mailbox (JSONL). Callers must hold the
 * team lock: the sanitizeKey normalizer may map different agent names to the
 * same file, so the team-level lock is the serialization boundary.
 */
export async function appendMailbox(
  stateRoot: string,
  teamId: string,
  agentKey: string,
  message: TeamMessage,
): Promise<void> {
  const file = join(stateRoot, teamId, 'inbox', `${sanitizeKey(agentKey)}.jsonl`)
  await mkdir(join(stateRoot, teamId, 'inbox'), { recursive: true })
  let existing = ''
  try {
    existing = await readFile(file, 'utf8')
  } catch (error: unknown) {
    if (!(error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT')) {
      throw error
    }
  }
  const separator = existing !== '' && !existing.endsWith('\n') ? '\n' : ''
  await atomicWriteText(file, `${existing}${separator}${JSON.stringify(message)}\n`)
}

/** Whether a parsed mailbox record is structurally valid. */
function isTeamMessage(value: unknown): value is TeamMessage {
  if (!isRecord(value)) return false
  return typeof value['id'] === 'string'
    && typeof value['from'] === 'string'
    && typeof value['to'] === 'string'
    && typeof value['content'] === 'string'
    && isFiniteNumber(value['ts'])
    && (value['deliveryClaimedAt'] === undefined || isFiniteNumber(value['deliveryClaimedAt']))
    && (value['deliveredAt'] === undefined || isFiniteNumber(value['deliveredAt']))
    && (value['readAt'] === undefined || isFiniteNumber(value['readAt']))
}

/**
 * Read one agent's whole mailbox, oldest first. Malformed records are
 * skipped (reported via `onMalformedLine`) so one damaged line cannot make
 * the whole team unreadable.
 */
export async function readMailbox(
  stateRoot: string,
  teamId: string,
  agentKey: string,
  onMalformedLine?: (lineNumber: number, error: unknown) => void,
): Promise<TeamMessage[]> {
  const file = join(stateRoot, teamId, 'inbox', `${sanitizeKey(agentKey)}.jsonl`)
  try {
    const raw = await readFile(file, 'utf8')
    const messages: TeamMessage[] = []
    for (const [index, rawLine] of raw.split('\n').entries()) {
      const line = stripLeadingBom(rawLine)
      if (line.trim() === '') continue
      let value: unknown
      try {
        value = JSON.parse(line)
      } catch {
        onMalformedLine?.(index + 1, new Error('invalid JSON'))
        continue
      }
      if (!isTeamMessage(value)) {
        onMalformedLine?.(index + 1, new Error('invalid message shape'))
        continue
      }
      messages.push(value)
    }
    return messages
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

/** Read only messages that have not been acknowledged by their recipient. */
export async function readUnreadMailbox(
  stateRoot: string,
  teamId: string,
  agentKey: string,
  onMalformedLine?: (lineNumber: number, error: unknown) => void,
): Promise<TeamMessage[]> {
  const now = Date.now()
  return (await readMailbox(stateRoot, teamId, agentKey, onMalformedLine))
    .filter((message) => message.readAt === undefined
      && (message.deliveryClaimedAt === undefined
        || now - message.deliveryClaimedAt >= MAILBOX_DELIVERY_LEASE_MS))
}

async function mutateMailbox(
  stateRoot: string,
  teamId: string,
  agentKey: string,
  messageIds: readonly string[],
  mutate: (message: TeamMessage) => TeamMessage,
): Promise<void> {
  if (messageIds.length === 0) return
  const file = join(stateRoot, teamId, 'inbox', `${sanitizeKey(agentKey)}.jsonl`)
  let raw: string
  try {
    raw = await readFile(file, 'utf8')
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') return
    throw error
  }
  const selected = new Set(messageIds)
  const lines = raw.split('\n').map((rawLine) => {
    const line = stripLeadingBom(rawLine)
    if (line.trim() === '') return rawLine
    try {
      const value: unknown = JSON.parse(line)
      if (!isTeamMessage(value) || !selected.has(value.id)) return rawLine
      return JSON.stringify(mutate(value))
    } catch {
      return rawLine
    }
  })
  await atomicWriteText(file, lines.join('\n'))
}

/** Lease selected fallback messages to one delivery path. */
export async function claimMailboxDelivery(
  stateRoot: string,
  teamId: string,
  agentKey: string,
  messageIds: readonly string[],
): Promise<void> {
  const now = Date.now()
  await mutateMailbox(stateRoot, teamId, agentKey, messageIds, (message) => ({
    ...message,
    deliveryClaimedAt: now,
  }))
}

/** Release a failed delivery lease so the scheduler can retry it later. */
export async function releaseMailboxDelivery(
  stateRoot: string,
  teamId: string,
  agentKey: string,
  messageIds: readonly string[],
): Promise<void> {
  await mutateMailbox(stateRoot, teamId, agentKey, messageIds, (message) => {
    const { deliveryClaimedAt: _claimed, ...released } = message
    return released
  })
}

/** Mark selected durable mailbox records delivered/read. */
export async function acknowledgeMailbox(
  stateRoot: string,
  teamId: string,
  agentKey: string,
  messageIds: readonly string[],
): Promise<void> {
  const now = Date.now()
  await mutateMailbox(stateRoot, teamId, agentKey, messageIds, (message) => {
    const { deliveryClaimedAt: _claimed, ...rest } = message
    return { ...rest, deliveredAt: message.deliveredAt ?? now, readAt: message.readAt ?? now }
  })
}

// ── task attempt lifecycle ──

/** Activate the task's current generation for one owner and return its capability id. */
export function activateTaskAttempt(task: TeamTask, assignee: string): string {
  const attemptId = randomUUID()
  task.status = 'claimed'
  task.assignee = assignee
  task.attemptId = attemptId
  task.handoffId = undefined
  task.reassigning = false
  task.output = undefined
  task.updatedAt = Date.now()
  return attemptId
}

/** Start a fresh task generation for one owner. */
export function beginTaskAttempt(task: TeamTask, assignee: string): string {
  task.attempt = (task.attempt ?? 0) + 1
  return activateTaskAttempt(task, assignee)
}

/** Cancel one unfinished task without returning it to the ready pool. */
export function cancelUnfinishedTask(task: TeamTask, output?: string): void {
  if (TERMINAL_TASK_STATUSES.includes(task.status)) return
  task.status = 'cancelled'
  task.attemptId = undefined
  task.handoffId = undefined
  task.reassigning = false
  if (output !== undefined) task.output = output
  task.updatedAt = Date.now()
}

/**
 * Revoke the current worker immediately. Clearing its capability makes old
 * updates stale; a separate handoff generation serializes async quiescence.
 */
export function invalidateTaskAttempt(task: TeamTask, nextAssignee?: string, reassigning = false): void {
  task.attemptId = undefined
  task.handoffId = randomUUID()
  task.status = 'pending'
  task.assignee = nextAssignee
  task.reassigning = reassigning
  task.output = undefined
  task.updatedAt = Date.now()
}

// ── pure task-graph helpers ──

/**
 * Whether `dependencies` are all satisfied (every named task exists and
 * completed) for the given task list.
 * @param byId - optional pre-built lookup map for hot loops.
 */
export function unsatisfiedDependencies(
  tasks: readonly TeamTask[],
  dependencies: readonly string[],
  byId?: Map<string, TeamTask>,
): string[] {
  const lookup = byId ?? new Map(tasks.map((task) => [task.id, task]))
  return dependencies.filter((id) => lookup.get(id)?.status !== 'completed')
}

/** Visual task state for the activity panel. */
export type VisualTaskState = 'blocked' | 'open' | 'running' | 'completed' | 'failed' | 'cancelled'

/**
 * The visual state of one task. Pass a pre-built `byId` map when called in a
 * loop over the same task list.
 */
export function taskVisualState(
  status: string,
  dependencies: readonly string[],
  tasks: readonly TeamTask[],
  byId?: Map<string, TeamTask>,
): VisualTaskState {
  if (status === 'completed') return 'completed'
  if (status === 'failed') return 'failed'
  if (status === 'cancelled') return 'cancelled'
  if (status === 'in_progress') return 'running'
  const lookup = byId ?? new Map(tasks.map((task) => [task.id, task]))
  const openDependency = dependencies.some((dependencyId) => {
    const dependency = lookup.get(dependencyId)
    return dependency !== undefined && dependency.status !== 'completed'
  })
  return openDependency ? 'blocked' : 'open'
}

/** Longest dependency path depth per task id (each depth = one lane column). */
export function taskDepthsById(tasks: readonly TeamTask[]): Map<string, number> {
  const byId = new Map(tasks.map((task) => [task.id, task]))
  const depths = new Map<string, number>()
  const visiting = new Set<string>()
  const depthOf = (taskId: string): number => {
    const cached = depths.get(taskId)
    if (cached !== undefined) return cached
    if (visiting.has(taskId)) return 0
    const task = byId.get(taskId)
    if (task === undefined) return 0
    visiting.add(taskId)
    const dependencies = task.dependencies
      .filter((dependencyId) => byId.has(dependencyId))
      .sort()
    const depth = dependencies.length === 0
      ? 0
      : 1 + Math.max(...dependencies.map(depthOf))
    visiting.delete(taskId)
    depths.set(taskId, depth)
    return depth
  }
  for (const task of tasks) depthOf(task.id)
  return depths
}
