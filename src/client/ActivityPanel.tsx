/**
 * TeamsX activity panel, mounted as a session-scoped header action.
 *
 * The badge registers into `conversation.session.header.actions` (next to the
 * autonomous-mode and Session-log controls), so it only ever exists inside an
 * open session's title bar. The framework resolves `sessionId` for
 * session-scoped slots, and the badge renders nothing unless a team belongs
 * to THIS session (captain or member id match) — switching to a session that
 * never used TeamsX shows no badge at all.
 *
 * The expanded panel portals to document.body as a fixed-position card
 * anchored under the badge; placement probes elementFromPoint so third-party
 * higher-layer docks (better-sidebar) cannot cover it.
 * @module dsh-teams-x/client/ActivityPanel
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement, RefObject } from 'react'
import { createPortal } from 'react-dom'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import css from './ActivityPanel.module.css'
import {
  ACTIVITY_ICONS,
  GlyphClose,
  GlyphPause,
  GlyphProgress,
  GlyphRefresh,
  ROLE_ICONS,
  VISUAL_STATE_ICONS,
  TeamsXLogo,
  type IconComponent,
} from './icons.ts'
import type { TeamsXLocaleKey } from './locale-keys.ts'
import type { TeamActivitySnapshot } from '../snapshot-types.ts'
import type { TeamsXSessionNavigator } from './session-navigation.ts'
import { StagedPlanEditor } from './StagedPlanEditor.tsx'
import { onTeamsXPanelRequest } from './open-request.ts'

/** Panel data endpoint served by the host plane. */
export const TEAMSX_STATE_URL = '/plugins/dsh-teams-x/state'
/** Halt endpoint served by the host plane. */
export const TEAMSX_HALT_URL = '/plugins/dsh-teams-x/halt'
/** Per-member pause endpoint served by the host plane. */
export const TEAMSX_PAUSE_URL = '/plugins/dsh-teams-x/member/pause'
/** Staged-plan review endpoint served by the host plane. */
export const TEAMSX_PLAN_URL = '/plugins/dsh-teams-x/plan'
/** Poll cadence for the live view. */
export const POLL_INTERVAL_MS = 4_000
/** Collapsed discovery cadence: slow, but fast enough to notice a team the
 * session creates after this badge mounted. */
export const DISCOVERY_INTERVAL_MS = 10_000

/** Locale formatter supplied by the harness locale service. */
export type PanelTranslate = (key: TeamsXLocaleKey, params?: Record<string, string | number>) => string

export interface ActivityPanelProps
  extends PropsRuntime<'conversation.session.header.actions'>, PropsLocale<'teamsX'> {
  /** Client sessions service, used to open member transcripts. */
  readonly sessions: TeamsXSessionNavigator
  /** Open one member's transcript (wired by the plugin shell). */
  readonly openMember: (parentId: TeamActivitySnapshot['captainSessionId'], childId: string) => void
}

interface StateResponse {
  teams: TeamActivitySnapshot[]
}

/** Interpolate `{key}` params into a locale string. */
function format(template: string, params: Record<string, string | number> | undefined): string {
  if (params === undefined) return template
  return template.replace(/\{(\w+)\}/gu, (match, key: string) => (
    Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match
  ))
}

/** Wrap the harness translate function with interpolation. */
function makeT(t: PanelTranslate): (key: TeamsXLocaleKey, params?: Record<string, string | number>) => string {
  return (key, params) => format(t(key, params), params)
}

/** Fetch the state endpoint (live or archived). */
async function fetchTeams(viewMode: 'live' | 'archive'): Promise<TeamActivitySnapshot[]> {
  const url = viewMode === 'archive'
    ? `${TEAMSX_STATE_URL}?archived=1`
    : TEAMSX_STATE_URL
  const response = await fetch(url, { headers: { accept: 'application/json' } })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const body = await response.json() as StateResponse
  return body.teams
}

/**
 * Fetch team snapshots. `live` mode polls (slow cadence when collapsed,
 * fast when expanded); `archive` mode fetches once on mount and on
 * explicit reload only (static historical data, no auto-refresh).
 */
