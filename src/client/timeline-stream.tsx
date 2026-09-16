/**
 * 统一时间流（timeline stream）— the Direction-C narrative core.
 *
 * One rail, everything in occurrence order: structured operations and
 * captain-inbox mail interleave by timestamp, each task expands a compact
 * state card at its NEWEST event (the card is the task, the events are its
 * story), and the viewer reads one column instead of hopping between a
 * roster block, a task block, and a ticker.
 *
 * Discipline carried over from the ticker it replaces:
 * - consecutive same-actor same-action operations inside 60s fold into one
 *   row with a ×N counter (poll bursts read as one beat);
 * - unmatched server actions fall back to their raw kebab string (never
 *   blank);
 * - poll-driven text swaps render directly, no entry animation.
 * @module dsh-teams-x/client/timeline-stream
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import { createPortal } from 'react-dom'
import type { TeamActivityMessage, TeamActivityOperation, TeamActivitySnapshot, TeamActivityTask } from '../snapshot-types.ts'
import type { TeamsXLocaleKey } from './locale-keys.ts'
import type { Translate } from './format.ts'
import { formatElapsed } from './format.ts'
import { memberInk } from './member-identity.ts'
import { RichText } from './rich-text.tsx'
import css from './ActivityPanel.module.css'
import { VISUAL_STATE_ICONS, type IconComponent } from './icons.tsx'

/** Open one member's transcript (wired by the plugin shell). */
export type OpenMember = (parentId: TeamActivitySnapshot['captainSessionId'], childId: string) => void

/** Stream filter: everything, tasks only, mail only, or one member's story. */
export type StreamFilter = 'all' | 'task' | 'msg' | { readonly member: string }

/** Locale keys for the frequent operation verbs (zh dictionary is truth). */
const OP_VERB_KEYS: Readonly<Record<string, TeamsXLocaleKey>> = {
  'task-dispatched': 'op.task-dispatched',
  'task-claimed': 'op.task-claimed',
  'task-progress': 'op.task-progress',
  'task-updated': 'op.task-updated',
  'task-shadow-takeover': 'op.task-shadow-takeover',
  'dispatch-rolled-back': 'op.dispatch-rolled-back',
  'repair-derived': 'op.repair-derived',
  'repair-cancelled': 'op.repair-cancelled',
  'repair-round-limit': 'op.repair-round-limit',
  'repair-skip-duplicate': 'op.repair-skip-duplicate',
  'stalled-orphan-requeued': 'op.stalled-orphan-requeued',
  'stranded-captain-task-requeued': 'op.stranded-captain-task-requeued',
  'stall-parked-notify': 'op.stall-parked-notify',
  'stall-running-notify': 'op.stall-running-notify',
}

/** Human verb for an operation action; unmatched actions fall back to raw. */
export function operationVerb(t: Translate, action: string): string {
  const key = OP_VERB_KEYS[action]
  return key !== undefined ? t(key) : action
}

/** Actions that were in-flight when logged (hollow rail dots). */
const IN_FLIGHT = new Set(['task-dispatched', 'task-claimed', 'task-progress'])

/** Merge window for consecutive same-actor same-action operations. */
const MERGE_WINDOW_MS = 60_000
/** Rows shown before the "load earlier" fold. */
const FRESH_ROW_LIMIT = 10

/** One merged, renderable stream row. */
export interface StreamEntry {
  readonly key: string
  readonly kind: 'op' | 'inbox'
  readonly ts: number
  readonly op?: TeamActivityOperation
  readonly message?: TeamActivityMessage
  /** Folded repeat count (1 = single event). */
  readonly count: number
  /** True when this op is the newest event of its task (the card anchor). */
  readonly anchor: boolean
}

