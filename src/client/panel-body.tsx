/**
 * The activity body every host shares: the live/archive toggle, refresh, the
 * error and empty states, and the team cards. Self-contained — it owns its
 * view mode and its polling — so the session-header dropdown, the right
 * Sidebar tab and the main-column panel are one component with one data path.
 * Behavior-preserving extraction from ActivityPanel (v0.9 P0).
 * @module dsh-teams-x/client/panel-body
 */
import { useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import type { TeamActivitySnapshot } from '../snapshot-types.ts'
import type { PanelTranslate, Translate } from './format.ts'
import { makeT } from './format.ts'
import { fetchTeams } from './api.ts'
import { TeamCard, type OpenMember } from './team-card.tsx'
import css from './ActivityPanel.module.css'
import { GlyphClose, GlyphRefresh, TeamsXLogo } from './icons.ts'

/** Poll cadence for the live view. */
export const POLL_INTERVAL_MS = 4_000
/** Collapsed discovery cadence: slow, but fast enough to notice a team the
 * session creates after this badge mounted. */
export const DISCOVERY_INTERVAL_MS = 10_000

/** Props the shared activity body needs from whichever host renders it. */
export interface TeamsXPanelBodyProps {
  /** Session whose teams this body lists. */
  readonly sessionId: string
  /** Locale formatter supplied by the hosting seat. */
  readonly t: PanelTranslate
  /** Open one member's transcript (wired by the plugin shell). */
  readonly openMember: OpenMember
  /**
   * Close the hosting panel. Omitted by a host that owns its own close control
   * (the right Sidebar's tab strip), which is also what hides the body's ✕.
   */
  readonly onClose?: () => void
}

/**
 * Fetch team snapshots. `live` mode polls (slow cadence when collapsed,
 * fast when expanded); `archive` mode fetches once on mount and on
 * explicit reload only (static historical data, no auto-refresh).
 */
export function useTeamData(expanded: boolean, viewMode: 'live' | 'archive'): {
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

export function TeamsXPanelBody({ sessionId, t, openMember, onClose }: TeamsXPanelBodyProps): ReactElement {
  const translate = useMemo(() => makeT(t), [t]) as Translate
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
