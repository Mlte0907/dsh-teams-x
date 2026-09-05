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
  ROLE_ICONS,
  VISUAL_STATE_ICONS,
  TeamsXLogo,
  type IconComponent,
} from './icons.ts'
import type { TeamsXLocaleKey } from './locale-keys.ts'
import type { TeamActivitySnapshot } from '../snapshot-types.ts'

/** Panel data endpoint served by the host plane. */
export const TEAMSX_STATE_URL = '/plugins/dsh-teams-x/state'
/** Halt endpoint served by the host plane. */
export const TEAMSX_HALT_URL = '/plugins/dsh-teams-x/halt'
/** Poll cadence for the live view. */
export const POLL_INTERVAL_MS = 4_000
/** Collapsed discovery cadence: slow, but fast enough to notice a team the
 * session creates after this badge mounted. */
export const DISCOVERY_INTERVAL_MS = 10_000

/** Locale formatter supplied by the harness locale service. */
export type PanelTranslate = (key: TeamsXLocaleKey, params?: Record<string, string | number>) => string

export interface ActivityPanelProps
  extends PropsRuntime<'conversation.session.header.actions'>, PropsLocale<'teamsX'> {}

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

/** Poll the state endpoint: once on mount, then on an interval ONLY while expanded. */
function useTeamSnapshots(expanded: boolean): { teams: TeamActivitySnapshot[]; error?: string; reload: () => void } {
  const [teams, setTeams] = useState<TeamActivitySnapshot[]>([])
  const [error, setError] = useState<string | undefined>(undefined)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let disposed = false
    const load = async (): Promise<void> => {
      try {
        const response = await fetch(TEAMSX_STATE_URL, { headers: { accept: 'application/json' } })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const body = await response.json() as StateResponse
        if (!disposed) {
          setTeams(body.teams)
          setError(undefined)
        }
      } catch (cause: unknown) {
        if (!disposed) setError(cause instanceof Error ? cause.message : String(cause))
      }
    }
    void load()
    // Collapsed keeps a slow discovery cadence (a team may be created after
    // mount); expanded polls at the live cadence.
    const interval = expanded ? POLL_INTERVAL_MS : DISCOVERY_INTERVAL_MS
    const timer = window.setInterval(() => { void load() }, interval)
    return () => {
      disposed = true
      window.clearInterval(timer)
    }
  }, [expanded, tick])

  return { teams, error, reload: () => setTick((value) => value + 1) }
}

/**
 * Place the expanded panel under the badge, then shift it left until nothing
 * paints above it. Third-party overlay docks (e.g. better-sidebar) live in
 * higher stacking layers than a portal can assume, so placement is measured:
 * probe elementFromPoint at the panel's header and walk candidate `right`
 * offsets; re-probe on resize/interval so a closed dock returns the panel.
 */