/** Merge operations + mail into one newest-first stream with fold + anchors. */
export function buildStreamEntries(
  operations: readonly TeamActivityOperation[],
  messages: readonly TeamActivityMessage[],
): StreamEntry[] {
  const newestByTask = new Map<string, TeamActivityOperation>()
  for (const op of operations) {
    if (op.taskId === undefined) continue
    const current = newestByTask.get(op.taskId)
    if (current === undefined || op.ts >= current.ts) newestByTask.set(op.taskId, op)
  }
  const raw: StreamEntry[] = [
    ...operations.map((op) => ({
      key: `op-${op.ts}-${op.actor}-${op.action}`,
      kind: 'op' as const,
      ts: op.ts,
      op,
      count: 1,
      anchor: op.taskId !== undefined && newestByTask.get(op.taskId) === op,
    })),
    ...messages.map((message, index) => ({
      key: `msg-${message.ts ?? 0}-${index}`,
      kind: 'inbox' as const,
      ts: message.ts ?? 0,
      message,
      count: 1,
      anchor: false,
    })),
  ].sort((a, b) => b.ts - a.ts)
  const merged: StreamEntry[] = []
  for (const entry of raw) {
    const last = merged[merged.length - 1]
    if (entry.kind === 'op' && last !== undefined && last.kind === 'op'
      && last.op !== undefined && entry.op !== undefined
      && last.op.actor === entry.op.actor
      && last.op.action === entry.op.action
      && last.op.ts - entry.op.ts <= MERGE_WINDOW_MS) {
      merged[merged.length - 1] = { ...last, count: last.count + 1 }
      continue
    }
    merged.push(entry)
  }
  return merged
}

/** Visual row kind: drives the rail dot's shape/color. */
function rowKind(entry: StreamEntry): 'inbox' | 'bad' | 'ok' | 'task' | 'op' {
  if (entry.kind === 'inbox') return 'inbox'
  const action = entry.op?.action
  if (action === 'task-failed') return 'bad'
  if (action === 'task-completed') return 'ok'
  if (entry.op?.taskId !== undefined) return 'task'
  return 'op'
}

/** Apply a stream filter to merged entries (shared by the filter chips row). */
export function applyStreamFilter(entries: readonly StreamEntry[], filter: StreamFilter): readonly StreamEntry[] {
  if (filter === 'all') return entries
  if (filter === 'task') return entries.filter((entry) => entry.kind === 'op' && entry.op?.taskId !== undefined)
  if (filter === 'msg') return entries.filter((entry) => entry.kind === 'inbox')
  return entries.filter((entry) => (
    entry.kind === 'inbox' ? entry.message?.from === filter.member : entry.op?.actor === filter.member
  ))
}

function sameFilter(a: StreamFilter, b: StreamFilter): boolean {
  if (a === b) return true
  if (typeof a === 'object' && typeof b === 'object') return a.member === b.member
  return false
}

function formatClock(ts: number): string {
  // hourCycle 显式 23 制：宿主 locale 不确定（zh 一般无上午/后缀，en 会拖出
  // AM/PM 撑爆时间列），不能依赖运行环境默认。
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
}

function formatDay(ts: number): string {
  return new Date(ts).toLocaleDateString([], { month: 'numeric', day: 'numeric', weekday: 'short' })
}

/* ── 任务状态卡（锚定在最新事件处） ──────────────────────────── */

/** Progress-note sparkline: up to 8 ascending bars. */
function Trend({ count }: { readonly count: number }): ReactElement | null {
  const steps = Math.min(count, 8)
  if (steps < 2) return null
  return (
    <span className={css.trend} aria-hidden>
      {Array.from({ length: steps }, (_, index) => (
        <i key={index} style={{ height: `${Math.min(14, 3 + index * 2)}px` }} />
      ))}
    </span>
  )
}