function useTeamData(expanded: boolean, viewMode: 'live' | 'archive'): {
  teams: TeamActivitySnapshot[]
  error?: string
  loading: boolean
  reload: () => void
} {
  const [teams, setTeams] = useState<TeamActivitySnapshot[]>([])
  const [error, setError] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let disposed = false
    const load = async (): Promise<void> => {
      setLoading(true)
      try {
        const data = await fetchTeams(viewMode)
        if (!disposed) {
          setTeams(data)
          setError(undefined)
        }
      } catch (cause: unknown) {
        if (!disposed) setError(cause instanceof Error ? cause.message : String(cause))
      } finally {
        if (!disposed) setLoading(false)
      }
    }
    void load()
    if (viewMode === 'archive') {
      // Static historical data — fetch once, then only on explicit reload.
      return () => { disposed = true }
    }
    const interval = expanded ? POLL_INTERVAL_MS : DISCOVERY_INTERVAL_MS
    const timer = window.setInterval(() => { void load() }, interval)
    return () => {
      disposed = true
      window.clearInterval(timer)
    }
  }, [expanded, viewMode, tick])

  return { teams, error, loading, reload: () => setTick((value) => value + 1) }
}

/**
 * Detect narrow viewports (mobile web / remote): the expanded panel renders
 * as a full-width bottom sheet instead of a badge-anchored dropdown.
 */
function useIsNarrow(): boolean {
  const [isNarrow, setIsNarrow] = useState(() => window.matchMedia('(max-width: 768px)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const onChange = (e: MediaQueryListEvent): void => { setIsNarrow(e.matches) }
    mq.addEventListener('change', onChange)
    return () => { mq.removeEventListener('change', onChange) }
  }, [])
  return isNarrow
}

/**
 * Place the expanded panel under the badge, cleared below the session tab
 * bar. Placement runs ONCE on open (plus on resize): no periodic re-probing,
 * so the panel never visibly jumps after settling.
 *
 * (2026-09-12) Horizontal anchor switched from the badge's right edge to its
 * LEFT edge: the badge sits mid-header, so right-edge anchoring pushed the
 * 400px card into the content area's top-left corner — visually detached from
 * the badge and covering the transcript. Opening to the right of the badge
 * keeps the card visually attached to its trigger; a clamp keeps it inside
 * the viewport on narrow desktops.
 */
function usePanelPlacement(
  badgeRef: RefObject<HTMLElement | null>,
  panelRef: RefObject<HTMLDivElement | null>,
  expanded: boolean,
): { top: number; left: number } {
  const [pos, setPos] = useState({ top: 96, left: 96 })
  useEffect(() => {
    if (!expanded) return
    const place = (): void => {
      const badge = badgeRef.current
      if (badge === null) return
      const rect = badge.getBoundingClientRect()
      // Clear the session tab strip ("对话/轨迹/…") as the user asked: anchor
      // under whichever is lower — the badge or the tab bar.
      const tablist = document.querySelector('[role="tablist"]')
      const tablistBottom = tablist === null ? 0 : tablist.getBoundingClientRect().bottom
      let top = Math.max(rect.bottom + 6, tablistBottom + 8, 8)
      const maxH = Math.min(window.innerHeight * 0.72, 640)
      if (top + maxH > window.innerHeight - 8) {
        top = Math.max(8, window.innerHeight - maxH - 8)
      }
      const panel = panelRef.current
      const width = panel?.getBoundingClientRect().width ?? 0
      let left = rect.left
      if (width > 0 && left + width > window.innerWidth - 8) left = window.innerWidth - width - 8
      left = Math.max(8, left)
      setPos((prev) => (prev.top === top && prev.left === left ? prev : { top, left }))
    }
    place()
    window.addEventListener('resize', place)
    let resizeObserver: ResizeObserver | undefined
    const badgeEl = badgeRef.current
    if (badgeEl !== null && typeof ResizeObserver !== 'undefined') {
      const parent = badgeEl.offsetParent
      if (parent !== null) {
        resizeObserver = new ResizeObserver(() => place())
        resizeObserver.observe(parent)
      }
    }
    return () => {
      window.removeEventListener('resize', place)
      resizeObserver?.disconnect()
    }
  }, [badgeRef, panelRef, expanded])
  return pos
}

