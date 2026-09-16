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
 *
 * v0.9 P0 split: the shared body lives in panel-body.tsx, the team card in
 * team-card.tsx, rows in member-row.tsx / task-row.tsx, the review bar in
 * plan-review.tsx, endpoints in endpoints.ts, API helpers in api.ts, and
 * formatting in format.ts. This file keeps the session-scoped shell plus the
 * historical export surface (TeamsXPanelBody, PanelTranslate, URL constants).
 * @module dsh-teams-x/client/ActivityPanel
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactElement, RefObject } from 'react'
import { createPortal } from 'react-dom'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { TeamActivitySnapshot } from '../snapshot-types.ts'
import css from './ActivityPanel.module.css'
import { TeamsXLogo } from './icons.ts'
import type { PanelTranslate } from './format.ts'
import { makeT } from './format.ts'
import { fetchTeams } from './api.ts'
import { TEAMSX_HALT_URL, TEAMSX_PAUSE_URL, TEAMSX_PLAN_URL, TEAMSX_STATE_URL } from './endpoints.ts'
import { DISCOVERY_INTERVAL_MS, POLL_INTERVAL_MS, TeamsXPanelBody, useTeamData, type TeamsXPanelBodyProps } from './panel-body.tsx'
import { setSheetOpen } from './sheet-visibility.ts'
import type { TeamsXSessionNavigator } from './session-navigation.ts'
import { onTeamsXPanelRequest } from './open-request.ts'

// Historical export surface: constants moved to endpoints.ts / panel-body.tsx
// in the v0.9 P0 split; re-exported so existing importers keep working.
export { TEAMSX_STATE_URL, TEAMSX_HALT_URL, TEAMSX_PAUSE_URL, TEAMSX_PLAN_URL }
export { POLL_INTERVAL_MS, DISCOVERY_INTERVAL_MS }
export type { PanelTranslate }
export { TeamsXPanelBody }
export type { TeamsXPanelBodyProps }

export interface ActivityPanelProps
  extends PropsRuntime<'conversation.session.header.actions'>, PropsLocale<'teamsX'> {
  /** Client sessions service, used to open member transcripts. */
  readonly sessions: TeamsXSessionNavigator
  /** Open one member's transcript (wired by the plugin shell). */
  readonly openMember: (parentId: TeamActivitySnapshot['captainSessionId'], childId: string) => void
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
 * Place the expanded panel flush against the LEFT sidebar's right edge —
 * the user-facing anchor is the sidebar, not the mid-header badge — and
 * cleared below the session tab bar. Placement runs ONCE on open (plus on
 * resize): no periodic re-probing, so the panel never visibly jumps after
 * settling.
 *
 * (2026-09-12) Horizontal anchor history: badge right edge, then badge left
 * edge. (2026-09-13, user direction) The panel docks next to the host's left
 * sidebar column (`[class*="sidebarCol"]`, the hashed-suffix local name
 * survives host rebuilds) with a 10px gap, falling back to the session tab
 * strip's left edge and finally the badge — with a viewport clamp for narrow
 * desktops.
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
      const tablistRect = tablist === null ? null : tablist.getBoundingClientRect()
      const tablistBottom = tablistRect?.bottom ?? 0
      let top = Math.max(rect.bottom + 6, tablistBottom + 8, 8)
      const maxH = Math.min(window.innerHeight * 0.72, 640)
      if (top + maxH > window.innerHeight - 8) {
        top = Math.max(8, window.innerHeight - maxH - 8)
      }
      const panel = panelRef.current
      const width = panel?.getBoundingClientRect().width ?? 0
      // Dock to the sidebar's right edge; degrade to the main column's left
      // edge (the tab strip starts there), then to the badge itself.
      const sidebar = document.querySelector<HTMLElement>('[class*="sidebarCol"]')
      const sidebarRight = sidebar?.getBoundingClientRect().right
      let left = (sidebarRight !== undefined ? sidebarRight + 10 : tablistRect?.left ?? rect.left)
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
  // 徽标呼吸的触发器：任务在跑（claimed/in_progress），而非成员活动位——
  // "团队创建后任务在跑"是这个信号的准确语义，也覆盖任务已派、成员尚未
  // 上报活动的窗口。
  const runningTasks = sessionTeams.reduce((count, team) => (
    count + team.tasks.filter((task) => task.status === 'claimed' || task.status === 'in_progress').length
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

  // On a phone the right-Sidebar pane can sit behind the bottom sheet; tell
  // the tab body to step aside while the sheet is open (no duplicate card).
  useEffect(() => {
    if (!isNarrow) return
    setSheetOpen(expanded)
    return () => { setSheetOpen(false) }
  }, [expanded, isNarrow])

  // No teams in this session and no archived history: render nothing — the
  // header shows no TeamsX control at all. If archived teams exist, show the
  // badge so the user can browse history.
  if (sessionTeams.length === 0 && !hasArchived && error === undefined && !expanded) return null

  // The badge STAYS mounted while expanded (it is the anchor the panel
  // positions under, and the outside-click toggle target); the expanded
  // panel portals to document.body as a dropdown beneath it.
  const badgeLabel = workingCount > 0
    ? `${translate('panel.aria')} (${workingCount})`
    : translate('panel.aria')
  const badgeDetail = runningTasks > 0
    ? `${translate('panel.title')} · ${translate('task.status.in_progress')} ${runningTasks}`
    : workingCount > 0
      ? `${translate('panel.title')} · ${t('member.state.working')} ${workingCount}`
      : translate('panel.title')
  const badge = (
    <button
      type='button'
      ref={badgeRef}
      className={css.badgeFab}
      data-expanded={expanded === true || undefined}
      data-busy={runningTasks > 0 || undefined}
      onClick={() => { setExpanded((value) => !value) }}
      aria-label={badgeLabel}
      aria-expanded={expanded === true || undefined}
      title={badgeDetail}
    >
      <TeamsXLogo size={16} decorative />
      {workingCount > 0 && <span className={css.badgeFabBusy} aria-hidden />}
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
