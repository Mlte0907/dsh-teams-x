/**
 * Team activity snapshot assembly for the activity panel.
 *
 * Server-side assembly: read the durable team files (the truth source) and
 * enrich with live subagent activity, so the panel always reflects the
 * on-disk state even when a model skipped a tool call. Mailbox reads run in
 * parallel, and the dependency lookup map is built once per team.
 * @module dsh-teams-x/snapshot
 */

import type { Context } from '@deepseek-ai/cordis'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { memberActivity } from './members.ts'
import {
  CAPTAIN_KEY,
  listArchivedTeamIds,
  readArchivedTeam,
  readTeam,
  readUnreadMailbox,
  taskDepthsById,
  taskVisualState,
} from './state.ts'
import { TERMINAL_TASK_STATUSES, type TeamState, type TeamTask } from './types.ts'
// Snapshot view types live in the zero-import snapshot-types module so the
// browser panel can share them without pulling in the host graph.
import type {
  TeamActivityMember,
  TeamActivityMessage,
  TeamActivitySnapshot,
  TeamActivityTask,
} from './snapshot-types.ts'

export type {
  TeamActivityMember,
  TeamActivityMessage,
  TeamActivitySnapshot,
  TeamActivityTask,
} from './snapshot-types.ts'

/** Snapshot projection switches for live and archived teams. */
export interface TeamSnapshotOptions {
  /** Historic review must retain members that were marked removed at shutdown. */
  readonly includeRemoved?: boolean
  /** Archived teams have no meaningful live activity after their sessions stop. */
  readonly historic?: boolean
}

/** The current task of a member: its first in-progress owned task. */
function currentTaskOf(memberName: string, tasks: readonly TeamTask[]): string {
  for (const task of tasks) {
    if (task.status === 'in_progress' && task.assignee === memberName) return task.id
  }
  return ''
}

/** Compact `provider/model` route for the activity panel, or just the model. */
export function memberModelRoute(member: { provider?: string; model?: string } | undefined): string {
  if (member === undefined) return ''
  const provider = member.provider?.trim() ?? ''
  const model = member.model?.trim() ?? ''
  if (provider !== '' && model !== '') return `${provider}/${model}`
  return model
}

/**
 * Assemble one team snapshot from its durable files plus live activity.
 * @param ctx - the plugin context (injects `agents`, used for activity).
 * @param stateRoot - resolved absolute state root of the owning workspace.
 * @param workspace - display name of the owning workspace.
 * @param state - the durable team record.
 */