/** POST the halt route for one team. */
async function haltTeam(captainSessionId: string, teamId: string): Promise<void> {
  const response = await fetch(TEAMSX_HALT_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId: captainSessionId, teamId }),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` })) as { error?: string }
    throw new Error(body.error ?? `HTTP ${response.status}`)
  }
}

/** POST the pause route for one member (interrupt; attempt stays parked). */
async function pauseMember(captainSessionId: string, teamId: string, memberName: string): Promise<void> {
  const response = await fetch(TEAMSX_PAUSE_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId: captainSessionId, teamId, memberName }),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` })) as { error?: string }
    throw new Error(body.error ?? `HTTP ${response.status}`)
  }
}

/** One member row of the roster. */
/** Compact token formatter: 1234 → 1.2k, 45600 → 45.6k. */
function formatTokens(n: number): string {
  if (n < 1000) return String(n)
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`
  return `${(n / 1_000_000).toFixed(1)}M`
}

function MemberRow({ member, team, t, openMember, readOnly }: {
  member: TeamActivitySnapshot['members'][number]
  team: TeamActivitySnapshot
  t: ReturnType<typeof makeT>
  openMember: ActivityPanelProps['openMember']
  readOnly?: boolean
}): ReactElement {
  const [pausing, setPausing] = useState(false)
  const [pauseError, setPauseError] = useState<string | undefined>(undefined)
  const roleKey = (member.role?.trim().toLowerCase() ?? '') as keyof typeof ROLE_ICONS
  const RoleIcon = ROLE_ICONS[roleKey] as IconComponent | undefined
  const ActivityIcon = ACTIVITY_ICONS[member.activity] as IconComponent | undefined
  const stateKey = (member.activity === 'working' ? 'member.state.working'
    : member.activity === 'idle' ? 'member.state.idle'
      : 'member.state.unknown') as TeamsXLocaleKey
  const openable = member.id !== ''

  const pause = async (): Promise<void> => {
    setPausing(true)
    setPauseError(undefined)
    try {
      await pauseMember(team.captainSessionId, team.teamId, member.name)
    } catch (cause: unknown) {
      setPauseError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setPausing(false)
    }
  }

  return (
    <div className={css.memberRow} data-activity={member.activity}>
      <span className={css.memberIcon}>
        {RoleIcon !== undefined
          ? <RoleIcon size={18} decorative />
          : <TeamsXLogo size={18} label={member.name} />}
      </span>
      <div className={css.memberMain}>
        <div className={css.memberTop}>
          <span className={css.memberName} title={member.name}>
            {openable ? (
              <button
                type='button'
                className={css.memberLink}
                onClick={() => { openMember(team.captainSessionId, member.id) }}
                title={t('member.openSession')}
              >
                {member.name}
              </button>
            ) : member.name}
          </span>
          {member.unread > 0 && (
            <span className={css.memberUnread} title={t('member.unread', { count: member.unread })}>{member.unread}</span>
          )}
          <span className={css.memberState}>
            {ActivityIcon !== undefined && <ActivityIcon size={14} className={
              member.activity === 'working' ? css.animPulse
                : member.activity === 'idle' ? css.animThink
                  : undefined
            } decorative />}
        {t(stateKey)}
        {!readOnly && member.activity === 'working' && (
          <button
            type='button'
            className={css.memberPause}
            onClick={() => { void pause() }}
            disabled={pausing}
            aria-label={t('member.pause')}
            title={t('member.pause')}
          >
            {pausing ? '…' : <GlyphPause size={11} decorative />}
          </button>
        )}
          </span>
        </div>
        <div className={css.memberSub}>
          <span className={css.memberMeta}>
            {pauseError ?? member.model}
            {member.usage !== undefined && (
              <span className={css.memberTokens} title="累计 token（token-meter）">
                {` · ↑${formatTokens(member.usage.inputTokens)} ↓${formatTokens(member.usage.outputTokens)}`}
              </span>
            )}
          </span>
          <span className={css.memberProgress} title={t('member.progress', { done: member.done, total: member.total })}>
            <span className={css.memberProgressBar} aria-hidden>
              <span
                className={css.memberProgressFill}
                style={{ width: `${member.progress}%` }}
                data-active={member.progress > 0 && member.progress < 100 || undefined}
                data-done={member.progress >= 100 || undefined}
              />
            </span>
            {t('member.progress', { done: member.done, total: member.total })}
          </span>
        </div>
      </div>
    </div>
  )
}

/** Humanize a millisecond duration for the task-age badge. */
function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  if (totalSeconds < 60) return `${totalSeconds}s`
  const minutes = Math.floor(totalSeconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours < 24) return rest === 0 ? `${hours}h` : `${hours}h${rest}m`
  return `${Math.floor(hours / 24)}d${hours % 24}h`
}

/** One task row of the DAG list, with depth strip, dependency tags, and status colors. */
function TaskRow({ task, t }: { task: TeamActivitySnapshot['tasks'][number]; t: ReturnType<typeof makeT> }): ReactElement {
  const StateIcon = VISUAL_STATE_ICONS[task.state] as IconComponent | undefined
  const statusKey = `task.status.${task.status}` as TeamsXLocaleKey
  const visualKey = `task.visual.${task.state}` as TeamsXLocaleKey
  const assignee = task.assignee === '' ? t('task.assignee.shared')
    : task.assignee === 'captain' ? t('task.assignee.captain')
      : task.assignee
  return (
    <div className={css.taskRow} data-state={task.state} data-depth={task.depth}>
      {/* Depth lane: a colored strip indicating the dependency level. The cell is
          ALWAYS rendered, empty at depth 0, because the row is a 6-column grid
          whose cells must map 1:1 onto its six children: skipping the cell made
          every later child shift one column left, which pushed the subject into
          the 30px id column (rendered as "需…") and the status into the flexible
          subject column (2026-09-10, visible on mobile). */}
      <span className={css.taskLane} aria-hidden>
        {task.depth > 0 && Array.from({ length: Math.min(task.depth, 4) }, (_, i) => (
          <span key={i} className={css.taskLaneSegment} data-depth={i} />
        ))}
      </span>
      <span className={css.taskIcon}>{StateIcon !== undefined && <StateIcon size={14} className={task.state === 'running' ? css.animPulse : undefined} decorative />}</span>
      <span className={css.taskId}>{task.id}</span>
      <span className={css.taskSubject} title={task.description || task.subject}>
        <span className={css.taskSubjectText}>{task.subject}</span>
        <span className={css.taskBadgeRow}>
          {task.dependencies.length > 0 && (
            <span className={css.taskDepList}>
              {task.dependencies.map((dep) => (
                <span key={dep} className={css.taskDepTag}>{dep}</span>
              ))}
            </span>
          )}
          {task.round !== undefined && task.round > 0 && (
            <span className={css.taskBadge} data-badge="round" title={`第 ${task.round} 轮修复`}>R{task.round}</span>
          )}
          {task.kind === 'repair' && task.dependencies.length > 0 && (
            <span className={css.taskBadge} data-badge="source" title={`修复自 ${task.dependencies[0]}`}>↻ {task.dependencies[0]}</span>
          )}
          {task.takenOverBy === 'captain' && (
            <span className={css.taskBadge} data-badge="taken" title="队长影子接管中：成员保留提交权">队长接管</span>
          )}
          {task.verdict !== undefined && (
            <span className={css.taskBadge} data-badge={task.verdict}>
              {task.verdict === 'pass' ? 'pass' : task.verdict === 'needs_revision' ? '待修' : '拒绝'}
            </span>
          )}
          {typeof task.elapsedMs === 'number' && (
            <span className={css.taskBadge} data-badge="elapsed" title="任务耗时">{formatElapsed(task.elapsedMs)}</span>
          )}
          {typeof task.progressCount === 'number' && task.progressCount > 0 && (
            <span className={css.taskBadge} data-badge="progress" title={task.progressLatest ?? ''}>
              <GlyphProgress size={10} decorative />
              {task.progressCount}
            </span>
          )}
        </span>
      </span>
      <span className={css.taskAssignee}>{assignee}</span>
      <span className={css.taskStatus} title={t(visualKey)}>{t(statusKey)}</span>
    </div>
  )
}

/** POST one staged-plan review action. */
async function planAction(
  captainSessionId: string,
  teamId: string,
  action: 'approve' | 'discard' | 'continue',
): Promise<void> {
  const response = await fetch(TEAMSX_PLAN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ sessionId: captainSessionId, teamId, action }),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` })) as { error?: string }
    throw new Error(body.error ?? `HTTP ${response.status}`)
  }
}