function TaskStreamCard({ task, t, onOpen }: {
  task: TeamActivityTask
  t: Translate
  onOpen: (task: TeamActivityTask, anchor: HTMLElement) => void
}): ReactElement {
  const StateIcon = VISUAL_STATE_ICONS[task.state] as IconComponent | undefined
  const statusKey = `task.status.${task.status}` as TeamsXLocaleKey
  const shared = task.assignee === ''
  const assignee = shared ? t('task.assignee.shared')
    : task.assignee === 'captain' ? t('task.assignee.captain')
      : task.assignee
  const inkStyle = shared ? undefined : { '--tx-ink': memberInk(task.assignee) } as CSSProperties
  return (
    <button
      type='button'
      className={css.tcard}
      data-state={task.state}
      onClick={(event) => { onOpen(task, event.currentTarget) }}
      aria-label={`${task.id} ${t(statusKey)} ${assignee}`}
    >
      <span className={css.tcTop}>
        <span className={css.tcId}>{task.id}</span>
        {task.kind === 'repair' && task.round !== undefined && task.round > 0 && (
          <span className={css.chipRepair} title={t('task.roundTitle', { round: task.round })}>{`R${task.round}`}</span>
        )}
        {task.takenOverBy === 'captain' && (
          <span className={css.chipTaken} title={t('task.takenTitle')}>{t('task.taken')}</span>
        )}
        {typeof task.elapsedMs === 'number' && (
          <span className={css.tcElapsed} title={t('task.elapsedTitle')}>{formatElapsed(task.elapsedMs)}</span>
        )}
      </span>
      <span className={css.tcSubj} title={task.description || task.subject}>{task.subject}</span>
      <span className={css.tcFoot}>
        <span className={css.tcStatus}>
          {StateIcon !== undefined && <StateIcon size={11} decorative />}
          {t(statusKey)}
        </span>
        {task.depth > 0 && <span className={css.chip}>{t('task.depth', { depth: task.depth })}</span>}
        {task.kind === 'repair' && task.dependencies.length > 0 && (
          <span
            className={css.chip}
            data-note="source"
            title={t('task.sourceTitle', { taskId: task.dependencies[0] ?? '' })}
          >{`↻ ${task.dependencies[0] ?? ''}`}</span>
        )}
        {typeof task.progressCount === 'number' && task.progressCount > 0 && (
          <span className={css.chip} data-note="progress" title={task.progressLatest ?? ''}>
            {`${task.progressCount}×${t('op.task-progress')}`}
          </span>
        )}
        {task.verdict !== undefined && (
          <span className={css.chip} data-verdict={task.verdict}>
            {t(`task.verdict.${task.verdict}` as TeamsXLocaleKey)}
          </span>
        )}
        {task.dependencies.length > 0 && (
          <span className={css.chip} title={t('task.depsNote', { deps: task.dependencies.join(' ') })}>
            {`deps ${task.dependencies.join(' ')}`}
          </span>
        )}
        <span className={css.tcAssignee} style={inkStyle}>{assignee}</span>
      </span>
      {task.status === 'in_progress' && (task.progressCount ?? 0) > 1 && <Trend count={task.progressCount ?? 0} />}
    </button>
  )
}

/* ── 任务详情浮层（点击状态卡；点外/Esc/滚动关闭） ────────────── */