function usePanelPlacement(
  badgeRef: RefObject<HTMLButtonElement | null>,
  panelRef: RefObject<HTMLDivElement | null>,
  expanded: boolean,
): { top: number; right: number } {
  const [pos, setPos] = useState({ top: 96, right: 18 })
  useEffect(() => {
    if (!expanded) return
    const place = (): void => {
      const badge = badgeRef.current
      if (badge === null) return
      const rect = badge.getBoundingClientRect()
      let top = rect.bottom + 6
      const maxH = Math.min(window.innerHeight * 0.72, 640)
      if (top + maxH > window.innerHeight - 8) {
        top = Math.max(8, window.innerHeight - maxH - 8)
      }
      const preferred = Math.max(8, window.innerWidth - rect.right)
      const panel = panelRef.current
      let right = preferred
      if (panel !== null) {
        const candidates = [preferred, preferred + 80, preferred + 180, preferred + 320, preferred + 480]
        for (const candidate of candidates) {
          panel.style.right = `${candidate}px`
          const r = panel.getBoundingClientRect()
          if (r.width === 0) break
          const probeY = Math.min(r.top + 20, window.innerHeight - 1)
          const topEl = document.elementFromPoint(r.left + Math.min(60, r.width / 2), probeY)
          if (topEl === null || panel === topEl || panel.contains(topEl)) {
            right = candidate
            break
          }
          right = candidate
        }
      }
      setPos((prev) => (prev.top === top && prev.right === right ? prev : { top, right }))
    }
    place()
    const timer = window.setInterval(place, 1500)
    window.addEventListener('resize', place)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('resize', place)
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

/** One member row of the roster. */
function MemberRow({ member, t }: { member: TeamActivitySnapshot['members'][number]; t: ReturnType<typeof makeT> }): ReactElement {
  const roleKey = (member.role?.trim().toLowerCase() ?? '') as keyof typeof ROLE_ICONS
  const RoleIcon = ROLE_ICONS[roleKey] as IconComponent | undefined
  const ActivityIcon = ACTIVITY_ICONS[member.activity] as IconComponent | undefined
  const stateKey = (member.activity === 'working' ? 'member.state.working'
    : member.activity === 'idle' ? 'member.state.idle'
      : 'member.state.unknown') as TeamsXLocaleKey
  return (
    <div className={css.memberRow} data-activity={member.activity}>
      <span className={css.memberIcon}>
        {RoleIcon !== undefined
          ? <RoleIcon size={18} decorative />
          : <TeamsXLogo size={18} label={member.name} />}
      </span>
      <span className={css.memberName} title={member.name}>{member.name}</span>
      <span className={css.memberMeta}>{member.model}</span>
      <span className={css.memberProgress}>{t('member.progress', { done: member.done, total: member.total })}</span>
      {member.unread > 0 && (
        <span className={css.memberUnread} title={t('member.unread', { count: member.unread })}>{member.unread}</span>
      )}
      <span className={css.memberState}>
        {ActivityIcon !== undefined && <ActivityIcon size={14} className={member.activity === 'working' ? css.animPulse : undefined} decorative />}
        {t(stateKey)}
      </span>
    </div>
  )
}

/** One task row of the DAG list, indented by dependency depth. */
function TaskRow({ task, t }: { task: TeamActivitySnapshot['tasks'][number]; t: ReturnType<typeof makeT> }): ReactElement {
  const StateIcon = VISUAL_STATE_ICONS[task.state] as IconComponent | undefined
  const statusKey = `task.status.${task.status}` as TeamsXLocaleKey
  const visualKey = `task.visual.${task.state}` as TeamsXLocaleKey
  const assignee = task.assignee === '' ? t('task.assignee.shared')
    : task.assignee === 'captain' ? t('task.assignee.captain')
      : task.assignee
  return (
    <div className={css.taskRow} data-state={task.state} style={{ marginInlineStart: `${Math.min(task.depth, 4) * 18}px` }}>
      <span className={css.taskIcon}>{StateIcon !== undefined && <StateIcon size={14} className={task.state === 'running' ? css.animPulse : undefined} decorative />}</span>
      <span className={css.taskId}>{task.id}</span>
      <span className={css.taskSubject} title={task.description || task.subject}>{task.subject}</span>
      <span className={css.taskAssignee}>{assignee}</span>
      <span className={css.taskStatus} title={t(visualKey)}>{t(statusKey)}</span>
    </div>
  )
}

/** One team card: header, roster, DAG, inbox preview, and stop control. */
function TeamCard({ team, t }: { team: TeamActivitySnapshot; t: ReturnType<typeof makeT> }): ReactElement {
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
      <header className={css.teamHeader}>
        <TeamsXLogo size={20} className={css.teamLogo} decorative />
        <div className={css.teamTitleBlock}>
          <h3 className={css.teamName}>{team.name}</h3>
          {team.description !== undefined && <p className={css.teamGoal}>{team.description}</p>}
        </div>
        <div className={css.teamBadges}>
          <span className={css.badge}>{t(team.phase === 'staged' ? 'team.phase.staged' : 'team.phase.running')}</span>
          {team.planReviewState !== undefined && (
            <span className={css.badgeMuted}>{t(`team.planReview.${team.planReviewState}` as TeamsXLocaleKey)}</span>
          )}
          {team.halted === true && <span className={css.badgeWarn}>{t('team.halted')}</span>}
          <span className={css.badgeMuted}>{t('team.members', { count: team.members.length })}</span>
          <span className={css.badgeMuted}>{t('team.done', { done, total: team.tasks.length })}</span>
        </div>
        {team.phase === 'running' && team.halted !== true && !confirming && (
          <button type='button' className={css.stopButton} onClick={() => { setConfirming(true) }}>
            {t('team.stop')}
          </button>
        )}
      </header>

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

      <div className={css.roster}>
        {team.members.map((member) => <MemberRow key={member.id !== '' ? member.id : member.name} member={member} t={t} />)}
      </div>

      <div className={css.dag}>
        {team.tasks.map((task) => <TaskRow key={task.id} task={task} t={t} />)}
      </div>

      <footer className={css.inbox}>
        <h4 className={css.inboxTitle}>{t('inbox.title')}</h4>
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

/**
 * The session-scoped shell: a header chip that exists only when THIS session
 * owns or participates in a live team; the expanded panel portals to body.
 */
export function ActivityPanel({ sessionId, t }: ActivityPanelProps): ReactElement | null {
  const translate = useMemo(() => makeT(t), [t])
  const [expanded, setExpanded] = useState(false)
  const badgeRef = useRef<HTMLButtonElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const { teams, error, reload } = useTeamSnapshots(expanded)
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
  const placement = usePanelPlacement(badgeRef, panelRef, expanded)

  if (!expanded) {
    // No teams in this session (and no fetch error): render nothing — the
    // header shows no TeamsX control at all.
    if (sessionTeams.length === 0 && error === undefined) return null
    return (
      <button
        type='button'
        ref={badgeRef}
        className={css.badgeFab}
        onClick={() => { setExpanded(true) }}
        aria-label={translate('panel.aria')}
        title={translate('panel.title')}
      >
        <TeamsXLogo size={14} decorative />
        <span className={css.badgeFabCount}>{sessionTeams.length}</span>
        {workingCount > 0 && <span className={css.badgeFabBusy} data-busy>{workingCount}</span>}
      </button>
    )
  }

  return createPortal(
    <div
      className={css.panelWindow}
      ref={panelRef}
      style={{ top: `${placement.top}px`, right: `${placement.right}px` }}
      role='region'
      aria-label={translate('panel.aria')}
    >
      <header className={css.panelHeader}>
        <h2 className={css.panelTitle}><TeamsXLogo size={18} decorative /> {translate('panel.title')}</h2>
        <button type='button' className={css.refreshButton} onClick={reload} aria-label={translate('panel.refresh')}>
          <span className={css.animSpin}>⟳</span>
        </button>
        <button type='button' className={css.refreshButton} onClick={() => { setExpanded(false) }} aria-label={translate('panel.refresh')}>
          ✕
        </button>
      </header>
      {error !== undefined && <p className={css.panelError}>{translate('panel.error', { message: error })}</p>}
      {error === undefined && sessionTeams.length === 0 && (
        <p className={css.panelEmpty}>{translate('panel.empty')}</p>
      )}
      <div className={css.teamList}>
        {sessionTeams.map((team) => <TeamCard key={`${team.workspace}/${team.teamId}`} team={team} t={translate} />)}
      </div>
    </div>,
    document.body,
  )
}