/** The staged-plan review bar: approve, return-to-chat, and discard (2-step). */
function PlanReviewBar({ team, t }: { team: TeamActivitySnapshot; t: ReturnType<typeof makeT> }): ReactElement {
  const [busy, setBusy] = useState<'approve' | 'discard' | 'continue' | undefined>(undefined)
  const [discardArmed, setDiscardArmed] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const runnable = team.members.length > 0 && team.tasks.length > 0

  const run = async (action: 'approve' | 'discard' | 'continue'): Promise<void> => {
    setBusy(action)
    setError(undefined)
    try {
      await planAction(team.captainSessionId, team.teamId, action)
      // No local state flip: the next poll reflects disk truth (phase flips to
      // running, or the team disappears into the archive) and unmounts us.
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : String(cause))
      setBusy(undefined)
    }
  }

  return (
    <div className={css.planBar} role='group' aria-label={t('plan.needsReview')}>
      <p className={css.planBarText}>{t('plan.needsReview')}</p>
      {error !== undefined && <p className={css.planError}>{error}</p>}
      <div className={css.planActions}>
        <button
          type='button'
          className={css.planApprove}
          disabled={busy !== undefined || !runnable}
          title={runnable ? undefined : t('plan.notRunnable')}
          onClick={() => { void run('approve') }}
        >
          {busy === 'approve' ? '…' : t('plan.approve')}
        </button>
        <button
          type='button'
          className={css.planChat}
          disabled={busy !== undefined}
          onClick={() => { void run('continue') }}
        >
          {busy === 'continue' ? '…' : t('plan.returnToChat')}
        </button>
        {discardArmed ? (
          <>
            <button type='button' className={css.planCancel} onClick={() => { setDiscardArmed(false) }} disabled={busy !== undefined}>
              {t('team.stopCancel')}
            </button>
            <button type='button' className={css.planDiscard} onClick={() => { void run('discard') }} disabled={busy !== undefined}>
              {busy === 'discard' ? '…' : t('plan.discardConfirm')}
            </button>
          </>
        ) : (
          <button type='button' className={css.planDiscardArm} onClick={() => { setDiscardArmed(true) }} disabled={busy !== undefined}>
            {t('plan.discard')}
          </button>
        )}
      </div>
    </div>
  )
}

