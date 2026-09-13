/**
 * TeamsX for DeepSeek Harness.
 *
 * A host-plane plugin that registers the `teamsx_*` tools and one usage
 * section into the global system prompt. After installation any session can
 * run multi-agent teamwork through natural language (e.g. "用 TeamsX 调研 X"):
 * the model creates a team (it becomes the captain), spawns members as
 * durable continuable subagents, breaks the goal into tasks with
 * dependencies, wakes members with messages, relays reports, and collects
 * results.
 *
 * The state dir is `.teams-x` and the tool namespace is `teamsx_*`, so this
 * * state stays isolated from any other team-mode plugins that may be mounted.
 *
 * @module dsh-teams-x
 */

import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
// Declaration merge only: makes ctx.llm, ctx.subagents, ctx.systemPrompt,
// ctx.agents and the client surfaces visible to the compiler.
import type {} from '@deepseek-ai/dsh-llm'
import type {} from '@deepseek-ai/dsh-subagent'
import type {} from '@deepseek-ai/dsh-system-prompt'
import type { SessionId } from '@deepseek-ai/dsh-session'
import type { WorkspaceRegistry } from '@deepseek-ai/dsh-workspace'
import { KNOWN_SESSION_EVENT_TYPES } from '@deepseek-ai/dsh-session'
import {
  haltTeamWork,
  parseStagedPlanMutations,
  registerTeamsXTools,
  type StagedPlanMutation,
  type ToolsConfig,
} from './tools.ts'
import { interruptMember } from './members.ts'
import { WEB_SERVER_KEYS, WORKSPACE_KEYS } from './compat.ts'
import { installKnownEventTypes } from './events.ts'
import { join } from 'node:path'
import { collectArchivedTeamsActivity, collectTeamsActivity } from './snapshot.ts'
import { findTeamByCaptain } from './state.ts'
import { authenticatedWebRoutes, type BrowserRequestGate, type WebRouteHost } from './web-routes.ts'
import { formatProfilesForPrompt, type TeamProfileConfig } from './profiles.ts'

export const name = 'teams-x'
export const inject = ['tools', 'llm', 'subagents', 'systemPrompt', 'agents']

/** Plugin configuration. */
export interface Config {
  /**
   * State directory name under the captain's workspace; team state lives at
   * `<workspace>/<stateDir>/<teamId>/` (default `.teams-x`).
   */
  stateDir?: string
  /** `ctx.subagents` provider used to spawn members (default `spawn`). */
  memberProvider?: string
  /** Optional model override applied to every member. */
  memberModel?: string
  /** Prompt injected into member personas and automatic task assignments. */
  executionPrompt?: string
  /** Plugin-wide fallback route for unavailable member models. */
  fallback?: { provider: string; model: string }
  /** Member delegation depth cap (default `1`; `0` forbids delegation). */
  memberMaxDepth?: number
  /** Team size cap in members (default `8`). */
  maxMembers?: number
  /** Prompt-section order for the usage policy (default `118`). */
  promptSectionOrder?: number
  /** Named team profile templates. */
  profiles?: Record<string, TeamProfileConfig>
}

const fallbackRouteConfig = z.union([
  z.object({ provider: z.string().required(), model: z.string().required() }),
  z.const(undefined),
])

export const Config: z<Config> = z.object({
  stateDir: z.string().default('.teams-x'),
  memberProvider: z.string().default('spawn'),
  memberModel: z.string(),
  executionPrompt: z.string(),
  fallback: fallbackRouteConfig,
  memberMaxDepth: z.natural().default(1),
  maxMembers: z.natural().min(1).default(8),
  promptSectionOrder: z.natural().default(118),
  profiles: z.any(),
})