function TaskPopover({ task, anchor, t, onClose }: {
  task: TeamActivityTask
  anchor: HTMLElement
  t: Translate
  onClose: () => void
}): ReactElement {
  const ref = useRef<HTMLDivElement | null>(null)
  const [pos, setPos] = useState<{ left: number; top: number } | undefined>(undefined)
  useEffect(() => {
    const rect = anchor.getBoundingClientRect()
    const width = 264
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
    let top = rect.bottom + 6
    if (top + 200 > window.innerHeight - 8) top = Math.max(8, rect.top - 206)
    setPos({ left, top })
    const close = (event: PointerEvent): void => {
      const target = event.target as Node | null
      if (target === null) return
      if (ref.current?.contains(target) === true || anchor.contains(target) === true) return
      onClose()
    }
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
    }
    const onScroll = (): void => { onClose() }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', onKey, true)
    document.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', onKey, true)
      document.removeEventListener('scroll', onScroll, true)
    }
  }, [anchor, onClose])
  const statusKey = `task.status.${task.status}` as TeamsXLocaleKey
  return createPortal(
    <div
      ref={ref}
      className={css.taskPop}
      style={pos === undefined ? { visibility: 'hidden' } : { left: `${pos.left}px`, top: `${pos.top}px` }}
      role='dialog'
      aria-label={task.subject}
    >
      <h4>{task.subject}</h4>
      <div className={css.taskPopMeta}>
        {`${task.id} · ${t(statusKey)}${task.round !== undefined && task.round > 0 ? ` · R${task.round}` : ''}`}
      </div>
      {task.description !== '' && <p className={css.taskPopDesc}>{task.description}</p>}
      <div className={css.taskPopRow}>
        <span className={css.taskPopKey}>{t('pop.assignee')}</span>
        <span>{task.assignee === '' ? t('task.assignee.shared') : task.assignee === 'captain' ? t('task.assignee.captain') : task.assignee}</span>
      </div>
      <div className={css.taskPopRow}>
        <span className={css.taskPopKey}>{t('pop.deps')}</span>
        <span>{task.dependencies.length > 0 ? task.dependencies.join(', ') : '—'}</span>
      </div>
      {task.progressLatest !== undefined && (
        <div className={css.taskPopRow}>
          <span className={css.taskPopKey}>{t('pop.latest')}</span>
          <span>{task.progressLatest}</span>
        </div>
      )}
      {typeof task.elapsedMs === 'number' && (
        <div className={css.taskPopRow}>
          <span className={css.taskPopKey}>{t('pop.elapsed')}</span>
          <span>{formatElapsed(task.elapsedMs)}</span>
        </div>
      )}
    </div>,
    document.body,
  )
}

/* ── 流本体 ──────────────────────────────────────────────────── */