export async function assembleTeamSnapshot(
  ctx: Context,
  stateRoot: string,
  workspace: string,
  state: TeamState,
  options: TeamSnapshotOptions = {},
): Promise<TeamActivitySnapshot> {
  const tasks = state.tasks
  const depths = taskDepthsById(tasks)
  const byId = new Map(tasks.map((task) => [task.id, task]))
  const roster = options.includeRemoved === true
    ? state.members
    : state.members.filter((member) => member.status !== 'removed')
  const activity = options.historic === true
    ? new Map<string, 'running' | 'idle' | 'ready'>()
    : memberActivity(ctx, roster.map((member) => member.id))
  // Read all member mailboxes in parallel to avoid N sequential file reads.
  const unreadByMember = new Map<string, number>()
  const mailboxResults = await Promise.allSettled(
    roster.map(async (member) => {
      const messages = await readUnreadMailbox(stateRoot, state.id, member.name)
      return { name: member.name, count: messages.length }
    }),
  )
  for (let i = 0; i < roster.length; i += 1) {
    const memberName = roster[i]!.name
    const result = mailboxResults[i]
    if (result?.status === 'fulfilled') {
      unreadByMember.set(memberName, result.value.count)
    } else {
      if (result?.status === 'rejected') {
        ctx.logger.warn(`teams-x: mailbox read failed for ${memberName}: ${String(result.reason)}`)
      }
      unreadByMember.set(memberName, 0)
    }
  }
  const members: TeamActivityMember[] = roster.map((member) => {
    const owned = tasks.filter((task) => task.assignee === member.name)
    const done = owned.filter((task) => task.status === 'completed').length
    const live = member.id !== '' ? activity.get(member.id) : undefined
    return {
      id: member.id,
      name: member.name,
      role: member.role ?? '',
      provider: member.provider?.trim() ?? '',
      model: member.model?.trim() ?? '',
      status: member.status,
      activity: options.historic === true
        ? 'idle'
        : member.id !== ''
          ? (live === 'running' ? 'working' : live === 'idle' || live === 'ready' ? 'idle' : 'unknown')
          : state.phase === 'staged' ? 'idle' : 'unknown',
      progress: owned.length === 0 ? 0 : Math.round((done / owned.length) * 100),
      done,
      total: owned.length,
      currentTask: currentTaskOf(member.name, tasks),
      unread: unreadByMember.get(member.name) ?? 0,
    }
  })
  const captainInbox = await readUnreadMailbox(stateRoot, state.id, CAPTAIN_KEY)
  return {
    workspace,
    teamId: state.id,
    name: state.name,
    ...state.description !== undefined ? { description: state.description } : {},
    captainSessionId: state.captainSessionId,
    phase: state.phase ?? 'running',
    ...state.phase === 'staged'
      ? { planReviewState: state.planReviewState ?? 'awaiting_review' as const }
      : {},
    ...state.halted === true ? { halted: true } : {},
    members,
    tasks: tasks.map((task) => ({
      id: task.id,
      subject: task.subject,
      description: task.description ?? '',
      status: task.status,
      state: taskVisualState(task.status, task.dependencies, tasks, byId),
      assignee: task.assignee ?? '',
      model: memberModelRoute(roster.find((member) => member.name === task.assignee)),
      dependencies: task.dependencies,
      depth: depths.get(task.id) ?? 0,
      ...task.kind === undefined ? {} : { kind: task.kind },
      ...task.round === undefined ? {} : { round: task.round },
      ...task.verdict !== undefined ? { verdict: task.verdict } : {},
      ...task.attempt === undefined ? {} : { attempt: task.attempt },
      ...task.takenOverBy === undefined ? {} : { takenOverBy: task.takenOverBy },
      elapsedMs: Math.max(0, (TERMINAL_TASK_STATUSES.includes(task.status)
        ? task.updatedAt
        : Date.now()) - task.createdAt),
    })),
    messageCount: captainInbox.length
      + members.reduce((count, member) => count + member.unread, 0),
    captainInbox: captainInbox.slice(-5).map((message) => ({
      from: message.from,
      content: message.content,
    })),
  }
}

/**
 * Collect every team under the given workspace state roots.
 * @returns the snapshots in stable order (workspace, then team id).
 */
export async function collectTeamsActivity(
  ctx: Context,
  roots: readonly { workspace: string; stateRoot: string }[],
): Promise<TeamActivitySnapshot[]> {
  const snapshots: TeamActivitySnapshot[] = []
  for (const root of roots) {
    let entries
    try {
      entries = await readdir(root.stateRoot, { withFileTypes: true })
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        continue
      }
      throw error
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name === 'archive') continue
      try {
        const state = await readTeam(root.stateRoot, entry.name)
        if (state === undefined) continue
        snapshots.push(await assembleTeamSnapshot(ctx, root.stateRoot, root.workspace, state))
      } catch {
        ctx.logger.warn(`teams-x: skipped unreadable team state "${entry.name}" in workspace "${root.workspace}"`)
      }
    }
  }
  return snapshots
}

/**
 * Collect every archived team under the given workspace state roots (the
 * `archive/` subdirectory of each state root).
 */
export async function collectArchivedTeamsActivity(
  ctx: Context,
  roots: readonly { workspace: string; stateRoot: string }[],
): Promise<TeamActivitySnapshot[]> {
  const snapshots: TeamActivitySnapshot[] = []
  for (const root of roots) {
    for (const teamId of await listArchivedTeamIds(root.stateRoot)) {
      try {
        const state = await readArchivedTeam(root.stateRoot, teamId)
        if (state === undefined) continue
        snapshots.push(await assembleTeamSnapshot(
          ctx,
          join(root.stateRoot, 'archive'),
          root.workspace,
          state,
          { includeRemoved: true, historic: true },
        ))
      } catch {
        ctx.logger.warn(`teams-x: skipped unreadable archived team "${teamId}" in workspace "${root.workspace}"`)
      }
    }
  }
  return snapshots
}