/** One team card: header, roster, DAG, inbox preview, and stop control. */
function TeamCard({ team, t, openMember, readOnly, onSaved }: {
  team: TeamActivitySnapshot
  t: ReturnType<typeof makeT>
  openMember: ActivityPanelProps['openMember']
  readOnly?: boolean
  /** Called after a staged-plan edit batch commits, to refresh immediately. */
  onSaved: () => void
}): ReactElement {
  const [confirming, setConfirming] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [stopError, setStopError] = useState<string | undefined>(undefined)
  const done = team.tasks.filter((task) => task.status === 'completed').length

  const stop = async (): Promise<void> => {
    setStopping(true)
    setStopError(undefined)
    try {
      await haltTeam(team.captainSessionId, team.teamId)
      setConfirming(false)
    } catch (cause: unknown) {
      setStopError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setStopping(false)
    }
  }

  return (
    <section className={css.teamCard} data-phase={team.phase} data-halted={team.halted === true || undefined}>
      {team.phase === 'staged' && !readOnly && (
        <>
          <PlanReviewBar team={team} t={t} />
          <StagedPlanEditor team={team} t={t} onSaved={onSaved} />
        </>
      )}
      <header className={css.teamHeader}>
        <TeamsXLogo size={20} className={css.teamLogo} decorative />
        <div className={css.teamTitleBlock}>
          <h3 className={css.teamName} title={team.name}>{team.name}</h3>
          {team.description !== undefined && <p className={css.teamGoal}>{team.description}</p>}
        </div>
        {!readOnly && team.phase === 'running' && team.halted !== true && !confirming && (
          <button type='button' className={css.stopButton} onClick={() => { setConfirming(true) }}>
            {t('team.stop')}
          </button>
        )}
      </header>
      <div className={css.teamBadges}>
        <span className={css.badge}>{t(team.phase === 'staged' ? 'team.phase.staged' : 'team.phase.running')}</span>
        {team.planReviewState !== undefined && (
          <span className={css.badgeMuted}>{t(`team.planReview.${team.planReviewState}` as TeamsXLocaleKey)}</span>
        )}
        {team.halted === true && <span className={css.badgeWarn}>{t('team.halted')}</span>}
        <span className={css.badgeMuted}>{t('team.members', { count: team.members.length })}</span>
        <span className={css.badgeMuted}>{t('team.done', { done, total: team.tasks.length })}</span>
      </div>

      {confirming && (
        <div className={css.stopConfirmBox} role='alertdialog' aria-label={t('team.stopTitle', { team: team.name })}>
          <p>{t('team.stopDescription', { tasks: team.tasks.filter((task) => task.status === 'pending' || task.status === 'claimed' || task.status === 'in_progress').length, members: team.members.filter((member) => member.activity === 'working').length })}</p>
          {stopError !== undefined && <p className={css.stopError}>{t('team.stopFailed', { message: stopError })}</p>}
          <div className={css.stopActions}>
            <button type='button' className={css.stopCancel} onClick={() => { setConfirming(false) }} disabled={stopping}>
              {t('team.stopCancel')}
            </button>
            <button type='button' className={css.stopConfirm} onClick={() => { void stop() }} disabled={stopping}>
              {stopping ? t('team.stopping') : t('team.stopConfirm')}
            </button>
          </div>
        </div>
      )}

      <h5 className={css.sectionLabel}>{t('section.members' as TeamsXLocaleKey)}</h5>
      <div className={css.roster}>
        {team.members.map((member) => <MemberRow key={member.id !== '' ? member.id : member.name} member={member} team={team} t={t} openMember={openMember} />)}
      </div>

      <h5 className={css.sectionLabel}>{t('section.tasks' as TeamsXLocaleKey)}</h5>
      <div className={css.dag}>
        {team.tasks.length === 0 && team.phase === 'running' && (
          <div className={css.dagEmpty} role='status'>
            <p className={css.dagEmptyText}>队长正在把目标拆解成任务</p>
            <span className={css.skeletonRow} style={{ width: '72%' }} aria-hidden />
            <span className={css.skeletonRow} style={{ width: '54%' }} aria-hidden />
            <span className={css.skeletonRow} style={{ width: '63%' }} aria-hidden />
          </div>
        )}
        {team.tasks.map((task) => <TaskRow key={task.id} task={task} t={t} />)}
        {team.operations.length > 0 && (
          <details className={css.timeline}>
            <summary className={css.timelineSummary}>{t('section.timeline' as TeamsXLocaleKey)}（最近 {team.operations.length} 条）</summary>
            <div className={css.timelineBody}>
              {team.operations.map((op, index) => (
                <div key={`${op.ts}-${index}`} className={css.timelineRow}>
                  <span className={css.timelineTime}>{new Date(op.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={css.timelineActor}>{op.actor}</span>
                  <span className={css.timelineAction}>{op.action}{op.taskId !== undefined ? ` ${op.taskId}` : ''}</span>
                  {op.detail !== undefined && <span className={css.timelineDetail} title={op.detail}>{op.detail}</span>}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      <footer className={css.inbox}>
        <h4 className={css.inboxTitle}>{t('section.inbox' as TeamsXLocaleKey)} · {t('inbox.title')}</h4>
        {team.captainInbox.length === 0
          ? <p className={css.inboxEmpty}>{t('inbox.empty')}</p>
          : (
            <ul className={css.inboxList}>
              {team.captainInbox.map((message, index) => (
                <li key={`${message.from}-${index}`} className={css.inboxItem}>
                  <span className={css.inboxFrom}>{message.from}</span>
                  <span className={css.inboxContent}>{message.content}</span>
                </li>
              ))}
            </ul>
          )}
      </footer>
    </section>
  )
}

/** Props the shared activity body needs from whichever host renders it. */
export interface TeamsXPanelBodyProps {
  /** Session whose teams this body lists. */
  readonly sessionId: string
  /** Locale formatter supplied by the hosting seat. */
  readonly t: PanelTranslate
  /** Open one member's transcript (wired by the plugin shell). */
  readonly openMember: (parentId: TeamActivitySnapshot['captainSessionId'], childId: string) => void
  /**
   * Close the hosting panel. Omitted by a host that owns its own close control
   * (the right Sidebar's tab strip), which is also what hides the body's ✕.
   */
  readonly onClose?: () => void
}

/**
 * The activity body every host shares: the live/archive toggle, refresh, the
 * error and empty states, and the team cards. Self-contained — it owns its
 * view mode and its polling — so the session-header dropdown, the right
 * Sidebar tab and the main-column panel are one component with one data path.
 */
export function TeamsXPanelBody({ sessionId, t, openMember, onClose }: TeamsXPanelBodyProps): ReactElement {
  const translate = useMemo(() => makeT(t), [t])
  const [viewMode, setViewMode] = useState<'live' | 'archive'>('live')
  // A body renders only while its host shows it, so it always polls fast.
  const { teams, error, loading, reload } = useTeamData(true, viewMode)
  const sessionTeams = useMemo(() => teams.filter((team) => (
    team.captainSessionId === sessionId
    || team.members.some((member) => member.id === sessionId)
  )), [teams, sessionId])

  return (
    <>
      <header className={css.panelHeader}>
        <h2 className={css.panelTitle}><TeamsXLogo size={18} decorative /> {translate('panel.title')}</h2>
        <div className={css.panelActions}>
          <div className={css.modeToggle} role='radiogroup' aria-label={translate('panel.live')}>
            <button
              type='button'
              className={`${css.modeOption} ${viewMode === 'live' ? css.modeActive : ''}`}
              onClick={() => { setViewMode('live') }}
              aria-pressed={viewMode === 'live'}
            >
              {translate('panel.live')}
            </button>
            <button
              type='button'
              className={`${css.modeOption} ${viewMode === 'archive' ? css.modeActive : ''}`}
              onClick={() => { setViewMode('archive') }}
              aria-pressed={viewMode === 'archive'}
            >
              {translate('panel.archived')}
            </button>
          </div>
          <button
            type='button'
            className={css.refreshButton}
            onClick={reload}
            data-loading={loading === true || undefined}
            aria-label={translate('panel.refresh')}
            title={translate('panel.refresh')}
          >
            <GlyphRefresh
              size={13}
              className={loading === true ? css.animSpin : undefined}
              decorative
            />
          </button>
          {onClose !== undefined && (
            <button
              type='button'
              className={css.refreshButton}
              onClick={onClose}
              aria-label={translate('panel.close')}
              title={translate('panel.close')}
            >
              <GlyphClose size={13} decorative />
            </button>
          )}
        </div>
      </header>
      {error !== undefined && (
        <div className={css.errorBox}>
          <p className={css.panelError}>{translate('panel.error', { message: error })}</p>
          <button type='button' className={css.retryButton} onClick={reload}>
            {translate('panel.refresh')}
          </button>
        </div>
      )}
      {error === undefined && sessionTeams.length === 0 && (
        <div className={css.emptyState}>
          <TeamsXLogo size={48} className={css.emptyLogo} />
          <p className={css.panelEmpty}>{translate('panel.empty')}</p>
        </div>
      )}
      <div className={css.teamList}>
        {sessionTeams.map((team) => <TeamCard key={`${team.workspace}/${team.teamId}`} team={team} t={translate} openMember={openMember} readOnly={viewMode === 'archive'} onSaved={reload} />)}
      </div>
    </>
  )
}

/**
 * The session-scoped shell: a header chip that exists only when THIS session
 * owns or participates in a live team; the expanded panel portals to body.
 */
export function ActivityPanel({ sessionId, t, openMember }: ActivityPanelProps): ReactElement | null {
  const translate = useMemo(() => makeT(t), [t])
  const [expanded, setExpanded] = useState(false)
  const [hasArchived, setHasArchived] = useState(false)
  const badgeRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const isNarrow = useIsNarrow()
  // The /teamsx slash command expands this panel for its session.
  useEffect(() => (
    onTeamsXPanelRequest((target) => {
      if (target === sessionId) {
        setExpanded(true)
        return true
      }
      return false
    })
  ), [sessionId])
  // The badge carries the count only: once expanded, the body polls on its own
  // fast cadence, so this subscription stays on the collapsed schedule.
  const { teams, error } = useTeamData(false, 'live')
  // One-shot: if archived teams exist for this session, show the badge
  // even when no live teams exist — the user can browse archive history.
  useEffect(() => {
    if (hasArchived) return
    void fetchTeams('archive').then((data) => {
      const matches = data.some((team) => (
        team.captainSessionId === sessionId
        || team.members.some((member) => member.id === sessionId)
      ))
      if (matches) setHasArchived(true)
    }).catch(() => {})
  }, [sessionId, hasArchived])
  // Session scoping: only teams led (or joined as a member) by the session
  // whose header hosts this badge are visible here. Other sessions' teams,
  // and sessions that never used TeamsX, render nothing.
  const sessionTeams = useMemo(() => teams.filter((team) => (
    team.captainSessionId === sessionId
    || team.members.some((member) => member.id === sessionId)
  )), [teams, sessionId])
  const workingCount = sessionTeams.reduce((count, team) => (
    count + team.members.filter((member) => member.activity === 'working').length
  ), 0)
  const placement = usePanelPlacement(badgeRef, panelRef, expanded && !isNarrow)

  // Drop the panel on any pointer outside badge + panel, matching the
  // subagent-count dropdown's dismiss behavior.
  useEffect(() => {
    if (!expanded) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target as Node | null
      if (target === null) return
      if (panelRef.current?.contains(target) === true) return
      if (badgeRef.current?.contains(target) === true) return
      setExpanded(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => { document.removeEventListener('pointerdown', onPointerDown) }
  }, [expanded])

  // Escape key closes the panel.
  useEffect(() => {
    if (!expanded) return
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        setExpanded(false)
      }
    }
    document.addEventListener('keydown', onKeyDown, true)
    return () => { document.removeEventListener('keydown', onKeyDown, true) }
  }, [expanded])

  // No teams in this session and no archived history: render nothing — the
  // header shows no TeamsX control at all. If archived teams exist, show the
  // badge so the user can browse history.
  if (sessionTeams.length === 0 && !hasArchived && error === undefined && !expanded) return null

  // The badge STAYS mounted while expanded (it is the anchor the panel
  // positions under, and the outside-click toggle target); the expanded
  // panel portals to document.body as a dropdown beneath it.
  const badge = (
    <button
      type='button'
      ref={badgeRef}
      className={css.badgeFab}
      data-expanded={expanded === true || undefined}
      onClick={() => { setExpanded((value) => !value) }}
      aria-label={translate('panel.aria')}
      aria-expanded={expanded === true || undefined}
      title={translate('panel.title')}
    >
      <TeamsXLogo size={14} decorative />
      <span className={css.badgeFabCount}>{sessionTeams.length}</span>
      {workingCount > 0 && <span className={css.badgeFabBusy} data-busy>{workingCount}</span>}
    </button>
  )

  if (!expanded) return badge

  return (
    <>
      {badge}
      {createPortal(
        <div
          className={isNarrow ? css.panelSheet : css.panelWindow}
          ref={panelRef}
          style={isNarrow ? undefined : {
            top: `${placement.top}px`,
            left: `${placement.left}px`,
          }}
          role='region'
          aria-label={translate('panel.aria')}
        >
          <TeamsXPanelBody
            sessionId={sessionId}
            t={t}
            openMember={openMember}
            onClose={() => { setExpanded(false) }}
          />
        </div>,
        document.body,
      )}
    </>
  )
}