export function TimelineStream({ team, t, openMember, readOnly, filter, decomposing, focusTaskId, onFocusHandled }: {
  team: TeamActivitySnapshot
  t: Translate
  openMember: OpenMember
  readOnly?: boolean
  filter: StreamFilter
  decomposing: boolean
  /** Transient locate request from the task meter; scrolls the anchor into view. */
  focusTaskId?: string
  onFocusHandled?: () => void
}): ReactElement {
  const [olderShown, setOlderShown] = useState(false)
  const [pop, setPop] = useState<{ task: TeamActivityTask; anchor: HTMLElement } | undefined>(undefined)
  const rowRefs = useRef(new Map<string, HTMLDivElement>())

  const entries = useMemo(() => buildStreamEntries(team.operations, team.captainInbox), [team.operations, team.captainInbox])
  const tasksById = useMemo(() => new Map(team.tasks.map((task) => [task.id, task])), [team.tasks])

  const filtered = useMemo(
    () => applyStreamFilter(entries, filter),
    [entries, filter],
  )

  // A member filter on a fresh fold reads as broken when it keeps only 2 of 30
  // rows — the fold only makes sense for the unfiltered narrative.
  const folded = !olderShown && sameFilter(filter, 'all') && filtered.length > FRESH_ROW_LIMIT
  const visible = folded ? filtered.slice(0, FRESH_ROW_LIMIT) : filtered

  // Locate request (task meter click): expand the fold, then scroll.
  useEffect(() => {
    if (focusTaskId === undefined) return
    setOlderShown(true)
    const row = rowRefs.current.get(`anchor-${focusTaskId}`)
    row?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    onFocusHandled?.()
  }, [focusTaskId, onFocusHandled])

  const openTaskCard = (task: TeamActivityTask, anchor: HTMLElement): void => {
    if (readOnly) return
    setPop({ task, anchor })
  }

  const openActor = (name: string): boolean => {
    const member = team.members.find((candidate) => candidate.name === name)
    if (member === undefined || member.id === '') return false
    openMember(team.captainSessionId, member.id)
    return true
  }

  if (decomposing) {
    return (
      <div className={css.stream} role='status' aria-label={t('task.decomposing')}>
        {[86, 64, 78, 58].map((width, index) => (
          <div key={index} className={css.streamRow}>
            <span className={css.streamTime}>--:--</span>
            <div className={css.streamBody}>
              <span className={css.skeletonRow} style={{ width: `${width}%` }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (filtered.length === 0) {
    return (
      <div className={css.stream}>
        <p className={css.streamEmpty}>
          {entries.length === 0
            ? t('stream.empty')
            : t('stream.count', { shown: 0, total: entries.length })}
        </p>
      </div>
    )
  }

  let prevTs: number | undefined
  return (
    <div className={css.stream} role='feed' aria-label={t('ticker.aria')}>
      {visible.map((entry, index) => {
        const dayBreak = prevTs !== undefined && formatDay(prevTs) !== formatDay(entry.ts)
        prevTs = entry.ts
        const kind = rowKind(entry)
        const actor = entry.kind === 'inbox' ? entry.message?.from ?? '' : entry.op?.actor ?? ''
        const verb = entry.kind === 'op' && entry.op !== undefined ? operationVerb(t, entry.op.action) : ''
        const taskId = entry.op?.taskId
        const anchorTask = entry.anchor && taskId !== undefined ? tasksById.get(taskId) : undefined
        const member = team.members.find((candidate) => candidate.name === actor)
        const openable = member !== undefined && member.id !== '' && member.status !== 'removed'
        const last = index === visible.length - 1
        return (
          <div key={entry.key}>
            {dayBreak && <div className={css.daysep} role='separator'>{formatDay(entry.ts)}</div>}
            <div
              ref={(node) => {
                if (anchorTask !== undefined && node !== null) rowRefs.current.set(`anchor-${anchorTask.id}`, node)
              }}
              className={css.streamRow}
              data-kind={kind}
              data-flight={entry.kind === 'op' && IN_FLIGHT.has(entry.op?.action ?? '') || undefined}
            >
              <span className={css.streamTime}>{formatClock(entry.ts)}</span>
              <div className={css.streamBody}>
                <span className={css.streamWho} style={{ '--tx-ink': memberInk(actor) } as CSSProperties}>
                  {openable ? (
                    <button
                      type='button'
                      className={css.streamWhoBtn}
                      onClick={() => { openActor(actor) }}
                      title={t('member.openSession')}
                    >
                      {actor}
                    </button>
                  ) : actor}
                </span>
                {entry.kind === 'inbox' ? (
                  <span className={css.msg}>
                    <span className={css.msgTag}>{t('stream.from')}</span>
                    <RichText text={entry.message?.content ?? ''} className={css.msgRich} />
                  </span>
                ) : (
                  <span className={css.streamText}>
                    <b>{verb}</b>
                    {taskId !== undefined && <span className={css.streamTaskId}>{taskId}</span>}
                    {entry.count > 1 && <span className={css.streamMerge}>{`×${entry.count}`}</span>}
                    {entry.op?.detail !== undefined && <span className={css.streamDetail}>{entry.op.detail}</span>}
                  </span>
                )}
                {anchorTask !== undefined && (
                  <TaskStreamCard task={anchorTask} t={t} onOpen={openTaskCard} />
                )}
              </div>
            </div>
            {last && folded && (
              <button type='button' className={css.older} onClick={() => { setOlderShown(true) }}>
                {t('stream.older')}
              </button>
            )}
          </div>
        )
      })}
      {pop !== undefined && (
        <TaskPopover task={pop.task} anchor={pop.anchor} t={t} onClose={() => { setPop(undefined) }} />
      )}
    </div>
  )
}
