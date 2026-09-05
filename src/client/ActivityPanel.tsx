/**
 * TeamsX activity panel: live roster, task DAG, and captain inbox preview.
 *
 * Lean by design — the reference panel is 57 KB of layout machinery; this
 * panel covers the same information with a third of the code: a poller, one
 * team card renderer (with the all-SVG icon system), and a stop control.
 * All state lives in one hook; icons come from icons.tsx.
 * @module dsh-teams-x/client/ActivityPanel
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement } from 'react'
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

/** Locale formatter supplied by the harness locale service. */
export type PanelTranslate = (key: TeamsXLocaleKey, params?: Record<string, string | number>) => string

export interface ActivityPanelProps {
  /** Translate function bound to the `teamsX` locale namespace. */
  readonly t: PanelTranslate
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

/**
 * Shift the floating surface left until nothing paints above it. Third-party
 * overlay panels (e.g. better-sidebar's right dock) live in higher stacking
 * layers than shell.overlay, so no z-index inside the overlay can win — the
 * only robust fix is measured avoidance. Probes elementFromPoint at the
 * surface's center and walks candidate `right` offsets; re-probes on resize
 * and on an interval so a closed panel returns the surface to its preferred
 * spot.
 */
function useAvoidCover(surfaceRef: React.RefObject<HTMLElement | null>): number {
  const [shift, setShift] = useState(18)
  useEffect(() => {
    const PREFERRED = 18
    const CANDIDATES = [18, 60, 120, 200, 300, 420, 520]
    const probe = (): void => {
      const el = surfaceRef.current
      if (el === null) return
      for (const candidate of CANDIDATES) {
        el.style.right = `${candidate}px`
        const rect = el.getBoundingClientRect()
        if (rect.width === 0) return
        const top = document.elementFromPoint(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        )
        if (top === null || el === top || el.contains(top)) {
          setShift(candidate)
          return
        }
      }
    }
    probe()
    const timer = window.setInterval(probe, 1500)
    window.addEventListener('resize', probe)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('resize', probe)
    }
  }, [surfaceRef])
  return shift
}

/** Poll the state endpoint: once on mount, then on an interval ONLY while expanded. */
function useTeamSnapshots(expanded: boolean): { teams: TeamActivitySnapshot[]; error?: string; reload: () => void } {
  const [teams, setTeams] = useState<TeamActivitySnapshot[]>([])
  const [error, setError] = useState<string | undefined>(undefined)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    // Collapsed: one discovery fetch only, no recurring background activity.
    if (!expanded && tick > 0) return
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
    if (!expanded) return () => { disposed = true }
    const timer = window.setInterval(() => { void load() }, POLL_INTERVAL_MS)
    return () => {
      disposed = true
      window.clearInterval(timer)
    }
  }, [expanded, tick])

  return { teams, error, reload: () => setTick((value) => value + 1) }
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
          ? <RoleIcon size={18} />
          : <TeamsXLogo size={18} label={member.name} />}
      </span>
      <span className={css.memberName} title={member.name}>{member.name}</span>
      <span className={css.memberMeta}>{member.model}</span>
      <span className={css.memberProgress}>{t('member.progress', { done: member.done, total: member.total })}</span>
      {member.unread > 0 && (
        <span className={css.memberUnread} title={t('member.unread', { count: member.unread })}>{member.unread}</span>
      )}
      <span className={css.memberState}>
        {ActivityIcon !== undefined && <ActivityIcon size={14} className={member.activity === 'working' ? css.animPulse : undefined} />}
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
      <span className={css.taskIcon}>{StateIcon !== undefined && <StateIcon size={14} className={task.state === 'running' ? css.animPulse : undefined} />}</span>
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
        <TeamsXLogo size={20} className={css.teamLogo} />
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

/** The panel shell: a collapsed floating badge by default; expanded on click. */
export function ActivityPanel({ t }: ActivityPanelProps): ReactElement | null {
  const translate = useMemo(() => makeT(t), [t])
  // Collapsed by default: the shell.overlay layer covers the whole app, so
  // this component must occupy nothing until the user opens it.
  const [expanded, setExpanded] = useState(false)
  // A single shared surface ref feeds useAvoidCover; the callback ref is the
  // boundary between the generic probe and the concrete button/div elements.
  const surfaceRef = useRef<HTMLElement | null>(null)
  const setSurface = (el: HTMLElement | null): void => { surfaceRef.current = el }
  const shift = useAvoidCover(surfaceRef)
  const { teams, error, reload } = useTeamSnapshots(expanded)
  const activeTeams = teams.filter((team) => team.halted !== true)
  const workingCount = activeTeams.reduce((count, team) => (
    count + team.members.filter((member) => member.activity === 'working').length
  ), 0)

  if (!expanded) {
    // No teams and no error: render nothing at all into the overlay layer.
    if (teams.length === 0 && error === undefined) return null
    return (
      <button
        type='button'
        ref={setSurface}
        className={css.badgeFab}
        style={{ right: `${shift}px` }}
        onClick={() => { setExpanded(true) }}
        aria-label={translate('panel.aria')}
        title={translate('panel.title')}
      >
        <TeamsXLogo size={16} />
        <span className={css.badgeFabCount}>{teams.length}</span>
        {workingCount > 0 && <span className={css.badgeFabBusy} data-busy>{workingCount}</span>}
      </button>
    )
  }

  return (
    <div
      className={css.panelWindow}
      ref={setSurface}
      style={{ right: `${shift}px` }}
      role='region'
      aria-label={translate('panel.aria')}
    >
      <header className={css.panelHeader}>
        <h2 className={css.panelTitle}><TeamsXLogo size={18} /> {translate('panel.title')}</h2>
        <button type='button' className={css.refreshButton} onClick={reload} aria-label={translate('panel.refresh')}>
          <span className={css.animSpin}>⟳</span>
        </button>
        <button type='button' className={css.refreshButton} onClick={() => { setExpanded(false) }} aria-label={translate('panel.refresh')}>
          ✕
        </button>
      </header>
      {error !== undefined && <p className={css.panelError}>{translate('panel.error', { message: error })}</p>}
      {error === undefined && teams.length === 0 && (
        <p className={css.panelEmpty}>{translate('panel.empty')}</p>
      )}
      <div className={css.teamList}>
        {teams.map((team) => <TeamCard key={`${team.workspace}/${team.teamId}`} team={team} t={translate} />)}
      </div>
    </div>
  )
}
