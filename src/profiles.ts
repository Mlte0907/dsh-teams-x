/**
 * Named team-profile templates: config types, normalization, invocation
 * parsing, and prompt rendering. Pure functions — no I/O, no spawn.
 *
 * Profiles let operators pre-define team rosters and seed tasks so
 * `teamsx_create({ profile: 'name' })` instantiates a known composition
 * instead of building from scratch every time.
 * @module dsh-teams-x/profiles
 */

/** Hard cap on named profiles so the usage prompt cannot grow without bound. */
export const MAX_TEAM_PROFILES = 16
/** Hard cap on seed tasks per profile. The software-delivery example has 13. */
export const MAX_PROFILE_TASKS = 32
/** Protocol excerpt length in the usage / prompt listing. */
export const PROFILE_PROTOCOL_PROMPT_LIMIT = 240

const MEMBER_KEYS = ['name', 'role', 'provider', 'model', 'reasoning_effort', 'executionPrompt', 'fallback'] as const
const TASK_KEYS = ['id', 'subject', 'description', 'assignee', 'dependencies'] as const
const PROFILE_FLAG_DASH = '--profile'
const PROFILE_FLAG_PLAIN = 'profile='

/** One member row in a named team-profile template (unresolved). */
export interface TeamModelFallbackConfig {
  readonly provider: string
  readonly model: string
}

export interface TeamProfileMemberConfig {
  readonly name: string
  readonly role?: string
  readonly provider?: string
  readonly model?: string
  readonly reasoning_effort?: string
  readonly executionPrompt?: string
  readonly fallback?: TeamModelFallbackConfig
}

/** One seed-task row in a named team-profile template (unresolved). */
export interface TeamProfileTaskConfig {
  readonly id: string
  readonly subject: string
  readonly description?: string
  readonly assignee?: string
  readonly dependencies?: string[]
}

/** One named team-profile template from plugin config. */
export interface TeamProfileConfig {
  readonly description?: string
  readonly protocol?: string
  readonly executionPrompt?: string
  readonly fallback?: TeamModelFallbackConfig
  readonly members: TeamProfileMemberConfig[]
  readonly tasks?: TeamProfileTaskConfig[]
  readonly taskPlanning?: 'captain' | 'seed'
  readonly reviewPolicy?: Record<string, unknown>
}

/** A profile member after trim / pairing / reserved-name checks. */
export interface NormalizedProfileMember {
  readonly name: string
  readonly role?: string
  readonly provider?: string
  readonly model?: string
  readonly reasoningEffort?: string
  readonly executionPrompt?: string
  readonly fallback?: TeamModelFallbackConfig
}

/** A profile seed task after assignee canonicalization; `sourceIndex` is the YAML order. */
export interface NormalizedProfileTask {
  readonly id: string
  readonly subject: string
  readonly description?: string
  readonly assignee?: string
  readonly dependencies: string[]
  readonly sourceIndex: number
}

/** A fully validated, topologically ordered team profile. */
export interface NormalizedTeamProfile {
  readonly name: string
  readonly description?: string
  readonly protocol?: string
  readonly executionPrompt?: string
  readonly fallback?: TeamModelFallbackConfig
  readonly taskPlanning: 'captain' | 'seed'
  readonly members: NormalizedProfileMember[]
  readonly tasks: NormalizedProfileTask[]
  readonly reviewPolicy?: Record<string, unknown>
}

/** The goal + optional named profile extracted from a slash / gesture line. */
export interface AgentTeamsInvocation {
  readonly goal: string
  readonly profile?: string
}