/** The model-facing usage policy: when and how to drive TeamsX. */
export function usageSectionText(toolNames: string, profilesText?: string): string {
  const base = `When the user asks to run something with TeamsX (e.g. "use TeamsX to do X"), you are the captain of a multi-agent team. Follow this protocol:
1. Call teamsx_create with a team name, the goal as description, and approval="required". This creates a staged plan and must not spawn members or schedule work. Use approval="automatic" only when the user explicitly asks to skip review and run immediately. You can include profile=template-name in the description to use a configured team template.
2. Call teamsx_add_member once per role the goal needs (researcher, engineer, reviewer, ...). In staging these are editable roster entries, not running subagents. By default a member snapshots your current provider/model/reasoning route; use a different route only when the goal or user requires it.
3. Analyze the goal and create the smallest useful task DAG while staged. Every teamsx_create_task call must include a non-empty subject, including verification and review tasks. Independent work should be parallel; dependencies are only genuine prerequisites. When the complete roster and DAG are staged, ask the user to decide with the ask_user_question tool — one question, header "TeamsX 计划审批", options exactly ["批准并运行", "回聊天修改", "放弃计划"], question text summarizing the plan in one or two sentences. Map the answer: 批准并运行 → teamsx_approve (the user's selection counts as the explicit approval); 回聊天修改 → ask what to change, then teamsx_edit_plan, re-ask after revising; 放弃计划 → teamsx_delete. Never call teamsx_approve without that selection, and never call it during the planning turn.
4. After approval, the final member configuration is spawned atomically and the scheduler starts ready work. Lead by delegation: monitor with teamsx_status, send guidance with teamsx_send_message, and let idle teammates execute ready work. Do not duplicate a teammate's work merely because its turn is slow. If the user requires every member to contribute or report, create one task per required contribution (or message each member directly); never wait for an unassigned member to produce work it was never given.
5. If the user explicitly asks to pause a running member, its open attempt remains parked after interruption; after answering the user, send that same member guidance with teamsx_send_message so it continues the same attempt. If work must change owner, restart from scratch, or be taken over, call teamsx_reassign_task first. Use assignee=captain only for one ready task that you will personally drive to a terminal status in this same turn; this is a shadow takeover - the member keeps submit rights and its attempt stays valid, and ending your turn returns the task to them automatically (no reassign-back). Never start a second captain takeover while one is unfinished, and never end your turn with captain-owned work open.
6. Tasks carry attempt_id capabilities. Members must use the current attempt_id for updates; stale-attempt errors mean ownership changed. Check status after progress notifications until every task is terminal and every member is idle; do not busy-poll or require reports from members with no assigned work.
7. Quality kinds (requirements, implementation, verification, review, repair, integration) need a contract: non-empty objective and acceptance; implementation/repair also need inScope and verify. Review/requirements can complete only with verdict=pass; needs_revision/reject must fail with findings. Do not approve your own implementation.
8. Present the team's results to the user, then teamsx_delete the team unless the user wants to keep working with it. Stopping a team aborts the Captain's current turn as well as member work; only a later explicit user turn may resume it.

Tools: ${toolNames}`
  if (profilesText) {
    return `${base}

${profilesText}`
  }
  return base
}