/** One configured profile after key trim, for listing / lookup. */
export interface ListedTeamProfile {
  readonly name: string
  readonly config: TeamProfileConfig
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function nonemptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function firstToken(input: string): string {
  const spaceIndex = input.indexOf(' ')
  return spaceIndex === -1 ? input : input.slice(0, spaceIndex)
}

function afterFirstToken(input: string): string {
  const spaceIndex = input.indexOf(' ')
  return spaceIndex === -1 ? '' : input.slice(spaceIndex + 1).trim()
}

/**
 * Trim every profile key once, reject empty / colliding keys, and reject
 * more than MAX_TEAM_PROFILES entries.
 */
export function listConfiguredProfiles(
  profiles: Record<string, TeamProfileConfig> | undefined | null,
): ListedTeamProfile[] {
  if (!profiles || typeof profiles !== 'object') return []
  const keys = Object.keys(profiles)
  if (keys.length > MAX_TEAM_PROFILES) {
    throw new Error(`too many AgentTeams profiles (${keys.length}); the limit is ${MAX_TEAM_PROFILES}`)
  }
  const seen = new Set<string>()
  const listed: ListedTeamProfile[] = []
  for (const rawKey of keys) {
    const name = rawKey.trim()
    if (name === '') throw new Error('configured AgentTeams profiles include an empty key')
    if (seen.has(name)) throw new Error(`configured AgentTeams profiles have duplicate key "${name}"`)
    seen.add(name)
    listed.push({ name, config: profiles[rawKey] as TeamProfileConfig })
  }
  return listed
}

/** Render the usage-prompt listing. One line per profile; empty when nothing is configured. */
export function formatProfilesForPrompt(
  profiles: Record<string, TeamProfileConfig> | undefined | null,
): string {
  const listed = listConfiguredProfiles(profiles)
  if (listed.length === 0) return ''
  const lines = [
    'Configured team profiles (pass profile= to teamsx_create):',
    ...listed.map((entry) => {
      const memberCount = entry.config.members?.length ?? 0
      const taskCount = entry.config.tasks?.length ?? 0
      const protocol = entry.config.protocol?.trim() ?? ''
      const protocolExcerpt = protocol.length > PROFILE_PROTOCOL_PROMPT_LIMIT
        ? `${protocol.slice(0, PROFILE_PROTOCOL_PROMPT_LIMIT)}…`
        : protocol
      return `- ${entry.name} (${memberCount} members, ${taskCount} tasks${protocolExcerpt !== '' ? `, protocol: ${protocolExcerpt}` : ''})`
    }),
  ]
  return lines.join('\n')
}

/**
 * Extract a leading profile flag from an invocation string. Only a leading
 * `--profile <name>`, `--profile=<name>`, or `profile=<name>` counts; any
 * other first token means the entire string is the goal. Pure string
 * tokenization — no shell execution, no regex evaluation.
 */
export function parseProfileInvocation(rawInput: string): AgentTeamsInvocation {
  const trimmed = rawInput.trim()
  if (trimmed === '') return { goal: '' }

  const head = firstToken(trimmed)
  const rest = afterFirstToken(trimmed)

  if (head === PROFILE_FLAG_DASH) {
    // --profile <name> <goal...>
    const name = firstToken(rest)
    if (name !== '') return { profile: name, goal: afterFirstToken(rest) }
    return { goal: trimmed }
  }
  if (head.startsWith(`${PROFILE_FLAG_DASH}=`)) {
    // --profile=<name> <goal...>
    return { profile: head.slice(PROFILE_FLAG_DASH.length + 1), goal: rest }
  }
  if (head.startsWith(PROFILE_FLAG_PLAIN)) {
    // profile=<name> <goal...>
    return { profile: head.slice(PROFILE_FLAG_PLAIN.length), goal: rest }
  }
  return { goal: trimmed }
}

/**
 * Normalize and pre-validate one named profile. Failures throw before any
 * caller should create a directory or spawn members.
 */
export function resolveTeamProfile(
  profiles: Record<string, TeamProfileConfig>,
  profileName: string,
  maxMembers: number,
): NormalizedTeamProfile {
  const listed = listConfiguredProfiles(profiles)
  const entry = listed.find((item) => item.name === profileName.trim())
  if (entry === undefined) throw new Error(`AgentTeams profile "${profileName}" not found`)
  const config = entry.config
  if (!isRecord(config)) throw new Error(`profile "${profileName}" config is not an object`)

  // ── members ──
  if (!Array.isArray(config.members) || config.members.length === 0) {
    throw new Error(`profile "${profileName}" must have at least one member`)
  }
  if (config.members.length > maxMembers) {
    throw new Error(`profile "${profileName}" has ${config.members.length} members; the limit is ${maxMembers}`)
  }
  const seenMemberNames = new Set<string>()
  const members: NormalizedProfileMember[] = config.members.map((raw: unknown) => {
    if (!isRecord(raw)) throw new Error(`profile "${profileName}" member is not an object`)
    for (const key of Object.keys(raw)) {
      if (!(MEMBER_KEYS as readonly string[]).includes(key)) {
        throw new Error(`profile "${profileName}" member has unknown key "${key}"`)
      }
    }
    if (!nonemptyString(raw['name'])) throw new Error(`profile "${profileName}" member missing non-empty name`)
    const name = raw['name'].trim()
    if (name.toLowerCase() === 'captain') throw new Error(`profile "${profileName}" member name "captain" is reserved`)
    if (seenMemberNames.has(name.toLowerCase())) throw new Error(`profile "${profileName}" duplicate member name "${name}"`)
    seenMemberNames.add(name.toLowerCase())
    const member: NormalizedProfileMember = {
      name,
      ...(nonemptyString(raw['role']) ? { role: raw['role'].trim() } : {}),
      ...(nonemptyString(raw['provider']) ? { provider: raw['provider'].trim() } : {}),
      ...(nonemptyString(raw['model']) ? { model: raw['model'].trim() } : {}),
      ...(nonemptyString(raw['reasoning_effort']) ? { reasoningEffort: raw['reasoning_effort'].trim() } : {}),
      ...(nonemptyString(raw['executionPrompt']) ? { executionPrompt: raw['executionPrompt'].trim() } : {}),
      ...(isRecord(raw['fallback']) && nonemptyString(raw['fallback']['provider']) && nonemptyString(raw['fallback']['model'])
        ? { fallback: { provider: raw['fallback']['provider'].trim(), model: raw['fallback']['model'].trim() } }
        : {}),
    }
    return member
  })

  // ── tasks ──
  const rawTasks = config.tasks
  if (rawTasks !== undefined && (!Array.isArray(rawTasks) || rawTasks.length > MAX_PROFILE_TASKS)) {
    throw new Error(`profile "${profileName}" tasks must be an array of at most ${MAX_PROFILE_TASKS} items`)
  }
  const taskPlanning: 'captain' | 'seed' = rawTasks !== undefined && rawTasks.length > 0 ? 'seed' : 'captain'
  const seedIdOrder: string[] = (rawTasks ?? []).map((t: unknown) => (isRecord(t) ? String(t['id'] ?? '') : ''))
  const tasks: NormalizedProfileTask[] = (rawTasks ?? []).map((raw: unknown, index: number) => {
    if (!isRecord(raw)) throw new Error(`profile "${profileName}" task ${index} is not an object`)
    for (const key of Object.keys(raw)) {
      if (!(TASK_KEYS as readonly string[]).includes(key)) {
        throw new Error(`profile "${profileName}" task has unknown key "${key}"`)
      }
    }
    if (!nonemptyString(raw['id'])) throw new Error(`profile "${profileName}" task ${index} missing non-empty id`)
    if (!nonemptyString(raw['subject'])) throw new Error(`profile "${profileName}" task ${index} missing non-empty subject`)
    const id = raw['id'].trim()
    // Remap seed-id dependencies to actual task ids (t1, t2, ...) in creation order
    const dependencies = (Array.isArray(raw['dependencies']) ? raw['dependencies'] : [])
      .filter(nonemptyString)
      .map((dep: string) => {
        const depIndex = seedIdOrder.indexOf(dep)
        return depIndex >= 0 ? `t${depIndex + 1}` : dep
      })
    const task: NormalizedProfileTask = {
      id,
      subject: raw['subject'].trim(),
      dependencies,
      sourceIndex: index,
      ...(nonemptyString(raw['description']) ? { description: raw['description'].trim() } : {}),
      ...(nonemptyString(raw['assignee']) ? { assignee: raw['assignee'].trim() } : {}),
    }
    return task
  })

  // ── dependency existence check ──
  const taskIds = new Set(tasks.map((task) => task.id))
  for (const task of tasks) {
    for (const dep of task.dependencies) {
      if (!taskIds.has(dep)) throw new Error(`profile "${profileName}" task "${task.id}" depends on unknown task "${dep}"`)
    }
  }

  // ── fallback ──
  let fallback: TeamModelFallbackConfig | undefined
  if (isRecord(config.fallback) && nonemptyString(config.fallback['provider']) && nonemptyString(config.fallback['model'])) {
    fallback = { provider: config.fallback['provider'].trim(), model: config.fallback['model'].trim() }
  }

  const normalized: NormalizedTeamProfile = {
    name: profileName.trim(),
    taskPlanning,
    members,
    tasks,
    ...(nonemptyString(config.description) ? { description: config.description.trim() } : {}),
    ...(nonemptyString(config.protocol) ? { protocol: config.protocol.trim() } : {}),
    ...(nonemptyString(config.executionPrompt) ? { executionPrompt: config.executionPrompt.trim() } : {}),
    ...(fallback !== undefined ? { fallback } : {}),
    ...(config.reviewPolicy !== undefined && isRecord(config.reviewPolicy) ? { reviewPolicy: config.reviewPolicy } : {}),
  }

  return normalized
}

/** Resolve the task-planning mode for a profile, defaulting to 'seed'. */
export function resolveProfileTaskPlanning(config: TeamProfileConfig | undefined): 'captain' | 'seed' {
  return config?.taskPlanning ?? 'seed'
}