export function apply(ctx: Context, config: Config): void {
  installKnownEventTypes(KNOWN_SESSION_EVENT_TYPES)
  const resolved: ToolsConfig = {
    stateDir: config.stateDir ?? '.teams-x',
    memberProvider: config.memberProvider ?? 'spawn',
    memberModel: config.memberModel,
    executionPrompt: config.executionPrompt,
    fallback: config.fallback,
    memberMaxDepth: config.memberMaxDepth ?? 1,
    maxMembers: config.maxMembers ?? 8,
    profiles: config.profiles,
  }

  const toolNames = [
    'teamsx_create',
    'teamsx_approve',
    'teamsx_edit_plan',
    'teamsx_add_member',
    'teamsx_remove_member',
    'teamsx_create_task',
    'teamsx_reassign_task',
    'teamsx_claim_task',
    'teamsx_update_task',
    'teamsx_send_message',
    'teamsx_status',
    'teamsx_resume',
    'teamsx_delete',
  ].join(', ')
  ctx.systemPrompt.section({
    name: 'teams-x:usage',
    order: config.promptSectionOrder ?? 118,
    text: () => usageSectionText(toolNames, formatProfilesForPrompt(config.profiles)),
  })

  const teamsXRuntime = registerTeamsXTools(ctx, resolved)

  // The activity panel data/halt routes need the Web server and the workspace
  // registry, which headless profiles do not mount; under concurrent
  // activation they may also bind after this plugin. Register the routes
  // lazily: try now, then on each service binding event. In a webless profile
  // the plugin stays tool-only and never blocks boot.
  let webRegistered = false
  const registerWebSurface = (): void => {
    if (webRegistered) return
    const rawWebServer = (ctx.get(WEB_SERVER_KEYS[0]) ?? ctx.get(WEB_SERVER_KEYS[1])) as WebRouteHost | undefined
    const workspaceRegistry = (ctx.get(WORKSPACE_KEYS[0]) ?? ctx.get(WORKSPACE_KEYS[1])) as WorkspaceRegistry | undefined
    if (rawWebServer === undefined || workspaceRegistry === undefined) return
    const webServer = authenticatedWebRoutes(rawWebServer, () => ctx.get('connection') as BrowserRequestGate | undefined)
    webRegistered = true

    // Activity panel data route: the browser panel polls this for team
    // snapshots (disk truth + live subagent activity).
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/plugins/dsh-teams-x/state',
      handler: async (req, res) => {
        const url = new URL(req.url ?? '/', 'http://x')
        const roots = workspaceRegistry.list().map((workspace) => ({
          workspace: workspace.title,
          stateRoot: join(workspace.path, resolved.stateDir),
        }))
        // ?archived=1 serves teams moved to archive/ (post-delete review).
        const snapshots = url.searchParams.get('archived') === '1'
          ? await collectArchivedTeamsActivity(ctx, roots)
          : await collectTeamsActivity(ctx, roots)
        const body = JSON.stringify({ teams: snapshots })
        res.writeHead(200, {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        })
        res.end(body)
      },
    }), 'teams-x: activity route')

    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/plugins/dsh-teams-x/halt',
      handler: async (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { allow: 'POST', 'cache-control': 'no-store' })
          res.end()
          return
        }
        let payload: { sessionId?: unknown; teamId?: unknown }
        try {
          const chunks: Buffer[] = []
          const raw = await new Promise<string>((resolve, reject) => {
            req.on('data', (chunk) => { chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)) })
            req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
            req.on('error', reject)
          })
          payload = raw.trim() === '' ? {} : JSON.parse(raw) as { sessionId?: unknown; teamId?: unknown }
        } catch {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'invalid request body' }))
          return
        }
        const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId.trim() : ''
        const teamId = typeof payload.teamId === 'string' ? payload.teamId.trim() : ''
        if (sessionId === '' || teamId === '') {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'sessionId and teamId are required' }))
          return
        }
        const captain = ctx.agents.get(sessionId as SessionId)
        if (captain === undefined) {
          res.writeHead(409, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'captain session is not attached' }))
          return
        }
        const workspace = captain.session.header.cwd ?? process.cwd()
        const stateRoot = join(workspace, resolved.stateDir)
        const team = await findTeamByCaptain(stateRoot, captain.id)
        if (team === undefined || team.id !== teamId) {
          res.writeHead(404, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'team not found for this captain' }))
          return
        }
        try {
          const result = await haltTeamWork({ ctx, stateRoot, teamId, captain })
          res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify(result))
        } catch (error: unknown) {
          ctx.logger.warn(`teams-x: halt failed for ${teamId}: ${String(error)}`)
          res.writeHead(500, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'failed to stop the team' }))
        }
      },
    }), 'teams-x: halt route')

    // Per-member pause: interrupt one working member's current turn. The
    // member's open attempt stays parked (the scheduler parks it on the idle
    // edge), so the captain can resume it with guidance later — the same
    // semantic as asking the captain to pause a member in chat.
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/plugins/dsh-teams-x/member/pause',
      handler: async (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { allow: 'POST', 'cache-control': 'no-store' })
          res.end()
          return
        }
        let payload: { sessionId?: unknown; teamId?: unknown; memberName?: unknown }
        try {
          const chunks: Buffer[] = []
          const raw = await new Promise<string>((resolve, reject) => {
            req.on('data', (chunk) => { chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)) })
            req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
            req.on('error', reject)
          })
          payload = raw.trim() === '' ? {} : JSON.parse(raw) as typeof payload
        } catch {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'invalid request body' }))
          return
        }
        const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId.trim() : ''
        const teamId = typeof payload.teamId === 'string' ? payload.teamId.trim() : ''
        const memberName = typeof payload.memberName === 'string' ? payload.memberName.trim() : ''
        if (sessionId === '' || teamId === '' || memberName === '') {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'sessionId, teamId, and memberName are required' }))
          return
        }
        const captain = ctx.agents.get(sessionId as SessionId)
        if (captain === undefined) {
          res.writeHead(409, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'captain session is not attached' }))
          return
        }
        const stateRoot = join(captain.session.header.cwd ?? process.cwd(), resolved.stateDir)
        const team = await findTeamByCaptain(stateRoot, captain.id)
        if (team === undefined || team.id !== teamId) {
          res.writeHead(404, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'team not found for this captain' }))
          return
        }
        const member = team.members.find((candidate) => candidate.name === memberName && candidate.status !== 'removed')
        if (member === undefined || member.id === '') {
          res.writeHead(404, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: `no active member "${memberName}"` }))
          return
        }
        try {
          interruptMember(ctx, captain, member.id)
          res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ ok: true, memberName, note: 'interrupt requested; the open attempt stays parked' }))
        } catch (error: unknown) {
          ctx.logger.warn(`teams-x: pause failed for ${memberName}: ${String(error)}`)
          res.writeHead(500, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'failed to pause the member' }))
        }
      },
    }), 'teams-x: member pause route')

    // Staged-plan review surface: approve / discard / return-to-chat. Approve
    // spawns every member and can take a while; the panel keeps a busy state
    // until the next snapshot flips the team to running.
    ctx.effect(() => webServer.register({
      kind: 'exact',
      path: '/plugins/dsh-teams-x/plan',
      handler: async (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { allow: 'POST', 'cache-control': 'no-store' })
          res.end()
          return
        }
        let payload: Record<string, unknown>
        try {
          const chunks: Buffer[] = []
          let size = 0
          const raw = await new Promise<string>((resolve, reject) => {
            req.on('data', (chunk) => {
              const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
              size += part.length
              if (size > 1_000_000) {
                reject(new Error('request body is too large'))
                return
              }
              chunks.push(part)
            })
            req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
            req.on('error', reject)
          })
          const parsed: unknown = raw.trim() === '' ? {} : JSON.parse(raw)
          if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('body must be an object')
          payload = parsed as Record<string, unknown>
        } catch (error: unknown) {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'invalid request body' }))
          return
        }
        const sessionId = typeof payload['sessionId'] === 'string' ? payload['sessionId'].trim() : ''
        const teamId = typeof payload['teamId'] === 'string' ? payload['teamId'].trim() : ''
        const action = typeof payload['action'] === 'string' ? payload['action'] : ''
        if (sessionId === '' || teamId === '' || action === '') {
          res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'sessionId, teamId, and action are required' }))
          return
        }
        const captain = ctx.agents.get(sessionId as SessionId)
        if (captain === undefined) {
          res.writeHead(409, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'captain session is not attached' }))
          return
        }
        const stateRoot = join(captain.session.header.cwd ?? process.cwd(), resolved.stateDir)
        const team = await findTeamByCaptain(stateRoot, captain.id)
        if (team === undefined || team.id !== teamId) {
          res.writeHead(404, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: 'team not found for this captain' }))
          return
        }
        try {
          if (action === 'edit') {
            let mutations: StagedPlanMutation[]
            try {
              mutations = parseStagedPlanMutations(payload['mutations'])
            } catch (error: unknown) {
              res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
              res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'invalid mutations' }))
              return
            }
            const updated = await teamsXRuntime.updateStagedPlanBatch(captain, teamId, mutations)
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
            res.end(JSON.stringify({ ok: true, phase: 'staged', review: 'awaiting_review', teamId: updated.id, members: updated.members.length, tasks: updated.tasks.length }))
            return
          }
          if (action === 'approve') {
            const approved = await teamsXRuntime.approveStagedTeam(captain, teamId)
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
            res.end(JSON.stringify({ ok: true, phase: 'running', ...approved }))
            return
          }
          if (action === 'continue') {
            const continued = await teamsXRuntime.continueStagedPlanning(captain, teamId)
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
            res.end(JSON.stringify({ ok: true, phase: 'staged', review: 'awaiting_feedback', ...continued }))
            return
          }
          if (action === 'discard') {
            const discarded = await teamsXRuntime.discardStagedTeam(captain, teamId)
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
            res.end(JSON.stringify({ ok: true, phase: 'archived', ...discarded }))
            return
          }
          throw new Error(`unknown plan action "${action}"`)
        } catch (error: unknown) {
          ctx.logger.warn(`teams-x: plan ${action} failed for ${teamId}: ${String(error)}`)
          res.writeHead(409, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
          res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'plan action failed' }))
        }
      },
    }), 'teams-x: plan review route')
  }

  registerWebSurface()
  ctx.on('internal/service', (name) => {
    if (WEB_SERVER_KEYS.includes(name as (typeof WEB_SERVER_KEYS)[number])
      || WORKSPACE_KEYS.includes(name as (typeof WORKSPACE_KEYS)[number])) {
      registerWebSurface()
    }
  })
}
